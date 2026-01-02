import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LogoInsignia from "@/components/LogoInsignia";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/solutions", label: "Solutions" },
    { to: "/pricing", label: "Pricing" },
    { to: "/talk-to-daisy", label: "Talk to Daisy", isRainbow: true },
    ...(user ? [{ to: "/dashboard", label: "Dashboard" }] : [{ to: "/login", label: "Sign In" }]),
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-sm",
        isHome ? "bg-background/30" : "bg-background/95",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <LogoInsignia className="h-8 w-8" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors",
                  link.isRainbow 
                    ? "rainbow-text font-semibold" 
                    : location.pathname === link.to
                      ? "text-primary"
                      : "text-foreground/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user && <ThemeToggle />}
            {!user && (
              <Button size="sm" className="shadow-glow" asChild>
                <Link to="/signup">Sign Up Free</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {user && <ThemeToggle />}
            {!user && (
              <Button size="sm" className="shadow-glow" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            )}
            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors",
                  link.isRainbow 
                    ? "rainbow-text font-semibold" 
                    : location.pathname === link.to
                      ? "text-primary"
                      : "text-foreground/70 hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Button className="w-full mt-4 shadow-glow" size="sm" asChild>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  Sign Up Free
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
