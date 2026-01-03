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
import { BookingPageConfig, defaultBookingPageConfig } from "@/types/bookingPageConfig";

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
  const [pageConfig, setPageConfig] = useState<BookingPageConfig>(defaultBookingPageConfig);
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

      // Fetch published page config
      const { data: configData } = await supabase
        .from("booking_page_config")
        .select("published_config")
        .eq("user_id", profileData.id)
        .maybeSingle();

      if (configData?.published_config) {
        setPageConfig({
          ...defaultBookingPageConfig,
          ...(configData.published_config as unknown as BookingPageConfig),
        });
      }

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

  const { theme, cover, header, layout, buttons } = pageConfig;

  const fontFamily = {
    'Inter': 'Inter, sans-serif',
    'System': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'Poppins': 'Poppins, sans-serif',
    'DM Sans': '"DM Sans", sans-serif',
  }[theme.font] || 'Inter, sans-serif';

  const spacingClass = {
    compact: 'py-4 px-4',
    comfortable: 'py-6 px-4 sm:px-6',
    spacious: 'py-8 px-4 sm:px-8',
  }[layout.spacing];

  const cardStyles: React.CSSProperties = {
    background: layout.cardStyle === 'flat' 
      ? 'rgba(255,255,255,0.05)' 
      : layout.cardStyle === 'glass' 
        ? 'rgba(255,255,255,0.08)' 
        : 'rgba(255,255,255,0.06)',
    backdropFilter: layout.cardStyle === 'glass' ? 'blur(12px)' : undefined,
    border: layout.cardStyle !== 'shadow' ? '1px solid rgba(255,255,255,0.12)' : undefined,
    boxShadow: layout.cardStyle === 'shadow' ? '0 8px 32px rgba(0,0,0,0.3)' : undefined,
    borderRadius: `${theme.radius}px`,
  };

  const buttonStyles: React.CSSProperties = {
    background: buttons.style === 'filled' ? theme.primary : 'transparent',
    border: buttons.style === 'outline' ? `2px solid ${theme.primary}` : 'none',
    color: buttons.style === 'filled' ? '#ffffff' : theme.primary,
    boxShadow: buttons.shadow ? `0 4px 14px ${theme.primary}40` : 'none',
    borderRadius: `${theme.radius}px`,
  };

  const renderCover = () => {
    if (cover.style === 'none') return null;

    if (cover.style === 'gradient') {
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}30 0%, ${theme.background} 100%)`,
          }}
        />
      );
    }

    if (cover.style === 'image' && cover.imageUrl) {
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${cover.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `rgba(0,0,0,${cover.overlay})` }}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        background: theme.background, 
        color: theme.text,
        fontFamily,
      }}
    >
      {renderCover()}

      <div className="relative z-10">
        <header 
          className="border-b py-3 sm:py-4"
          style={{ 
            borderColor: 'rgba(255,255,255,0.1)',
            justifyContent: header.align === 'center' ? 'center' : header.align === 'right' ? 'flex-end' : 'flex-start',
          }}
        >
          <div 
            className="container mx-auto px-4 sm:px-6 flex items-center gap-2"
            style={{ 
              maxWidth: `${layout.maxWidth}px`,
              justifyContent: header.align === 'center' ? 'center' : header.align === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {header.showLogo && (
              header.logoUrl ? (
                <img src={header.logoUrl} alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
              ) : (
                <LogoInsignia className="h-7 w-7 sm:h-8 sm:w-8" />
              )
            )}
            <div style={{ textAlign: header.align }}>
              <span className="font-semibold text-sm sm:text-base truncate">
                {header.title || profile.business_name || profile.full_name}
              </span>
              {header.tagline && (
                <p className="text-xs opacity-70">{header.tagline}</p>
              )}
            </div>
          </div>
        </header>

        <main 
          className={`container mx-auto max-w-2xl ${spacingClass}`}
          style={{ maxWidth: `${layout.maxWidth}px` }}
        >
          {!selectedType ? (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Book an Appointment</h1>
              <p className="text-sm sm:text-base opacity-70 mb-6">Select a service to get started</p>

              {types.length === 0 ? (
                <div 
                  className="py-8 text-center opacity-70"
                  style={cardStyles}
                >
                  No appointment types available
                </div>
              ) : (
                <div className="space-y-3">
                  {types.map((type) => (
                    <div
                      key={type.id}
                      className="cursor-pointer transition-all hover:scale-[1.01]"
                      style={{
                        ...cardStyles,
                        padding: '1rem',
                      }}
                      onClick={() => setSelectedType(type)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium">{type.name}</h3>
                          {type.description && (
                            <p className="text-sm opacity-60 line-clamp-2">{type.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 text-sm opacity-70 flex-shrink-0">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <button 
                className="mb-4 min-h-[44px] -ml-2 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
                onClick={() => setSelectedType(null)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to services
              </button>

              <div style={cardStyles}>
                <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <h2 className="text-lg sm:text-xl font-semibold">{selectedType.name}</h2>
                  <p className="text-sm opacity-70">
                    {selectedType.duration_minutes} min • {selectedType.location_type === "phone" ? "Phone Call" : selectedType.location_type === "google_meet" ? "Video Call" : "In Person"}
                  </p>
                </div>
                <div className="p-4 sm:p-6">
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
                          className="min-h-[44px] bg-white/5 border-white/20"
                          style={{ borderRadius: `${theme.radius}px` }}
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
                          className="min-h-[44px] bg-white/5 border-white/20"
                          style={{ borderRadius: `${theme.radius}px` }}
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
                        className="min-h-[44px] bg-white/5 border-white/20"
                        style={{ borderRadius: `${theme.radius}px` }}
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
                        className="min-h-[44px] bg-white/5 border-white/20"
                        style={{ borderRadius: `${theme.radius}px` }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="min-h-[44px] bg-white/5 border-white/20"
                        style={{ borderRadius: `${theme.radius}px` }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="min-h-[88px] bg-white/5 border-white/20"
                        style={{ borderRadius: `${theme.radius}px` }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full min-h-[48px] text-base font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                      style={buttonStyles}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
