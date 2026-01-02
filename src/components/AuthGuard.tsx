import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  /** If true, redirects authenticated users away from this route to /dashboard */
  redirectAuthenticatedTo?: string;
  /** If true, redirects unauthenticated users to /login */
  requireAuth?: boolean;
}

/**
 * AuthGuard component that handles route protection:
 * - redirectAuthenticatedTo: Redirects logged-in users (e.g., from "/" to "/dashboard")
 * - requireAuth: Redirects logged-out users to /login
 */
export function AuthGuard({ 
  children, 
  redirectAuthenticatedTo,
  requireAuth = false 
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // If user is authenticated and this route should redirect them away
    if (user && redirectAuthenticatedTo) {
      navigate(redirectAuthenticatedTo, { replace: true });
      return;
    }

    // If route requires auth and user is not authenticated
    if (requireAuth && !user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
  }, [user, isLoading, redirectAuthenticatedTo, requireAuth, navigate, location.pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated and should redirect, don't render children
  if (user && redirectAuthenticatedTo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If requires auth and not authenticated, don't render children
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
