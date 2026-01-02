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
  { to: "/settings/appointment-types", label: "Appointment Types", icon: Calendar },
  { to: "/settings/calendar-design", label: "Calendar Design", icon: Palette },
];

export function SettingsLayout({ children, title, description }: SettingsLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoInsignia className="h-8 w-8" />
            <span className="text-xl font-bold">Easy Day AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
