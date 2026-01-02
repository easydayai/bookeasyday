import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";
import { useAuth } from "@/contexts/AuthContext";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // If user is already logged in, handle post-login flow
  useEffect(() => {
    if (!authLoading && user) {
      handlePostLoginRedirect();
    }
  }, [user, authLoading]);

  const handlePostLoginRedirect = async () => {
    const selectedPlan = sessionStorage.getItem("selected_plan");
    
    if (!selectedPlan || selectedPlan === "free") {
      // Free plan - go to dashboard
      sessionStorage.removeItem("selected_plan");
      navigate("/dashboard");
    } else {
      // Paid plan - go to checkout
      navigate(`/checkout?plan=${selectedPlan}`);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/signup`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email to complete signup.",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center mb-8 gap-2">
          <LogoInsignia className="h-10 w-10" />
          <span className="text-2xl font-bold">Easy Day AI</span>
        </Link>

        <Card className="border-border/50 shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {emailSent ? "Check your email" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {emailSent
                ? "We sent you a magic link to sign in"
                : "Enter your email to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Click the link in your email to complete signup. You can close this tab.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full shadow-glow" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Magic Link
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
