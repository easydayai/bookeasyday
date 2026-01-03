import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-INVOICE] ${step}${detailsStr}`);
};

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

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { action, bookingId, amountCents, customerEmail } = await req.json();
    logStep("Request received", { action, bookingId, amountCents });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get booking and verify ownership
    const { data: booking, error: bookingError } = await supabaseClient
      .from("business_bookings")
      .select(`
        *,
        businesses:business_id (
          id,
          owner_user_id,
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

    const business = booking.businesses as { id: string; owner_user_id: string; stripe_account_id: string; business_name: string };
    
    if (business.owner_user_id !== user.id) {
      throw new Error("Access denied");
    }

    if (!business.stripe_account_id) {
      throw new Error("Business has no connected Stripe account");
    }

    if (action === "create_payment_link") {
      const origin = req.headers.get("origin") || "https://bookeasy.day";
      
      // Create a payment link using connected account
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: (booking.services as { name: string })?.name || "Service Payment",
                description: `Payment for booking with ${business.business_name}`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        application_fee_amount: 100, // $1 platform fee
        transfer_data: {
          destination: business.stripe_account_id,
        },
        after_completion: {
          type: "redirect",
          redirect: {
            url: `${origin}/booking-success?booking_id=${bookingId}&payment=success`,
          },
        },
        metadata: {
          booking_id: bookingId,
          business_id: business.id,
        },
      }, {
        stripeAccount: undefined, // Use platform account to create connected payment
      });

      // Record the payment request
      await supabaseClient
        .from("payment_requests")
        .insert({
          booking_id: bookingId,
          business_id: business.id,
          type: "payment_link",
          stripe_payment_link_id: paymentLink.id,
          status: "sent",
        });

      logStep("Payment link created", { paymentLinkId: paymentLink.id, url: paymentLink.url });

      return new Response(
        JSON.stringify({ url: paymentLink.url, id: paymentLink.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "create_invoice") {
      // Create or get customer on connected account
      let customerId: string;
      
      const customers = await stripe.customers.list({
        email: customerEmail || booking.customer_email,
        limit: 1,
      }, {
        stripeAccount: business.stripe_account_id,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail || booking.customer_email,
          name: booking.customer_name,
          phone: booking.customer_phone || undefined,
        }, {
          stripeAccount: business.stripe_account_id,
        });
        customerId = customer.id;
      }

      // Create invoice
      const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: "send_invoice",
        days_until_due: 7,
        metadata: {
          booking_id: bookingId,
          business_id: business.id,
        },
      }, {
        stripeAccount: business.stripe_account_id,
      });

      // Add invoice item
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: amountCents,
        currency: "usd",
        description: (booking.services as { name: string })?.name || "Service Payment",
      }, {
        stripeAccount: business.stripe_account_id,
      });

      // Finalize and send
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {}, {
        stripeAccount: business.stripe_account_id,
      });

      await stripe.invoices.sendInvoice(invoice.id, {}, {
        stripeAccount: business.stripe_account_id,
      });

      // Record the payment request
      await supabaseClient
        .from("payment_requests")
        .insert({
          booking_id: bookingId,
          business_id: business.id,
          type: "invoice",
          stripe_invoice_id: invoice.id,
          status: "sent",
        });

      logStep("Invoice created and sent", { invoiceId: invoice.id });

      return new Response(
        JSON.stringify({ 
          invoiceId: invoice.id, 
          hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url 
        }),
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
