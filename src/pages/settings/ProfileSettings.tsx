import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SettingsLayout } from "@/components/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Link as LinkIcon, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

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

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [originalSlug, setOriginalSlug] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    timezone: "America/New_York",
    slug: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        business_name: profile.business_name || "",
        phone: profile.phone || "",
        timezone: profile.timezone || "America/New_York",
        slug: profile.slug || "",
      });
      setOriginalSlug(profile.slug || "");
    }
  }, [profile]);

  // Debounced slug check
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3 || slug === originalSlug) {
      setSlugAvailable(slug === originalSlug ? true : null);
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
  }, [user?.id, originalSlug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.slug && formData.slug !== originalSlug) {
        checkSlugAvailability(formData.slug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug, checkSlugAvailability, originalSlug]);

  const handleSlugChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, slug: sanitized });
    if (sanitized === originalSlug) {
      setSlugAvailable(true);
    } else {
      setSlugAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate slug
    if (formData.slug.length < 3) {
      toast({
        title: "Invalid slug",
        description: "Booking link must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    if (slugAvailable === false) {
      toast({
        title: "Slug unavailable",
        description: "This booking link is already taken",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          business_name: formData.business_name,
          phone: formData.phone || null,
          timezone: formData.timezone,
          slug: formData.slug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Slug unavailable",
            description: "This booking link is already taken",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      await refreshProfile();
      setOriginalSlug(formData.slug);

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
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

  const slugChanged = formData.slug !== originalSlug;

  return (
    <SettingsLayout title="Profile Settings" description="Manage your personal and business information">
      <Card className="border-border/50 shadow-card">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="My Business"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Booking Link</Label>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 text-sm text-muted-foreground flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  {window.location.origin}/book/
                </div>
                <div className="relative flex-1">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="pr-10"
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
              {slugAvailable === false && (
                <p className="text-sm text-destructive">This link is already taken</p>
              )}
              {slugAvailable === true && slugChanged && (
                <p className="text-sm text-green-600">This link is available!</p>
              )}
            </div>

            {slugChanged && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Changing your booking link will break any existing links you've shared. 
                  Clients with your old link will no longer be able to book.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading || slugAvailable === false}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
