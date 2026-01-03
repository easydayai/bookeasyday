import { Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your schedule today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-secondary"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--primary))]" />
        </Button>
        <Button variant="ghost" size="icon" asChild className="hover:bg-secondary">
          <Link to="/settings/profile">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
