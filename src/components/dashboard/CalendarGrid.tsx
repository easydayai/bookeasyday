import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "meeting" | "deadline" | "appointment";
}

interface CalendarGridProps {
  events?: CalendarEvent[];
  onAddEvent?: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({ events = [], onAddEvent }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { days, monthName, year } = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];
    
    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Pad to complete the last week
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
    const year = currentDate.getFullYear();

    return { days, monthName, year };
  }, [currentDate]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">
            {monthName} {year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <Button
          onClick={onAddEvent}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(270_91%_65%_/_0.4)] hover:shadow-[0_0_30px_hsl(270_91%_65%_/_0.5)] transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={index}
              className={cn(
                "relative min-h-[100px] p-2 rounded-xl border transition-all duration-200 group",
                day
                  ? "border-border/50 hover:border-primary/50 hover:shadow-[0_0_15px_hsl(270_91%_65%_/_0.2)] cursor-pointer"
                  : "border-transparent bg-transparent"
              )}
            >
              {day && (
                <>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                      isToday(day)
                        ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(270_91%_65%_/_0.6)]"
                        : "text-foreground"
                    )}
                  >
                    {day}
                  </span>

                  {/* Event Pills */}
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs px-2 py-1 rounded-full truncate font-medium",
                          event.type === "meeting"
                            ? "bg-primary/20 text-primary"
                            : event.type === "deadline"
                            ? "bg-pink-500/20 text-pink-400"
                            : "bg-cyan-500/20 text-cyan-400"
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-2">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
