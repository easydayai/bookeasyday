import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Gift, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: DollarSign,
    title: "35% Commission",
    description: "Earn 35% commission on every successful referral that converts to a paying customer.",
  },
  {
    icon: TrendingUp,
    title: "Recurring Revenue",
    description: "Build passive income with commissions on ongoing client relationships and upsells.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description: "Monitor your referrals, conversions, and earnings with our transparent dashboard.",
  },
  {
    icon: Gift,
    title: "Marketing Resources",
    description: "Access branded materials, landing pages, and promotional content to boost conversions.",
  },
];

const steps = [
  {
    step: "01",
    title: "Apply",
    description: "Fill out our simple application form to join the partner program.",
  },
  {
    step: "02",
    title: "Get Approved",
    description: "Our team reviews your application and sets up your affiliate account.",
  },
  {
    step: "03",
    title: "Share & Earn",
    description: "Share your unique link and earn commissions on every conversion.",
  },
];

const idealPartners = [
  "Business consultants & coaches",
  "Marketing agencies",
  "Web developers & designers",
  "CRM & software resellers",
  "Industry influencers",
  "Business networking groups",
];

export default function Affiliate() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Partner Program
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Earn by Referring{" "}
              <span className="text-gradient">Easy Day AI</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our affiliate program and earn generous commissions by connecting 
              service-based businesses with AI automation solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="shadow-glow"
                onClick={() => window.open('https://bookeasy.goaffpro.com/create-account', '_blank')}
              >
                Become an Affiliate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/affiliate-legal">View Program Terms</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built a partner program that rewards you for helping businesses automate.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Getting started is simple. Here's how to begin earning.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal Partners */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Who Should Join?</h2>
                <p className="text-muted-foreground mb-6">
                  Our affiliate program is perfect for anyone who works with service-based 
                  businesses looking to scale with automation.
                </p>
                <ul className="space-y-3">
                  {idealPartners.map((partner) => (
                    <li key={partner} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                      <span>{partner}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-border/50">
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Ready to Earn?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join hundreds of partners already earning with Easy Day AI.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => window.open('https://bookeasy.goaffpro.com/create-account', '_blank')}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-6">
            Review our program terms and legal information for complete details.
          </p>
          <Button variant="outline" asChild>
            <Link to="/affiliate-legal">View Legal & Program Terms</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
