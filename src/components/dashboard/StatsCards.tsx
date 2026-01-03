import { Calendar, CheckSquare, Clock } from "lucide-react";

interface StatsCardsProps {
  totalEvents: number;
  tasksCompleted: number;
  totalTasks: number;
  hoursLogged: number;
}

export function StatsCards({
  totalEvents,
  tasksCompleted,
  totalTasks,
  hoursLogged,
}: StatsCardsProps) {
  const tasksPercentage = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  const stats = [
    {
      icon: Calendar,
      label: "Total Events",
      value: totalEvents.toString(),
      color: "text-primary",
      glow: "shadow-[0_0_20px_hsl(270_91%_65%_/_0.3)]",
    },
    {
      icon: CheckSquare,
      label: "Tasks Completed",
      value: `${tasksPercentage}%`,
      color: "text-cyan-400",
      glow: "shadow-[0_0_20px_hsl(180_100%_50%_/_0.3)]",
    },
    {
      icon: Clock,
      label: "Hours Logged",
      value: hoursLogged.toString(),
      color: "text-pink-400",
      glow: "shadow-[0_0_20px_hsl(330_100%_65%_/_0.3)]",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all duration-200 ${stat.glow}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-secondary">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
