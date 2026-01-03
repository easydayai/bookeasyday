import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) throw new Error("No Stripe signature");
      
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } else {
      // For development without signature verification
      event = JSON.parse(body) as Stripe.Event;
    }

    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;
        const chargeId = typeof paymentIntent.latest_charge === 'string' 
          ? paymentIntent.latest_charge 
          : paymentIntent.latest_charge?.id;

        logStep("Payment succeeded", { 
          paymentIntentId: paymentIntent.id, 
          bookingId,
          amount: paymentIntent.amount 
        });

        if (bookingId) {
          // Update payment record
          await supabaseClient
            .from("business_payments")
            .update({ 
              status: "succeeded",
              stripe_charge_id: chargeId 
            })
            .eq("stripe_payment_intent_id", paymentIntent.id);

          // Update booking payment status
          const { data: booking } = await supabaseClient
            .from("business_bookings")
            .select("amount_due_cents, amount_paid_cents")
            .eq("id", bookingId)
            .single();

          if (booking) {
            const newPaidAmount = (booking.amount_paid_cents || 0) + paymentIntent.amount;
            const paymentStatus = newPaidAmount >= booking.amount_due_cents 
              ? "paid_in_full" 
              : "deposit_paid";

            await supabaseClient
              .from("business_bookings")
              .update({ 
                amount_paid_cents: newPaidAmount,
                payment_status: paymentStatus 
              })
              .eq("id", bookingId);
          }
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.booking_id;

        logStep("Checkout completed", { sessionId: session.id, bookingId });

        if (bookingId && session.payment_intent) {
          const paymentIntentId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent.id;

          // Update payment record
          await supabaseClient
            .from("business_payments")
            .update({ 
              status: "succeeded",
              stripe_payment_intent_id: paymentIntentId 
            })
            .eq("booking_id", bookingId)
            .eq("status", "pending");

          // Update booking
          const { data: booking } = await supabaseClient
            .from("business_bookings")
            .select("amount_due_cents")
            .eq("id", bookingId)
            .single();

          if (booking) {
            const paidAmount = session.amount_total || 0;
            const paymentStatus = paidAmount >= booking.amount_due_cents 
              ? "paid_in_full" 
              : "deposit_paid";

            await supabaseClient
              .from("business_bookings")
              .update({ 
                amount_paid_cents: paidAmount,
                payment_status: paymentStatus 
              })
              .eq("id", bookingId);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        
        logStep("Charge refunded", { chargeId: charge.id });

        await supabaseClient
          .from("business_payments")
          .update({ status: "refunded" })
          .eq("stripe_charge_id", charge.id);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
        
        logStep("Dispute created", { disputeId: dispute.id, chargeId });

        if (chargeId) {
          await supabaseClient
            .from("business_payments")
            .update({ status: "disputed" })
            .eq("stripe_charge_id", chargeId);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        
        logStep("Account updated", { 
          accountId: account.id, 
          detailsSubmitted: account.details_submitted,
          payoutsEnabled: account.payouts_enabled 
        });

        // Update business record
        await supabaseClient
          .from("businesses")
          .update({ 
            stripe_onboarded: account.details_submitted ?? false,
            payouts_enabled: account.payouts_enabled ?? false 
          })
          .eq("stripe_account_id", account.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const bookingId = invoice.metadata?.booking_id;
        
        logStep("Invoice paid", { invoiceId: invoice.id, bookingId });

        if (bookingId) {
          await supabaseClient
            .from("payment_requests")
            .update({ status: "paid" })
            .eq("stripe_invoice_id", invoice.id);

          await supabaseClient
            .from("business_bookings")
            .update({ 
              amount_paid_cents: invoice.amount_paid,
              payment_status: "paid_in_full" 
            })
            .eq("id", bookingId);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
