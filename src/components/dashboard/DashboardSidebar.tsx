import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Target,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Calendar", href: "/dashboard/calendar", active: true },
  { icon: CheckSquare, label: "Tasks", href: "/dashboard/tasks" },
  { icon: Target, label: "Goals", href: "/dashboard/goals" },
  { icon: Settings, label: "Settings", href: "/settings/profile" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { profile, subscription, signOut } = useAuth();

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const isPro = subscription?.plan_key && subscription.plan_key !== "free";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[hsl(var(--sidebar-bg))] border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Easy Day AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary shadow-[0_0_20px_hsl(270_91%_65%_/_0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              {item.label}
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(270_91%_65%_/_0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <Avatar className="w-10 h-10 ring-2 ring-primary/30">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            {isPro && (
              <Badge className="mt-0.5 bg-primary/20 text-primary border-primary/30 text-xs">
                Pro Member
              </Badge>
            )}
          </div>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
