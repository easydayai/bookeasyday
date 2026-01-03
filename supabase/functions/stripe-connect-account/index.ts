import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-ACCOUNT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { action, businessId } = await req.json();
    logStep("Request received", { action, businessId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    if (action === "create_account") {
      // Check if business exists and user owns it
      const { data: business, error: bizError } = await supabaseClient
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .eq("owner_user_id", user.id)
        .single();

      if (bizError || !business) {
        throw new Error("Business not found or access denied");
      }

      // Create Stripe Connect account if not exists
      if (business.stripe_account_id) {
        logStep("Account already exists", { stripeAccountId: business.stripe_account_id });
        return new Response(
          JSON.stringify({ accountId: business.stripe_account_id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: {
          business_id: businessId,
          user_id: user.id,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      logStep("Stripe account created", { accountId: account.id });

      // Update business with stripe account id
      await supabaseClient
        .from("businesses")
        .update({ stripe_account_id: account.id })
        .eq("id", businessId);

      return new Response(
        JSON.stringify({ accountId: account.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "onboard_link") {
      const { data: business, error: bizError } = await supabaseClient
        .from("businesses")
        .select("stripe_account_id")
        .eq("id", businessId)
        .eq("owner_user_id", user.id)
        .single();

      if (bizError || !business?.stripe_account_id) {
        throw new Error("Business not found or no Stripe account");
      }

      const origin = req.headers.get("origin") || "https://bookeasy.day";
      
      const accountLink = await stripe.accountLinks.create({
        account: business.stripe_account_id,
        refresh_url: `${origin}/dashboard?stripe_refresh=true`,
        return_url: `${origin}/dashboard?stripe_onboarded=true`,
        type: "account_onboarding",
      });

      logStep("Onboard link created", { url: accountLink.url });

      return new Response(
        JSON.stringify({ url: accountLink.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (action === "check_status") {
      const { data: business, error: bizError } = await supabaseClient
        .from("businesses")
        .select("stripe_account_id")
        .eq("id", businessId)
        .eq("owner_user_id", user.id)
        .single();

      if (bizError || !business?.stripe_account_id) {
        return new Response(
          JSON.stringify({ onboarded: false, payoutsEnabled: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const account = await stripe.accounts.retrieve(business.stripe_account_id);
      
      const onboarded = account.details_submitted ?? false;
      const payoutsEnabled = account.payouts_enabled ?? false;

      // Update business status
      await supabaseClient
        .from("businesses")
        .update({ 
          stripe_onboarded: onboarded,
          payouts_enabled: payoutsEnabled 
        })
        .eq("id", businessId);

      logStep("Status checked", { onboarded, payoutsEnabled });

      return new Response(
        JSON.stringify({ onboarded, payoutsEnabled }),
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
