import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, ArrowLeft, Check } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";
import { Link } from "react-router-dom";

// Plan configurations with Stripe price IDs
const PLANS = {
  basic: {
    name: "Basic",
    monthlyPrice: 12.50,
    yearlyPrice: 125,
    credits: 50,
    monthlyPriceId: "price_1SlFztBTVPq8Pb96YwTeDQY1",
    yearlyPriceId: "price_1SlG0uBTVPq8Pb969Xk4wRkA",
    features: ["50 AI credits/month", "Email support", "Basic integrations"],
  },
  starter: {
    name: "Starter",
    monthlyPrice: 25,
    yearlyPrice: 250,
    credits: 100,
    monthlyPriceId: "price_1SlFg0BTVPq8Pb96oWKt1dHM",
    yearlyPriceId: "price_1SlG1xBTVPq8Pb960yQak2q9",
    features: ["100 AI credits/month", "Priority support", "All integrations"],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 50,
    yearlyPrice: 500,
    credits: 200,
    monthlyPriceId: "price_1SlFgFBTVPq8Pb96pql8EA3O",
    yearlyPriceId: "price_1SlFmvBTVPq8Pb96701jtQfS",
    features: ["200 AI credits/month", "Dedicated support", "Custom integrations", "Analytics"],
  },
  business: {
    name: "Business",
    monthlyPrice: 100,
    yearlyPrice: 1000,
    credits: 400,
    monthlyPriceId: "price_1SlFgqBTVPq8Pb96yZsMQMd5",
    yearlyPriceId: "price_1SlFncBTVPq8Pb96e8rHexjI",
    features: ["400 AI credits/month", "White-glove support", "API access", "Team features"],
  },
} as const;

type PlanKey = keyof typeof PLANS;

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const planParam = searchParams.get("plan") || sessionStorage.getItem("selected_plan") || "";
  const planKey = planParam as PlanKey;
  const plan = planParam in PLANS ? PLANS[planKey] : null;

  useEffect(() => {
    // If not logged in, redirect to signup
    if (!authLoading && !user) {
      navigate("/signup");
      return;
    }

    // If no valid plan or free plan, redirect to dashboard
    if (!authLoading && user && (!planParam || planParam === "free" || !plan)) {
      sessionStorage.removeItem("selected_plan");
      navigate("/dashboard");
    }
  }, [planParam, plan, user, authLoading, navigate]);

  const handleCheckout = async () => {
    if (!user || !plan) return;

    setIsProcessing(true);

    try {
      const priceId = billingPeriod === "monthly" ? plan.monthlyPriceId : plan.yearlyPriceId;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          priceId,
          planKey,
          billingPeriod,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Clear selected plan before redirecting
        sessionStorage.removeItem("selected_plan");
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const savings = billingPeriod === "yearly" ? Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center justify-center mb-8 gap-2">
          <LogoInsignia className="h-10 w-10" />
          <span className="text-2xl font-bold">Easy Day AI</span>
        </Link>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-2"
              onClick={() => navigate("/pricing")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to plans
            </Button>
            <CardTitle className="text-2xl">Complete your subscription</CardTitle>
            <CardDescription>
              You're subscribing to the {plan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Billing Period Toggle */}
            <div className="flex items-center justify-center gap-4 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  billingPeriod === "yearly"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                {savings > 0 && (
                  <span className="ml-2 text-xs text-primary">Save {savings}%</span>
                )}
              </button>
            </div>

            {/* Plan Summary */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{plan.name} Plan</span>
                <span className="text-2xl font-bold">
                  ${price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingPeriod === "monthly" ? "mo" : "yr"}
                  </span>
                </span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  + 100 credits on signup (one-time bonus)
                </p>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full shadow-glow"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : `Subscribe for $${price}/${billingPeriod === "monthly" ? "mo" : "yr"}`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
