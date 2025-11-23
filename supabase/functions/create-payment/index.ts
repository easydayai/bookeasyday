import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-PAYMENT] Starting payment session creation");

    // Get application ID from request body
    const { applicationId } = await req.json().catch(() => ({}));
    console.log("[CREATE-PAYMENT] Application ID:", applicationId);

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Try to get authenticated user (optional for guest checkout)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let userEmail: string | undefined;
    let customerId: string | undefined;

    // Check if user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user?.email) {
          userEmail = data.user.email;
          console.log("[CREATE-PAYMENT] Authenticated user found:", userEmail);

          // Check if customer already exists in Stripe
          const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            console.log("[CREATE-PAYMENT] Existing Stripe customer found:", customerId);
          }
        }
      } catch (authError) {
        console.log("[CREATE-PAYMENT] User not authenticated, proceeding with guest checkout");
      }
    }

    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: "price_1SWhFvBTVPq8Pb96E3ExM4OS",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/confirmation`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        application_id: applicationId || "",
      },
    });

    console.log("[CREATE-PAYMENT] Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-PAYMENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
