import { useState, useEffect } from "react";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  start: string;
}

interface BookingCalendarProps {
  eventTypeSlug?: string;
  username?: string;
  eventTypeId?: number;
}

export default function BookingCalendar({ 
  eventTypeSlug = "bookings", 
  username = "jeremy-rivera-n6ukhk",
  eventTypeId
}: BookingCalendarProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [resolvedEventTypeId, setResolvedEventTypeId] = useState<number | null>(eventTypeId || null);
  const [eventLength, setEventLength] = useState<number>(15); // Default to 15 minutes
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Generate days to display (2 weeks)
  const days = Array.from({ length: 14 }, (_, i) => addDays(currentDate, i));

  // Fetch event type ID if not provided
  useEffect(() => {
    if (!eventTypeId) {
      fetchEventTypeId();
    }
  }, [eventTypeId]);

  // Fetch slots when date range changes (can work with or without eventTypeId)
  useEffect(() => {
    // Allow fetching with either eventTypeId or username/slug
    fetchSlots();
  }, [currentDate, resolvedEventTypeId]);

  const fetchEventTypeId = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("calcom-api", {
        body: { action: "getEventTypes" },
      });

      if (error) throw error;

      console.log("Event types:", data);
      
      // Find the matching event type by slug
      const eventTypes = data?.event_types || data?.data?.eventTypes || data?.data || [];
      const matchingEvent = eventTypes.find((et: any) => et.slug === eventTypeSlug);
      
      if (matchingEvent) {
        setResolvedEventTypeId(matchingEvent.id);
        setEventLength(matchingEvent.length || 15);
        console.log("Resolved event type ID:", matchingEvent.id, "length:", matchingEvent.length);
      } else if (eventTypes.length > 0) {
        setResolvedEventTypeId(eventTypes[0].id);
        setEventLength(eventTypes[0].length || 15);
        console.log("Using first event type ID:", eventTypes[0].id, "length:", eventTypes[0].length);
      } else {
        // If no event types found, still try to fetch slots with username/slug
        console.log("No event types found, will use username/slug for slots");
      }
    } catch (err) {
      console.error("Error fetching event types:", err);
      // Still allow slot fetching even if event types fail
    }
  };

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const startTime = currentDate.toISOString();
      const endTime = addDays(currentDate, 14).toISOString();

      const { data, error } = await supabase.functions.invoke("calcom-api", {
        body: {
          action: "getSlots",
          eventTypeId: resolvedEventTypeId,
          eventTypeSlug,
          username,
          startTime,
          endTime,
        },
      });

      if (error) throw error;

      console.log("Slots response:", data);
      setSlots(data?.data || {});
    } catch (err) {
      console.error("Error fetching slots:", err);
      toast({
        title: "Error",
        description: "Failed to load available times. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTime || !name || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const { data, error } = await supabase.functions.invoke("calcom-api", {
        body: {
          action: "createBooking",
          eventTypeId: resolvedEventTypeId,
          eventLength: eventLength,
          start: selectedTime,
          attendee: {
            name,
            email,
          },
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          metadata: { phone },
        },
      });

      if (error) throw error;

      console.log("Booking response:", data);
      
      // v1 returns a booking object at the top level (e.g. { id, uid, ... })
      const bookingId = (data as any)?.id ?? (data as any)?.booking?.id;
      const bookingUid = (data as any)?.uid ?? (data as any)?.booking?.uid;

      if (bookingId || bookingUid || (data as any)?.status === "success" || (data as any)?.data) {
        setIsBooked(true);
        toast({
          title: "Booking Confirmed!",
          description: "Check your email for confirmation details.",
        });
      } else {
        throw new Error((data as any)?.error || "Booking failed");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      toast({
        title: "Booking Failed",
        description: err.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate(prev => addDays(prev, direction === "next" ? 7 : -7));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return slots[dateKey] || [];
  };

  const hasSlots = (date: Date): boolean => {
    return getSlotsForDate(date).length > 0;
  };

  if (isBooked) {
    return (
      <Card className="bg-card border-border/50 shadow-card">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-2">
            Your appointment has been scheduled for:
          </p>
          <p className="text-lg font-semibold text-primary mb-6">
            {selectedTime && format(parseISO(selectedTime), "EEEE, MMMM d 'at' h:mm a")}
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            A confirmation email has been sent to {email} with options to reschedule or cancel.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBooked(false);
                setSelectedDate(null);
                setSelectedTime(null);
                setName("");
                setEmail("");
                setPhone("");
              }}
            >
              Book Another Appointment
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Need to cancel or reschedule? Check your confirmation email or contact us at{" "}
            <a href="mailto:support@easyday.ai" className="text-primary hover:underline">
              support@easyday.ai
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50 shadow-card overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Select a Date & Time</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between px-6 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek("prev")}
            disabled={currentDate <= startOfDay(new Date())}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 px-4 pb-4">
          {days.slice(0, 7).map((day) => (
            <div key={day.toISOString()} className="text-center text-xs text-muted-foreground pb-1">
              {format(day, "EEE")}
            </div>
          ))}
          {days.map((day) => {
            const dayHasSlots = hasSlots(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isPast = day < startOfDay(new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  if (dayHasSlots && !isPast) {
                    setSelectedDate(day);
                    setSelectedTime(null);
                  }
                }}
                disabled={!dayHasSlots || isPast}
                className={cn(
                  "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && dayHasSlots && !isPast && "hover:bg-primary/10 cursor-pointer",
                  !dayHasSlots && "text-muted-foreground/50",
                  isPast && "text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {isLoadingSlots && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Time Slots */}
        {selectedDate && (
          <div className="border-t border-border/50 p-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {format(selectedDate, "EEEE, MMMM d")}
            </h3>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {getSlotsForDate(selectedDate).map((slot) => {
                const slotTime = parseISO(slot.start);
                const isSelectedSlot = selectedTime === slot.start;

                return (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedTime(slot.start)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      isSelectedSlot
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-primary/10"
                    )}
                  >
                    {format(slotTime, "h:mm a")}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {selectedTime && (
          <form onSubmit={handleBooking} className="border-t border-border/50 p-6 space-y-4">
            <h3 className="font-medium mb-3">Your Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-5555"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full shadow-glow" 
              size="lg"
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                `Confirm Booking for ${format(parseISO(selectedTime), "h:mm a")}`
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
