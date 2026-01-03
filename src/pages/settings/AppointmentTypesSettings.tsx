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
import { Loader2, Plus, Trash2, Edit2, DollarSign } from "lucide-react";
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
  price: number | null;
  pricing_mode: string;
  deposit_cents: number;
  min_pay_cents: number;
  suggested_pay_cents: number;
  max_pay_cents: number | null;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];
const LOCATION_TYPES = [
  { value: "phone", label: "Phone Call" },
  { value: "google_meet", label: "Google Meet" },
  { value: "in_person", label: "In Person" },
];

const PRICING_MODES = [
  { value: "free", label: "Free", description: "No payment required" },
  { value: "fixed", label: "Fixed Price", description: "Full payment at booking" },
  { value: "deposit", label: "Deposit", description: "Collect deposit now, balance later" },
  { value: "pay_what_you_want", label: "Pay What You Want", description: "Customer chooses amount" },
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
    price: 0,
    pricing_mode: "free",
    deposit_cents: 0,
    min_pay_cents: 0,
    suggested_pay_cents: 0,
    max_pay_cents: null as number | null,
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
      price: 0,
      pricing_mode: "free",
      deposit_cents: 0,
      min_pay_cents: 0,
      suggested_pay_cents: 0,
      max_pay_cents: null,
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
      price: type.price || 0,
      pricing_mode: type.pricing_mode || "free",
      deposit_cents: type.deposit_cents || 0,
      min_pay_cents: type.min_pay_cents || 0,
      suggested_pay_cents: type.suggested_pay_cents || 0,
      max_pay_cents: type.max_pay_cents,
    });
    setDialogOpen(true);
  };

  const saveType = async () => {
    if (!user || !formData.name) return;

    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        duration_minutes: formData.duration_minutes,
        description: formData.description || null,
        location_type: formData.location_type,
        price: formData.pricing_mode === "fixed" || formData.pricing_mode === "deposit" ? formData.price : null,
        pricing_mode: formData.pricing_mode,
        deposit_cents: formData.pricing_mode === "deposit" ? formData.deposit_cents : 0,
        min_pay_cents: formData.pricing_mode === "pay_what_you_want" ? formData.min_pay_cents : 0,
        suggested_pay_cents: formData.pricing_mode === "pay_what_you_want" ? formData.suggested_pay_cents : 0,
        max_pay_cents: formData.pricing_mode === "pay_what_you_want" ? formData.max_pay_cents : null,
      };

      if (editingType) {
        const { error } = await supabase
          .from("appointment_types")
          .update(payload)
          .eq("id", editingType.id);

        if (error) throw error;
        toast({ title: "Updated", description: "Appointment type updated" });
      } else {
        const { error } = await supabase.from("appointment_types").insert({
          user_id: user.id,
          ...payload,
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

  const formatPrice = (type: AppointmentType) => {
    const mode = type.pricing_mode || "free";
    if (mode === "free") return "Free";
    if (mode === "fixed") return `$${(type.price || 0).toFixed(2)}`;
    if (mode === "deposit") {
      return `$${(type.deposit_cents / 100).toFixed(2)} deposit (Total: $${(type.price || 0).toFixed(2)})`;
    }
    if (mode === "pay_what_you_want") {
      const min = type.min_pay_cents / 100;
      const max = type.max_pay_cents ? type.max_pay_cents / 100 : null;
      return max ? `$${min.toFixed(2)} - $${max.toFixed(2)}` : `$${min.toFixed(2)}+`;
    }
    return "—";
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
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{type.duration_minutes} min</span>
                      <span>•</span>
                      <span>{LOCATION_TYPES.find((l) => l.value === type.location_type)?.label}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(type)}
                      </span>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                rows={2}
              />
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-4 space-y-4">
              <Label className="text-base font-semibold">Pricing</Label>
              
              <div className="space-y-2">
                <Label>Pricing Mode</Label>
                <Select
                  value={formData.pricing_mode}
                  onValueChange={(v) => setFormData({ ...formData, pricing_mode: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-xs text-muted-foreground">{mode.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fixed Price */}
              {formData.pricing_mode === "fixed" && (
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Deposit */}
              {formData.pricing_mode === "deposit" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Deposit Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deposit_cents / 100}
                      onChange={(e) => setFormData({ ...formData, deposit_cents: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Pay What You Want */}
              {formData.pricing_mode === "pay_what_you_want" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.min_pay_cents / 100}
                        onChange={(e) => setFormData({ ...formData, min_pay_cents: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum ($ - optional)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.max_pay_cents ? formData.max_pay_cents / 100 : ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, max_pay_cents: val ? Math.round(val * 100) : null });
                        }}
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Suggested Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.suggested_pay_cents / 100}
                      onChange={(e) => setFormData({ ...formData, suggested_pay_cents: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">Default amount shown to customers</p>
                  </div>
                </div>
              )}
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
