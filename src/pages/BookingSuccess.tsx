import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";

export default function BookingSuccess() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 gap-2">
          <LogoInsignia className="h-10 w-10" />
          <span className="text-2xl font-bold">Easy Day AI</span>
        </Link>

        <Card className="border-border/50 shadow-card text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your appointment has been scheduled. Check your email for confirmation details.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild>
                <Link to={`/book/${slug}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Another
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
