import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  X,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  LogOut
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
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`border-r border-white/10 bg-[#0A0F1F] transition-all duration-200 ${
            sidebarCollapsed ? "w-[72px]" : "w-[240px]"
          }`}
        >
          <div className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-violet-400" />
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
                      ? "bg-white/10 text-white" 
                      : "text-white/60 hover:bg-white/5 hover:text-white/80"
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
        <main className="flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#070A12]">
            <div>
              <h1 className="text-lg font-semibold">Calendar</h1>
              <p className="text-white/60 text-sm">Manage your appointments</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <PanelLeftClose className="h-4 w-4 mr-2" />
                {sidebarCollapsed ? "Show" : "Hide"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPanelsCollapsed((v) => !v)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <PanelRightClose className="h-4 w-4 mr-2" />
                {panelsCollapsed ? "Panels" : "Panels"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Body grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div
              className={`grid gap-6 ${
                panelsCollapsed ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[1fr_360px]"
              }`}
            >
              {/* Calendar card */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevMonth}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold min-w-[180px] text-center">
                      {monthTitle}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextMonth}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
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
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    Today
                  </Button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-2 text-xs text-white/60 mb-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="px-2 py-1 text-center font-medium">
                      {dayLabel(i).toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
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
                        className={`min-h-[92px] rounded-xl border p-2 text-left transition cursor-pointer ${
                          !inMonth ? "opacity-40" : ""
                        } ${
                          isSelected 
                            ? "border-violet-500 bg-violet-500/10" 
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        } ${
                          isToday && !isSelected ? "ring-1 ring-violet-400/50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${
                            isToday ? "text-violet-400" : ""
                          }`}>
                            {d.getDate()}
                          </span>
                          {activeBookings.length > 0 && (
                            <span className="h-2 w-2 rounded-full bg-violet-500" />
                          )}
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          {activeBookings.slice(0, 2).map((booking) => (
                            <div
                              key={booking.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookingClick(booking);
                              }}
                              className="truncate rounded-lg bg-violet-600/25 px-2 py-1 text-[11px] text-white/90 border border-violet-500/20 cursor-pointer hover:bg-violet-600/40 transition"
                            >
                              {booking.customer_name}
                            </div>
                          ))}
                          {activeBookings.length > 2 && (
                            <div className="text-[11px] text-white/60">
                              +{activeBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {loadingBookings && (
                  <div className="mt-4 text-center text-white/60 text-sm">
                    Loading bookings...
                  </div>
                )}
              </section>

              {/* Right panels */}
              {!panelsCollapsed && (
                <aside className="space-y-6">
                  {/* Upcoming Events for selected date */}
                  <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-semibold mb-3">
                      Appointments on {selectedDateISO}
                    </h3>
                    <div className="space-y-3">
                      {selectedBookings.length === 0 ? (
                        <p className="text-white/60 text-sm">
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
                              className={`w-full text-left rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition ${
                                isCanceled ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold">{booking.customer_name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  isCanceled 
                                    ? "bg-red-500/20 text-red-400" 
                                    : "bg-green-500/20 text-green-400"
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              {appointmentType && (
                                <p className="text-xs text-white/60 mb-1">
                                  {appointmentType.name}
                                </p>
                              )}
                              <p className="text-sm text-white/80">
                                {formatTimeInTimezone(booking.start_time, userTimezone)} – {formatTimeInTimezone(booking.end_time, userTimezone)}
                              </p>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </section>

                  {/* Tasks placeholder */}
                  <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                    <div className="space-y-2 text-sm text-white/80">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-violet-500" defaultChecked />
                        <span>Follow up with client</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-violet-500" />
                        <span>Update availability</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-violet-500" />
                        <span>Review bookings</span>
                      </label>
                    </div>
                  </section>
                </aside>
              )}
            </div>

            {/* Bottom overview */}
            {!panelsCollapsed && (
              <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/60 text-sm">Total Bookings</p>
                    <p className="text-2xl font-semibold">{bookings.length}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/60 text-sm">Active</p>
                    <p className="text-2xl font-semibold">
                      {bookings.filter(b => b.status === "booked").length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white/60 text-sm">Canceled</p>
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
        <DialogContent className="bg-[#0A0F1F] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Booking Details</DialogTitle>
            <DialogDescription className="text-white/60">
              View and manage this appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 mt-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-white/60" />
                  <div>
                    <p className="text-sm text-white/60">Customer</p>
                    <p className="font-medium">{selectedBooking.customer_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-white/60" />
                  <div>
                    <p className="text-sm text-white/60">Email</p>
                    <p className="font-medium">{selectedBooking.customer_email}</p>
                  </div>
                </div>
                
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-white/60" />
                    <div>
                      <p className="text-sm text-white/60">Phone</p>
                      <p className="font-medium">{selectedBooking.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                {/* Appointment Type */}
                {selectedBooking.appointment_type_id && appointmentTypes.get(selectedBooking.appointment_type_id) && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-white/60" />
                    <div>
                      <p className="text-sm text-white/60">Appointment Type</p>
                      <p className="font-medium">
                        {appointmentTypes.get(selectedBooking.appointment_type_id)?.name}
                        <span className="text-white/60 ml-2">
                          ({appointmentTypes.get(selectedBooking.appointment_type_id)?.duration_minutes} min)
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-white/60" />
                  <div>
                    <p className="text-sm text-white/60">Time</p>
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
                    <p className="text-sm text-white/60">Status</p>
                    <p className="font-medium capitalize">{selectedBooking.status}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-white/60 mt-0.5" />
                    <div>
                      <p className="text-sm text-white/60">Notes</p>
                      <p className="font-medium">{selectedBooking.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
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
                  className="flex-1 border-white/10 text-white hover:bg-white/10"
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
