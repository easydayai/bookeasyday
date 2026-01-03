import React, { useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  start: string;   // HH:MM
  end: string;     // HH:MM
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1);
}

function endOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0);
}

function dayLabel(i: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
}

export default function CalendarPage() {
  // Layout toggles
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelsCollapsed, setPanelsCollapsed] = useState(false);

  // Calendar state
  const today = new Date();
  const [cursorYear, setCursorYear] = useState(today.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(today.getMonth()); // 0-11
  const [selectedDateISO, setSelectedDateISO] = useState(toISODate(today));

  // Demo events (replace with Supabase fetch by month range)
  const [events, setEvents] = useState<EventItem[]>([
    { id: "1", title: "Team Meeting", dateISO: "2026-01-04", start: "10:00", end: "10:30" },
    { id: "2", title: "Project Deadline", dateISO: "2026-01-09", start: "12:00", end: "12:15" },
    { id: "3", title: "Client Call", dateISO: "2026-01-09", start: "15:00", end: "15:30" },
    { id: "4", title: "Doctor Appointment", dateISO: "2026-01-12", start: "09:00", end: "09:30" },
  ]);

  const monthStart = startOfMonth(cursorYear, cursorMonth);
  const monthEnd = endOfMonth(cursorYear, cursorMonth);
  const monthTitle = monthStart.toLocaleString(undefined, { month: "long", year: "numeric" });

  // Build the 6-week grid view (42 cells)
  const cells = useMemo(() => {
    const firstDayOfWeek = monthStart.getDay(); // 0=Sun
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

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const list = map.get(e.dateISO) ?? [];
      list.push(e);
      map.set(e.dateISO, list);
    }
    // Sort each day's events by start time
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.start.localeCompare(b.start));
      map.set(k, list);
    }
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => {
    const list = eventsByDate.get(selectedDateISO) ?? [];
    return list;
  }, [eventsByDate, selectedDateISO]);

  function prevMonth() {
    const m = cursorMonth - 1;
    if (m < 0) {
      setCursorMonth(11);
      setCursorYear((y) => y - 1);
    } else {
      setCursorMonth(m);
    }
  }

  function nextMonth() {
    const m = cursorMonth + 1;
    if (m > 11) {
      setCursorMonth(0);
      setCursorYear((y) => y + 1);
    } else {
      setCursorMonth(m);
    }
  }

  // Minimal "Add Event" (replace with modal + form)
  function quickAddEvent() {
    const id = crypto.randomUUID();
    setEvents((prev) => [
      ...prev,
      { id, title: "New Event", dateISO: selectedDateISO, start: "13:00", end: "13:30" },
    ]);
  }

  // Layout: sidebar + main + right panels; bottom panel under main area
  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={[
            "border-r border-white/10 bg-[#0A0F1F] transition-all duration-200",
            sidebarCollapsed ? "w-[72px]" : "w-[240px]",
          ].join(" ")}
        >
          <div className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/10" />
              {!sidebarCollapsed && <div className="font-semibold">Easy Day AI</div>}
            </div>
          </div>
          <nav className="px-2">
            <a href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/5">
              <span className="h-5 w-5 rounded bg-white/10" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </a>
            <a
              href="/calendar"
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 bg-white/10 text-white"
            >
              <span className="h-5 w-5 rounded bg-white/20" />
              {!sidebarCollapsed && <span>Calendar</span>}
            </a>
            <a href="#" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/5">
              <span className="h-5 w-5 rounded bg-white/10" />
              {!sidebarCollapsed && <span>Tasks</span>}
            </a>
            <a href="#" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/5">
              <span className="h-5 w-5 rounded bg-white/10" />
              {!sidebarCollapsed && <span>Goals</span>}
            </a>
            <a href="/settings" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/5">
              <span className="h-5 w-5 rounded bg-white/10" />
              {!sidebarCollapsed && <span>Settings</span>}
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#070A12]">
            <div>
              <div className="text-lg font-semibold">Calendar</div>
              <div className="text-white/60 text-sm">Manage your appointments</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                {sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
              </button>
              <button
                onClick={() => setPanelsCollapsed((v) => !v)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                {panelsCollapsed ? "Show Panels" : "Hide Panels"}
              </button>
              <a
                href="/settings"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                Settings
              </a>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                // hook this to your sign out
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Body grid */}
          <div className="p-6">
            <div
              className={[
                "grid gap-6",
                panelsCollapsed ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[1fr_360px]",
              ].join(" ")}
            >
              {/* Calendar card */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                      aria-label="Previous month"
                    >
                      ←
                    </button>
                    <div className="text-xl font-semibold">{monthTitle}</div>
                    <button
                      onClick={nextMonth}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                      aria-label="Next month"
                    >
                      →
                    </button>
                  </div>
                  <button
                    onClick={quickAddEvent}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
                  >
                    + Add Event
                  </button>
                </div>
                {/* Weekday labels */}
                <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-white/60">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="px-2 py-1">
                      {dayLabel(i).toUpperCase()}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {cells.map((d) => {
                    const iso = toISODate(d);
                    const inMonth = d.getMonth() === cursorMonth;
                    const isSelected = iso === selectedDateISO;
                    const dayEvents = eventsByDate.get(iso) ?? [];
                    return (
                      <button
                        key={iso}
                        onClick={() => setSelectedDateISO(iso)}
                        className={[
                          "min-h-[92px] rounded-xl border p-2 text-left transition",
                          "border-white/10 bg-white/5 hover:bg-white/10",
                          !inMonth ? "opacity-40" : "",
                          isSelected ? "outline outline-2 outline-violet-500" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">{d.getDate()}</div>
                          {dayEvents.length > 0 && (
                            <div className="text-[11px] text-white/70">
                              {dayEvents.length} evt
                            </div>
                          )}
                        </div>
                        {/* Event chips (no glow) */}
                        <div className="mt-2 space-y-1">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className="truncate rounded-lg bg-violet-600/25 px-2 py-1 text-[11px] text-white/90 border border-violet-500/20"
                              title={`${e.title} (${e.start}-${e.end})`}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[11px] text-white/60">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Right panels */}
              {!panelsCollapsed && (
                <aside className="space-y-6">
                  <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-lg font-semibold">Upcoming Events</div>
                    <div className="mt-3 space-y-3">
                      {selectedEvents.length === 0 ? (
                        <div className="text-white/60 text-sm">
                          No events on {selectedDateISO}.
                        </div>
                      ) : (
                        selectedEvents.map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                          >
                            <div>
                              <div className="font-semibold">{e.title}</div>
                              <div className="text-xs text-white/60">{selectedDateISO}</div>
                            </div>
                            <div className="text-sm text-white/80">
                              {e.start}–{e.end}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-lg font-semibold">Tasks</div>
                    <div className="mt-3 space-y-2 text-sm text-white/80">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="accent-violet-500" defaultChecked />
                        Follow up with client
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="accent-violet-500" />
                        Update availability
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="accent-violet-500" />
                        Review bookings
                      </label>
                    </div>
                  </section>
                </aside>
              )}
            </div>

            {/* Bottom overview */}
            {!panelsCollapsed && (
              <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-lg font-semibold">Monthly Overview</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 text-sm">Events</div>
                    <div className="text-2xl font-semibold">{events.length}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 text-sm">Completion</div>
                    <div className="text-2xl font-semibold">—</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60 text-sm">Hours Logged</div>
                    <div className="text-2xl font-semibold">—</div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
