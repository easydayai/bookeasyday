import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-foreground">Rent EZ</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get approved fast — for just $20
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/policies" className="text-muted-foreground hover:text-primary transition-colors">
              Policies
            </Link>
            <Link to="/affiliate-legal" className="text-muted-foreground hover:text-primary transition-colors">
              Affiliate Program Info
            </Link>
            <a 
              href="https://rentezofficial.goaffpro.com/create-account" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Become an Affiliate
            </a>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Rent EZ. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
