import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SettingsLayout } from "@/components/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AvailabilityRule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export default function AvailabilitySettings() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRules();
    }
  }, [user]);

  const fetchRules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("availability_rules")
        .select("*")
        .eq("user_id", user.id)
        .order("day_of_week", { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRule = () => {
    // Find first day without a rule
    const usedDays = new Set(rules.map((r) => r.day_of_week));
    const availableDay = DAYS.find((d) => !usedDays.has(d.value))?.value ?? 1;

    const newRule: AvailabilityRule = {
      id: `temp-${Date.now()}`,
      day_of_week: availableDay,
      start_time: "09:00",
      end_time: "17:00",
      timezone: profile?.timezone || "America/New_York",
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (id: string, field: keyof AvailabilityRule, value: string | number) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRule = async (id: string) => {
    if (id.startsWith("temp-")) {
      setRules(rules.filter((r) => r.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from("availability_rules").delete().eq("id", id);
      if (error) throw error;
      setRules(rules.filter((r) => r.id !== id));
      toast({ title: "Removed", description: "Availability slot removed" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove availability",
        variant: "destructive",
      });
    }
  };

  const saveRules = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      // Separate new and existing rules
      const newRules = rules.filter((r) => r.id.startsWith("temp-"));
      const existingRules = rules.filter((r) => !r.id.startsWith("temp-"));

      // Update existing rules
      for (const rule of existingRules) {
        const { error } = await supabase
          .from("availability_rules")
          .update({
            day_of_week: rule.day_of_week,
            start_time: rule.start_time,
            end_time: rule.end_time,
            timezone: rule.timezone,
          })
          .eq("id", rule.id);

        if (error) throw error;
      }

      // Insert new rules
      if (newRules.length > 0) {
        const { error } = await supabase.from("availability_rules").insert(
          newRules.map((r) => ({
            user_id: user.id,
            day_of_week: r.day_of_week,
            start_time: r.start_time,
            end_time: r.end_time,
            timezone: r.timezone,
          }))
        );

        if (error) throw error;
      }

      await fetchRules();
      toast({ title: "Saved", description: "Your availability has been updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save availability",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SettingsLayout title="Availability" description="Set your working hours for bookings">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Define when you're available to accept bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No availability set. Add your working hours to start accepting bookings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Select
                    value={rule.day_of_week.toString()}
                    onValueChange={(v) => updateRule(rule.id, "day_of_week", parseInt(v))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.start_time}
                    onValueChange={(v) => updateRule(rule.id, "start_time", v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-muted-foreground">to</span>

                  <Select
                    value={rule.end_time}
                    onValueChange={(v) => updateRule(rule.id, "end_time", v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMES.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={addRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hours
            </Button>
            <Button onClick={saveRules} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
