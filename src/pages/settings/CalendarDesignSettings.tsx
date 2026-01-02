import { useState, useEffect } from "react";
import { SettingsLayout } from "@/components/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, Palette } from "lucide-react";

interface CalendarDesignSettings {
  primary_color: string;
  accent_color: string;
  background_color: string;
  button_radius: number;
  font_family: string;
  cover_style: string;
  cover_image_url: string | null;
  show_logo: boolean;
  logo_url: string | null;
  show_business_name: boolean;
  show_contact: boolean;
}

const defaultSettings: CalendarDesignSettings = {
  primary_color: "#8B5CF6",
  accent_color: "#0EA5E9",
  background_color: "#FFFFFF",
  button_radius: 8,
  font_family: "Inter",
  cover_style: "none",
  cover_image_url: null,
  show_logo: true,
  logo_url: null,
  show_business_name: true,
  show_contact: true,
};

export default function CalendarDesignSettingsPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<CalendarDesignSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("calendar_design_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          primary_color: data.primary_color || defaultSettings.primary_color,
          accent_color: data.accent_color || defaultSettings.accent_color,
          background_color: data.background_color || defaultSettings.background_color,
          button_radius: data.button_radius ?? defaultSettings.button_radius,
          font_family: data.font_family || defaultSettings.font_family,
          cover_style: data.cover_style || defaultSettings.cover_style,
          cover_image_url: data.cover_image_url,
          show_logo: data.show_logo ?? defaultSettings.show_logo,
          logo_url: data.logo_url,
          show_business_name: data.show_business_name ?? defaultSettings.show_business_name,
          show_contact: data.show_contact ?? defaultSettings.show_contact,
        });
      }
    } catch (error) {
      console.error("Error fetching calendar design settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("calendar_design_settings")
        .upsert({
          user_id: user.id,
          ...settings,
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Calendar design settings saved!");
    } catch (error) {
      console.error("Error saving calendar design settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof CalendarDesignSettings>(
    key: K,
    value: CalendarDesignSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <SettingsLayout title="Calendar Design" description="Customize your booking page appearance">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Calendar Design" description="Customize your booking page appearance">
      <div className="space-y-6">
        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colors
            </CardTitle>
            <CardDescription>Choose colors for your booking page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => updateSetting("primary_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => updateSetting("primary_color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent_color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => updateSetting("accent_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) => updateSetting("accent_color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={settings.background_color}
                    onChange={(e) => updateSetting("background_color", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={settings.background_color}
                    onChange={(e) => updateSetting("background_color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography & Style */}
        <Card>
          <CardHeader>
            <CardTitle>Typography & Style</CardTitle>
            <CardDescription>Customize fonts and button styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="font_family">Font Family</Label>
              <Select
                value={settings.font_family}
                onValueChange={(value) => updateSetting("font_family", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="System">System Default</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Button Radius</Label>
                <span className="text-sm text-muted-foreground">{settings.button_radius}px</span>
              </div>
              <Slider
                value={[settings.button_radius]}
                onValueChange={([value]) => updateSetting("button_radius", value)}
                min={0}
                max={24}
                step={1}
                className="w-full"
              />
              <div className="flex gap-4 mt-4">
                <div
                  className="px-4 py-2 text-sm font-medium text-primary-foreground"
                  style={{
                    backgroundColor: settings.primary_color,
                    borderRadius: `${settings.button_radius}px`,
                  }}
                >
                  Preview Button
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Style */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Style</CardTitle>
            <CardDescription>Add a header to your booking page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cover Type</Label>
              <Select
                value={settings.cover_style}
                onValueChange={(value) => updateSetting("cover_style", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="image">Custom Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.cover_style === "image" && (
              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input
                  id="cover_image_url"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={settings.cover_image_url || ""}
                  onChange={(e) => updateSetting("cover_image_url", e.target.value || null)}
                />
              </div>
            )}

            {/* Cover Preview */}
            {settings.cover_style !== "none" && (
              <div
                className="h-24 rounded-lg overflow-hidden"
                style={{
                  background:
                    settings.cover_style === "gradient"
                      ? `linear-gradient(135deg, ${settings.primary_color}, ${settings.accent_color})`
                      : settings.cover_image_url
                      ? `url(${settings.cover_image_url}) center/cover`
                      : "#ccc",
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Display Options
            </CardTitle>
            <CardDescription>Choose what to show on your booking page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Logo</Label>
                <p className="text-sm text-muted-foreground">Display your logo on the booking page</p>
              </div>
              <Switch
                checked={settings.show_logo}
                onCheckedChange={(checked) => updateSetting("show_logo", checked)}
              />
            </div>

            {settings.show_logo && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={settings.logo_url || ""}
                  onChange={(e) => updateSetting("logo_url", e.target.value || null)}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Business Name</Label>
                <p className="text-sm text-muted-foreground">Display your business name</p>
              </div>
              <Switch
                checked={settings.show_business_name}
                onCheckedChange={(checked) => updateSetting("show_business_name", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Contact Info</Label>
                <p className="text-sm text-muted-foreground">Display email and phone</p>
              </div>
              <Switch
                checked={settings.show_contact}
                onCheckedChange={(checked) => updateSetting("show_contact", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Link */}
        {profile?.slug && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Preview your booking page</p>
                  <p className="text-sm text-muted-foreground">
                    See how your customizations look
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href={`/book/${profile.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
