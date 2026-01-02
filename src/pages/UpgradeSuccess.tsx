import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, PartyPopper } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";

export default function UpgradeSuccess() {
  const navigate = useNavigate();
  const { subscription, refreshProfile, isLoading } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10;

  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    // Poll for subscription status
    const checkSubscription = async () => {
      await refreshProfile();
      if (cancelled) return;

      if (subscription?.status === "active" && subscription?.plan_key !== "free") {
        // Subscription is active, redirect to dashboard after a short delay
        timer = window.setTimeout(() => {
          if (!cancelled) navigate("/dashboard");
        }, 2000);
      } else if (retryCount < maxRetries) {
        // Keep polling
        timer = window.setTimeout(() => {
          if (!cancelled) setRetryCount((prev) => prev + 1);
        }, 2000);
      }
    };

    if (!isLoading) {
      checkSubscription();
    }

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [retryCount, subscription, refreshProfile, isLoading, navigate]);

  const isComplete = subscription?.status === "active" && subscription?.plan_key !== "free";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 gap-2">
          <LogoInsignia className="h-10 w-10" />
          <span className="text-2xl font-bold">Easy Day AI</span>
        </Link>

        <Card className="border-border/50 shadow-card">
          <CardHeader className="text-center">
            {isComplete ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome to Easy Day AI!</CardTitle>
                <CardDescription>
                  Your subscription is now active
                </CardDescription>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <CardTitle className="text-2xl">Finalizing your subscription...</CardTitle>
                <CardDescription>
                  This usually takes just a few seconds
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isComplete ? (
              <>
                <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">Plan activated</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You now have access to all {subscription?.plan_key} features.
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full shadow-glow"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Payment received</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Activating your subscription...</span>
                  </div>
                </div>
                {retryCount >= maxRetries && (
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Taking longer than expected? Your subscription will be activated shortly.
                    </p>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      variant="outline"
                      className="w-full"
                    >
                      Go to Dashboard anyway
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
