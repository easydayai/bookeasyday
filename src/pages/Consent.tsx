import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Consent() {
  const navigate = useNavigate();
  const [consents, setConsents] = useState({
    informationCollection: false,
    thirdPartySharing: false,
    communication: false,
    applicationFee: false,
    refundPolicy: false,
    noGuarantee: false,
    accuracyConfirmation: false,
    backgroundCheck: false,
  });

  const allChecked = Object.values(consents).every((value) => value);

  const handleCheckboxChange = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    if (allChecked) {
      navigate("/apply");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardContent className="pt-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">Consent & Applicant Agreement</h1>
              <p className="text-muted-foreground">
                By continuing, you agree to the following terms regarding your Rent EZ application and use of our services.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              {/* Section 1 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">1. Consent to Collect & Use Your Information</h3>
                <p>
                  I understand and agree that Rent EZ will collect, store, and use my personal information (including my contact details, income information, employment details, rental history, and any documents I provide) for the purpose of:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Reviewing my application</li>
                  <li>Matching me with rental specialists, landlords, or property managers</li>
                  <li>Facilitating my rental approval and move-in process</li>
                </ul>
                <p>
                  I understand my information may be stored securely in electronic form and used only for rental and verification purposes related to this service.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">2. Sharing Information With Third Parties</h3>
                <p>I authorize Rent EZ to share my application information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Rental specialists and brokers</li>
                  <li>Landlords and property managers</li>
                  <li>Third-party verification services (for background, income, or identity checks)</li>
                </ul>
                <p>
                  This sharing is only for evaluating my rental eligibility and helping me get approved for housing.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">3. Communication Consent (Phone, SMS, Email)</h3>
                <p>I consent to Rent EZ contacting me by:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Phone calls</li>
                  <li>SMS/text messages</li>
                  <li>Email</li>
                </ul>
                <p>
                  regarding my application, approvals/denials, requested documents, and rental opportunities. Message and data rates may apply. I understand I can opt out of marketing messages at any time, but service-related messages may still be required.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">4. Application Fee & Service Description</h3>
                <p>I understand that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    The <strong>$20 fee</strong> is an application/service fee paid to Rent EZ, not a security deposit and not rent.
                  </li>
                  <li>
                    This fee covers processing my information, matching me with a rental specialist, and attempting to secure approval with participating landlords or properties.
                  </li>
                </ul>
                <p>
                  I understand Rent EZ is a rental connection and application processing service, not the landlord or property owner.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">5. Refund & Timeframe Policy (30-Day Promise)</h3>
                <p>
                  I understand that Rent EZ offers a <strong>"move-in within 30 days or your money back"</strong> guarantee, subject to the following:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    I must cooperate with the process (respond to calls/texts/emails, provide requested documents, and consider reasonable units presented to me).
                  </li>
                  <li>
                    If, after 30 days from the date of my completed application and payment, I have not been approved for at least one qualifying rental option through Rent EZ, I may request a refund of my $20 application fee.
                  </li>
                  <li>
                    Refund eligibility is determined by Rent EZ based on my cooperation, responsiveness, and whether I met the basic requirements (income, background, etc.).
                  </li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">6. No Guarantee of Approval or Specific Apartment</h3>
                <p>I understand and agree:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Rent EZ does <strong>not</strong> guarantee that I will be approved for any specific apartment, building, or landlord.
                  </li>
                  <li>
                    Final approval decisions are made by landlords, property managers, or their screening systems—not by Rent EZ.
                  </li>
                  <li>
                    Rent EZ is not responsible if I am denied based on criteria set by landlords, property managers, or third-party screening services.
                  </li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">7. Accuracy of Information</h3>
                <p>
                  I confirm that all information I provide is true, accurate, and complete to the best of my knowledge.
                </p>
                <p>I understand that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Providing false, incomplete, or misleading information can result in application denial, cancellation of services, or loss of any guarantees.
                  </li>
                </ul>
              </div>

              {/* Section 8 */}
              <div className="space-y-3">
                <h3 className="font-bold text-base">8. Background & Verification Authorization</h3>
                <p>I authorize Rent EZ and its partners to use my information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Verify my identity</li>
                  <li>Verify my income and employment</li>
                  <li>Run background or rental history checks where permitted by law</li>
                </ul>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4 pt-6 border-t">
              <p className="font-semibold text-base">Please confirm your agreement to all terms:</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="informationCollection"
                    checked={consents.informationCollection}
                    onCheckedChange={() => handleCheckboxChange("informationCollection")}
                  />
                  <Label htmlFor="informationCollection" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I consent to Rent EZ collecting and using my personal information for application processing
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="thirdPartySharing"
                    checked={consents.thirdPartySharing}
                    onCheckedChange={() => handleCheckboxChange("thirdPartySharing")}
                  />
                  <Label htmlFor="thirdPartySharing" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I authorize sharing my information with landlords, property managers, and verification services
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="communication"
                    checked={consents.communication}
                    onCheckedChange={() => handleCheckboxChange("communication")}
                  />
                  <Label htmlFor="communication" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I consent to being contacted via phone, SMS, and email regarding my application
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="applicationFee"
                    checked={consents.applicationFee}
                    onCheckedChange={() => handleCheckboxChange("applicationFee")}
                  />
                  <Label htmlFor="applicationFee" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I understand the $20 fee is for application processing and is non-refundable except under the 30-day guarantee
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="refundPolicy"
                    checked={consents.refundPolicy}
                    onCheckedChange={() => handleCheckboxChange("refundPolicy")}
                  />
                  <Label htmlFor="refundPolicy" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I understand the 30-day money-back guarantee requires my cooperation and responsiveness
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="noGuarantee"
                    checked={consents.noGuarantee}
                    onCheckedChange={() => handleCheckboxChange("noGuarantee")}
                  />
                  <Label htmlFor="noGuarantee" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I understand Rent EZ does not guarantee approval for any specific apartment or landlord
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="accuracyConfirmation"
                    checked={consents.accuracyConfirmation}
                    onCheckedChange={() => handleCheckboxChange("accuracyConfirmation")}
                  />
                  <Label htmlFor="accuracyConfirmation" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I confirm all information I provide is true, accurate, and complete
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="backgroundCheck"
                    checked={consents.backgroundCheck}
                    onCheckedChange={() => handleCheckboxChange("backgroundCheck")}
                  />
                  <Label htmlFor="backgroundCheck" className="text-sm font-normal cursor-pointer leading-relaxed">
                    I authorize background and verification checks as described above
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Go Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={!allChecked}
                onClick={handleContinue}
              >
                I Agree & Continue
              </Button>
            </div>

            {!allChecked && (
              <p className="text-sm text-muted-foreground text-center">
                You must check all boxes above to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
