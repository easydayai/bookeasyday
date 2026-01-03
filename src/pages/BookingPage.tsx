import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, MapPin, ArrowLeft, Calendar } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";

interface Profile {
  id: string;
  business_name: string | null;
  full_name: string | null;
  timezone: string | null;
}

interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  description: string | null;
  location_type: string;
}

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    if (slug) {
      fetchProvider();
    }
  }, [slug]);

  const fetchProvider = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, business_name, full_name, timezone")
        .eq("slug", slug)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setIsLoading(false);
        return;
      }

      setProfile(profileData);

      const { data: typesData, error: typesError } = await supabase
        .from("appointment_types")
        .select("*")
        .eq("user_id", profileData.id)
        .eq("is_active", true);

      if (typesError) throw typesError;
      setTypes(typesData || []);
    } catch (error) {
      console.error("Error fetching provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedType || !formData.date || !formData.time) return;

    setIsSubmitting(true);

    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + selectedType.duration_minutes * 60000);

      const { error } = await supabase.from("bookings").insert({
        user_id: profile.id,
        appointment_type_id: selectedType.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || null,
        notes: formData.notes || null,
        status: "booked",
      });

      if (error) throw error;

      navigate(`/book/${slug}/success`);
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message || "Unable to complete booking",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Provider not found</h1>
        <Button asChild className="min-h-[44px]">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-3 sm:py-4">
        <div className="container mx-auto px-4 sm:px-6 flex items-center gap-2">
          <LogoInsignia className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="font-semibold text-sm sm:text-base truncate">{profile.business_name || profile.full_name}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        {!selectedType ? (
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Book an Appointment</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Select a service to get started</p>

            {types.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No appointment types available
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {types.map((type) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedType(type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium">{type.name}</h3>
                          {type.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{type.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground flex-shrink-0">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {type.duration_minutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {type.location_type === "phone" ? "Phone" : type.location_type === "google_meet" ? "Video" : "In Person"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <Button variant="ghost" className="mb-4 min-h-[44px] -ml-2" onClick={() => setSelectedType(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to services
            </Button>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">{selectedType.name}</CardTitle>
                <CardDescription>
                  {selectedType.duration_minutes} min • {selectedType.location_type === "phone" ? "Phone Call" : selectedType.location_type === "google_meet" ? "Video Call" : "In Person"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      required
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="min-h-[88px]"
                    />
                  </div>
                  <Button type="submit" className="w-full min-h-[48px] text-base" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
