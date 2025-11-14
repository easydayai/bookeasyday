import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Apply() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate("/checkout");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardContent className="pt-6 space-y-6">
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
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Current Address</Label>
                  <Input id="address" placeholder="Street Address" required />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" required />
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
                    <Input id="desiredCity" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desiredState">Desired State</Label>
                    <Input id="desiredState" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate">Target Move-In Date</Label>
                    <Input id="moveInDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Monthly Rent Budget ($)</Label>
                    <Input id="budget" type="number" placeholder="e.g., 1500" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms Needed</Label>
                    <Select>
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
                    <Select>
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
                  <Select>
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
                  <Select>
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
                    <Input id="employer" placeholder="Company or self-employed" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeAtJob">How long at current job?</Label>
                    <Select>
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
                    <Input id="income" type="number" placeholder="e.g., 45000" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payFrequency">Pay Frequency</Label>
                    <Select>
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
                  <Select>
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
                  <Select>
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
                  <Select>
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
                      <Input id="ref1Name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref1Relationship">Relationship</Label>
                      <Input id="ref1Relationship" placeholder="e.g., Friend" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref1Phone">Phone</Label>
                      <Input id="ref1Phone" type="tel" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ref2Name">Reference 2 Name</Label>
                      <Input id="ref2Name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref2Relationship">Relationship</Label>
                      <Input id="ref2Relationship" placeholder="e.g., Coworker" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref2Phone">Phone</Label>
                      <Input id="ref2Phone" type="tel" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border border-border rounded-lg p-6">
                  <h3 className="font-semibold">Upload Documents (Required)</h3>
                  <p className="text-sm text-muted-foreground">
                    Please upload: Last 2-3 bank statements, front and back of your ID, recent pay
                    stubs or income proof
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
                    <Checkbox id="confirm" />
                    <label htmlFor="confirm" className="text-sm cursor-pointer">
                      I confirm all information is true and correct.
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="agree" />
                    <label htmlFor="agree" className="text-sm cursor-pointer">
                      I agree to the Rent EZ policies, terms, and refund rules.
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="authorize" />
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
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                Back
              </Button>
              <Button onClick={handleNext}>
                {step === totalSteps ? "Continue to Secure Checkout – $20" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
