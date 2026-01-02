import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Phone, Calendar, Globe, Zap, Rocket, Building, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Subscription plans (recurring)
const subscriptionPlans = [
  {
    id: "starter-sub",
    name: "Starter",
    subtitle: "For individuals",
    monthlyPrice: 25,
    yearlyPrice: 270,
    monthlyPriceId: "price_1SlFg0BTVPq8Pb96oWKt1dHM",
    yearlyPriceId: "price_1SlFmkBTVPq8Pb96whtHOBHB",
    credits: 100,
    icon: Rocket,
    features: [
      "100 AI credits/month",
      "Basic support",
      "Email notifications",
      "1 user seat",
    ],
    popular: false,
  },
  {
    id: "pro-sub",
    name: "Pro",
    subtitle: "For growing teams",
    monthlyPrice: 50,
    yearlyPrice: 540,
    monthlyPriceId: "price_1SlFgFBTVPq8Pb96pql8EA3O",
    yearlyPriceId: "price_1SlFmvBTVPq8Pb96701jtQfS",
    credits: 200,
    icon: Star,
    features: [
      "200 AI credits/month",
      "Priority support",
      "Advanced analytics",
      "5 user seats",
      "Custom integrations",
    ],
    popular: true,
  },
  {
    id: "business-sub",
    name: "Business",
    subtitle: "For enterprises",
    monthlyPrice: 100,
    yearlyPrice: 1080,
    monthlyPriceId: "price_1SlFgqBTVPq8Pb96yZsMQMd5",
    yearlyPriceId: "price_1SlFncBTVPq8Pb96e8rHexjI",
    credits: 400,
    icon: Building,
    features: [
      "400 AI credits/month",
      "Dedicated support",
      "White-label options",
      "Unlimited seats",
      "API access",
      "SLA guarantee",
    ],
    popular: false,
  },
];

// One-time setup packages
const setupPackages = [
  {
    id: "starter",
    name: "Starter Pilot",
    subtitle: "Booking Only",
    price: 450,
    priceId: "price_1Sl0nuBTVPq8Pb96kr50xyAv",
    icon: Calendar,
    features: [
      "AI Booking Agent",
      "Calendar integration",
      "3-day testing window",
      "Basic setup support",
    ],
    popular: false,
  },
  {
    id: "call",
    name: "Call Agent Only",
    subtitle: "Phone Automation",
    price: 750,
    priceId: "price_1Sl0nPBTVPq8Pb96n6ykqKIj",
    icon: Phone,
    features: [
      "AI Call Agent",
      "24/7 inbound handling",
      "Lead capture",
      "Call summaries",
    ],
    popular: false,
  },
  {
    id: "combo",
    name: "Booking + Call",
    subtitle: "Best Value",
    price: 1100,
    priceId: "price_1Sl0nBBTVPq8Pb96edjEvaxW",
    icon: Zap,
    features: [
      "AI Call Agent",
      "AI Booking Agent",
      "Phone number setup",
      "Go-live testing",
      "Priority support",
    ],
    popular: false,
  },
  {
    id: "full",
    name: "Full Automation",
    subtitle: "Complete Solution",
    price: 1500,
    priceId: "price_1Sl0myBTVPq8Pb96eIOFbYzY",
    icon: Globe,
    features: [
      "AI Call Agent",
      "AI Booking Agent",
      "1-page conversion website",
      "Complete automation",
      "Dedicated onboarding",
    ],
    popular: true,
  },
];

export default function Pricing() {
  const [customAmount, setCustomAmount] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const handleCheckout = async (priceId: string, packageId: string) => {
    setLoadingId(packageId);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCustomCheckout = async () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 50) {
      toast.error("Please enter an amount of at least $50");
      return;
    }

    setLoadingId("custom");
    try {
      const { data, error } = await supabase.functions.invoke("create-custom-payment", {
        body: { amount: Math.round(amount * 100) },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Custom checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const yearlySavings = (monthly: number, yearly: number) => {
    const annualMonthly = monthly * 12;
    return Math.round(((annualMonthly - yearly) / annualMonthly) * 100);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent{" "}
              <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose a subscription plan for ongoing AI automation, or a one-time setup package.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Section Header with Billing Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold">Subscription Plans</h2>
                <p className="text-muted-foreground text-sm">Monthly credits for ongoing automation</p>
              </div>
              
              {/* Billing Toggle */}
              <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full">
                <Label 
                  htmlFor="billing-toggle" 
                  className={`text-sm cursor-pointer ${!isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                >
                  Monthly
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                />
                <Label 
                  htmlFor="billing-toggle" 
                  className={`text-sm cursor-pointer ${isYearly ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
                >
                  Yearly
                </Label>
                {isYearly && (
                  <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                    Save 10%
                  </span>
                )}
              </div>
            </div>

            {/* Subscription Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon;
                const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                const priceId = isYearly ? plan.yearlyPriceId : plan.monthlyPriceId;
                const savings = yearlySavings(plan.monthlyPrice, plan.yearlyPrice);
                
                return (
                  <Card
                    key={plan.id}
                    className={`relative bg-card border-border/50 transition-all hover:border-primary/50 ${
                      plan.popular ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${price}</span>
                        <span className="text-muted-foreground ml-1">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </div>
                      {isYearly && (
                        <p className="text-xs text-accent font-medium mt-1">
                          Save {savings}% vs monthly
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.credits} credits/month
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handleCheckout(priceId, plan.id)}
                        disabled={loadingId === plan.id}
                      >
                        {loadingId === plan.id ? "Processing..." : "Subscribe"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or get started with a one-time setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* One-time Setup Packages */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">One-Time Setup Packages</h2>
              <p className="text-muted-foreground text-sm">Get your AI agents live with a single payment</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {setupPackages.map((pkg) => {
                const Icon = pkg.icon;
                return (
                  <Card
                    key={pkg.id}
                    className={`relative bg-card border-border/50 transition-all hover:border-primary/50 ${
                      pkg.popular ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{pkg.subtitle}</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">${pkg.price.toLocaleString()}</span>
                        <span className="text-muted-foreground ml-1">one-time</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {pkg.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                        onClick={() => handleCheckout(pkg.priceId, pkg.id)}
                        disabled={loadingId === pkg.id}
                      >
                        {loadingId === pkg.id ? "Processing..." : "Get Started"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Package */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-border/50">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Custom Package</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Need something unique? Set your own budget and we'll create a custom solution.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">$</span>
                  <Input
                    type="number"
                    placeholder="Enter amount (min $50)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min={50}
                    className="text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Minimum $50. We'll reach out to discuss your custom requirements.
                </p>
                <Button
                  className="w-full"
                  onClick={handleCustomCheckout}
                  disabled={loadingId === "custom" || !customAmount}
                >
                  {loadingId === "custom" ? "Processing..." : "Pay Custom Amount"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            Not sure which option is right for you?
          </p>
          <Button variant="outline" asChild>
            <a href="/contact">Book a Free Consultation</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
