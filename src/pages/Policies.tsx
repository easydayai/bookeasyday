import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function Policies() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Policies & Terms</h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about working with Rent EZ
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  30-Day Move-In Money-Back Policy
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    After you are fully approved by Rent EZ and have paid the $20 application fee, we
                    guarantee that we will help you secure an approved move-in within 30 days from
                    the date of your approval.
                  </p>
                  <p>
                    If we are unable to help you move into an apartment within this 30-day period,
                    you may request a full refund of your $20 application fee.
                  </p>
                  <p className="font-semibold text-foreground">This guarantee is subject to the following conditions:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      You must respond to all communication from Rent EZ and our rental specialists
                      in a timely manner
                    </li>
                    <li>
                      You must provide accurate, complete, and truthful information and documentation
                    </li>
                    <li>
                      You must cooperate with the process and not repeatedly reject reasonable
                      listings that match your stated criteria
                    </li>
                    <li>
                      You must meet the eligibility requirements outlined in our Basic Eligibility
                      section
                    </li>
                    <li>
                      The guarantee does not apply if there is evidence of fraud, false documents, or
                      non-cooperation
                    </li>
                  </ul>
                  <p>
                    To request a refund, contact us at refunds@rentez.com with your application
                    details within 60 days of your approval date.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Basic Eligibility Requirements</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>To qualify for Rent EZ services, applicants must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Have verifiable income from employment, self-employment, benefits, or other
                      legitimate sources
                    </li>
                    <li>
                      Meet minimum income requirements (typically 2.5-3x the monthly rent, though
                      this varies by landlord)
                    </li>
                    <li>
                      Pass background and credit screening criteria set by landlords and property
                      managers
                    </li>
                    <li>
                      Have no active serious evictions or recent violent felony convictions (some
                      exceptions may apply based on circumstances and time passed)
                    </li>
                    <li>
                      Be able to provide required documentation including ID, bank statements, pay
                      stubs, and references
                    </li>
                  </ul>
                  <p>
                    Please note: Meeting these basic requirements does not guarantee approval by all
                    landlords. Final approval decisions are made by individual property owners and
                    managers based on their specific criteria.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Refund Policy</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p className="font-semibold text-foreground">Refunds are granted when:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      We are unable to help you secure an approved move-in within 30 days of your
                      approval date (subject to conditions above)
                    </li>
                    <li>
                      There is a technical error or service failure on our part that prevents us from
                      providing the service
                    </li>
                  </ul>
                  <p className="font-semibold text-foreground">Refunds are NOT granted when:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You do not meet basic eligibility requirements</li>
                    <li>
                      You fail to respond to communications or provide requested documentation in a
                      timely manner
                    </li>
                    <li>You repeatedly reject reasonable property matches without valid reasons</li>
                    <li>
                      You provide false or fraudulent information or documentation
                    </li>
                    <li>You violate our terms of service</li>
                    <li>You decide to stop looking for housing or move out of the area</li>
                  </ul>
                  <p>
                    All refund requests must be submitted via email to refunds@rentez.com and will be
                    reviewed within 7-10 business days.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Privacy Policy</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Rent EZ takes your privacy seriously. We collect personal information including
                    your name, contact details, employment information, income documentation, and
                    background details solely for the purpose of helping you secure rental housing.
                  </p>
                  <p>Your information is used to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Match you with suitable rental properties and specialists</li>
                    <li>Submit applications to landlords and property managers on your behalf</li>
                    <li>Communicate with you about your application status</li>
                    <li>Improve our services</li>
                  </ul>
                  <p>
                    We use industry-standard security measures to protect your data. We do not sell
                    your personal information to third parties. We may share your information with
                    rental specialists, landlords, and property managers as necessary to facilitate
                    your housing search.
                  </p>
                  <p>
                    You have the right to request access to, correction of, or deletion of your
                    personal information at any time by contacting privacy@rentez.com.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Terms of Use</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Rent EZ is a rental application service that connects renters with rental
                    specialists, landlords, and property managers. We do not own or manage rental
                    properties directly.
                  </p>
                  <p>By using our service, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide truthful and accurate information</li>
                    <li>Respond to communications in a timely manner</li>
                    <li>Work cooperatively with our specialists and landlords</li>
                    <li>
                      Understand that final rental approval decisions are made by property owners
                      and managers
                    </li>
                    <li>Not use the service for fraudulent or illegal purposes</li>
                  </ul>
                  <p>
                    Rent EZ reserves the right to refuse service to anyone who violates these terms,
                    provides false information, or engages in behavior that interferes with our
                    ability to provide services.
                  </p>
                  <p>
                    For questions about our policies, please contact us at support@rentez.com.
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
