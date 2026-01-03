import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOOKING-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    logStep("ERROR", { message: "STRIPE_SECRET_KEY not set" });
    return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const db = createClient(supabaseUrl, supabaseServiceKey);

  // For now, skip signature verification if no webhook secret
  // In production, you should set STRIPE_BOOKING_WEBHOOK_SECRET
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_BOOKING_WEBHOOK_SECRET");

  let event: Stripe.Event;

  try {
    const body = await req.text();

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Parse without verification (development mode)
      event = JSON.parse(body) as Stripe.Event;
      logStep("WARNING: Processing webhook without signature verification");
    }
  } catch (err: any) {
    logStep("Webhook signature verification failed", { error: err.message });
    return new Response(
      JSON.stringify({ error: `Webhook signature failed: ${err.message}` }),
      { headers: corsHeaders, status: 400 }
    );
  }

  logStep("Event received", { type: event.type, id: event.id });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      const paymentIntentId = String(session.payment_intent || "");
      const paidNowCents = Number(session.metadata?.chargeNowCents || 0);

      logStep("Processing checkout.session.completed", { bookingId, paidNowCents });

      if (bookingId) {
        // Fetch booking totals
        const { data: booking, error: berr } = await db
          .from("bookings")
          .select("total_amount_cents, paid_amount_cents")
          .eq("id", bookingId)
          .single();

        if (berr) {
          logStep("Failed to fetch booking", { error: berr.message });
          throw new Error(berr.message);
        }

        const newPaid = Number(booking.paid_amount_cents || 0) + paidNowCents;
        const total = Number(booking.total_amount_cents || 0);
        const balance = Math.max(total - newPaid, 0);

        // Determine payment status
        let paymentStatus = "paid";
        if (balance > 0) {
          paymentStatus = "deposit_paid";
        }

        const { error } = await db
          .from("bookings")
          .update({
            stripe_payment_intent_id: paymentIntentId,
            paid_amount_cents: newPaid,
            balance_due_cents: balance,
            status: "confirmed",
          })
          .eq("id", bookingId);

        if (error) {
          logStep("Failed to update booking", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Booking updated", { bookingId, newPaid, balance, paymentStatus });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      
      logStep("Processing checkout.session.expired", { bookingId });

      if (bookingId) {
        await db
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    logStep("Webhook handler error", { error: e.message });
    return new Response(
      JSON.stringify({ ok: false, error: e.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
