import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Compass,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDaisy, DAISY_ROUTES, getRouteFromKey } from "@/contexts/DaisyContext";
import { cn } from "@/lib/utils";

type QuickAction = {
  label: string;
  message: string;
};

const DAISY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daisy-assistant`;

const publicQuickActions: QuickAction[] = [
  { label: "What is Easy Day AI?", message: "What is Easy Day AI and how can it help my business?" },
  { label: "See pricing", message: "Take me to pricing" },
  { label: "Book a call", message: "I'd like to book a demo call" },
];

const authQuickActions: QuickAction[] = [
  { label: "Go to calendar", message: "Take me to my calendar" },
  { label: "Set availability", message: "Take me to availability settings" },
  { label: "Customize booking page", message: "Open the booking page builder" },
  { label: "Create appointment type", message: "Take me to appointment types" },
];

// Page-specific guidance messages
const PAGE_GUIDANCE: Record<string, { message: string; actions: QuickAction[] }> = {
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

// Quick actions specifically for the booking builder page
const bookingBuilderQuickActions: QuickAction[] = [
  { label: "🔧 Locksmith / Emergency", message: "I'm a locksmith, I need emergency bookings, dark theme, text confirmations" },
  { label: "💇 Salon / Spa", message: "I run a salon, I need scheduled appointments, warm inviting theme" },
  { label: "⚖️ Professional Services", message: "I'm a consultant, I need professional clean look for consultations" },
  { label: "🧹 Home Services", message: "I do home cleaning, I need simple functional booking page" },
];

export function DaisyAssistant() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    mode,
    setMode,
    messages,
    addMessage,
    isGuideMode,
    setGuideMode,
    pendingNavigation,
    setPendingNavigation,
  } = useDaisy();

  const isAuthenticated = !!user;
  const isOpen = mode !== "minimized";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode === "fullscreen") {
        setMode("docked");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mode, setMode]);

  // Prevent body scroll in fullscreen
  useEffect(() => {
    if (mode === "fullscreen") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mode]);

  // Execute pending navigation
  useEffect(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, navigate, setPendingNavigation]);

  // Add welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeMessage: string;
      
      if (location.pathname === "/booking-builder" && isAuthenticated) {
        welcomeMessage = `Hey! 👋 I'm Daisy, and I can generate your booking page automatically!\n\nJust tell me about your business in plain English. For example:\n\n"I'm a locksmith, I want emergency bookings, black page, text confirmations"\n\nI'll pick the right layout, apply the right theme, and set everything up. No menus, no sliders — just tell me what you need! 😊`;
      } else if (isAuthenticated) {
        welcomeMessage = `Hey there! 👋 I'm Daisy, your AI assistant. I can help you navigate the app, manage your calendar, and set up appointments. Just tell me where you want to go or what you need help with!`;
      } else {
        welcomeMessage = `Hi! I'm Daisy, the Easy Day AI assistant 😊 I'm here to answer your questions and help you explore. Where would you like to go?`;
      }

      addMessage({ role: "assistant", content: welcomeMessage });
    }
  }, [isOpen, isAuthenticated, messages.length, addMessage, location.pathname]);

  // Track last guided path to prevent duplicate guidance
  const lastGuidedPathRef = useRef<string | null>(null);

  // Guide mode: provide page-specific help on route change
  useEffect(() => {
    if (isGuideMode && isOpen && isAuthenticated) {
      const guidance = PAGE_GUIDANCE[location.pathname];
      if (guidance && lastGuidedPathRef.current !== location.pathname) {
        lastGuidedPathRef.current = location.pathname;
        addMessage({
          role: "assistant",
          content: guidance.message,
          actions: guidance.actions.map((a) => ({
            type: "message" as const,
            message: a.message,
            label: a.label,
          })),
        });
      }
    }
    
    // Reset tracking when guide mode is turned off
    if (!isGuideMode) {
      lastGuidedPathRef.current = null;
    }
  }, [location.pathname, isGuideMode, isOpen, isAuthenticated, addMessage]);
  const handleNavigate = useCallback(
    (path: string) => {
      // Handle destination_key or direct path
      const route = getRouteFromKey(path);
      const targetPath = route?.path || path;

      // Check auth requirements
      if (route?.requiresAuth && !isAuthenticated) {
        addMessage({
          role: "assistant",
          content: `You need to log in to access ${route.label}. Let me take you to the login page.`,
          actions: [{ type: "navigate", path: "/login", label: "Go to Login" }],
        });
        setPendingNavigation("/login");
        return;
      }

      // If logged in and requesting home, go to dashboard
      if (targetPath === "/" && isAuthenticated) {
        setPendingNavigation("/dashboard");
        return;
      }

      setPendingNavigation(targetPath);
    },
    [isAuthenticated, addMessage, setPendingNavigation]
  );

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    addMessage({ role: "user", content: messageText.trim() });
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(DAISY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: messageText.trim() }].map(m => ({
            role: m.role,
            content: m.content,
          })),
          isAuthenticated,
          currentPage: location.pathname,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 402 && errorData.content) {
          addMessage({
            role: "assistant",
            content: errorData.content,
            actions: errorData.actions,
          });
        } else {
          throw new Error(errorData.error || "Failed to get response");
        }
        return;
      }

      const data = await resp.json();

      // Check for auto-navigation
      if (data.actions && data.actions.length > 0) {
        const navAction = data.actions.find(
          (a: { type: string; path: string }) => a.type === "navigate" && a.path
        );
        if (navAction && data.autoNavigate) {
          // Auto-navigate immediately
          addMessage({
            role: "assistant",
            content: data.content,
            actions: data.actions,
          });
          setTimeout(() => handleNavigate(navAction.path), 500);
          return;
        }
      }

      addMessage({
        role: "assistant",
        content: data.content,
        actions: data.actions,
      });
    } catch (error) {
      console.error("Daisy error:", error);
      addMessage({
        role: "assistant",
        content: "Oops! Something went wrong. Please try again. 😅",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  // Use booking builder specific quick actions when on that page
  const quickActions = location.pathname === "/booking-builder" 
    ? bookingBuilderQuickActions 
    : (isAuthenticated ? authQuickActions : publicQuickActions);

  // Minimized bubble
  if (mode === "minimized") {
    return (
      <button
        onClick={() => setMode("docked")}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center group"
        aria-label="Open Daisy Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </button>
    );
  }

  // Fullscreen mode
  if (mode === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMode("docked")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Daisy</h3>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-2 mr-4">
                <Switch
                  id="guide-mode"
                  checked={isGuideMode}
                  onCheckedChange={setGuideMode}
                  className="scale-90"
                />
                <Label htmlFor="guide-mode" className="text-sm flex items-center gap-1">
                  <Compass className="w-4 h-4" />
                  Guide Mode
                </Label>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setMode("docked")}>
              <Minimize2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMode("minimized")}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages - centered column */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {message.actions.map((action, actionIdx) => (
                          <Button
                            key={actionIdx}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (action.type === "message") {
                                sendMessage(action.message);
                                return;
                              }
                              handleNavigate(action.path || action.destination_key || "");
                            }}
                          >
                            {action.label}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="max-w-3xl mx-auto w-full px-4 pb-2">
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="text-sm px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Daisy to navigate, help, or explain..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Docked mode (default panel)
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Daisy</h3>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMode("fullscreen")}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMode("minimized")}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Guide Mode Toggle (authenticated only) */}
      {isAuthenticated && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
          <Label htmlFor="guide-mode-dock" className="text-xs flex items-center gap-1.5 text-muted-foreground">
            <Compass className="w-3.5 h-3.5" />
            Guide Mode
          </Label>
          <Switch
            id="guide-mode-dock"
            checked={isGuideMode}
            onCheckedChange={setGuideMode}
            className="scale-75"
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action, actionIdx) => (
                       <Button
                         key={actionIdx}
                         variant="outline"
                         size="sm"
                         className="text-xs h-8"
                         onClick={() => {
                           if (action.type === "message") {
                             sendMessage(action.message);
                             return;
                           }
                           handleNavigate(action.path || action.destination_key || "");
                         }}
                       >
                        {action.label}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions (show only at start) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask Daisy anything..."
            className="flex-1 bg-background"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
