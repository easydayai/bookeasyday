import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DaisyAssistant } from "@/components/DaisyAssistant";
import {
  Loader2,
  Copy,
  Calendar,
  Calendar as CalendarIcon,
  CreditCard,
  Settings,
  Clock,
  User,
  ExternalLink,
  Zap,
  Palette,
} from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  status: string;
  appointment_types: {
    name: string;
    duration_minutes: number;
  } | null;
}

const PLAN_DISPLAY = {
  free: { name: "Free", color: "text-muted-foreground" },
  basic: { name: "Basic", color: "text-primary" },
  starter: { name: "Starter", color: "text-primary" },
  pro: { name: "Pro", color: "text-primary" },
  business: { name: "Business", color: "text-primary" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, subscription, credits, isLoading, isProfileComplete, signOut } = useAuth();
  const { toast } = useToast();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!isLoading && user && !isProfileComplete) {
      navigate("/onboarding");
    }
  }, [user, isLoading, isProfileComplete, navigate]);

  useEffect(() => {
    if (user) {
      fetchUpcomingBookings();
    }
  }, [user]);

  const fetchUpcomingBookings = async () => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          start_time,
          end_time,
          customer_name,
          customer_email,
          status,
          appointment_types (
            name,
            duration_minutes
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "booked")
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(5);

      if (error) throw error;
      setUpcomingBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const copyBookingLink = () => {
    if (profile?.slug) {
      const link = `${window.location.origin}/book/${profile.slug}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copied!",
        description: "Your booking link has been copied to clipboard.",
      });
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to open billing portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const planInfo = PLAN_DISPLAY[subscription?.plan_key as keyof typeof PLAN_DISPLAY] || PLAN_DISPLAY.free;
  const isPaidPlan = subscription?.plan_key && subscription.plan_key !== "free";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LogoInsignia className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="text-lg sm:text-xl font-bold">Easy Day AI</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings/profile">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
          {/* Mobile nav */}
          <div className="flex sm:hidden items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link to="/settings/profile">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Here's an overview of your Easy Day AI account.</p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Credits Card */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Available Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl sm:text-4xl font-bold">{credits}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {isPaidPlan ? "Refills monthly with your subscription" : "Upgrade for more credits"}
              </p>
            </CardContent>
          </Card>

          {/* Plan Card */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${planInfo.color}`}>{planInfo.name}</div>
              {isPaidPlan ? (
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-sm" 
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                >
                  {portalLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Manage Billing
                </Button>
              ) : (
                <Button variant="link" className="h-auto p-0 text-sm" asChild>
                  <Link to="/pricing">Upgrade Plan</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Booking Link Card */}
          <Card className="border-border/50 shadow-card sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Your Booking Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.slug ? (
                <>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-2 sm:py-1 rounded truncate flex-1 text-center sm:text-left">
                      /book/{profile.slug}
                    </code>
                    <Button variant="outline" onClick={copyBookingLink} className="w-full sm:w-auto min-h-[44px]">
                      <Copy className="h-4 w-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Copy Link</span>
                    </Button>
                  </div>
                  <Button variant="link" className="h-auto p-0 text-sm mt-2" asChild>
                    <Link to={`/book/${profile.slug}`} target="_blank">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Preview
                    </Link>
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Set up your profile to get a booking link</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customize Booking Page CTA */}
        <Card className="mt-6 sm:mt-8 border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Customize Your Booking Page</h3>
                <p className="text-sm text-muted-foreground">Design your public booking page with our visual editor</p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/booking-builder">
                <Palette className="h-4 w-4 mr-2" />
                Open Builder
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mt-6 sm:mt-8">
          <Button variant="outline" className="h-auto py-4 justify-start min-h-[56px]" asChild>
            <Link to="/settings/profile" className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Edit Profile</div>
                <div className="text-xs text-muted-foreground">Name, business info</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start min-h-[56px]" asChild>
            <Link to="/settings/availability" className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Set Availability</div>
                <div className="text-xs text-muted-foreground">Working hours</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start min-h-[56px]" asChild>
            <Link to="/settings/appointment-types" className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Appointment Types</div>
                <div className="text-xs text-muted-foreground">Services you offer</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start min-h-[56px]" asChild>
            <Link to="/calendar" className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Calendar</div>
                <div className="text-xs text-muted-foreground">View & manage</div>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 justify-start min-h-[56px]" asChild>
            <Link to="/booking-builder" className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">Page Builder</div>
                <div className="text-xs text-muted-foreground">Customize design</div>
              </div>
            </Link>
          </Button>
        </div>

        {/* Upcoming Bookings */}
        <Card className="mt-6 sm:mt-8 border-border/50 shadow-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <p className="text-sm">Share your booking link to get started</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-secondary/50 gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{booking.customer_name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {booking.appointment_types?.name || "Appointment"} • {booking.customer_email}
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <div className="font-medium">
                        {new Date(booking.start_time).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full min-h-[44px]" asChild>
                  <Link to="/calendar">View All Appointments</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Daisy Assistant */}
      <DaisyAssistant />
    </div>
  );
}
