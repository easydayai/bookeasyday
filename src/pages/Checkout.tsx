import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Get application ID from session storage
      const applicationId = sessionStorage.getItem('applicationId');

      // Call the create-payment edge function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { applicationId },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
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

                  <p className="text-muted-foreground">
                    You'll be redirected to our secure payment partner, Stripe, to complete your payment.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment processing powered by Stripe</span>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg" disabled={isProcessing}>
                    {isProcessing ? "Redirecting to Stripe..." : "Complete Payment – $20"}
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
