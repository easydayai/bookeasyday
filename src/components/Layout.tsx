import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Chatbot } from "./Chatbot";
import { PWAInstallBanner } from "./PWAInstallBanner";
import { usePWAMode } from "@/hooks/use-pwa-mode";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isPWAMobile } = usePWAMode();

  return (
    <div className={isPWAMobile ? "pwa-mobile-layout" : "min-h-screen bg-background text-foreground"}>
      <Navigation />
      <main className={isPWAMobile ? "pwa-mobile-main" : "pt-16"}>{children}</main>
      {!isPWAMobile && <Chatbot />}
      <PWAInstallBanner />
    </div>
  );
};
