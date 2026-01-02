import { useState, useEffect } from "react";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Loader2, Calendar, X, RefreshCw, AlertCircle, Mail, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimeSlot {
  start: string;
}

interface BookingCalendarProps {
  durationMinutes?: number;
}

interface BookingEvent {
  id: string;
  title?: string;
  when?: { start_time: number; end_time: number };
  participants?: { email: string; name?: string }[];
}

export default function BookingCalendar({ 
  durationMinutes = 15
}: BookingCalendarProps) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [bookedEventId, setBookedEventId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Manage booking state
  const [showManage, setShowManage] = useState(false);
  const [manageEventId, setManageEventId] = useState("");
  const [manageEmail, setManageEmail] = useState("");
  const [existingBooking, setExistingBooking] = useState<BookingEvent | null>(null);
  const [emailBookings, setEmailBookings] = useState<BookingEvent[]>([]);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [lookupMethod, setLookupMethod] = useState<"email" | "id">("email");
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleSlots, setRescheduleSlots] = useState<Record<string, TimeSlot[]>>({});
  const [rescheduleDate, setRescheduleDate] = useState(startOfDay(new Date()));
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState<Date | null>(null);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelAllConfirm, setShowCancelAllConfirm] = useState(false);
  const [isCancellingAll, setIsCancellingAll] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");

  // Check for URL params from email links
  useEffect(() => {
    const manageParam = searchParams.get("manage");
    const emailParam = searchParams.get("email");
    
    if (manageParam) {
      setShowManage(true);
      setManageEventId(manageParam);
      if (emailParam) {
        setManageEmail(emailParam);
      }
      // Auto-fetch the booking
      fetchBookingById(manageParam);
    }
  }, [searchParams]);

  // Generate days to display (3 rows = 21 days)
  const days = Array.from({ length: 21 }, (_, i) => addDays(currentDate, i));
  const rescheduleDays = Array.from({ length: 21 }, (_, i) => addDays(rescheduleDate, i));

  // Fetch slots when date range changes
  useEffect(() => {
    fetchSlots();
  }, [currentDate]);

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const startTime = currentDate.toISOString();
      const endTime = addDays(currentDate, 21).toISOString();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "getAvailability",
          startTime,
          endTime,
          timeZone,
          durationMinutes,
          intervalMinutes: 15,
        },
      });

      if (error) throw error;

      console.log("Nylas slots response:", data);
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
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "createBooking",
          start: selectedTime,
          durationMinutes,
          attendee: {
            name,
            email,
          },
          timeZone,
          metadata: { phone },
        },
      });

      if (error) throw error;

      console.log("Booking response:", data);
      
      if (data?.id || data?.uid || data?.status === "success") {
        const eventId = data.id || data.uid;
        setBookedEventId(eventId);
        setIsBooked(true);
        
        // Send confirmation email with cancel/reschedule links
        const appointmentDate = format(parseISO(selectedTime), "EEEE, MMMM d, yyyy");
        const appointmentTime = format(parseISO(selectedTime), "h:mm a");
        
        try {
          await supabase.functions.invoke("nylas-api", {
            body: {
              action: "sendConfirmationEmail",
              eventId,
              attendeeEmail: email,
              attendeeName: name,
              appointmentDate,
              appointmentTime,
              phone,
            },
          });
          console.log("Confirmation email sent");
        } catch (emailErr) {
          console.error("Failed to send confirmation email:", emailErr);
        }
        
        toast({
          title: "Booking Confirmed!",
          description: "Check your email for confirmation details.",
        });
      } else {
        throw new Error(data?.error || "Booking failed");
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

  const navigateRescheduleWeek = (direction: "prev" | "next") => {
    setRescheduleDate(prev => addDays(prev, direction === "next" ? 7 : -7));
    setSelectedRescheduleDate(null);
    setSelectedRescheduleTime(null);
  };

  const getSlotsForDate = (date: Date): TimeSlot[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return slots[dateKey] || [];
  };

  const getRescheduleSlotsForDate = (date: Date): TimeSlot[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return rescheduleSlots[dateKey] || [];
  };

  const hasSlots = (date: Date): boolean => {
    return getSlotsForDate(date).length > 0;
  };

  const hasRescheduleSlots = (date: Date): boolean => {
    return getRescheduleSlotsForDate(date).length > 0;
  };

  // Fetch booking by ID
  const fetchBookingById = async (eventId?: string) => {
    const idToFetch = eventId || manageEventId.trim();
    
    if (!idToFetch) {
      toast({
        title: "Missing Booking ID",
        description: "Please enter your booking ID.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingBooking(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "getBooking",
          eventId: idToFetch,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.event) {
        setExistingBooking(data.event);
      } else {
        throw new Error("Booking not found");
      }
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      toast({
        title: "Booking Not Found",
        description: "Could not find a booking with that ID. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBooking(false);
    }
  };

  // Fetch bookings by email
  const fetchBookingsByEmail = async () => {
    if (!manageEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingBooking(true);
    setEmailBookings([]);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "findBookingByEmail",
          email: manageEmail.trim(),
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.events && data.events.length > 0) {
        setEmailBookings(data.events);
        setSavedEmail(manageEmail.trim());
        toast({
          title: "No Bookings Found",
          description: "No upcoming appointments found for this email address.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      toast({
        title: "Search Failed",
        description: err.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBooking(false);
    }
  };

  // Select a booking from email results
  const selectBookingFromEmail = (booking: BookingEvent) => {
    setExistingBooking(booking);
    setEmailBookings([]);
  };

  // Fetch reschedule slots
  const fetchRescheduleSlots = async () => {
    try {
      const startTime = rescheduleDate.toISOString();
      const endTime = addDays(rescheduleDate, 21).toISOString();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "getAvailability",
          startTime,
          endTime,
          timeZone,
          durationMinutes,
          intervalMinutes: 15,
        },
      });

      if (error) throw error;
      setRescheduleSlots(data?.data || {});
    } catch (err) {
      console.error("Error fetching reschedule slots:", err);
    }
  };

  // Handle cancel - then go back to bookings list
  const handleCancel = async () => {
    if (!existingBooking) return;

    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "cancelBooking",
          eventId: existingBooking.id,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setShowCancelConfirm(false);
      toast({
        title: "Booking Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      
      // Go back to bookings list if we came from email lookup
      if (savedEmail) {
        setExistingBooking(null);
        setShowReschedule(false);
        // Refresh the bookings list
        fetchBookingsByEmail();
      } else {
        resetManageState();
      }
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast({
        title: "Cancellation Failed",
        description: err.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle cancel all bookings
  const handleCancelAll = async () => {
    if (emailBookings.length === 0) return;

    setIsCancellingAll(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const booking of emailBookings) {
        try {
          const { data, error } = await supabase.functions.invoke("nylas-api", {
            body: {
              action: "cancelBooking",
              eventId: booking.id,
            },
          });

          if (error || data?.error) {
            failCount++;
          } else {
            successCount++;
          }
        } catch {
          failCount++;
        }
      }

      setShowCancelAllConfirm(false);
      
      if (successCount > 0) {
        toast({
          title: "Bookings Cancelled",
          description: `Successfully cancelled ${successCount} appointment${successCount > 1 ? 's' : ''}.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        });
      }
      
      // Refresh the bookings list
      if (savedEmail) {
        fetchBookingsByEmail();
      } else {
        setEmailBookings([]);
      }
    } catch (err: any) {
      console.error("Cancel all error:", err);
      toast({
        title: "Cancellation Failed",
        description: err.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsCancellingAll(false);
    }
  };

  // Handle reschedule - then go back to bookings list
  const handleReschedule = async () => {
    if (!existingBooking || !selectedRescheduleTime) return;

    setIsRescheduling(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "rescheduleBooking",
          eventId: existingBooking.id,
          newStart: selectedRescheduleTime,
          durationMinutes,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Booking Rescheduled",
        description: `Your appointment has been rescheduled to ${format(parseISO(selectedRescheduleTime), "EEEE, MMMM d 'at' h:mm a")}.`,
      });
      
      // Go back to bookings list if we came from email lookup
      if (savedEmail) {
        setExistingBooking(null);
        setShowReschedule(false);
        setSelectedRescheduleDate(null);
        setSelectedRescheduleTime(null);
        // Refresh the bookings list
        fetchBookingsByEmail();
      } else {
        resetManageState();
      }
    } catch (err: any) {
      console.error("Reschedule error:", err);
      toast({
        title: "Reschedule Failed",
        description: err.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  // Start reschedule flow
  const startReschedule = () => {
    setShowReschedule(true);
    fetchRescheduleSlots();
  };

  // Reset manage state
  const resetManageState = () => {
    setShowManage(false);
    setManageEventId("");
    setManageEmail("");
    setExistingBooking(null);
    setEmailBookings([]);
    setLookupMethod("email");
    setShowReschedule(false);
    setSelectedRescheduleDate(null);
    setSelectedRescheduleTime(null);
    setSavedEmail("");
    setShowCancelAllConfirm(false);
  };

  if (isBooked) {
    const manageUrl = bookedEventId 
      ? `${window.location.origin}/manage-booking/${bookedEventId}`
      : null;

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
            A confirmation email has been sent to {email} with calendar invite and meeting details.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBooked(false);
                setBookedEventId(null);
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
          
          {manageUrl && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium mb-2">Need to cancel or reschedule?</p>
              <a 
                href={manageUrl}
                className="text-primary hover:underline text-sm break-all"
              >
                {manageUrl}
              </a>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            Save this link or check your confirmation email for booking management options.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Manage booking views
  if (showManage) {

    // Existing booking found - show details and options
    if (existingBooking) {
      const bookingDate = existingBooking.when?.start_time 
        ? new Date(existingBooking.when.start_time * 1000)
        : null;

      return (
        <Card className="bg-card border-border/50 shadow-card overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {savedEmail && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setExistingBooking(null);
                      setShowReschedule(false);
                      fetchBookingsByEmail();
                    }}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                )}
                <CardTitle className="text-xl">Manage Your Booking</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={resetManageState}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current booking details */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">Current Appointment</span>
              </div>
              {bookingDate ? (
                <p className="text-lg font-semibold">
                  {format(bookingDate, "EEEE, MMMM d 'at' h:mm a")}
                </p>
              ) : (
                <p className="text-muted-foreground">Appointment details not available</p>
              )}
            </div>

            {/* Reschedule flow */}
            {showReschedule ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Select New Date & Time</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowReschedule(false)}>
                    Cancel
                  </Button>
                </div>

                {/* Calendar Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateRescheduleWeek("prev")}
                    disabled={rescheduleDate <= startOfDay(new Date())}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-medium">
                    {format(rescheduleDate, "MMMM yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateRescheduleWeek("next")}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {rescheduleDays.slice(0, 7).map((day) => (
                    <div key={day.toISOString()} className="text-center text-xs text-muted-foreground pb-1">
                      {format(day, "EEE")}
                    </div>
                  ))}
                  {rescheduleDays.map((day) => {
                    const dayHasSlots = hasRescheduleSlots(day);
                    const isSelected = selectedRescheduleDate && isSameDay(day, selectedRescheduleDate);
                    const isPast = day < startOfDay(new Date());

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          if (dayHasSlots && !isPast) {
                            setSelectedRescheduleDate(day);
                            setSelectedRescheduleTime(null);
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

                {/* Time Slots */}
                {selectedRescheduleDate && (
                  <div className="border-t border-border/50 pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {format(selectedRescheduleDate, "EEEE, MMMM d")}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {getRescheduleSlotsForDate(selectedRescheduleDate).map((slot) => {
                        const slotTime = parseISO(slot.start);
                        const isSelectedSlot = selectedRescheduleTime === slot.start;

                        return (
                          <button
                            key={slot.start}
                            onClick={() => setSelectedRescheduleTime(slot.start)}
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

                {/* Confirm reschedule */}
                {selectedRescheduleTime && (
                  <Button 
                    onClick={handleReschedule} 
                    className="w-full shadow-glow"
                    disabled={isRescheduling}
                  >
                    {isRescheduling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rescheduling...
                      </>
                    ) : (
                      `Reschedule to ${format(parseISO(selectedRescheduleTime), "h:mm a")}`
                    )}
                  </Button>
                )}
              </div>
            ) : (
              /* Action buttons */
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={startReschedule}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </div>
            )}
          </CardContent>

          {/* Cancel confirmation dialog */}
          <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel your appointment. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      );
    }

    // Show email results list
    if (emailBookings.length > 0) {
      return (
        <Card className="bg-card border-border/50 shadow-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Your Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetManageState}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm">
                {emailBookings.length} booking{emailBookings.length > 1 ? 's' : ''} found
              </p>
              {emailBookings.length > 1 && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowCancelAllConfirm(true)}
                >
                  Cancel All
                </Button>
              )}
            </div>
            {emailBookings.map((booking) => {
              const bookingDate = booking.when?.start_time 
                ? new Date(booking.when.start_time * 1000)
                : null;
              return (
                <button
                  key={booking.id}
                  onClick={() => selectBookingFromEmail(booking)}
                  className="w-full p-4 bg-secondary/50 rounded-lg text-left hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {bookingDate ? format(bookingDate, "EEEE, MMMM d 'at' h:mm a") : "Appointment"}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.title}</p>
                    </div>
                  </div>
                </button>
              );
            })}
            <Button 
              variant="outline" 
              onClick={() => { setEmailBookings([]); setSavedEmail(""); }} 
              className="w-full mt-4"
            >
              Search Again
            </Button>
          </CardContent>

          {/* Cancel All Confirmation Dialog */}
          <AlertDialog open={showCancelAllConfirm} onOpenChange={setShowCancelAllConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel All Bookings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel all {emailBookings.length} appointments. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Bookings</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isCancellingAll}
                >
                  {isCancellingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel All"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      );
    }

    // Lookup booking form
    return (
      <Card className="bg-card border-border/50 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Manage Existing Booking</CardTitle>
            <Button variant="ghost" size="sm" onClick={resetManageState}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lookup method tabs */}
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
            <button
              onClick={() => setLookupMethod("email")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                lookupMethod === "email" 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Mail className="w-4 h-4" />
              By Email
            </button>
            <button
              onClick={() => setLookupMethod("id")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                lookupMethod === "id" 
                  ? "bg-background shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="w-4 h-4" />
              By Booking ID
            </button>
          </div>

          {lookupMethod === "email" ? (
            <>
              <p className="text-muted-foreground text-sm">
                Enter the email address you used when booking to find your appointments.
              </p>
              <div className="space-y-2">
                <Label htmlFor="manageEmail">Email Address</Label>
                <Input
                  id="manageEmail"
                  type="email"
                  value={manageEmail}
                  onChange={(e) => setManageEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <Button 
                onClick={fetchBookingsByEmail} 
                className="w-full"
                disabled={isLoadingBooking}
              >
                {isLoadingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find My Bookings"
                )}
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                Enter the booking ID from your confirmation email.
              </p>
              <div className="space-y-2">
                <Label htmlFor="eventId">Booking ID</Label>
                <Input
                  id="eventId"
                  value={manageEventId}
                  onChange={(e) => setManageEventId(e.target.value)}
                  placeholder="Enter your booking ID"
                />
              </div>
              <Button 
                onClick={() => fetchBookingById()} 
                className="w-full"
                disabled={isLoadingBooking}
              >
                {isLoadingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  "Find My Booking"
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500/50 shadow-card overflow-hidden text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white">Select a Date & Time</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between px-6 pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("prev")}
              disabled={currentDate <= startOfDay(new Date())}
              className="text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-medium text-white">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek("next")}
              className="text-white hover:bg-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 px-4 pb-4 border border-white/20 mx-4 rounded-lg overflow-hidden">
            {days.slice(0, 7).map((day) => (
              <div key={day.toISOString()} className="text-center text-xs text-white/70 py-2 border-b border-white/20 font-medium">
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
                    "py-4 flex items-center justify-center text-sm font-medium transition-colors text-white border-r border-b border-white/20 last:border-r-0 [&:nth-child(7n+7)]:border-r-0",
                    isSelected && "bg-white text-purple-700",
                    !isSelected && dayHasSlots && !isPast && "hover:bg-white/20 cursor-pointer",
                    !dayHasSlots && "text-white/30",
                    isPast && "text-white/20 cursor-not-allowed"
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
            <div className="border-t border-white/20 p-6">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-white">
                <Clock className="w-4 h-4" />
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
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
                          ? "bg-white text-purple-700"
                          : "bg-white/20 text-white hover:bg-white/30"
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
            <form onSubmit={handleBooking} className="border-t border-white/20 p-6 space-y-4">
              <h3 className="font-medium mb-3 text-white">Your Information</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-purple-700 hover:bg-white/90" 
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

      {/* Manage existing booking link */}
      <div className="text-center">
        <button
          onClick={() => setShowManage(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Need to cancel or reschedule an existing booking?
        </button>
      </div>
    </div>
  );
}
