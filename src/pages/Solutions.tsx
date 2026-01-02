import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  Cog,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Wrench,
  Stethoscope,
  Car,
  Scale,
  Dumbbell,
} from "lucide-react";

const solutions = [
  {
    icon: MessageSquare,
    title: "AI SMS Automation",
    description:
      "Easy Day AI installs SMS agents that respond to customer texts, qualify leads, answer questions, and take action automatically.",
    features: [
      "Instant response to every text message",
      "Qualify leads with smart questions",
      "Check calendar availability in real-time",
      "Book appointments automatically",
      "Handle reschedules and cancellations",
      "Answer FAQs about your business",
    ],
  },
  {
    icon: Phone,
    title: "AI Phone Automation",
    description:
      "Easy Day AI installs AI phone agents that answer calls, route conversations, and book appointments without human involvement.",
    features: [
      "Answer every call 24/7/365",
      "Natural voice conversations",
      "Route urgent calls to staff",
      "Book appointments during calls",
      "Collect caller information",
      "Transfer to voicemail when needed",
    ],
  },
  {
    icon: Cog,
    title: "Business Process Automation",
    description:
      "Automate follow-ups, reminders, lead capture, and customer updates — without hiring staff.",
    features: [
      "Automated appointment reminders",
      "No-show follow-up sequences",
      "Lead nurture campaigns",
      "Review request automation",
      "Customer update notifications",
      "Multi-channel communication",
    ],
  },
];

const industries = [
  {
    id: "home-services",
    icon: Wrench,
    title: "Home Services",
    subtitle: "HVAC, Plumbers, Electricians, Contractors",
    problem: [
      "You're on a job when a new lead calls",
      "By the time you call back, they've hired someone else",
      "Evenings and weekends go unanswered",
    ],
    solution: [
      "AI answers every call and text instantly",
      "Qualifies the job and books appointments",
      "Sends confirmation and reminder texts",
    ],
    outcomes: ["Capture leads 24/7", "Reduce scheduling time by 90%", "Never miss a call"],
  },
  {
    id: "healthcare",
    icon: Stethoscope,
    title: "Healthcare & Wellness",
    subtitle: "Medical Offices, Dental, Medspas, Clinics",
    problem: [
      "Front desk is overwhelmed with calls",
      "Patients can't get through to book",
      "No-shows cost thousands per month",
    ],
    solution: [
      "AI handles appointment scheduling 24/7",
      "Sends automated appointment reminders",
      "Follows up with no-shows automatically",
    ],
    outcomes: ["Reduce no-shows by 40%", "Free up front desk", "Capture after-hours requests"],
  },
  {
    id: "automotive",
    icon: Car,
    title: "Automotive",
    subtitle: "Auto Repair, Body Shops, Detailing",
    problem: [
      "Technicians can't answer phones mid-job",
      "Quote requests pile up in voicemail",
      "Customers call around until someone answers",
    ],
    solution: [
      "AI answers immediately, gathers vehicle info",
      "Books appointments based on availability",
      "Sends updates on service status",
    ],
    outcomes: ["Win more jobs by responding first", "Keep technicians focused", "Reduce call-backs"],
  },
  {
    id: "legal",
    icon: Scale,
    title: "Legal & Professional",
    subtitle: "Law Firms, Accountants, Consultants",
    problem: [
      "Potential clients call after hours",
      "Slow response loses high-value leads",
      "Staff time spent on unqualified leads",
    ],
    solution: [
      "AI qualifies leads 24/7 with intake questions",
      "Schedules consultations instantly",
      "Routes urgent matters appropriately",
    ],
    outcomes: ["Capture leads competitors miss", "Pre-qualify before calls", "Reduce intake time 75%"],
  },
  {
    id: "fitness",
    icon: Dumbbell,
    title: "Fitness & Coaching",
    subtitle: "Gyms, Personal Trainers, Studios",
    problem: [
      "Leads inquire while you're training clients",
      "Trial booking is manual and slow",
      "Follow-up with prospects is inconsistent",
    ],
    solution: [
      "AI answers membership questions instantly",
      "Books trial sessions automatically",
      "Follows up with trial attendees",
    ],
    outcomes: ["Convert more trials to members", "Focus on training", "Consistent follow-up"],
  },
];

export default function Solutions() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Solutions That Work{" "}
              <span className="text-gradient">While You Sleep</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Stop losing leads to missed calls and slow responses. Easy Day AI automates customer communication so you can focus on delivering great service.
            </p>
            <Button size="lg" className="shadow-glow" asChild>
              <Link to="/contact">Book an Appointment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our AI Solutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three powerful automation tools that work together to handle your customer communication.
            </p>
          </div>
          <div className="space-y-24">
            {solutions.map((solution, index) => (
              <div
                key={solution.title}
                className={`flex flex-col ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-12 items-center`}
              >
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <solution.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-3xl font-bold">{solution.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {solution.description}
                  </p>
                  <ul className="space-y-3">
                    {solution.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="shadow-glow" asChild>
                    <Link to="/contact">
                      Book an Appointment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <div className="flex-1">
                  <Card className="bg-card border-border/50 shadow-card overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary to-accent/10 flex items-center justify-center">
                        <solution.icon className="w-24 h-24 text-primary/30" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Service Businesses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're fixing HVAC units, running a medspa, or managing a law firm — Easy Day AI automates customer communication for your industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Card key={industry.id} className="bg-card border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <industry.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{industry.title}</h3>
                      <p className="text-xs text-muted-foreground">{industry.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">The Problem</span>
                      </div>
                      <ul className="space-y-1">
                        {industry.problem.map((point) => (
                          <li key={point} className="text-xs text-muted-foreground pl-6">• {point}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Our Solution</span>
                      </div>
                      <ul className="space-y-1">
                        {industry.solution.map((point) => (
                          <li key={point} className="text-xs text-muted-foreground pl-6">• {point}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Results</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {industry.outcomes.map((outcome) => (
                          <span key={outcome} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {outcome}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Don't see your industry?</p>
            <Button variant="outline" asChild>
              <Link to="/contact">Let's Talk About Your Needs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to automate your customer communication?
          </h2>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/contact">Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
