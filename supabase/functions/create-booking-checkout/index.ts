import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-BOOKING-CHECKOUT] ${step}${detailsStr}`);
};

function clampInt(n: any, min: number, max?: number): number {
  const x = Math.floor(Number(n));
  if (!Number.isFinite(x)) return min;
  if (x < min) return min;
  if (typeof max === "number" && x > max) return max;
  return x;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const db = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const {
      userId,
      appointmentTypeId,
      start_time,
      end_time,
      customer_name,
      customer_email,
      customer_phone,
      notes,
      customer_pay_cents, // only for pay_what_you_want
    } = body;

    logStep("Request body", { userId, appointmentTypeId, start_time, customer_email });

    if (!userId || !appointmentTypeId || !start_time || !end_time || !customer_email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Load appointment type
    const { data: apptype, error: apperr } = await db
      .from("appointment_types")
      .select("*")
      .eq("id", appointmentTypeId)
      .eq("user_id", userId)
      .single();

    if (apperr || !apptype) {
      logStep("Appointment type not found", { error: apperr?.message });
      return new Response(
        JSON.stringify({ ok: false, error: apperr?.message || "Appointment type not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    logStep("Appointment type loaded", { name: apptype.name, pricing_mode: apptype.pricing_mode });

    const mode: "free" | "fixed" | "deposit" | "pay_what_you_want" = apptype.pricing_mode || "free";
    const currency = "usd";

    // Determine what to charge NOW
    let chargeNowCents = 0;
    let totalCents = 0;

    if (mode === "free") {
      chargeNowCents = 0;
      totalCents = 0;
    } else if (mode === "fixed") {
      // price column stores dollars, convert to cents
      totalCents = clampInt((apptype.price || 0) * 100, 0);
      chargeNowCents = totalCents;
    } else if (mode === "deposit") {
      totalCents = clampInt((apptype.price || 0) * 100, 0);
      const depositCents = clampInt(apptype.deposit_cents || 0, 0, totalCents);
      chargeNowCents = depositCents;
    } else if (mode === "pay_what_you_want") {
      const minCents = clampInt(apptype.min_pay_cents || 0, 0);
      const maxCents = apptype.max_pay_cents === null || apptype.max_pay_cents === undefined
        ? undefined
        : clampInt(apptype.max_pay_cents, minCents);
      const suggestedCents = clampInt(apptype.suggested_pay_cents || minCents, minCents, maxCents);

      const chosen = clampInt(
        customer_pay_cents ?? suggestedCents,
        minCents,
        maxCents
      );

      totalCents = chosen;
      chargeNowCents = chosen;
    }

    logStep("Pricing calculated", { mode, totalCents, chargeNowCents });

    // Create booking record
    const payment_status = chargeNowCents > 0 ? "unpaid" : "paid";
    const balance_due_cents = Math.max(totalCents - 0, 0); // paid_amount starts at 0

    const { data: booking, error: berr } = await db
      .from("bookings")
      .insert([{
        user_id: userId,
        appointment_type_id: appointmentTypeId,
        start_time,
        end_time,
        customer_name: customer_name ?? null,
        customer_email,
        customer_phone: customer_phone ?? null,
        notes: notes ?? null,
        status: "booked",
        pricing_mode: mode,
        total_amount_cents: totalCents,
        paid_amount_cents: 0,
        balance_due_cents,
      }])
      .select()
      .single();

    if (berr) {
      logStep("Booking creation failed", { error: berr.message });
      return new Response(
        JSON.stringify({ ok: false, error: berr.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    logStep("Booking created", { bookingId: booking.id, payment_status });

    // If nothing to charge, finish
    if (chargeNowCents <= 0) {
      return new Response(
        JSON.stringify({ ok: true, free: true, bookingId: booking.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Build Stripe Checkout Session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://bookeasy.day";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: chargeNowCents,
          product_data: {
            name: apptype.name + (mode === "deposit" ? " (Deposit)" : ""),
            description: apptype.description || undefined,
          },
        },
      }],
      success_url: `${origin}/book/success?bookingId=${booking.id}`,
      cancel_url: `${origin}/book/cancel?bookingId=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        providerUserId: userId,
        appointmentTypeId,
        pricingMode: mode,
        chargeNowCents: String(chargeNowCents),
        totalCents: String(totalCents),
      },
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Save session id
    const { error: updateErr } = await db
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    if (updateErr) {
      logStep("Failed to save session id", { error: updateErr.message });
    }

    return new Response(
      JSON.stringify({ ok: true, checkoutUrl: session.url, bookingId: booking.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
