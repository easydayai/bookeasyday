import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type DaisyMode = "minimized" | "docked" | "fullscreen";

export type DaisyAction = {
  type: "navigate";
  path: string;
  label: string;
  destination_key?: string;
};

export type DaisyMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: DaisyAction[];
  timestamp: number;
};

type DaisyState = {
  mode: DaisyMode;
  setMode: (mode: DaisyMode) => void;
  messages: DaisyMessage[];
  addMessage: (message: Omit<DaisyMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
  isGuideMode: boolean;
  setGuideMode: (enabled: boolean) => void;
  pendingNavigation: string | null;
  setPendingNavigation: (path: string | null) => void;
};

const DaisyContext = createContext<DaisyState | null>(null);

export function DaisyProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<DaisyMode>("minimized");
  const [messages, setMessages] = useState<DaisyMessage[]>([]);
  const [isGuideMode, setGuideMode] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<DaisyMessage, "id" | "timestamp">) => {
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...message,
      },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      messages,
      addMessage,
      clearMessages,
      isGuideMode,
      setGuideMode,
      pendingNavigation,
      setPendingNavigation,
    }),
    [mode, messages, addMessage, clearMessages, isGuideMode, pendingNavigation]
  );

  return <DaisyContext.Provider value={value}>{children}</DaisyContext.Provider>;
}

export function useDaisy() {
  const context = useContext(DaisyContext);
  if (!context) {
    throw new Error("useDaisy must be used within a DaisyProvider");
  }
  return context;
}

// Route mapping for Daisy navigation
export const DAISY_ROUTES: Record<string, { path: string; label: string; requiresAuth: boolean }> = {
  dashboard: { path: "/dashboard", label: "Dashboard", requiresAuth: true },
  calendar: { path: "/calendar", label: "Calendar", requiresAuth: true },
  profile: { path: "/settings/profile", label: "Profile Settings", requiresAuth: true },
  availability: { path: "/settings/availability", label: "Availability Settings", requiresAuth: true },
  appointment_types: { path: "/settings/appointment-types", label: "Appointment Types", requiresAuth: true },
  bookings: { path: "/dashboard/appointments", label: "Bookings", requiresAuth: true },
  booking_builder: { path: "/booking-builder", label: "Booking Page Builder", requiresAuth: true },
  pricing: { path: "/pricing", label: "Pricing", requiresAuth: false },
  home: { path: "/", label: "Home", requiresAuth: false },
  solutions: { path: "/solutions", label: "Solutions", requiresAuth: false },
  demo: { path: "/demo", label: "Book a Demo", requiresAuth: false },
  contact: { path: "/contact", label: "Contact", requiresAuth: false },
};

export function getRouteFromKey(key: string, userSlug?: string): { path: string; label: string; requiresAuth: boolean } | null {
  if (key === "public_booking" && userSlug) {
    return { path: `/book/${userSlug}`, label: "Your Booking Page", requiresAuth: true };
  }
  return DAISY_ROUTES[key] || null;
}
