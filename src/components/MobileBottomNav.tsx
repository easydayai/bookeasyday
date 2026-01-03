import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: ClipboardList, label: "Bookings", href: "/dashboard/appointments" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: User, label: "Profile", href: "/settings/profile" },
];

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "border-t bg-[#070A12]/95 border-white/10 backdrop-blur-lg",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] px-2 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-violet-400"
                  : "text-white/50 active:text-white/70"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-violet-400")} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-violet-400" : "text-white/50"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
