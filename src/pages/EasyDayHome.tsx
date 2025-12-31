import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  Calendar,
  PhoneMissed,
  Bell,
  HelpCircle,
  Wrench,
  Stethoscope,
  Car,
  Scale,
  Dumbbell,
  Home,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import heroLogo from "@/assets/easy-day-ai-logo-transparent.png";

const features = [
  {
    icon: MessageSquare,
    title: "AI SMS Agents",
    description: "Instantly reply to customer texts",
  },
  {
    icon: Phone,
    title: "AI Phone Agents",
    description: "Answer calls 24/7 without staff",
  },
  {
    icon: Calendar,
    title: "Appointment Booking",
    description: "Check availability and book automatically",
  },
  {
    icon: PhoneMissed,
    title: "Missed Call Recovery",
    description: "Text missed callers instantly",
  },
  {
    icon: Bell,
    title: "Follow-ups & Reminders",
    description: "Reduce no-shows and ghosting",
  },
  {
    icon: HelpCircle,
    title: "FAQs & Customer Support",
    description: "Answer common questions automatically",
  },
];

const steps = [
  {
    number: "01",
    title: "Customers Contact You",
    description: "Customers call or text your business number",
  },
  {
    number: "02",
    title: "Easy Day AI Responds",
    description: "AI responds instantly and handles the conversation",
  },
  {
    number: "03",
    title: "Action Completed",
    description: "Appointments booked, info collected, leads qualified",
  },
];

const industries = [
  {
    icon: Wrench,
    title: "HVAC, Plumbers, Electricians",
    problem: "Missed calls during jobs mean lost revenue",
    solution: "AI answers and books while you work",
    outcome: "More jobs scheduled, zero phone tag",
  },
  {
    icon: Stethoscope,
    title: "Medical, Dental, Medspas",
    problem: "Overwhelmed front desk can't keep up",
    solution: "AI handles booking, reminders, and FAQs",
    outcome: "Fuller schedule, fewer no-shows",
  },
  {
    icon: Car,
    title: "Auto Repair",
    problem: "Customers call while you're under the hood",
    solution: "AI qualifies leads and schedules appointments",
    outcome: "More appointments, less interruption",
  },
  {
    icon: Scale,
    title: "Legal & Professional Services",
    problem: "Slow response loses potential clients",
    solution: "AI qualifies and schedules consultations 24/7",
    outcome: "Capture leads competitors miss",
  },
  {
    icon: Dumbbell,
    title: "Gyms & Fitness",
    problem: "Inquiries slip through when you're training",
    solution: "AI books trials and answers membership questions",
    outcome: "More members, less admin work",
  },
  {
    icon: Home,
    title: "Home Services",
    problem: "Manual scheduling wastes hours each week",
    solution: "AI books, confirms, and sends reminders",
    outcome: "Reclaim your time, grow your business",
  },
];

const metrics = [
  { icon: Phone, value: "10,000+", label: "Calls Handled" },
  { icon: Clock, value: "500+", label: "Hours Saved" },
  { icon: Calendar, value: "2,500+", label: "Bookings Created" },
];

export default function EasyDayHome() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-teal/3" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Logo */}
            <div className="mb-8 animate-fade-up">
              <img 
                src={heroLogo} 
                alt="Easy Day AI" 
                className="mx-auto h-40 md:h-56 lg:h-64 w-auto animate-logo-float"
              />
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Automate your business.{" "}
              <span className="text-gradient">Make every day an easy day.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Easy Day AI installs AI agents that handle calls, texts, booking, and follow-ups automatically — so you can focus on running your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button size="lg" className="text-lg px-8 shadow-glow" asChild>
                <Link to="/contact">Book an Appointment</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/demo">See Live Demo</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "0.4s" }}>
              Works with your existing phone & calendar • No apps required • Setup in days
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Easy Day AI Automates</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop doing repetitive tasks. Let AI handle customer communication while you focus on what matters.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.title} className="group hover:shadow-glow transition-all duration-300 border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple setup, powerful automation. Get started in just a few days.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center">
                <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-8 w-8 h-8 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who Easy Day AI Is Built For</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Service businesses that are ready to stop losing leads and start growing.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Card key={industry.title} className="group hover:shadow-glow transition-all duration-300 border-border/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <industry.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{industry.title}</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-destructive font-medium shrink-0">Problem:</span>
                      <span className="text-muted-foreground">{industry.problem}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary font-medium shrink-0">Solution:</span>
                      <span className="text-muted-foreground">{industry.solution}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-accent font-medium shrink-0">Result:</span>
                      <span className="text-foreground font-medium">{industry.outcome}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Growing Businesses</h2>
            <p className="text-muted-foreground">Early access automation partners onboarding now.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <metric.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-4xl font-bold mb-1">{metric.value}</div>
                <div className="text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-accent">★</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "Easy Day AI transformed how we handle customer calls. We haven't missed a lead since."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10" />
                    <div>
                      <div className="font-medium">Business Owner</div>
                      <div className="text-sm text-muted-foreground">Local Service Company</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to make your business easier to run?
          </h2>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/contact">Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
