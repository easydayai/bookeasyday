import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, DollarSign, ArrowLeft, Calendar } from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";

interface Business {
  id: string;
  business_name: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
}

interface Service {
  id: string;
  name: string;
  duration_min: number;
  price_cents: number;
  payment_mode: string;
  deposit_type: string;
  deposit_value: number;
}

interface BookingPage {
  id: string;
  page_model: {
    brand?: {
      primary?: string;
      background?: string;
      text?: string;
      radius?: number;
      font?: string;
    };
    hero?: {
      headline?: string;
      tagline?: string;
    };
  };
}

export default function PublicBookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingPage, setBookingPage] = useState<BookingPage | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
      fetchBusinessData();
    }
  }, [slug]);

  const fetchBusinessData = async () => {
    try {
      // Get booking page by slug
      const { data: pageData, error: pageError } = await supabase
        .from("booking_pages")
        .select("*, businesses:business_id(*)")
        .eq("slug", slug)
        .maybeSingle();

      if (pageError) throw pageError;
      if (!pageData) {
        setIsLoading(false);
        return;
      }

      const businessData = pageData.businesses as unknown as Business;
      setBusiness(businessData);
      setBookingPage(pageData as unknown as BookingPage);

      // Fetch active services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessData.id)
        .eq("active", true)
        .order("created_at", { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData as Service[]);
    } catch (error) {
      console.error("Error fetching business:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDeposit = (service: Service) => {
    if (service.payment_mode !== "deposit_required") return 0;
    if (service.deposit_type === "fixed") return service.deposit_value;
    if (service.deposit_type === "percent") {
      return Math.round((service.price_cents * service.deposit_value) / 100);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !selectedService || !formData.date || !formData.time) return;

    setIsSubmitting(true);

    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + selectedService.duration_min * 60000);

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("business_bookings")
        .insert({
          business_id: business.id,
          service_id: selectedService.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          notes: formData.notes || null,
          amount_due_cents: selectedService.price_cents,
          amount_paid_cents: 0,
          payment_status: "unpaid",
          status: "scheduled",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // If deposit required and Stripe connected, redirect to payment
      if (
        selectedService.payment_mode === "deposit_required" &&
        business.stripe_onboarded &&
        business.stripe_account_id
      ) {
        const depositAmount = calculateDeposit(selectedService);
        
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          "stripe-connect-payment",
          {
            body: {
              action: "create_checkout_session",
              bookingId: bookingData.id,
              amountCents: depositAmount,
              customerEmail: formData.customer_email,
            },
          }
        );

        if (checkoutError) throw checkoutError;
        
        if (checkoutData?.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      // No payment required - go to success
      navigate(`/b/${slug}/success?booking_id=${bookingData.id}`);
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

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business || !bookingPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Business not found</h1>
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const pageModel = bookingPage.page_model || {};
  const brand = pageModel.brand || {};
  const hero = pageModel.hero || {};

  const themeStyles: React.CSSProperties = {
    background: brand.background || "#1a1a2e",
    color: brand.text || "#ffffff",
    fontFamily: brand.font || "Inter, sans-serif",
  };

  const cardStyles: React.CSSProperties = {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: `${brand.radius || 12}px`,
  };

  const buttonStyles: React.CSSProperties = {
    background: brand.primary || "#8B5CF6",
    color: "#ffffff",
    borderRadius: `${brand.radius || 12}px`,
  };

  return (
    <div className="min-h-screen relative" style={themeStyles}>
      <header className="border-b py-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="container mx-auto px-4 max-w-2xl flex items-center gap-3">
          <LogoInsignia className="h-8 w-8" />
          <div>
            <h1 className="font-semibold">{business.business_name}</h1>
            {hero.tagline && <p className="text-sm opacity-70">{hero.tagline}</p>}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!selectedService ? (
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {hero.headline || "Book an Appointment"}
            </h1>
            <p className="opacity-70 mb-6">Select a service to get started</p>

            {services.length === 0 ? (
              <div className="py-8 text-center opacity-70" style={cardStyles}>
                No services available
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="cursor-pointer transition-all hover:scale-[1.01] p-4"
                    style={cardStyles}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <div className="flex items-center gap-4 text-sm opacity-70 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.duration_min} min
                          </span>
                          {service.price_cents > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatPrice(service.price_cents)}
                            </span>
                          )}
                        </div>
                      </div>
                      {service.payment_mode === "deposit_required" && (
                        <Badge variant="outline">
                          {formatPrice(calculateDeposit(service))} deposit
                        </Badge>
                      )}
                      {service.payment_mode === "pay_later" && (
                        <Badge variant="secondary">Pay Later</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <button
              className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-white/10"
              onClick={() => setSelectedService(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to services
            </button>

            <div style={cardStyles}>
              <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <h2 className="text-xl font-semibold">{selectedService.name}</h2>
                <div className="flex items-center gap-4 text-sm opacity-70 mt-1">
                  <span>{selectedService.duration_min} min</span>
                  {selectedService.price_cents > 0 && (
                    <span>{formatPrice(selectedService.price_cents)}</span>
                  )}
                </div>
                {selectedService.payment_mode === "deposit_required" && (
                  <p className="text-sm mt-2 text-primary">
                    {formatPrice(calculateDeposit(selectedService))} deposit required at booking
                  </p>
                )}
              </div>
              <div className="p-6">
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
                        className="bg-white/5 border-white/20"
                        style={{ borderRadius: `${brand.radius || 12}px` }}
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
                        className="bg-white/5 border-white/20"
                        style={{ borderRadius: `${brand.radius || 12}px` }}
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
                      className="bg-white/5 border-white/20"
                      style={{ borderRadius: `${brand.radius || 12}px` }}
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
                      className="bg-white/5 border-white/20"
                      style={{ borderRadius: `${brand.radius || 12}px` }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="bg-white/5 border-white/20"
                      style={{ borderRadius: `${brand.radius || 12}px` }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="bg-white/5 border-white/20"
                      style={{ borderRadius: `${brand.radius || 12}px` }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 text-base font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                    style={buttonStyles}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Calendar className="h-4 w-4" />
                    {selectedService.payment_mode === "deposit_required"
                      ? `Pay ${formatPrice(calculateDeposit(selectedService))} & Book`
                      : "Book Appointment"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
