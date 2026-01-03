import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Target, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  LogOut,
  Moon,
  Sun
} from "lucide-react";

interface Booking {
  id: string;
  user_id: string;
  appointment_type_id: string | null;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTimeInTimezone(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    });
  } catch {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}

function getDateInTimezone(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // Returns YYYY-MM-DD
  } catch {
    const date = new Date(isoString);
    return toISODate(date);
  }
}

function dayLabel(i: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
}

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CalendarIcon, label: "Calendar", href: "/calendar" },
  { icon: CheckSquare, label: "Tasks", href: "#" },
  { icon: Target, label: "Goals", href: "#" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Layout toggles
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);

  // Calendar state
  const today = new Date();
  const [cursorYear, setCursorYear] = useState(today.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(today.getMonth());
  const [selectedDateISO, setSelectedDateISO] = useState(toISODate(today));

  // Data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<Map<string, AppointmentType>>(new Map());
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const userTimezone = profile?.timezone || "America/New_York";

  // Auth redirect
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    } else if (!isLoading && user && profile && !profile.full_name) {
      navigate("/onboarding");
    }
  }, [isLoading, user, profile, navigate]);

  // Fetch appointment types
  useEffect(() => {
    if (!user) return;

    async function fetchAppointmentTypes() {
      const { data } = await supabase
        .from("appointment_types")
        .select("id, name, duration_minutes")
        .eq("user_id", user.id);
      
      if (data) {
        const map = new Map<string, AppointmentType>();
        data.forEach((at) => map.set(at.id, at));
        setAppointmentTypes(map);
      }
    }

    fetchAppointmentTypes();
  }, [user]);

  // Fetch bookings for the visible month
  const fetchMonthBookings = useCallback(async () => {
    if (!user) return;
    
    setLoadingBookings(true);
    
    // Calculate month range in UTC
    const monthStart = new Date(cursorYear, cursorMonth, 1);
    const nextMonthStart = new Date(cursorYear, cursorMonth + 1, 1);
    
    const startISO = monthStart.toISOString();
    const endISO = nextMonthStart.toISOString();

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", startISO)
      .lt("start_time", endISO)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } else {
      setBookings(data || []);
    }
    
    setLoadingBookings(false);
  }, [user, cursorYear, cursorMonth]);

  useEffect(() => {
    fetchMonthBookings();
  }, [fetchMonthBookings]);

  // Build calendar grid cells
  const cells = useMemo(() => {
    const monthStart = new Date(cursorYear, cursorMonth, 1);
    const firstDayOfWeek = monthStart.getDay();
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - firstDayOfWeek);

    const arr: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [cursorYear, cursorMonth]);

  // Group bookings by date (in user's timezone)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    
    for (const booking of bookings) {
      const dateKey = getDateInTimezone(booking.start_time, userTimezone);
      const list = map.get(dateKey) ?? [];
      list.push(booking);
      map.set(dateKey, list);
    }
    
    // Sort each day's bookings by start time
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => a.start_time.localeCompare(b.start_time));
      map.set(key, list);
    }
    
    return map;
  }, [bookings, userTimezone]);

  // Get bookings for selected date
  const selectedBookings = useMemo(() => {
    return bookingsByDate.get(selectedDateISO) ?? [];
  }, [bookingsByDate, selectedDateISO]);

  const monthTitle = new Date(cursorYear, cursorMonth, 1).toLocaleString(undefined, { 
    month: "long", 
    year: "numeric" 
  });

  function prevMonth() {
    if (cursorMonth === 0) {
      setCursorMonth(11);
      setCursorYear((y) => y - 1);
    } else {
      setCursorMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (cursorMonth === 11) {
      setCursorMonth(0);
      setCursorYear((y) => y + 1);
    } else {
      setCursorMonth((m) => m + 1);
    }
  }

  function handleDateClick(dateISO: string) {
    setSelectedDateISO(dateISO);
  }

  function handleBookingClick(booking: Booking) {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  }

  async function handleCancelBooking() {
    if (!selectedBooking) return;
    
    setCancelling(true);
    
    const { error } = await supabase
      .from("bookings")
      .update({ status: "canceled" })
      .eq("id", selectedBooking.id)
      .eq("user_id", user?.id);
    
    if (error) {
      toast.error("Failed to cancel booking");
    } else {
      toast.success("Booking canceled");
      setDetailsOpen(false);
      setSelectedBooking(null);
      fetchMonthBookings();
    }
    
    setCancelling(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#070A12] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex min-h-screen">
        {/* Sidebar - hidden on mobile */}
        <aside
          className={`hidden md:block border-r transition-all duration-200 ${
            sidebarCollapsed ? "w-[72px]" : "w-[240px]"
          } ${isDark ? "border-white/10 bg-[#0A0F1F]" : "border-gray-200 bg-white"}`}
        >
          <div className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isDark ? "bg-violet-600/20" : "bg-violet-100"}`}>
                <CalendarIcon className="h-5 w-5 text-violet-500" />
              </div>
              {!sidebarCollapsed && (
                <div className="font-semibold">Easy Day AI</div>
              )}
            </div>
          </div>
          <nav className="px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === "/calendar";
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 mt-1 transition-colors ${
                    isActive 
                      ? isDark ? "bg-white/10 text-white" : "bg-violet-100 text-violet-700"
                      : isDark ? "text-white/60 hover:bg-white/5 hover:text-white/80" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5 border-b ${isDark ? "border-white/10 bg-[#070A12]" : "border-gray-200 bg-white"}`}>
            <div className="flex items-center gap-3">
              {/* Mobile logo */}
              <div className={`md:hidden h-8 w-8 rounded-xl flex items-center justify-center ${isDark ? "bg-violet-600/20" : "bg-violet-100"}`}>
                <CalendarIcon className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold">Calendar</h1>
                <p className={`hidden sm:block ${isDark ? "text-white/60 text-sm" : "text-gray-500 text-sm"}`}>Manage your appointments</p>
              </div>
            </div>
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className={`min-h-[44px] min-w-[44px] ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className={`hidden lg:flex ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                <PanelLeftClose className="h-4 w-4 mr-2" />
                {sidebarCollapsed ? "Show" : "Hide"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPanelsCollapsed((v) => !v)}
                className={`hidden xl:flex ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                <PanelRightClose className="h-4 w-4 mr-2" />
                Panels
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className={isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
            {/* Mobile actions */}
            <div className="flex sm:hidden items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="min-h-[44px] min-w-[44px]"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="min-h-[44px] min-w-[44px]"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Body grid */}
          <div className="flex-1 p-3 sm:p-6 overflow-auto">
            <div
              className={`flex flex-col xl:grid gap-4 sm:gap-6 ${
                panelsCollapsed ? "" : "xl:grid-cols-[1fr_360px]"
              }`}
            >
              {/* Calendar card */}
              <section className={`rounded-2xl border p-3 sm:p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevMonth}
                      className={`min-h-[44px] min-w-[44px] flex-shrink-0 ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-base sm:text-xl font-semibold text-center flex-1 truncate">
                      {monthTitle}
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextMonth}
                      className={`min-h-[44px] min-w-[44px] flex-shrink-0 ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedDateISO(toISODate(today));
                      setCursorMonth(today.getMonth());
                      setCursorYear(today.getFullYear());
                    }}
                    variant="outline"
                    size="sm"
                    className={`min-h-[44px] flex-shrink-0 ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"}`}
                  >
                    Today
                  </Button>
                </div>

                {/* Weekday labels */}
                <div className={`grid grid-cols-7 gap-1 sm:gap-2 text-[10px] sm:text-xs mb-2 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="py-1 text-center font-medium">
                      <span className="hidden sm:inline">{dayLabel(i).toUpperCase()}</span>
                      <span className="sm:hidden">{dayLabel(i).charAt(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {cells.map((d) => {
                    const iso = toISODate(d);
                    const inMonth = d.getMonth() === cursorMonth;
                    const isSelected = iso === selectedDateISO;
                    const isToday = iso === toISODate(today);
                    const dayBookings = bookingsByDate.get(iso) ?? [];
                    const activeBookings = dayBookings.filter(b => b.status !== "canceled");

                    return (
                      <button
                        key={iso}
                        onClick={() => handleDateClick(iso)}
                        className={`min-h-[44px] sm:min-h-[92px] rounded-lg sm:rounded-xl border p-1 sm:p-2 text-left transition cursor-pointer ${
                          !inMonth ? "opacity-40" : ""
                        } ${
                          isSelected 
                            ? "border-violet-500 bg-violet-500/10" 
                            : isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        } ${
                          isToday && !isSelected ? "ring-1 ring-violet-400/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm font-semibold ${
                            isToday ? "text-violet-500" : ""
                          }`}>
                            {d.getDate()}
                          </span>
                          {activeBookings.length > 0 && (
                            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-violet-500" />
                          )}
                        </div>
                        
                        {/* Hide event chips on mobile, just show dot */}
                        <div className="hidden sm:block mt-2 space-y-1">
                          {activeBookings.slice(0, 2).map((booking) => (
                            <div
                              key={booking.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookingClick(booking);
                              }}
                              className={`truncate rounded-lg px-2 py-1 text-[11px] border cursor-pointer transition ${
                                isDark 
                                  ? "bg-violet-600/25 text-white/90 border-violet-500/20 hover:bg-violet-600/40" 
                                  : "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200"
                              }`}
                            >
                              {booking.customer_name}
                            </div>
                          ))}
                          {activeBookings.length > 2 && (
                            <div className={`text-[11px] ${isDark ? "text-white/60" : "text-gray-500"}`}>
                              +{activeBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {loadingBookings && (
                  <div className={`mt-4 text-center text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>
                    Loading bookings...
                  </div>
                )}
              </section>

              {/* Right panels - always show on mobile as appointments list */}
              <aside className={`space-y-4 sm:space-y-6 ${panelsCollapsed ? "hidden xl:block" : ""}`}>
                {/* Upcoming Events for selected date */}
                <section className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                  <h3 className="text-base sm:text-lg font-semibold mb-3">
                    Appointments on {selectedDateISO}
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedBookings.length === 0 ? (
                      <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>
                        No appointments on this date.
                      </p>
                    ) : (
                      selectedBookings.map((booking) => {
                        const appointmentType = booking.appointment_type_id 
                          ? appointmentTypes.get(booking.appointment_type_id)
                          : null;
                        const isCanceled = booking.status === "canceled";
                        
                        return (
                          <button
                            key={booking.id}
                            onClick={() => handleBookingClick(booking)}
                            className={`w-full text-left rounded-xl border px-3 sm:px-4 py-3 transition min-h-[56px] ${
                              isCanceled ? "opacity-50" : ""
                            } ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold truncate mr-2">{booking.customer_name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                isCanceled 
                                  ? "bg-red-500/20 text-red-500" 
                                  : "bg-green-500/20 text-green-600"
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            {appointmentType && (
                              <p className={`text-xs mb-1 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                                {appointmentType.name}
                              </p>
                            )}
                            <p className={`text-sm ${isDark ? "text-white/80" : "text-gray-700"}`}>
                              {formatTimeInTimezone(booking.start_time, userTimezone)} – {formatTimeInTimezone(booking.end_time, userTimezone)}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Tasks placeholder - hide on mobile */}
                <section className={`hidden sm:block rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                  <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                  <div className={`space-y-2 text-sm ${isDark ? "text-white/80" : "text-gray-700"}`}>
                    <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                      <input type="checkbox" className="accent-violet-500 h-5 w-5" defaultChecked />
                      <span>Follow up with client</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                      <input type="checkbox" className="accent-violet-500 h-5 w-5" />
                      <span>Update availability</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                      <input type="checkbox" className="accent-violet-500 h-5 w-5" />
                      <span>Review bookings</span>
                    </label>
                  </div>
                </section>
              </aside>
            </div>

            {/* Bottom overview - hide on mobile */}
            {!panelsCollapsed && (
              <section className={`hidden sm:block mt-6 rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Total Bookings</p>
                    <p className="text-2xl font-semibold">{bookings.length}</p>
                  </div>
                  <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Active</p>
                    <p className="text-2xl font-semibold">
                      {bookings.filter(b => b.status === "booked").length}
                    </p>
                  </div>
                  <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Canceled</p>
                    <p className="text-2xl font-semibold">
                      {bookings.filter(b => b.status === "canceled").length}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={`w-full max-w-lg sm:max-w-lg h-[90vh] sm:h-auto overflow-y-auto ${isDark ? "bg-[#0A0F1F] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Booking Details</DialogTitle>
            <DialogDescription className={isDark ? "text-white/60" : "text-gray-500"}>
              View and manage this appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 mt-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className={`h-5 w-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Customer</p>
                    <p className="font-medium">{selectedBooking.customer_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className={`h-5 w-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Email</p>
                    <p className="font-medium">{selectedBooking.customer_email}</p>
                  </div>
                </div>
                
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className={`h-5 w-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
                    <div>
                      <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Phone</p>
                      <p className="font-medium">{selectedBooking.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`border-t pt-4 space-y-3 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                {/* Appointment Type */}
                {selectedBooking.appointment_type_id && appointmentTypes.get(selectedBooking.appointment_type_id) && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className={`h-5 w-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
                    <div>
                      <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Appointment Type</p>
                      <p className="font-medium">
                        {appointmentTypes.get(selectedBooking.appointment_type_id)?.name}
                        <span className={`ml-2 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                          ({appointmentTypes.get(selectedBooking.appointment_type_id)?.duration_minutes} min)
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock className={`h-5 w-5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Time</p>
                    <p className="font-medium">
                      {getDateInTimezone(selectedBooking.start_time, userTimezone)} at{" "}
                      {formatTimeInTimezone(selectedBooking.start_time, userTimezone)} – {formatTimeInTimezone(selectedBooking.end_time, userTimezone)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${
                    selectedBooking.status === "canceled" ? "bg-red-500" : "bg-green-500"
                  }`} />
                  <div>
                    <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Status</p>
                    <p className="font-medium capitalize">{selectedBooking.status}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className={`border-t pt-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                  <div className="flex items-start gap-3">
                    <FileText className={`h-5 w-5 mt-0.5 ${isDark ? "text-white/60" : "text-gray-400"}`} />
                    <div>
                      <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>Notes</p>
                      <p className="font-medium">{selectedBooking.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={`flex gap-3 pt-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
                {selectedBooking.status !== "canceled" && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                    className="flex-1"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                  className={`flex-1 ${isDark ? "border-white/10 text-white hover:bg-white/10" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
