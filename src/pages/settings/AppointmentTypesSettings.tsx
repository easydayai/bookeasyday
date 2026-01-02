import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SettingsLayout } from "@/components/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  description: string | null;
  location_type: string;
  is_active: boolean;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const LOCATION_TYPES = [
  { value: "phone", label: "Phone Call" },
  { value: "google_meet", label: "Google Meet" },
  { value: "in_person", label: "In Person" },
];

export default function AppointmentTypesSettings() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: 30,
    description: "",
    location_type: "phone",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTypes();
    }
  }, [user]);

  const fetchTypes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("appointment_types")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setTypes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load appointment types",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingType(null);
    setFormData({
      name: "",
      duration_minutes: 30,
      description: "",
      location_type: "phone",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (type: AppointmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      duration_minutes: type.duration_minutes,
      description: type.description || "",
      location_type: type.location_type,
    });
    setDialogOpen(true);
  };

  const saveType = async () => {
    if (!user || !formData.name) return;

    setIsSaving(true);

    try {
      if (editingType) {
        // Update existing
        const { error } = await supabase
          .from("appointment_types")
          .update({
            name: formData.name,
            duration_minutes: formData.duration_minutes,
            description: formData.description || null,
            location_type: formData.location_type,
          })
          .eq("id", editingType.id);

        if (error) throw error;
        toast({ title: "Updated", description: "Appointment type updated" });
      } else {
        // Create new
        const { error } = await supabase.from("appointment_types").insert({
          user_id: user.id,
          name: formData.name,
          duration_minutes: formData.duration_minutes,
          description: formData.description || null,
          location_type: formData.location_type,
          is_active: true,
        });

        if (error) throw error;
        toast({ title: "Created", description: "Appointment type created" });
      }

      setDialogOpen(false);
      await fetchTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteType = async (id: string) => {
    try {
      const { error } = await supabase.from("appointment_types").delete().eq("id", id);
      if (error) throw error;
      setTypes(types.filter((t) => t.id !== id));
      toast({ title: "Deleted", description: "Appointment type removed" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (type: AppointmentType) => {
    try {
      const { error } = await supabase
        .from("appointment_types")
        .update({ is_active: !type.is_active })
        .eq("id", type.id);

      if (error) throw error;
      setTypes(types.map((t) => (t.id === type.id ? { ...t, is_active: !t.is_active } : t)));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      });
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
    <SettingsLayout title="Appointment Types" description="Define the services you offer for booking">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>
                Create appointment types that clients can book
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {types.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No appointment types yet. Create one to start accepting bookings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {types.map((type) => (
                <div
                  key={type.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    type.is_active ? "border-border bg-secondary/30" : "border-border/50 bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{type.name}</span>
                      {!type.is_active && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {type.duration_minutes} min • {LOCATION_TYPES.find((l) => l.value === type.location_type)?.label}
                    </div>
                    {type.description && (
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(type)}
                    >
                      {type.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(type)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteType(type.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit" : "Create"} Appointment Type</DialogTitle>
            <DialogDescription>
              {editingType ? "Update the details of this appointment type" : "Add a new service for clients to book"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Consultation Call"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(v) => setFormData({ ...formData, duration_minutes: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={formData.location_type}
                  onValueChange={(v) => setFormData({ ...formData, location_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this service"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveType} disabled={isSaving || !formData.name}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingType ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsLayout>
  );
}
