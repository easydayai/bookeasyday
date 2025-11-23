import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";

interface Application {
  applicant_name: string;
  email: string;
  status: string;
  created_at: string;
}

const statusConfig = {
  pending: {
    label: "Submitted",
    step: 1,
    message: "We've received your application. A rental specialist will review it soon.",
    variant: "secondary" as const,
  },
  in_progress: {
    label: "In Progress",
    step: 2,
    message: "Your application is being reviewed by our team.",
    variant: "default" as const,
  },
  approved: {
    label: "Approved",
    step: 3,
    message: "You've been approved. A rental specialist will contact you with next steps.",
    variant: "default" as const,
  },
  declined: {
    label: "Declined",
    step: 3,
    message: "Your application was not approved. You may contact support for more information.",
    variant: "destructive" as const,
  },
};

const steps = [
  { number: 1, label: "Submitted", icon: FileText },
  { number: 2, label: "In Review", icon: Clock },
  { number: 3, label: "Final Decision", icon: CheckCircle },
  { number: 4, label: "Complete", icon: CheckCircle },
];

export default function Status() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const email = sessionStorage.getItem("applicant_email");
    
    if (!email) {
      navigate("/login");
      return;
    }

    fetchApplication(email);
  }, [navigate]);

  const fetchApplication = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        toast.error("Could not load your application");
        navigate("/login");
        return;
      }

      setApplication(data);
    } catch (error) {
      toast.error("Something went wrong");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("applicant_email");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your application...</p>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const status = application.status as keyof typeof statusConfig;
  const config = statusConfig[status] || statusConfig.pending;
  const currentStep = config.step;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-3xl font-bold">Your Application Status</CardTitle>
            <div className="flex justify-center">
              <Badge variant={config.variant} className="text-lg px-6 py-2">
                {config.label}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Progress Bar */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-muted">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step) => {
                  const isActive = step.number <= currentStep;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.number} className="flex flex-col items-center">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span 
                        className={`mt-3 text-sm font-medium transition-colors ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-foreground leading-relaxed">
                {config.message}
              </p>
            </div>

            {/* Application Details */}
            <div className="pt-4 space-y-2 text-sm text-muted-foreground text-center">
              <p>Applicant: {application.applicant_name}</p>
              <p>Applied: {new Date(application.created_at).toLocaleDateString()}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 pt-6 border-t border-border">
              <a 
                href="/contact" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Support
              </a>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Log Out
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
