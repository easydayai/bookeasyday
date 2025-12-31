import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, ArrowRight, Sparkles } from "lucide-react";

const examplePrompts = [
  "Can I book an appointment?",
  "Are you available tomorrow?",
  "I need to reschedule.",
  "What are your hours?",
  "How much do you charge?",
  "Do you serve my area?",
];

export default function Demo() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Live Demo</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              See Easy Day AI{" "}
              <span className="text-gradient">In Action</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Experience how Easy Day AI handles customer conversations. Try our live demo to see the AI respond, qualify, and book appointments in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Cards */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* SMS Demo */}
            <Card className="bg-card border-border/50 shadow-card">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">SMS Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Text our demo number and watch Easy Day AI respond and book automatically.
                </p>
                <div className="p-4 bg-secondary rounded-xl text-center">
                  <div className="text-sm text-muted-foreground mb-1">Demo Number</div>
                  <div className="text-2xl font-bold text-primary">(555) 123-DEMO</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Try saying:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• "I'd like to book an appointment"</li>
                    <li>• "What times are available this week?"</li>
                    <li>• "I need to cancel my appointment"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Phone Demo */}
            <Card className="bg-card border-border/50 shadow-card">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4">
                  <Phone className="w-7 h-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Phone Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Call our demo number to hear Easy Day AI answer and handle the call.
                </p>
                <div className="p-4 bg-secondary rounded-xl text-center">
                  <div className="text-sm text-muted-foreground mb-1">Demo Number</div>
                  <div className="text-2xl font-bold text-primary">(555) 456-DEMO</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Try asking:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• "I'd like to schedule a service"</li>
                    <li>• "Do you have availability tomorrow?"</li>
                    <li>• "What services do you offer?"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Example Prompts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">What to Try</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {examplePrompts.map((prompt) => (
                <div
                  key={prompt}
                  className="px-4 py-2 bg-secondary rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                >
                  "{prompt}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What Happens During the Demo</h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">You Send a Message or Call</h3>
                  <p className="text-muted-foreground">Reach out to our demo number just like a real customer would.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Day AI Responds Instantly</h3>
                  <p className="text-muted-foreground">The AI understands your request and starts the conversation naturally.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Complete Actions Automatically</h3>
                  <p className="text-muted-foreground">Watch as it qualifies your request and completes the booking process.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to install Easy Day AI for your business?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Let's discuss how Easy Day AI can automate your customer communication.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/contact">
              Book an Appointment
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
