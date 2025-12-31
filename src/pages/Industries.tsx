import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  Stethoscope,
  Car,
  Scale,
  Dumbbell,
  Home,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const industries = [
  {
    id: "home-services",
    icon: Wrench,
    title: "Home Services",
    subtitle: "HVAC, Plumbers, Electricians, Contractors",
    problem: {
      title: "The Problem",
      points: [
        "You're on a job when a new lead calls",
        "By the time you call back, they've hired someone else",
        "Evenings and weekends go unanswered",
        "Scheduling takes 10+ minutes per customer",
      ],
    },
    solution: {
      title: "The Easy Day AI Solution",
      points: [
        "AI answers every call and text instantly",
        "Qualifies the job (location, urgency, service needed)",
        "Books appointments directly into your calendar",
        "Sends confirmation and reminder texts",
      ],
    },
    outcomes: [
      "Capture leads 24/7 without hiring staff",
      "Reduce scheduling time by 90%",
      "Never miss a call during a job again",
    ],
  },
  {
    id: "healthcare",
    icon: Stethoscope,
    title: "Healthcare & Wellness",
    subtitle: "Medical Offices, Dental, Medspas, Clinics",
    problem: {
      title: "The Problem",
      points: [
        "Front desk is overwhelmed with calls",
        "Patients can't get through to book",
        "No-shows cost thousands per month",
        "After-hours inquiries go unanswered",
      ],
    },
    solution: {
      title: "The Easy Day AI Solution",
      points: [
        "AI handles appointment scheduling 24/7",
        "Sends automated appointment reminders",
        "Answers common patient questions",
        "Follows up with no-shows automatically",
      ],
    },
    outcomes: [
      "Reduce no-shows by up to 40%",
      "Free up front desk for in-person patients",
      "Capture after-hours appointment requests",
    ],
  },
  {
    id: "automotive",
    icon: Car,
    title: "Automotive",
    subtitle: "Auto Repair, Body Shops, Detailing",
    problem: {
      title: "The Problem",
      points: [
        "Technicians can't answer phones mid-job",
        "Quote requests pile up in voicemail",
        "Customers call around until someone answers",
        "Manual scheduling wastes valuable time",
      ],
    },
    solution: {
      title: "The Easy Day AI Solution",
      points: [
        "AI answers immediately, gathers vehicle info",
        "Qualifies the service request",
        "Books appointments based on availability",
        "Sends updates on service status",
      ],
    },
    outcomes: [
      "Win more jobs by responding first",
      "Keep technicians focused on repairs",
      "Automated status updates reduce call-backs",
    ],
  },
  {
    id: "legal",
    icon: Scale,
    title: "Legal & Professional Services",
    subtitle: "Law Firms, Accountants, Consultants",
    problem: {
      title: "The Problem",
      points: [
        "Potential clients call after hours",
        "Slow response loses high-value leads",
        "Intake forms take too long",
        "Staff time spent on unqualified leads",
      ],
    },
    solution: {
      title: "The Easy Day AI Solution",
      points: [
        "AI qualifies leads 24/7 with intake questions",
        "Schedules consultations instantly",
        "Collects case details before the call",
        "Routes urgent matters appropriately",
      ],
    },
    outcomes: [
      "Capture leads competitors miss",
      "Pre-qualify before consultations",
      "Reduce intake time by 75%",
    ],
  },
  {
    id: "fitness",
    icon: Dumbbell,
    title: "Fitness & Coaching",
    subtitle: "Gyms, Personal Trainers, Studios",
    problem: {
      title: "The Problem",
      points: [
        "Leads inquire while you're training clients",
        "Membership questions go unanswered",
        "Trial booking is manual and slow",
        "Follow-up with prospects is inconsistent",
      ],
    },
    solution: {
      title: "The Easy Day AI Solution",
      points: [
        "AI answers membership questions instantly",
        "Books trial sessions automatically",
        "Follows up with trial attendees",
        "Sends class reminders and updates",
      ],
    },
    outcomes: [
      "Convert more trial leads to members",
      "Focus on training, not admin",
      "Consistent follow-up without the effort",
    ],
  },
];

export default function Industries() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Built for{" "}
              <span className="text-gradient">Service Businesses</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you're fixing HVAC units, running a medspa, or managing a law firm — Easy Day AI automates customer communication for your industry.
            </p>
            <Button size="lg" className="shadow-glow" asChild>
              <Link to="/contact">Book an Appointment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-16">
        <div className="container mx-auto px-4 space-y-24">
          {industries.map((industry, index) => (
            <div key={industry.id} id={industry.id} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <industry.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{industry.title}</h2>
                  <p className="text-muted-foreground">{industry.subtitle}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Problem */}
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <XCircle className="w-5 h-5 text-destructive" />
                      <h3 className="text-xl font-semibold">{industry.problem.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {industry.problem.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-muted-foreground">
                          <span className="text-destructive mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Solution */}
                <Card className="bg-card border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-accent" />
                      <h3 className="text-xl font-semibold">{industry.solution.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {industry.solution.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-1" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Outcomes */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Business Outcomes</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {industry.outcomes.map((outcome) => (
                      <div key={outcome} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                        <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm font-medium">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <Button className="shadow-glow" asChild>
                  <Link to="/contact">
                    Book an Appointment
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {index < industries.length - 1 && (
                <div className="border-b border-border mt-16" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Don't see your industry?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Easy Day AI works for any business that takes appointments or handles customer inquiries. Let's talk about your needs.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/contact">Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
