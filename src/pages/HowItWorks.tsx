import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Users, Home, CheckCircle, DollarSign, Clock, Shield } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold">How Rent EZ Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stop wasting money on application fees. Apply once, get matched with specialists, and
            move in faster.
          </p>
        </div>

        {/* Main Process */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: FileText,
              step: "1",
              title: "Apply Once for $20",
              description:
                "Fill out one comprehensive application online. No more filling out the same forms over and over.",
            },
            {
              icon: Users,
              step: "2",
              title: "Get Matched with Specialists",
              description:
                "We connect you with rental specialists who have relationships with landlords in your desired area.",
            },
            {
              icon: Home,
              step: "3",
              title: "Review Properties That Fit",
              description:
                "Your specialist finds properties that match your budget, needs, and profile—no more wasted applications.",
            },
            {
              icon: CheckCircle,
              step: "4",
              title: "Move In Within 30 Days",
              description:
                "Get approved and move into your new place within 30 days, or get your money back. Guaranteed.",
            },
          ].map((item, idx) => (
            <Card key={idx} className="text-center relative">
              <CardContent className="pt-8 space-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="space-y-8 mb-16">
          <h2 className="text-3xl font-bold text-center">Why Choose Rent EZ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Save Hundreds in Fees",
                description:
                  "Traditional applications cost $50-150 each. With Rent EZ, you pay $20 once and apply to multiple properties.",
              },
              {
                icon: Clock,
                title: "Move In Faster",
                description:
                  "Our specialists pre-screen properties for you, so you only apply where you're likely to be approved.",
              },
              {
                icon: Shield,
                title: "Money-Back Guarantee",
                description:
                  "If we don't help you move in within 30 days after approval, get your $20 back. No risk.",
              },
            ].map((benefit, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6 space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <Card className="bg-muted/30 mb-16">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-2xl font-bold text-center mb-8">Traditional Way vs. Rent EZ</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-destructive">Traditional Way</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Pay $50-150 per application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Fill out same forms repeatedly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>No guarantee of approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>Waste weeks searching blindly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">✗</span>
                    <span>No support or guidance</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">The Rent EZ Way</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>One $20 application fee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Apply once, reuse for all properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>30-day move-in guarantee or refund</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Pre-screened property matches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Personal rental specialist support</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-6 py-12 bg-hero-gradient rounded-lg">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands who've stopped wasting money on application fees and found their perfect
            home with Rent EZ.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/apply">Apply Now – $20</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
