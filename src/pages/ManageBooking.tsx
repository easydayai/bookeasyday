import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfDay, isSameDay, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Calendar,
  XCircle,
  AlertTriangle
} from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TimeSlot {
  start: string;
}

interface BookingEvent {
  id: string;
  title: string;
  when: {
    start_time: number;
    end_time: number;
  };
  participants?: Array<{ name: string; email: string }>;
}

export default function ManageBooking() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<BookingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isRescheduled, setIsRescheduled] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  // Reschedule state
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [slots, setSlots] = useState<Record<string, TimeSlot[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const days = Array.from({ length: 21 }, (_, i) => addDays(currentDate, i));

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (showReschedule) {
      fetchSlots();
    }
  }, [currentDate, showReschedule]);

  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: { action: "getBooking", eventId },
      });

      if (error) throw error;

      if (data?.event) {
        setEvent(data.event);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

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
          durationMinutes: 15,
          intervalMinutes: 15,
        },
      });

      if (error) throw error;
      setSlots(data?.data || {});
    } catch (err) {
      console.error("Error fetching slots:", err);
      toast({
        title: "Error",
        description: "Failed to load available times.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: { action: "cancelBooking", eventId },
      });

      if (error) throw error;

      if (data?.status === "success") {
        setIsCancelled(true);
        toast({
          title: "Booking Cancelled",
          description: "Your appointment has been cancelled.",
        });
      } else {
        throw new Error(data?.error || "Failed to cancel");
      }
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast({
        title: "Cancellation Failed",
        description: err.message || "Please try again or contact us.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedTime) return;

    setIsRescheduling(true);
    try {
      const { data, error } = await supabase.functions.invoke("nylas-api", {
        body: {
          action: "rescheduleBooking",
          eventId,
          newStart: selectedTime,
          durationMinutes: 15,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (error) throw error;

      if (data?.status === "success") {
        setIsRescheduled(true);
        setEvent(data.event);
        toast({
          title: "Booking Rescheduled",
          description: "Your appointment has been updated.",
        });
      } else {
        throw new Error(data?.error || "Failed to reschedule");
      }
    } catch (err: any) {
      console.error("Reschedule error:", err);
      toast({
        title: "Reschedule Failed",
        description: err.message || "Please try again or contact us.",
        variant: "destructive",
      });
    } finally {
      setIsRescheduling(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-card border-border/50">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading booking details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-card border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
              <p className="text-muted-foreground mb-6">
                This booking may have already been cancelled or the link is invalid.
              </p>
              <Button onClick={() => navigate("/contact")}>
                Book a New Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-card border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Booking Cancelled</h2>
              <p className="text-muted-foreground mb-6">
                Your appointment has been cancelled. You'll receive a confirmation email shortly.
              </p>
              <Button onClick={() => navigate("/contact")}>
                Book a New Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isRescheduled) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="bg-card border-border/50">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Booking Rescheduled</h2>
              <p className="text-muted-foreground mb-2">
                Your appointment has been updated to:
              </p>
              <p className="text-lg font-semibold text-primary mb-6">
                {selectedTime && format(parseISO(selectedTime), "EEEE, MMMM d 'at' h:mm a")}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You'll receive an updated calendar invite via email.
              </p>
              <Button onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const eventStart = event ? new Date(event.when.start_time * 1000) : null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Manage Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Booking Details */}
            <div className="bg-secondary/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">{event?.title || "Your Appointment"}</h3>
              {eventStart && (
                <p className="text-lg text-primary font-medium">
                  {format(eventStart, "EEEE, MMMM d, yyyy")} at {format(eventStart, "h:mm a")}
                </p>
              )}
              {event?.participants?.[0] && (
                <p className="text-sm text-muted-foreground mt-2">
                  Booked by: {event.participants[0].name} ({event.participants[0].email})
                </p>
              )}
            </div>

            {!showReschedule ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReschedule(true)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Reschedule
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this appointment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
              </div>
            ) : (
              <>
                {/* Reschedule Calendar */}
                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-semibold mb-4">Select a New Time</h3>
                  
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between mb-4">
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
                  <div className="grid grid-cols-7 gap-1 mb-4">
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
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Time Slots */}
                  {selectedDate && (
                    <div className="border-t border-border/50 pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        {format(selectedDate, "EEEE, MMMM d")}
                      </h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
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
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowReschedule(false);
                      setSelectedDate(null);
                      setSelectedTime(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReschedule}
                    disabled={!selectedTime || isRescheduling}
                    className="flex-1"
                  >
                    {isRescheduling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Rescheduling...
                      </>
                    ) : selectedTime ? (
                      `Confirm New Time: ${format(parseISO(selectedTime), "h:mm a")}`
                    ) : (
                      "Select a New Time"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact us at{" "}
          <a href="mailto:hello@easydayai.com" className="text-primary hover:underline">
            hello@easydayai.com
          </a>
        </p>
      </div>
    </div>
  );
}
