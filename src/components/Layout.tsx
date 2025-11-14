import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Chatbot } from "./Chatbot";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-16">{children}</main>
      <Chatbot />
    </div>
  );
};
