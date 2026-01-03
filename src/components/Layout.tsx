import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { DaisyAssistant } from "./DaisyAssistant";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { usePWAMode } from "@/hooks/use-pwa-mode";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isPWAMobile } = usePWAMode();
  const location = useLocation();
  const isHomepage = location.pathname === "/";

  return (
    <div className={isPWAMobile ? "pwa-mobile-layout" : "min-h-screen bg-background text-foreground flex flex-col"}>
      <Navigation />
      <main className={isPWAMobile ? "pwa-mobile-main" : "pt-16 flex-1"}>{children}</main>
      {/* Show Daisy assistant on all pages */}
      {!isPWAMobile && <DaisyAssistant />}
      {!isPWAMobile && <Footer />}
    </div>
  );
};
