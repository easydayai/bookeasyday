import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Mail, Phone, Clock } from "lucide-react";

const industries = [
  "HVAC / Plumbing / Electrical",
  "Medical / Dental / Medspa",
  "Auto Repair / Body Shop",
  "Legal / Professional Services",
  "Gym / Fitness / Coaching",
  "Home Services / Cleaning",
  "Other",
];

const automationOptions = [
  { id: "calls", label: "Phone Calls" },
  { id: "sms", label: "SMS / Text Messages" },
  { id: "booking", label: "Appointment Booking" },
  { id: "followups", label: "Follow-ups & Reminders" },
  { id: "other", label: "Other" },
];

const calendarSystems = [
  "Google Calendar",
  "Cal.com",
  "Calendly",
  "Acuity",
  "Microsoft Outlook",
  "Other / None",
];

export default function EasyDayContact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>([]);

  const handleAutomationChange = (id: string, checked: boolean) => {
    setSelectedAutomations((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: "Request Received",
      description: "We'll reach out within 24 hours to schedule your automation call.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <Card className="max-w-xl mx-auto bg-card border-border/50 shadow-card">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Thanks for reaching out!</h1>
                <p className="text-muted-foreground mb-8">
                  We'll reach out within 24 hours to schedule your automation call.
                </p>
                <Button variant="outline" asChild>
                  <a href="/">Return to Home</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Let's Automate{" "}
              <span className="text-gradient">Your Business</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill out the form below and we'll schedule a call to discuss how Easy Day AI can save you time and capture more revenue.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Book an Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          placeholder="Your Business Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry *</Label>
                        <Select required>
                          <SelectTrigger id="industry">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry.toLowerCase()}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name *</Label>
                        <Input
                          id="ownerName"
                          placeholder="Your Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 555-5555"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@business.com"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>What do you want to automate?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {automationOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={option.id}
                              checked={selectedAutomations.includes(option.id)}
                              onCheckedChange={(checked) =>
                                handleAutomationChange(option.id, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={option.id}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="calendar">Current Calendar System</Label>
                      <Select>
                        <SelectTrigger id="calendar">
                          <SelectValue placeholder="Select your calendar system" />
                        </SelectTrigger>
                        <SelectContent>
                          {calendarSystems.map((system) => (
                            <SelectItem key={system} value={system.toLowerCase()}>
                              {system}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Tell us about your current challenges or what you're looking to achieve..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full shadow-glow">
                      Book an Appointment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Response Time</h3>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll reach out to schedule a call at a time that works for you.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Us</h3>
                      <p className="text-sm text-muted-foreground">hello@easydayai.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Call Us</h3>
                      <p className="text-sm text-muted-foreground">(555) 000-0000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-border/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">What to Expect</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      15-minute discovery call
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      Custom automation plan
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      No technical skills required
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      Setup in days, not weeks
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
