import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dob: string;
  desiredCity: string;
  desiredState: string;
  moveInDate: string;
  budget: string;
  bedrooms: string;
  bathrooms: string;
  pets: string;
  assistance: string;
  employmentStatus: string;
  employer: string;
  jobTitle: string;
  timeAtJob: string;
  income: string;
  payFrequency: string;
  additionalIncome: string;
  creditScore: string;
  evictions: string;
  criminalHistory: string;
  ref1Name: string;
  ref1Relationship: string;
  ref1Phone: string;
  ref2Name: string;
  ref2Relationship: string;
  ref2Phone: string;
  confirmed: boolean;
  agreed: boolean;
  authorized: boolean;
}

export default function Apply() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect in-app browser on mount
  useEffect(() => {
    const inAppBrowser = /Instagram|FBAN|FBAV|Twitter|LinkedIn/.test(navigator.userAgent);
    setIsInAppBrowser(inAppBrowser);
  }, []);

  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    dob: "",
    desiredCity: "",
    desiredState: "",
    moveInDate: "",
    budget: "",
    bedrooms: "",
    bathrooms: "",
    pets: "",
    assistance: "",
    employmentStatus: "",
    employer: "",
    jobTitle: "",
    timeAtJob: "",
    income: "",
    payFrequency: "",
    additionalIncome: "",
    creditScore: "",
    evictions: "",
    criminalHistory: "",
    ref1Name: "",
    ref1Relationship: "",
    ref1Phone: "",
    ref2Name: "",
    ref2Relationship: "",
    ref2Phone: "",
    confirmed: false,
    agreed: false,
    authorized: false,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const updateFormData = (field: keyof ApplicationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);

    try {
      // Detect in-app browsers (Instagram, Facebook, etc.)
      const isInAppBrowser = /Instagram|FBAN|FBAV/.test(navigator.userAgent);
      
      if (isInAppBrowser) {
        toast({
          title: "Please open in browser",
          description: "For best results, tap the '...' menu and select 'Open in Safari' or 'Open in Browser'",
          variant: "destructive",
          duration: 8000,
        });
      }

      // Get authenticated user (optional - for linking to account if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // Validate minimum required fields for database
      const requiredFields = {
        firstName: formData.firstName || 'Not',
        lastName: formData.lastName || 'Provided',
        email: formData.email || 'noemail@example.com',
        phone: formData.phone || '0000000000',
        city: formData.city || 'Not Provided',
        state: formData.state || 'N/A'
      };

      // Save application to database
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: user?.id || null,
          applicant_name: `${requiredFields.firstName} ${requiredFields.lastName}`,
          email: requiredFields.email,
          phone: requiredFields.phone,
          address: formData.address || null,
          city: requiredFields.city,
          state: requiredFields.state,
          desired_move_in_date: formData.moveInDate || null,
          monthly_income: parseFloat(formData.income) || null,
          bedroom_count: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          employment_type: formData.employmentStatus || null,
          status: 'pending',
          background_info: {
            dob: formData.dob,
            zip: formData.zip,
            desiredCity: formData.desiredCity,
            desiredState: formData.desiredState,
            budget: formData.budget,
            bathrooms: formData.bathrooms,
            pets: formData.pets,
            assistance: formData.assistance,
            employer: formData.employer,
            jobTitle: formData.jobTitle,
            timeAtJob: formData.timeAtJob,
            payFrequency: formData.payFrequency,
            additionalIncome: formData.additionalIncome,
            creditScore: formData.creditScore,
            evictions: formData.evictions,
            criminalHistory: formData.criminalHistory,
            references: [
              {
                name: formData.ref1Name,
                relationship: formData.ref1Relationship,
                phone: formData.ref1Phone,
              },
              {
                name: formData.ref2Name,
                relationship: formData.ref2Relationship,
                phone: formData.ref2Phone,
              },
            ],
          },
        })
        .select()
        .single();

      if (applicationError) {
        // Provide helpful error message for restricted browsers
        if (/Instagram|FBAN|FBAV/.test(navigator.userAgent)) {
          throw new Error("Unable to submit from in-app browser. Please open this page in Safari or your default browser by tapping the '...' menu and selecting 'Open in Safari' or 'Open in Browser'.");
        }
        throw applicationError;
      }

      // Store application ID in session storage for checkout
      sessionStorage.setItem('applicationId', application.id);

      toast({
        title: "Application saved!",
        description: "Redirecting to checkout...",
      });

      // Navigate to checkout
      navigate("/checkout");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      
      const errorMessage = error?.message || "There was an error saving your application. Please try again.";
      console.error("Detailed error:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardContent className="pt-6 space-y-6">
            {isInAppBrowser && (
              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
                <h3 className="font-semibold text-destructive mb-2">⚠️ Open in Browser for Best Experience</h3>
                <p className="text-sm text-muted-foreground">
                  You're viewing this in an in-app browser (Instagram/Facebook). For successful submission, 
                  please tap the menu (•••) and select "Open in Safari" or "Open in Browser".
                </p>
              </div>
            )}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Rent EZ Application</h1>
                <p className="text-muted-foreground">
                  Pay a one-time $20 application fee. If we don't help you get into a place within 30
                  days after approval, you get your money back (subject to our policies).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Step {step} of {totalSteps}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>

            {/* Step 1 - Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Current Address</Label>
                  <Input 
                    id="address" 
                    placeholder="Street Address" 
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input 
                      id="zip" 
                      value={formData.zip}
                      onChange={(e) => updateFormData('zip', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => updateFormData('dob', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2 - Housing & Budget */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Housing Preferences & Budget</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="desiredCity">Desired City</Label>
                    <Input 
                      id="desiredCity" 
                      value={formData.desiredCity}
                      onChange={(e) => updateFormData('desiredCity', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredState">Desired State</Label>
                    <Input 
                      id="desiredState" 
                      value={formData.desiredState}
                      onChange={(e) => updateFormData('desiredState', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">Target Move-In Date</Label>
                    <Input 
                      id="moveInDate" 
                      type="date" 
                      value={formData.moveInDate}
                      onChange={(e) => updateFormData('moveInDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Rent Budget ($)</Label>
                    <Input 
                      id="budget" 
                      type="number" 
                      placeholder="e.g., 1500" 
                      value={formData.budget}
                      onChange={(e) => updateFormData('budget', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms Needed</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => updateFormData('bedrooms', value)}>
                      <SelectTrigger id="bedrooms">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => updateFormData('bathrooms', value)}>
                      <SelectTrigger id="bathrooms">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                        <SelectItem value="2">2+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Do you have any pets?</Label>
                  <Select value={formData.pets} onValueChange={(value) => updateFormData('pets', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assistance">Any vouchers or assistance?</Label>
                  <Textarea
                    id="assistance"
                    placeholder="Describe any housing vouchers or rental assistance (or leave blank)"
                    value={formData.assistance}
                    onChange={(e) => updateFormData('assistance', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3 - Income & Employment */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Income & Employment</h2>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(value) => updateFormData('employmentStatus', value)}>
                    <SelectTrigger id="employmentStatus">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="gig">Gig/Contract</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employer">Employer Name</Label>
                    <Input 
                      id="employer" 
                      placeholder="Company or self-employed" 
                      value={formData.employer}
                      onChange={(e) => updateFormData('employer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={formData.jobTitle}
                      onChange={(e) => updateFormData('jobTitle', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeAtJob">How long at current job?</Label>
                    <Select value={formData.timeAtJob} onValueChange={(value) => updateFormData('timeAtJob', value)}>
                      <SelectTrigger id="timeAtJob">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-6">0-6 months</SelectItem>
                        <SelectItem value="6-12">6-12 months</SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="2+">2+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly/Annual Income ($)</Label>
                    <Input 
                      id="income" 
                      type="number" 
                      placeholder="e.g., 45000" 
                      value={formData.income}
                      onChange={(e) => updateFormData('income', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payFrequency">Pay Frequency</Label>
                    <Select value={formData.payFrequency} onValueChange={(value) => updateFormData('payFrequency', value)}>
                      <SelectTrigger id="payFrequency">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Biweekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalIncome">Any additional income?</Label>
                  <Textarea
                    id="additionalIncome"
                    placeholder="Describe any other income sources (or leave blank)"
                    value={formData.additionalIncome}
                    onChange={(e) => updateFormData('additionalIncome', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4 - Credit, Background & Documents */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Credit, Background & Documents</h2>
                <div className="space-y-2">
                  <Label htmlFor="creditScore">Estimated Credit Score Range</Label>
                  <Select value={formData.creditScore} onValueChange={(value) => updateFormData('creditScore', value)}>
                    <SelectTrigger id="creditScore">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300-579">300-579</SelectItem>
                      <SelectItem value="580-669">580-669</SelectItem>
                      <SelectItem value="670-739">670-739</SelectItem>
                      <SelectItem value="740+">740+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Any past evictions?</Label>
                  <Select value={formData.evictions} onValueChange={(value) => updateFormData('evictions', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Any criminal history?</Label>
                  <Select value={formData.criminalHistory} onValueChange={(value) => updateFormData('criminalHistory', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">References</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ref1Name">Reference 1 Name</Label>
                      <Input 
                        id="ref1Name" 
                        value={formData.ref1Name}
                        onChange={(e) => updateFormData('ref1Name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref1Relationship">Relationship</Label>
                      <Input 
                        id="ref1Relationship" 
                        placeholder="e.g., Friend" 
                        value={formData.ref1Relationship}
                        onChange={(e) => updateFormData('ref1Relationship', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref1Phone">Phone</Label>
                      <Input 
                        id="ref1Phone" 
                        type="tel" 
                        value={formData.ref1Phone}
                        onChange={(e) => updateFormData('ref1Phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ref2Name">Reference 2 Name</Label>
                      <Input 
                        id="ref2Name" 
                        value={formData.ref2Name}
                        onChange={(e) => updateFormData('ref2Name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref2Relationship">Relationship</Label>
                      <Input 
                        id="ref2Relationship" 
                        placeholder="e.g., Coworker" 
                        value={formData.ref2Relationship}
                        onChange={(e) => updateFormData('ref2Relationship', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref2Phone">Phone</Label>
                      <Input 
                        id="ref2Phone" 
                        type="tel" 
                        value={formData.ref2Phone}
                        onChange={(e) => updateFormData('ref2Phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border border-border rounded-lg p-6">
                  <h3 className="font-semibold">Upload Documents (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    You can upload documents now or later: Last 2-3 bank statements, front and back of your ID, recent pay stubs or income proof
                  </p>
                  <label
                    htmlFor="fileUpload"
                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop files
                    </span>
                    <span className="text-xs text-muted-foreground">PDF, JPG, PNG accepted</span>
                    <input
                      id="fileUpload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Uploaded files:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {files.map((file, idx) => (
                          <li key={idx}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="confirm" 
                      checked={formData.confirmed}
                      onCheckedChange={(checked) => updateFormData('confirmed', checked as boolean)}
                    />
                    <label htmlFor="confirm" className="text-sm cursor-pointer">
                      I confirm all information is true and correct.
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="agree" 
                      checked={formData.agreed}
                      onCheckedChange={(checked) => updateFormData('agreed', checked as boolean)}
                    />
                    <label htmlFor="agree" className="text-sm cursor-pointer">
                      I agree to the Rent EZ policies, terms, and refund rules.
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="authorize" 
                      checked={formData.authorized}
                      onCheckedChange={(checked) => updateFormData('authorized', checked as boolean)}
                    />
                    <label htmlFor="authorize" className="text-sm cursor-pointer">
                      I authorize Rent EZ and its partners to review my information for housing
                      approval purposes.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSubmitting}>
                Back
              </Button>
              {step === totalSteps ? (
                <Button onClick={handleSubmitApplication} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Application...
                    </>
                  ) : (
                    "Continue to Secure Checkout – $20"
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
