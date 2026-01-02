import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, FileText, DollarSign, Shield, Mail } from "lucide-react";

const AffiliateLegal = () => {
  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Affiliate Program – Legal & Compliance Information
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            This page provides transparency regarding Easy Day AI's business structure, 
            affiliate program terms, and compliance practices for prospective and current affiliates.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Section 1: Business Entity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Building2 className="h-6 w-6 text-primary" />
              1. Business Entity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registered Business Name</p>
                <p className="font-medium text-foreground">[To be provided upon request]</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Business Structure</p>
                <p className="font-medium text-foreground">Limited Liability Company (LLC)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Jurisdiction of Registration</p>
                <p className="font-medium text-foreground">State of New York, United States</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Principal Business Address</p>
                <p className="font-medium text-foreground">[Available upon formal partnership onboarding]</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Employer Identification Number (EIN)</p>
                <p className="font-medium text-foreground">Available upon formal partnership onboarding or W-9 request</p>
              </div>
            </div>
            <Separator />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Easy Day AI operates as a legally registered business entity in accordance with applicable 
              federal and state regulations. We maintain proper business licensing, tax compliance, and 
              corporate governance standards. Documentation verifying our legal status is available to 
              qualified partners upon execution of appropriate confidentiality agreements or formal 
              partnership arrangements.
            </p>
          </CardContent>
        </Card>

        {/* Section 2: Overview of the Affiliate Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="h-6 w-6 text-primary" />
              2. Overview of the Easy Day AI Affiliate Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The Easy Day AI Affiliate Program enables independent affiliates to promote our AI automation 
              platform in exchange for performance-based commissions tied to verified client activity. 
              Affiliates earn commissions when referred businesses complete qualifying actions as defined 
              in the Affiliate Agreement.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">Independent Contractor Status</p>
              <p className="text-sm text-muted-foreground">
                All affiliates participate as independent contractors. Affiliates are not employees, 
                agents, joint venturers, or legal representatives of Easy Day AI. Affiliates have 
                no authority to bind Easy Day AI to any contract, agreement, or obligation, and 
                shall not represent themselves as having such authority.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Affiliate Agreement & Legal Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="h-6 w-6 text-primary" />
              3. Affiliate Agreement & Legal Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Participation in the Easy Day AI Affiliate Program requires acceptance of the official 
              Affiliate Agreement. This legally binding agreement governs:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Commission eligibility requirements and calculation methods</li>
              <li>Promotional guidelines and brand usage policies</li>
              <li>Payment terms, schedules, and thresholds</li>
              <li>Compliance requirements and prohibited activities</li>
              <li>Termination conditions and dispute resolution procedures</li>
              <li>Confidentiality and data protection obligations</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              A complete, viewable version of the Affiliate Agreement is provided during the 
              affiliate signup process. Prospective affiliates must review and accept these 
              terms prior to activation.
            </p>
            <div className="pt-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => window.open('https://easydayai.goaffpro.com/create-account', '_blank')}
              >
                <FileText className="h-4 w-4" />
                View Affiliate Agreement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Commission Tracking & Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <DollarSign className="h-6 w-6 text-primary" />
              4. Commission Tracking & Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Paying Entity</p>
                <p className="font-medium text-foreground">[Same as registered business name]</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tracking Method</p>
                <p className="font-medium text-foreground">GoAffPro Affiliate Platform</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Minimum Payout Threshold</p>
                <p className="font-medium text-foreground">$50.00 USD</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Methods</p>
                <p className="font-medium text-foreground">PayPal, Direct Bank Transfer (ACH)</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Commission Validation Period</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All commissions are subject to a validation period to ensure legitimacy and prevent 
                fraudulent activity. During this period, referred transactions are verified to confirm 
                they meet program requirements. Commissions are finalized and become payable only after 
                successful validation. The standard validation period is 30 days from the date of the 
                qualifying transaction.
              </p>
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">Tracking & Audit Assurance</p>
              <p className="text-sm text-muted-foreground">
                All affiliate activity, including clicks, conversions, and commission calculations, 
                is logged, tracked, and auditable. Our tracking systems maintain comprehensive records 
                to ensure accurate attribution and transparent reporting for all program participants.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Compliance & Transparency Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Shield className="h-6 w-6 text-primary" />
              5. Compliance & Transparency Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Easy Day AI is committed to operating with full transparency, ethical marketing 
              practices, and compliance with all applicable federal, state, and local regulations. 
              We maintain open communication with our affiliate partners and welcome inquiries 
              regarding our business practices, program terms, and compliance measures.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We cooperate fully with affiliates conducting due diligence and are prepared to 
              provide additional documentation or clarification as reasonably requested, subject 
              to appropriate confidentiality protections.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Legal & Partnership Inquiries
              </p>
              <p className="text-sm text-muted-foreground">
                For legal inquiries, partnership discussions, or compliance-related questions, 
                please contact us at:{" "}
                <a 
                  href="mailto:hello@easydayai.com" 
                  className="text-primary hover:underline"
                >
                  hello@easydayai.com
                </a>
              </p>
            </div>
            <Separator />
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> Sensitive tax documentation, internal financial records, 
                and proprietary business information are provided only after formal onboarding, 
                execution of appropriate confidentiality agreements, or when contractually or legally 
                required. This page is intended for informational purposes and does not constitute 
                legal advice or a binding offer. Program terms are subject to change. Please refer 
                to the official Affiliate Agreement for complete terms and conditions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Ready to Join the Easy Day AI Affiliate Program?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Apply today to become an Easy Day AI affiliate partner and start earning commissions 
            for referring businesses to our AI automation platform.
          </p>
          <Button 
            size="lg"
            onClick={() => window.open('https://easydayai.goaffpro.com/create-account', '_blank')}
          >
            Apply to Become an Affiliate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLegal;
