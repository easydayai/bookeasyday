import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const VALID_PLANS = ["free", "basic", "starter", "pro", "business"];

export default function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const plan = searchParams.get("plan") || "free";

  useEffect(() => {
    // Validate plan
    const validPlan = VALID_PLANS.includes(plan) ? plan : "free";
    
    // Store selected plan in sessionStorage
    sessionStorage.setItem("selected_plan", validPlan);

    // If user is not logged in, redirect to signup
    if (!isLoading && !user) {
      navigate("/signup");
      return;
    }

    // If user is logged in, handle plan-based routing
    if (!isLoading && user) {
      if (validPlan === "free") {
        // Free plan - go directly to dashboard
        sessionStorage.removeItem("selected_plan");
        navigate("/dashboard");
      } else {
        // Paid plan - redirect to checkout
        navigate(`/checkout?plan=${validPlan}`);
      }
    }
  }, [plan, user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Setting up your plan...</p>
      </div>
    </div>
  );
}
