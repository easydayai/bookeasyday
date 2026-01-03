import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TasksCardProps {
  tasks: Task[];
  onToggle?: (id: string) => void;
}

export function TasksCard({ tasks, onToggle }: TasksCardProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Calculate the circle dash offset for progress
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Tasks</h3>
        <span className="text-sm text-muted-foreground">
          {completedCount} / {totalCount}
        </span>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-5">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500 drop-shadow-[0_0_8px_hsl(var(--primary))]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onToggle?.(task.id)}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all duration-200",
              task.completed
                ? "bg-primary/10"
                : "bg-secondary/50 hover:bg-secondary"
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 drop-shadow-[0_0_6px_hsl(var(--primary))]" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <span
              className={cn(
                "text-sm truncate",
                task.completed
                  ? "text-primary line-through"
                  : "text-foreground"
              )}
            >
              {task.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
