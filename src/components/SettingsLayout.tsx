import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LogoInsignia from "@/components/LogoInsignia";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Clock, Calendar, ArrowLeft, Palette } from "lucide-react";

interface SettingsLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const navItems = [
  { to: "/settings/profile", label: "Profile", icon: User },
  { to: "/settings/availability", label: "Availability", icon: Clock },
  { to: "/settings/appointment-types", label: "Appointments", icon: Calendar },
  { to: "/settings/calendar-design", label: "Design", icon: Palette },
];

export function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <LogoInsignia className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="text-lg sm:text-xl font-bold hidden sm:inline">Easy Day AI</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="sm:hidden min-h-[44px] min-w-[44px]">
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8">
          {/* Sidebar - horizontal scroll on mobile */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex-shrink-0",
                    location.pathname === item.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground bg-secondary/50 md:bg-transparent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline md:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.split(" ")[0]}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
              {description && <p className="text-sm sm:text-base text-muted-foreground">{description}</p>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
