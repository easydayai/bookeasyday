import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DaisyProvider } from "@/contexts/DaisyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DaisyAssistant } from "@/components/DaisyAssistant";
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
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BookingDetailsSheet } from "@/components/BookingDetailsSheet";

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
    return formatter.format(date);
  } catch {
    const date = new Date(isoString);
    return toISODate(date);
  }
}

function formatDateReadable(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: timezone,
    });
  } catch {
    return isoString;
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

  const formattedSelectedDate = useMemo(() => {
    const [year, month, day] = selectedDateISO.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, [selectedDateISO]);

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
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <DaisyProvider>
    <div className={`min-h-[100dvh] ${isDark ? "bg-[#070A12] text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Mobile Header */}
      <MobileHeader
        title="Calendar"
        backHref="/dashboard"
        rightContent={
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] text-white/70 hover:text-white hover:bg-white/10"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        }
      />

      <div className="flex min-h-[100dvh] md:min-h-screen">
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
        <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
          {/* Desktop top bar - hidden on mobile */}
          <div className={`hidden md:flex items-center justify-between px-6 py-5 border-b ${isDark ? "border-white/10 bg-[#070A12]" : "border-gray-200 bg-white"}`}>
            <div>
              <h1 className="text-lg font-semibold">Calendar</h1>
              <p className={`${isDark ? "text-white/60 text-sm" : "text-gray-500 text-sm"}`}>Manage your appointments</p>
            </div>
            <div className="flex items-center gap-2">
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
                    const eventCount = activeBookings.length;

                    return (
                      <button
                        key={iso}
                        onClick={() => handleDateClick(iso)}
                        className={`min-h-[44px] sm:min-h-[92px] rounded-lg sm:rounded-xl border p-1 sm:p-2 text-left transition cursor-pointer ${
                          !inMonth ? "opacity-40" : ""
                        } ${
                          isSelected 
                            ? "border-violet-500 bg-violet-500/20 ring-2 ring-violet-500/50" 
                            : isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                        } ${
                          isToday && !isSelected ? "ring-1 ring-violet-400/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm font-semibold ${
                            isToday ? "text-violet-500" : ""
                          } ${isSelected ? "text-violet-300" : ""}`}>
                            {d.getDate()}
                          </span>
                          {/* Event indicator dots */}
                          {eventCount > 0 && (
                            <div className="flex items-center gap-0.5">
                              {eventCount <= 3 ? (
                                Array.from({ length: eventCount }).map((_, i) => (
                                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                ))
                              ) : (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                  <span className="text-[9px] text-violet-400 font-medium ml-0.5">
                                    +{eventCount - 1}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Hide event chips on mobile, just show dots */}
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

              {/* Appointments list */}
              <aside className={`space-y-4 sm:space-y-6 ${panelsCollapsed ? "hidden xl:block" : ""}`}>
                {/* Appointments for selected date */}
                <section className={`rounded-2xl border p-4 sm:p-5 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Appointments
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                    {formattedSelectedDate}
                  </p>
                  <div className="space-y-2 sm:space-y-3 max-h-[40vh] md:max-h-[50vh] overflow-y-auto">
                    {selectedBookings.length === 0 ? (
                      <p className={`text-sm py-4 text-center ${isDark ? "text-white/50" : "text-gray-400"}`}>
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
                            className={`w-full text-left rounded-xl border px-3 sm:px-4 py-3 transition min-h-[56px] active:scale-[0.98] ${
                              isCanceled ? "opacity-50" : ""
                            } ${isDark ? "border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Booking Details Sheet/Modal */}
      <BookingDetailsSheet
        booking={selectedBooking}
        appointmentType={selectedBooking?.appointment_type_id ? appointmentTypes.get(selectedBooking.appointment_type_id) : null}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onCancel={handleCancelBooking}
        cancelling={cancelling}
        formatTime={(iso) => formatTimeInTimezone(iso, userTimezone)}
        formatDate={(iso) => formatDateReadable(iso, userTimezone)}
      />
      
      <DaisyAssistant />
    </div>
    </DaisyProvider>
  );
}
