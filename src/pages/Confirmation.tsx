import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Confirmation() {
  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Thank You!</h1>
            <p className="text-xl text-muted-foreground">
              Your Rent EZ application has been submitted.
            </p>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• You'll receive a confirmation email within minutes</li>
                <li>• Our team will review your application within 3-5 business days</li>
                <li>• You'll be connected with a rental specialist within 7 days</li>
                <li>• Your specialist will help you find and apply to matching properties</li>
                <li>• Remember: We guarantee a move-in within 30 days or your money back!</li>
              </ul>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button asChild size="lg">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
