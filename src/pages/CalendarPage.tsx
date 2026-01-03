import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
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
  LayoutDashboard,
  Target,
  CheckSquare,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Menu,
  LogOut,
  BarChart3,
  TrendingUp,
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

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const PLACEHOLDER_TASKS: Task[] = [
  { id: "1", title: "Follow up with client", completed: false },
  { id: "2", title: "Prepare presentation", completed: false },
  { id: "3", title: "Review weekly reports", completed: true },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CalendarIcon, label: "Calendar", href: "/calendar" },
  { icon: CheckSquare, label: "Tasks", href: "/calendar", disabled: true },
  { icon: Target, label: "Goals", href: "/calendar", disabled: true },
  { icon: Settings, label: "Settings", href: "/settings/profile" },
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, isProfileComplete, signOut } = useAuth();
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelingBooking, setCancelingBooking] = useState(false);
  
  // Collapse states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePanelsVisible, setMobilePanelsVisible] = useState(false);
  
  // Add event modal
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newEventStartTime, setNewEventStartTime] = useState("09:00");
  const [newEventEndTime, setNewEventEndTime] = useState("10:00");
  const [savingEvent, setSavingEvent] = useState(false);

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

      setBookings((prev) =>
        prev.map((b) =>
          b.id === selectedBooking.id ? { ...b, status: "canceled" } : b
        )
      );
      setSelectedBooking(null);
      toast({ title: "Appointment canceled" });
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast({ title: "Failed to cancel", variant: "destructive" });
    } finally {
      setCancelingBooking(false);
    }
  };

  const handleAddEvent = async () => {
    if (!user || !newEventTitle.trim()) return;

    setSavingEvent(true);
    try {
      const startDateTime = new Date(`${newEventDate}T${newEventStartTime}:00`);
      const endDateTime = new Date(`${newEventDate}T${newEventEndTime}:00`);

      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        customer_name: newEventTitle,
        customer_email: user.email || "manual@event.com",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: "booked",
      });

      if (error) throw error;

      toast({ title: "Event added successfully" });
      setAddEventOpen(false);
      setNewEventTitle("");
      fetchMonthlyBookings();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({ title: "Failed to add event", variant: "destructive" });
    } finally {
      setSavingEvent(false);
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

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      if (booking.status !== "canceled") {
        const dateKey = format(parseISO(booking.start_time), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(booking);
      }
    });
    return map;
  }, [bookings]);

  // Upcoming events (next 7 days or filtered by selected date)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => {
        const bookingDate = parseISO(b.start_time);
        return b.status === "booked" && !isBefore(bookingDate, now);
      })
      .slice(0, 5);
  }, [bookings]);

  // Stats for monthly overview
  const monthlyStats = useMemo(() => {
    const total = bookings.filter((b) => b.status === "booked").length;
    const canceled = bookings.filter((b) => b.status === "canceled").length;
    const completed = bookings.filter((b) => {
      const bookingDate = parseISO(b.start_time);
      return b.status === "booked" && isBefore(bookingDate, new Date());
    }).length;
    const upcoming = total - completed;
    return { total, canceled, completed, upcoming };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/calendar";
        return (
          <Link
            key={item.label}
            to={item.disabled ? "#" : item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }
              ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${sidebarCollapsed ? "justify-center" : ""}
            `}
            onClick={(e) => {
              if (item.disabled) e.preventDefault();
              setMobileMenuOpen(false);
            }}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300
          ${sidebarCollapsed ? "w-16" : "w-56"}
        `}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-border ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <Link to="/dashboard" className="flex items-center gap-2">
            <LogoInsignia className="h-8 w-8 shrink-0" />
            {!sidebarCollapsed && <span className="text-lg font-bold">Easy Day AI</span>}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-3">
          <SidebarContent />
        </div>

        {/* User section */}
        <div className={`p-3 border-t border-border ${sidebarCollapsed ? "flex flex-col items-center gap-2" : ""}`}>
          {!sidebarCollapsed && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.business_name}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={sidebarCollapsed ? "w-10 h-10 p-0" : "w-full justify-start"}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <LogoInsignia className="h-8 w-8" />
              <span className="text-lg font-bold">Easy Day AI</span>
            </Link>
          </div>
          <div className="p-3">
            <SidebarContent />
          </div>
          <div className="p-3 border-t border-border mt-auto">
            <div className="mb-3 px-3">
              <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{profile?.business_name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Sidebar collapse toggle - desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>

            <h1 className="text-lg font-semibold">Calendar</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Panels collapse toggle - desktop */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setPanelsCollapsed(!panelsCollapsed)}
            >
              {panelsCollapsed ? (
                <PanelRight className="h-5 w-5" />
              ) : (
                <PanelRightClose className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile panels toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobilePanelsVisible(!mobilePanelsVisible)}
            >
              {mobilePanelsVisible ? "Hide Panels" : "Show Panels"}
            </Button>

            <Button size="sm" onClick={() => setAddEventOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Calendar Section */}
          <div className={`flex-1 flex flex-col min-w-0 overflow-auto ${panelsCollapsed ? "" : "lg:max-w-[calc(100%-360px)]"}`}>
            {/* Calendar Controls */}
            <div className="p-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[160px] text-center">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 p-4 overflow-auto">
              <Card className="border-border/50 shadow-card h-full">
                <CardContent className="p-4">
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day) => {
                      const dateKey = format(day, "yyyy-MM-dd");
                      const dayBookings = bookingsByDate.get(dateKey) || [];
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrentMonth = isSameMonth(day, currentMonth);
                      const isTodayDate = isToday(day);

                      return (
                        <button
                          key={dateKey}
                          onClick={() => setSelectedDate(day)}
                          className={`
                            relative min-h-[80px] p-1.5 rounded-lg text-sm transition-colors text-left align-top
                            border border-transparent
                            ${isSelected ? "bg-primary/10 border-primary/30" : "hover:bg-secondary/50"}
                            ${!isCurrentMonth ? "opacity-40" : ""}
                          `}
                        >
                          <span
                            className={`
                              inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                              ${isTodayDate ? "bg-primary text-primary-foreground" : ""}
                            `}
                          >
                            {format(day, "d")}
                          </span>

                          {/* Event pills */}
                          <div className="mt-1 space-y-0.5 overflow-hidden">
                            {dayBookings.slice(0, 2).map((booking) => (
                              <div
                                key={booking.id}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary truncate"
                                title={booking.customer_name}
                              >
                                {format(parseISO(booking.start_time), "HH:mm")} {booking.customer_name}
                              </div>
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-[10px] text-muted-foreground px-1.5">
                                +{dayBookings.length - 2} more
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Overview - Bottom Panel */}
            <div className={`border-t border-border p-4 ${panelsCollapsed ? "" : "lg:block"} ${mobilePanelsVisible ? "block" : "hidden lg:block"}`}>
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Monthly Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold">{monthlyStats.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-primary">{monthlyStats.upcoming}</div>
                      <div className="text-xs text-muted-foreground">Upcoming</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-green-500">{monthlyStats.completed}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <div className="text-2xl font-bold text-destructive">{monthlyStats.canceled}</div>
                      <div className="text-xs text-muted-foreground">Canceled</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panels */}
          <div
            className={`
              border-l border-border bg-card overflow-y-auto transition-all duration-300
              ${panelsCollapsed ? "w-0 border-0 overflow-hidden" : "lg:w-[360px]"}
              ${mobilePanelsVisible ? "block" : "hidden lg:block"}
            `}
          >
            <div className="p-4 space-y-4">
              {/* Upcoming Events Panel */}
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {upcomingEvents.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">
                                {booking.customer_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(parseISO(booking.start_time), "MMM d")} • {format(parseISO(booking.start_time), "h:mm a")}
                              </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {booking.appointment_types?.name || "Event"}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks Panel */}
              <Card className="border-border/50 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {PLACEHOLDER_TASKS.map((task) => (
                      <div
                        key={task.id}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg bg-secondary/50
                          ${task.completed ? "opacity-60" : ""}
                        `}
                      >
                        <div
                          className={`
                            w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
                            ${task.completed ? "bg-primary border-primary" : "border-muted-foreground"}
                          `}
                        >
                          {task.completed && (
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Tasks feature coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Create a new event on your calendar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                placeholder="Event title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">Start Time</Label>
                <Input
                  id="event-start"
                  type="time"
                  value={newEventStartTime}
                  onChange={(e) => setNewEventStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">End Time</Label>
                <Input
                  id="event-end"
                  type="time"
                  value={newEventEndTime}
                  onChange={(e) => setNewEventEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={savingEvent || !newEventTitle.trim()}>
              {savingEvent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              {selectedBooking && format(parseISO(selectedBooking.start_time), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {format(parseISO(selectedBooking.start_time), "h:mm a")} –{" "}
                    {format(parseISO(selectedBooking.end_time), "h:mm a")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedBooking.appointment_types?.name || "Event"}
                  </div>
                </div>
              </div>

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

              {selectedBooking.notes && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Badge variant={selectedBooking.status === "canceled" ? "destructive" : "secondary"}>
                  {selectedBooking.status}
                </Badge>
              </div>

              {selectedBooking.status !== "canceled" && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" disabled>
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancelBooking}
                    disabled={cancelingBooking}
                  >
                    {cancelingBooking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
