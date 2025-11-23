import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsentModal({ open, onOpenChange }: ConsentModalProps) {
  const navigate = useNavigate();
  const [consents, setConsents] = useState({
    informationCollection: false,
    thirdPartySharing: false,
    applicationFee: false,
    refundPolicy: false,
    noGuarantee: false,
  });

  const allChecked = Object.values(consents).every((value) => value);

  const handleCheckboxChange = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAgree = () => {
    if (allChecked) {
      onOpenChange(false);
      navigate("/apply");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setConsents({
      informationCollection: false,
      thirdPartySharing: false,
      applicationFee: false,
      refundPolicy: false,
      noGuarantee: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Consent & Applicant Agreement</DialogTitle>
          <DialogDescription>
            By continuing, you agree to the following terms regarding your Rent EZ application and use of our services.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="overflow-y-auto px-6 py-4 flex-1">
          <div className="space-y-6 text-sm">
            {/* Section 1 */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <div className="space-y-2">
              <h3 className="font-bold text-base">8. Background & Verification Authorization</h3>
              <p>I authorize Rent EZ and its partners to use my information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verify my identity</li>
                <li>Verify my income and employment</li>
                <li>Run background or rental history checks where permitted by law</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="space-y-2">
              <h3 className="font-bold text-base">9. Limitation of Liability</h3>
              <p>
                I acknowledge that Rent EZ provides a rental connection service and is not responsible for the actions, policies, or decisions of landlords, property managers, or third-party verification services. Rent EZ's liability is limited to the amount of the application fee paid.
              </p>
            </div>

            {/* Section 10 */}
            <div className="space-y-2">
              <h3 className="font-bold text-base">10. Electronic Agreement</h3>
              <p>
                I understand that by checking the boxes below and clicking "I Agree & Continue," I am providing my electronic signature and legally binding consent to all terms outlined in this agreement.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed footer with checkboxes and buttons */}
        <div className="px-6 py-4 border-t bg-background flex-shrink-0 space-y-4">
          <div className="space-y-3">
            <p className="font-semibold text-sm">Please confirm your agreement to all terms:</p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="informationCollection"
                  checked={consents.informationCollection}
                  onCheckedChange={() => handleCheckboxChange("informationCollection")}
                />
                <Label htmlFor="informationCollection" className="text-xs font-normal cursor-pointer leading-relaxed">
                  I agree to the collection, storage, and use of my information by Rent EZ for rental application and verification purposes.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="thirdPartySharing"
                  checked={consents.thirdPartySharing}
                  onCheckedChange={() => handleCheckboxChange("thirdPartySharing")}
                />
                <Label htmlFor="thirdPartySharing" className="text-xs font-normal cursor-pointer leading-relaxed">
                  I authorize Rent EZ to share my information with rental specialists, landlords, property managers, and verification services for the purpose of evaluating my rental eligibility.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="applicationFee"
                  checked={consents.applicationFee}
                  onCheckedChange={() => handleCheckboxChange("applicationFee")}
                />
                <Label htmlFor="applicationFee" className="text-xs font-normal cursor-pointer leading-relaxed">
                  I understand the $20 fee is an application/service fee, not rent or a security deposit, and that approval is not guaranteed.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="refundPolicy"
                  checked={consents.refundPolicy}
                  onCheckedChange={() => handleCheckboxChange("refundPolicy")}
                />
                <Label htmlFor="refundPolicy" className="text-xs font-normal cursor-pointer leading-relaxed">
                  I understand the 30-day move-in or money-back policy and that refunds depend on my cooperation and meeting basic requirements.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="noGuarantee"
                  checked={consents.noGuarantee}
                  onCheckedChange={() => handleCheckboxChange("noGuarantee")}
                />
                <Label htmlFor="noGuarantee" className="text-xs font-normal cursor-pointer leading-relaxed">
                  I agree that final approval decisions are made by landlords or property managers, not by Rent EZ, and I release Rent EZ from responsibility for those decisions.
                </Label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!allChecked}
              onClick={handleAgree}
            >
              I Agree & Continue
            </Button>
          </div>

          {!allChecked && (
            <p className="text-xs text-muted-foreground text-center">
              You must check all boxes above to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
