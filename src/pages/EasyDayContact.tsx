import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import BookingCalendar from "@/components/BookingCalendar";

export default function EasyDayContact() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book Your{" "}
              <span className="text-gradient">Automation Call</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a time that works for you and let's discuss how Easy Day AI can automate your business.
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Custom Booking Calendar */}
            <div className="lg:col-span-2">
              <BookingCalendar />
            </div>

            {/* What to Expect */}
            <div className="space-y-6">
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