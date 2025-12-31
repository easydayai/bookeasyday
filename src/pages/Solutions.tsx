import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Phone,
  Cog,
  CheckCircle2,
  ArrowRight,
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
                    <h2 className="text-3xl font-bold">{solution.title}</h2>
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
