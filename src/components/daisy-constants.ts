// Configuration constants for DaisyAssistant
export const DAISY_CONFIG = {
  URL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daisy-assistant`,
  PANEL_WIDTH: 380,
  PANEL_HEIGHT: 600,
  DRAG_BOUNDS_BUFFER: 100,
  VOICE_SUBMIT_DELAY: 300,
  NAV_ANIMATION_DELAY: 500,
  TYPING_INDICATOR_DELAY: 100,
} as const;

// Quick action type
export type QuickAction = {
  label: string;
  message: string;
};

// Quick actions for public (unauthenticated) users
export const publicQuickActions: QuickAction[] = [
  { label: "What is Easy Day AI?", message: "What is Easy Day AI and how can it help my business?" },
  { label: "See pricing", message: "Take me to pricing" },
  { label: "Book a call", message: "I'd like to book a demo call" },
];

// Quick actions for authenticated users
export const authQuickActions: QuickAction[] = [
  { label: "Go to calendar", message: "Take me to my calendar" },
  { label: "Set availability", message: "Take me to availability settings" },
  { label: "Customize booking page", message: "Open the booking page builder" },
  { label: "Create appointment type", message: "Take me to appointment types" },
];

// Quick actions specifically for the booking builder page
export const bookingBuilderQuickActions: QuickAction[] = [
  { label: "🔧 Locksmith / Emergency", message: "I'm a locksmith, I need emergency bookings, dark theme, text confirmations" },
  { label: "💇 Salon / Spa", message: "I run a salon, I need scheduled appointments, warm inviting theme" },
  { label: "⚖️ Professional Services", message: "I'm a consultant, I need professional clean look for consultations" },
  { label: "🧹 Home Services", message: "I do home cleaning, I need simple functional booking page" },
];

// Page-specific guidance messages for Guide Mode
export const PAGE_GUIDANCE: Record<string, { message: string; actions: QuickAction[] }> = {
  "/dashboard": {
    message: "You're on your dashboard! Here you can see your overview and quick stats.",
    actions: [
      { label: "View calendar", message: "Take me to my calendar" },
      { label: "Edit profile", message: "Go to profile settings" },
    ],
  },
  "/calendar": {
    message: "This is your calendar view. You can see all your bookings and add new events here.",
    actions: [
      { label: "Add event", message: "How do I add a new event?" },
      { label: "Set availability", message: "Take me to availability" },
    ],
  },
  "/settings/availability": {
    message: "Set your working hours here. Tap a day to configure when you're available for bookings.",
    actions: [
      { label: "Set 9-5 weekdays", message: "Set my availability to 9am-5pm Monday through Friday" },
      { label: "Add buffer time", message: "How do I add buffer time between appointments?" },
    ],
  },
  "/settings/appointment-types": {
    message: "Manage your appointment types here. Create different services you offer with their own durations.",
    actions: [
      { label: "Create new type", message: "Create a new 30-minute consultation appointment type" },
      { label: "View existing", message: "Show me my current appointment types" },
    ],
  },
  "/booking-builder": {
    message: "I can generate your booking page automatically! Just tell me about your business and what you need 😊",
    actions: [
      { label: "Generate my page", message: "Create a booking page for my business" },
      { label: "Quick dark theme", message: "I want a simple black booking page for 30-minute jobs" },
      { label: "Preview current", message: "Take me to my booking page" },
    ],
  },
  "/settings/profile": {
    message: "Update your profile information here. Your booking link URL is based on your slug.",
    actions: [
      { label: "View booking link", message: "Take me to my booking page" },
      { label: "Update business name", message: "How do I update my business name?" },
    ],
  },
};

// Welcome messages based on context
export function getWelcomeMessage(isAuthenticated: boolean, pathname: string): string {
  if (pathname === "/booking-builder" && isAuthenticated) {
    return `Hey! 👋 I'm Daisy, and I can generate your booking page automatically!\n\nJust tell me about your business in plain English. For example:\n\n"I'm a locksmith, I want emergency bookings, black page, text confirmations"\n\nI'll pick the right layout, apply the right theme, and set everything up. No menus, no sliders — just tell me what you need! 😊`;
  }
  
  if (isAuthenticated) {
    return `Hey there! 👋 I'm Daisy, your AI assistant. I can help you navigate the app, manage your calendar, and set up appointments. Just tell me where you want to go or what you need help with!`;
  }
  
  return `Hi! I'm Daisy, the Easy Day AI assistant 😊 I'm here to answer your questions and help you explore. Where would you like to go?`;
}

// Get appropriate quick actions based on context
export function getQuickActions(isAuthenticated: boolean, pathname: string): QuickAction[] {
  if (pathname === "/booking-builder") {
    return bookingBuilderQuickActions;
  }
  return isAuthenticated ? authQuickActions : publicQuickActions;
}
