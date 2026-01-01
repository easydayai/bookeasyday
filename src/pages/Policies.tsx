import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, HeadphonesIcon } from "lucide-react";

export default function Policies() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Policies & Terms</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about working with Easy Day AI
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Privacy Policy
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Easy Day AI takes your privacy seriously. We collect business information including
                    your name, contact details, and business data solely for the purpose of providing
                    our AI automation services.
                  </p>
                  <p>Your information is used to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Configure and deploy AI agents for your business</li>
                    <li>Handle calls, texts, and booking on your behalf</li>
                    <li>Communicate with you about your service status</li>
                    <li>Improve our AI capabilities and services</li>
                  </ul>
                  <p>
                    We use industry-standard security measures to protect your data. We do not sell
                    your personal or business information to third parties. We may process your
                    customer interactions through our AI systems to provide the automation services.
                  </p>
                  <p>
                    You have the right to request access to, correction of, or deletion of your
                    information at any time by contacting privacy@easyday.ai.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Terms of Service
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Easy Day AI provides AI-powered automation services including call handling,
                    text messaging, booking, and follow-up systems for service businesses.
                  </p>
                  <p>By using our service, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate business and contact information</li>
                    <li>Use the service for legitimate business purposes only</li>
                    <li>Comply with all applicable laws regarding automated communications</li>
                    <li>Not use the service for spam, harassment, or fraudulent activities</li>
                    <li>Maintain appropriate customer consent for automated messaging</li>
                  </ul>
                  <p>
                    Easy Day AI reserves the right to suspend or terminate service for violations
                    of these terms or for any activity that may harm our platform or other users.
                  </p>
                  <p>
                    Service availability and AI performance may vary. We continuously improve our
                    systems but cannot guarantee 100% uptime or accuracy.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <HeadphonesIcon className="h-6 w-6 text-primary" />
                  Support & Contact
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Need help with your Easy Day AI setup or have questions about our services?
                    Our team is here to assist you.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>General inquiries: hello@easyday.ai</li>
                    <li>Technical support: support@easyday.ai</li>
                    <li>Privacy concerns: privacy@easyday.ai</li>
                  </ul>
                  <p>
                    We aim to respond to all inquiries within 24-48 business hours. For urgent
                    issues, please book a call through our scheduling system.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Refund Policy</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    We want you to be completely satisfied with Easy Day AI. If you're not happy
                    with our service:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cancel anytime during your trial period for a full refund</li>
                    <li>Monthly subscriptions can be cancelled before the next billing cycle</li>
                    <li>Setup fees are non-refundable once AI agents are deployed</li>
                  </ul>
                  <p>
                    For refund requests or billing questions, contact billing@easyday.ai.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}