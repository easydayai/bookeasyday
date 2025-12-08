import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "./CartDrawer";
import { ConsentModal } from "./ConsentModal";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/faq", label: "FAQs" },
    { to: "/contact", label: "Contact" },
    { to: "/login", label: "Check Status" },
  ];

  const affiliateLink = "https://rentezofficial.goaffpro.com/create-account";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">
            Rent <span className="text-primary">EZ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm transition-colors",
                  location.pathname === link.to
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Affiliates
            </a>
            <CartDrawer />
            {/* Priority: Available Listings button next to Apply */}
            <Button 
              variant="outline"
              size="sm"
              asChild
              className={cn(
                location.pathname === "/listings" && "border-primary text-primary"
              )}
            >
              <Link to="/listings">Available Listings</Link>
            </Button>
            <Button 
              size="sm"
              onClick={() => setConsentModalOpen(true)}
            >
              Apply – $20
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <CartDrawer />
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
          <div className="lg:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "block py-2 text-sm transition-colors",
                  location.pathname === link.to
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* Priority: Available Listings */}
            <Link
              to="/listings"
              className={cn(
                "block py-2 text-sm font-medium transition-colors",
                location.pathname === "/listings"
                  ? "text-primary"
                  : "text-foreground hover:text-primary"
              )}
              onClick={() => setIsOpen(false)}
            >
              ★ Available Listings
            </Link>
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Affiliates
            </a>
            <Button 
              className="w-full mt-4" 
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setConsentModalOpen(true);
              }}
            >
              Apply – $20
            </Button>
          </div>
        )}
      </div>

      <ConsentModal open={consentModalOpen} onOpenChange={setConsentModalOpen} />
    </nav>
  );
};
