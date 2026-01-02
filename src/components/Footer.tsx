import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground">Easy Day AI</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Automate your business. Make every day an easy day.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/solutions" className="text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/affiliate" className="text-muted-foreground hover:text-foreground transition-colors">
              Affiliate Program
            </Link>
            <Link to="/policies" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Easy Day AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
