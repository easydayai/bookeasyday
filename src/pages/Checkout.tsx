import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Application Submitted!",
        description: "Thank you! Your Rent EZ application has been submitted.",
      });
      window.location.href = "/confirmation";
    }, 2000);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b border-border">
                    <div>
                      <p className="font-semibold">Rent EZ Application – One-Time Fee</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Apply once with Rent EZ and get matched with rental specialists and
                        landlords.
                      </p>
                    </div>
                    <p className="font-bold text-xl">$20.00</p>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>$20.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">30-Day Move-In Money-Back Guarantee</p>
                    <p className="text-sm text-muted-foreground">
                      If we don't help you secure an approved move-in within 30 days after you're
                      fully approved by us and you cooperate with the process, we'll refund your
                      $20.
                    </p>
                  </div>
                </div>
                <Button variant="link" className="h-auto p-0">
                  See Policies for details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    Secure Checkout
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label>Billing Address</Label>
                    <Input placeholder="Street Address" required />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP</Label>
                      <Input id="zip" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" type="password" maxLength={3} required />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="updates" />
                    <label htmlFor="updates" className="text-sm cursor-pointer">
                      Send me status updates by email/text
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment processing</span>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Complete Payment – $20"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By completing this purchase, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
