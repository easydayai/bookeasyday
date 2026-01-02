import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Link as LinkIcon } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, refreshProfile, isProfileComplete } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    slug: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Redirect if profile is already complete
  useEffect(() => {
    if (!authLoading && user && isProfileComplete) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isProfileComplete, navigate]);

  // Debounced slug check
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setIsCheckingSlug(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("slug", slug)
        .neq("id", user?.id || "")
        .maybeSingle();

      if (error) throw error;
      setSlugAvailable(data === null);
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugAvailable(null);
    } finally {
      setIsCheckingSlug(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.slug) {
        checkSlugAvailability(formData.slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug, checkSlugAvailability]);

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, slug: sanitized });
    setSlugAvailable(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (!formData.business_name.trim()) {
      newErrors.business_name = "Business name is required";
    }
    // Slug is optional, but validate if provided
    if (formData.slug.trim()) {
      if (formData.slug.length < 3) {
        newErrors.slug = "Must be at least 3 characters";
      } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        newErrors.slug = "Only lowercase letters, numbers, and hyphens allowed";
      } else if (slugAvailable === false) {
        newErrors.slug = "This link is already taken";
      }
    }
    if (!formData.timezone) {
      newErrors.timezone = "Timezone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          business_name: formData.business_name.trim(),
          phone: formData.phone.trim() || null,
          timezone: formData.timezone,
          slug: formData.slug.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        if (profileError.code === "23505") {
          setErrors({ slug: "This link is already taken" });
          return;
        }
        throw profileError;
      }

      // Check if credits already exist (should from trigger, but backup)
      const { data: creditsData } = await supabase
        .from("credits_balance")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!creditsData) {
        // Initialize credits if not exists
        await supabase
          .from("credits_balance")
          .insert({ user_id: user.id, balance_credits: 100 });
      }

      await refreshProfile();

      toast({
        title: "Profile complete!",
        description: "Your account is all set up.",
      });

      // Check for selected plan
      const selectedPlan = sessionStorage.getItem("selected_plan");
      if (selectedPlan && selectedPlan !== "free") {
        navigate(`/checkout?plan=${selectedPlan}`);
      } else {
        sessionStorage.removeItem("selected_plan");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
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
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center mb-8 gap-2">
          <LogoInsignia className="h-10 w-10" />
          <span className="text-2xl font-bold">Easy Day AI</span>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome! Let's set up your profile</CardTitle>
            <CardDescription>
              Tell us about yourself and your business. This is a one-time setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={errors.full_name ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    placeholder="My Business"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className={errors.business_name ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.business_name && (
                    <p className="text-sm text-destructive">{errors.business_name}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 555 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone *</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={errors.timezone ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timezone && (
                    <p className="text-sm text-destructive">{errors.timezone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Your Booking Link (optional)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 text-sm text-muted-foreground flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    {window.location.origin}/book/
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="slug"
                      placeholder="your-name"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className={`pr-10 ${errors.slug ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingSlug ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : slugAvailable === true ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : slugAvailable === false ? (
                        <X className="h-4 w-4 text-destructive" />
                      ) : null}
                    </div>
                  </div>
                </div>
                {errors.slug ? (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                ) : slugAvailable === true ? (
                  <p className="text-sm text-green-600">This link is available!</p>
                ) : slugAvailable === false ? (
                  <p className="text-sm text-destructive">This link is already taken</p>
                ) : formData.slug.length > 0 && formData.slug.length < 3 ? (
                  <p className="text-sm text-muted-foreground">Must be at least 3 characters</p>
                ) : null}
              </div>

              {formData.slug && slugAvailable && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Your booking link preview:</p>
                  <p className="font-medium text-primary break-all">
                    {window.location.origin}/book/{formData.slug}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full shadow-glow"
                disabled={isLoading || slugAvailable === false}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
