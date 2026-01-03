import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type?: "meeting" | "deadline" | "appointment";
}

interface UpcomingEventsCardProps {
  events: Event[];
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Upcoming Events</h3>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full shadow-[0_0_6px_currentColor]",
                  event.type === "meeting"
                    ? "bg-primary text-primary"
                    : event.type === "deadline"
                    ? "bg-pink-400 text-pink-400"
                    : "bg-cyan-400 text-cyan-400"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {event.title}
                </p>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{event.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
