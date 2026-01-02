import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Plan key mapping from Stripe price IDs
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1SlFztBTVPq8Pb96YwTeDQY1": "basic",
  "price_1SlG0uBTVPq8Pb969Xk4wRkA": "basic",
  "price_1SlFg0BTVPq8Pb96oWKt1dHM": "starter",
  "price_1SlG1xBTVPq8Pb960yQak2q9": "starter",
  "price_1SlFgFBTVPq8Pb96pql8EA3O": "pro",
  "price_1SlFmvBTVPq8Pb96701jtQfS": "pro",
  "price_1SlFgqBTVPq8Pb96yZsMQMd5": "business",
  "price_1SlFncBTVPq8Pb96e8rHexjI": "business",
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const event = JSON.parse(body) as Stripe.Event;
    logStep("Event type", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { 
          sessionId: session.id, 
          customerId: session.customer,
          subscriptionId: session.subscription,
          metadata: session.metadata 
        });

        const userId = session.metadata?.user_id;
        const planKey = session.metadata?.plan_key;
        
        if (!userId) {
          logStep("No user_id in metadata, skipping");
          break;
        }

        // Get subscription details
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price?.id;
          const resolvedPlanKey = planKey || PRICE_TO_PLAN[priceId] || "starter";

          // Update subscription in database
          const { error: subError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_key: resolvedPlanKey,
              status: "active",
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (subError) {
            logStep("Error updating subscription", { error: subError.message });
          } else {
            logStep("Subscription updated successfully", { userId, planKey: resolvedPlanKey });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          metadata: subscription.metadata 
        });

        const userId = subscription.metadata?.user_id;
        if (!userId) {
          // Try to find user by customer email
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          if (customer.email) {
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("email", customer.email)
              .maybeSingle();
            
            if (profile) {
              const priceId = subscription.items.data[0]?.price?.id;
              const planKey = PRICE_TO_PLAN[priceId] || "starter";
              
              await supabaseAdmin
                .from("subscriptions")
                .update({
                  plan_key: planKey,
                  status: subscription.status === "active" ? "active" : subscription.status,
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("user_id", profile.id);
              
              logStep("Subscription synced via email lookup", { userId: profile.id, planKey });
            }
          }
        } else {
          const priceId = subscription.items.data[0]?.price?.id;
          const planKey = PRICE_TO_PLAN[priceId] || subscription.metadata?.plan_key || "starter";
          
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_key: planKey,
              status: subscription.status === "active" ? "active" : subscription.status,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          
          logStep("Subscription synced", { userId, planKey });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const userId = subscription.metadata?.user_id;
        if (userId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              plan_key: "free",
              status: "canceled",
              current_period_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          
          logStep("Subscription canceled, reverted to free", { userId });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice paid", { invoiceId: invoice.id, subscriptionId: invoice.subscription });
        // Could be used to reset monthly credits here
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
