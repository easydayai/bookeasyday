import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Phone, Calendar, Globe, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const packages = [
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
    popular: true,
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
    popular: false,
  },
];

export default function Pricing() {
  const [customAmount, setCustomAmount] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
        body: { amount: Math.round(amount * 100) }, // Convert to cents
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

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your{" "}
              <span className="text-gradient">Automation Package</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              One-time setup fee. No hidden costs. Get your AI agents live in days.
            </p>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {packages.map((pkg) => {
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
            Not sure which package is right for you?
          </p>
          <Button variant="outline" asChild>
            <a href="/contact">Book a Free Consultation</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
