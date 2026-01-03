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
  Minimize2,
  Maximize2,
  ArrowLeft,
  Compass,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDaisy, getRouteFromKey } from "@/contexts/DaisyContext";
import { useSpeechToText } from "@/hooks/use-speech-to-text";
import { useDraggable } from "@/hooks/use-draggable";
import { cn } from "@/lib/utils";
import { DaisyMessage, TypingIndicator } from "./DaisyMessage";
import {
  DAISY_CONFIG,
  PAGE_GUIDANCE,
  getWelcomeMessage,
  getQuickActions,
  type QuickAction,
} from "./daisy-constants";
import type { PatchOperation } from "@/lib/json-patch";

export function DaisyAssistant() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Refs to prevent duplicate messages
  const hasShownWelcomeRef = useRef(false);
  const lastGuidedPathRef = useRef<string | null>(null);

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
    pageModel,
    applyPagePatches,
    selectedNode,
  } = useDaisy();

  const { isListening, isSupported, transcript, startListening, stopListening } = useSpeechToText();
  
  // Custom draggable hook - fixes memory leak
  const { position, isDragging, handleMouseDown } = useDraggable({
    enabled: mode === "docked",
    panelRef,
  });

  const isAuthenticated = !!user;
  const isOpen = mode !== "minimized";
  const isPatchMode = location.pathname === "/booking-builder" && pageModel !== null;
  const quickActions = getQuickActions(isAuthenticated, location.pathname);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
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

  // Add welcome message when first opened - with ref to prevent duplicates
  useEffect(() => {
    if (isOpen && messages.length === 0 && !hasShownWelcomeRef.current) {
      hasShownWelcomeRef.current = true;
      const welcomeMessage = getWelcomeMessage(isAuthenticated, location.pathname);
      addMessage({ role: "assistant", content: welcomeMessage });
    }
    
    // Reset when closed
    if (!isOpen) {
      hasShownWelcomeRef.current = false;
    }
  }, [isOpen, isAuthenticated, messages.length, addMessage, location.pathname]);

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
      const route = getRouteFromKey(path);
      const targetPath = route?.path || path;

      if (route?.requiresAuth && !isAuthenticated) {
        addMessage({
          role: "assistant",
          content: `You need to log in to access ${route.label}. Let me take you to the login page.`,
          actions: [{ type: "navigate", path: "/login", label: "Go to Login" }],
        });
        setPendingNavigation("/login");
        return;
      }

      if (targetPath === "/" && isAuthenticated) {
        setPendingNavigation("/dashboard");
        return;
      }

      setPendingNavigation(targetPath);
    },
    [isAuthenticated, addMessage, setPendingNavigation]
  );

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    addMessage({ role: "user", content: messageText.trim() });
    setInput("");
    setIsLoading(true);

    try {
      const requestBody: Record<string, unknown> = {
        messages: [...messages, { role: "user", content: messageText.trim() }].map(m => ({
          role: m.role,
          content: m.content,
        })),
        isAuthenticated,
        currentPage: location.pathname,
      };

      if (isPatchMode) {
        requestBody.mode = "patchEditor";
        requestBody.pageModel = pageModel;
        requestBody.selectedNode = selectedNode;
      }

      const resp = await fetch(DAISY_CONFIG.URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && {
            Authorization: `Bearer ${session.access_token}`,
          }),
        },
        body: JSON.stringify(requestBody),
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

      // Handle patch mode response
      if (data.mode === "patchEditor" && data.patches) {
        const patches = data.patches as PatchOperation[];
        if (patches.length > 0) {
          try {
            const success = applyPagePatches(patches);
            if (!success) {
              console.error("Failed to apply patches:", patches);
            }
          } catch (patchError) {
            console.error("Patch application error:", patchError);
            addMessage({
              role: "assistant",
              content: "I had trouble applying those changes. Could you try rephrasing your request?",
            });
            return;
          }
        }
        addMessage({
          role: "assistant",
          content: data.assistantText || "Done!",
        });
        return;
      }

      // Check for auto-navigation
      if (data.actions && data.actions.length > 0) {
        const navAction = data.actions.find(
          (a: { type: string; path: string }) => a.type === "navigate" && a.path
        );
        if (navAction && data.autoNavigate) {
          addMessage({
            role: "assistant",
            content: data.content,
            actions: data.actions,
          });
          setTimeout(() => handleNavigate(navAction.path), DAISY_CONFIG.NAV_ANIMATION_DELAY);
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
  }, [messages, isAuthenticated, location.pathname, isPatchMode, pageModel, selectedNode, session?.access_token, addMessage, applyPagePatches, handleNavigate, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  const handleQuickActionKeyDown = (e: React.KeyboardEvent, action: QuickAction) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleQuickAction(action);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(
        (text) => {
          setInput(text);
          setTimeout(() => sendMessage(text), DAISY_CONFIG.VOICE_SUBMIT_DELAY);
        },
        () => {}
      );
    }
  };

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
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMode("docked")}
              aria-label="Exit fullscreen"
            >
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMode("docked")}
              aria-label="Minimize to panel"
            >
              <Minimize2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMode("minimized")}
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <DaisyMessage
                  key={message.id || index}
                  message={message}
                  onNavigate={handleNavigate}
                  onSendMessage={sendMessage}
                  variant="large"
                />
              ))}
              {isLoading && <TypingIndicator variant="large" />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="max-w-3xl mx-auto w-full px-4 pb-2">
            <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Quick actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  onKeyDown={(e) => handleQuickActionKeyDown(e, action)}
                  className="text-sm px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={0}
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
              value={isListening ? transcript || "Listening..." : input}
              onChange={e => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Daisy to navigate, help, or explain..."}
              className="flex-1"
              disabled={isLoading || isListening}
              aria-label="Message input"
            />
            {isSupported && (
              <Button 
                type="button" 
                variant={isListening ? "destructive" : "outline"}
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={cn(isListening && "animate-pulse")}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || isListening}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Docked mode (default panel) - draggable
  return (
    <div 
      ref={panelRef}
      className={cn(
        "fixed z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in",
        isDragging && "cursor-grabbing select-none"
      )}
      style={{
        bottom: `calc(24px - ${position.y}px)`,
        right: `calc(24px - ${position.x}px)`,
      }}
    >
      {/* Header - draggable handle */}
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50",
          !isDragging && "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Daisy</h3>
            <p className="text-xs text-muted-foreground">AI Assistant • Drag to move</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setMode("fullscreen")}
            aria-label="Enter fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setMode("minimized")}
            aria-label="Minimize assistant"
          >
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
            <DaisyMessage
              key={message.id || index}
              message={message}
              onNavigate={handleNavigate}
              onSendMessage={sendMessage}
              variant="compact"
            />
          ))}
          {isLoading && <TypingIndicator variant="compact" />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions (show only at start) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick actions">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action)}
                onKeyDown={(e) => handleQuickActionKeyDown(e, action)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={0}
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
            value={isListening ? transcript || "Listening..." : input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask Daisy anything..."}
            className="flex-1 bg-background"
            disabled={isLoading || isListening}
            aria-label="Message input"
          />
          {isSupported && (
            <Button 
              type="button" 
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={cn(isListening && "animate-pulse")}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim() || isListening}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
