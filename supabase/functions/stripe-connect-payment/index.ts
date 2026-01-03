import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-PAYMENT] ${step}${detailsStr}`);
};

const PLATFORM_FEE_CENTS = 100; // $1 platform fee

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, bookingId, amountCents, customerEmail } = await req.json();
    logStep("Request received", { action, bookingId, amountCents });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    if (action === "create_payment_intent") {
      // Get booking and business info
      const { data: booking, error: bookingError } = await supabaseClient
        .from("business_bookings")
        .select(`
          *,
          businesses:business_id (
            id,
            stripe_account_id,
            business_name
          ),
          services:service_id (
            name
          )
        `)
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error("Booking not found");
      }

      const business = booking.businesses as { id: string; stripe_account_id: string; business_name: string };
      if (!business?.stripe_account_id) {
        throw new Error("Business has no connected Stripe account");
      }

      logStep("Creating payment intent", { 
        amount: amountCents, 
        stripeAccountId: business.stripe_account_id 
      });

      // Create payment intent with destination charge
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        application_fee_amount: PLATFORM_FEE_CENTS,
        transfer_data: {
          destination: business.stripe_account_id,
        },
        metadata: {
          booking_id: bookingId,
          business_id: business.id,
        },
        receipt_email: customerEmail,
        description: `Booking - ${(booking.services as { name: string })?.name || 'Service'}`,
      });

      // Create payment record
      await supabaseClient
        .from("business_payments")
        .insert({
          booking_id: bookingId,
          business_id: business.id,
          stripe_payment_intent_id: paymentIntent.id,
          amount_gross_cents: amountCents,
          platform_fee_cents: PLATFORM_FEE_CENTS,
          status: "pending",
        });

      logStep("Payment intent created", { paymentIntentId: paymentIntent.id });

      return new Response(
        JSON.stringify({ 
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "create_checkout_session") {
      // Get booking and business info
      const { data: booking, error: bookingError } = await supabaseClient
        .from("business_bookings")
        .select(`
          *,
          businesses:business_id (
            id,
            stripe_account_id,
            business_name
          ),
          services:service_id (
            name
          )
        `)
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking) {
        throw new Error("Booking not found");
      }

      const business = booking.businesses as { id: string; stripe_account_id: string; business_name: string };
      if (!business?.stripe_account_id) {
        throw new Error("Business has no connected Stripe account");
      }

      const origin = req.headers.get("origin") || "https://bookeasy.day";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: (booking.services as { name: string })?.name || "Booking",
                description: `Appointment with ${business.business_name}`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: PLATFORM_FEE_CENTS,
          transfer_data: {
            destination: business.stripe_account_id,
          },
          metadata: {
            booking_id: bookingId,
            business_id: business.id,
          },
        },
        customer_email: customerEmail || booking.customer_email,
        success_url: `${origin}/booking-success?booking_id=${bookingId}&payment=success`,
        cancel_url: `${origin}/booking-success?booking_id=${bookingId}&payment=canceled`,
        metadata: {
          booking_id: bookingId,
          business_id: business.id,
        },
      });

      // Create payment record
      await supabaseClient
        .from("business_payments")
        .insert({
          booking_id: bookingId,
          business_id: business.id,
          amount_gross_cents: amountCents,
          platform_fee_cents: PLATFORM_FEE_CENTS,
          status: "pending",
        });

      logStep("Checkout session created", { sessionId: session.id });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      throw new Error("Invalid action");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
