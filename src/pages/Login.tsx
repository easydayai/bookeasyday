import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (error || !data) {
        toast.error("No application found with this email");
        setLoading(false);
        return;
      }

      // Store email in session storage for status page
      sessionStorage.setItem("applicant_email", email.toLowerCase().trim());
      navigate("/status");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Check Your Application Status</CardTitle>
          <CardDescription className="text-muted-foreground">
            Use the same email you applied with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Checking..." : "View Status"}
            </Button>

            <div className="text-center space-y-2 pt-4">
              <a 
                href="/contact" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Support
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
