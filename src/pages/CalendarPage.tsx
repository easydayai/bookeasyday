import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  X,
} from "lucide-react";
import LogoInsignia from "@/components/LogoInsignia";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  isBefore,
  parseISO,
} from "date-fns";

interface AppointmentType {
  name: string;
  duration_minutes: number;
}

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  appointment_types: AppointmentType | null;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isProfileComplete, signOut } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelingBooking, setCancelingBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!isLoading && user && !isProfileComplete) {
      navigate("/onboarding");
    }
  }, [user, isLoading, isProfileComplete, navigate]);

  // Fetch bookings for the current month
  useEffect(() => {
    if (user) {
      fetchMonthlyBookings();
    }
  }, [user, currentMonth]);

  const fetchMonthlyBookings = async () => {
    if (!user) return;

    setLoadingBookings(true);
    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          start_time,
          end_time,
          customer_name,
          customer_email,
          customer_phone,
          notes,
          status,
          appointment_types (
            name,
            duration_minutes
          )
        `)
        .eq("user_id", user.id)
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelingBooking(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "canceled" })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: "canceled" } : b
        )
      );
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error canceling booking:", error);
    } finally {
      setCancelingBooking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Days with bookings
  const daysWithBookings = useMemo(() => {
    const days = new Set<string>();
    bookings.forEach((booking) => {
      if (booking.status !== "canceled") {
        days.add(format(parseISO(booking.start_time), "yyyy-MM-dd"));
      }
    });
    return days;
  }, [bookings]);

  // Filter bookings for selected date and tab
  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = parseISO(booking.start_time);
      const matchesDate = isSameDay(bookingDate, selectedDate);

      if (!matchesDate) return false;

      switch (activeTab) {
        case "upcoming":
          return booking.status === "booked" && !isBefore(bookingDate, now);
        case "past":
          return booking.status === "booked" && isBefore(bookingDate, now);
        case "canceled":
          return booking.status === "canceled";
        default:
          return true;
      }
    });
  }, [bookings, selectedDate, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LogoInsignia className="h-8 w-8" />
            <span className="text-xl font-bold">Easy Day AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings/profile">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">View and manage your appointments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
            >
              Today
            </Button>
            <Button size="sm" disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Calendar Grid */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const hasBookings = daysWithBookings.has(dateKey);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative aspect-square p-2 rounded-lg text-sm font-medium
                        transition-colors hover:bg-accent
                        ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary" : ""}
                        ${!isCurrentMonth ? "text-muted-foreground/50" : ""}
                        ${isTodayDate && !isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                      `}
                    >
                      <span>{format(day, "d")}</span>
                      {hasBookings && (
                        <span
                          className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-primary-foreground" : "bg-primary"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bookings Panel */}
          <Card className="border-border/50 shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Appointments
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="upcoming" className="flex-1">
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger value="past" className="flex-1">
                    Past
                  </TabsTrigger>
                  <TabsTrigger value="canceled" className="flex-1">
                    Canceled
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No {activeTab} appointments</p>
                      <p className="text-sm">for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="w-full text-left p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-medium">
                                  {format(parseISO(booking.start_time), "h:mm a")} –{" "}
                                  {format(parseISO(booking.end_time), "h:mm a")}
                                </span>
                              </div>
                              <div className="font-medium truncate">
                                {booking.customer_name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {booking.appointment_types?.name || "Appointment"}
                              </div>
                            </div>
                            <Badge
                              variant={
                                booking.status === "canceled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedBooking &&
                format(parseISO(selectedBooking.start_time), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Time */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {format(parseISO(selectedBooking.start_time), "h:mm a")} –{" "}
                    {format(parseISO(selectedBooking.end_time), "h:mm a")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedBooking.appointment_types?.name || "Appointment"}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>{selectedBooking.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{selectedBooking.customer_email}</span>
                </div>
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{selectedBooking.customer_phone}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    selectedBooking.status === "canceled" ? "destructive" : "secondary"
                  }
                >
                  {selectedBooking.status}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                {selectedBooking.status !== "canceled" && (
                  <>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleCancelBooking}
                      disabled={cancelingBooking}
                    >
                      {cancelingBooking && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <X className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                    <Button variant="outline" className="flex-1" disabled>
                      Reschedule
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
