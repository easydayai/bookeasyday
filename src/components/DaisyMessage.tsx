import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Bot, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DaisyAction, DaisyMessage as DaisyMessageType } from "@/contexts/DaisyContext";

type MessageVariant = "compact" | "large";

type DaisyMessageProps = {
  message: DaisyMessageType;
  onNavigate: (path: string) => void;
  onSendMessage: (message: string) => void;
  variant?: MessageVariant;
};

// Memoized message component to prevent unnecessary re-renders
export const DaisyMessage = memo(function DaisyMessage({
  message,
  onNavigate,
  onSendMessage,
  variant = "compact",
}: DaisyMessageProps) {
  const isUser = message.role === "user";
  const isLarge = variant === "large";
  
  const avatarSize = isLarge ? "w-9 h-9" : "w-7 h-7";
  const iconSize = isLarge ? "w-5 h-5" : "w-4 h-4";
  const textSize = isLarge ? "" : "text-sm";
  const padding = isLarge ? "px-4 py-3" : "px-4 py-2.5";
  const gap = isLarge ? "gap-3" : "gap-2";
  const buttonSize = isLarge ? "sm" : "sm";
  const buttonClass = isLarge ? "" : "text-xs h-8";

  const handleActionClick = (action: DaisyAction) => {
    if (action.type === "message") {
      onSendMessage(action.message);
    } else if (action.type === "navigate") {
      onNavigate(action.path || action.destination_key || "");
    }
  };

  const handleActionKeyDown = (e: React.KeyboardEvent, action: DaisyAction) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActionClick(action);
    }
  };

  return (
    <div
      className={cn("flex", gap, isUser ? "justify-end" : "justify-start")}
      role="article"
      aria-label={`${isUser ? "Your" : "Daisy's"} message`}
    >
      {!isUser && (
        <div 
          className={cn(
            avatarSize, 
            "rounded-full bg-primary flex items-center justify-center shrink-0",
            isLarge ? "" : "mt-1"
          )}
          aria-hidden="true"
        >
          <Bot className={cn(iconSize, "text-primary-foreground")} />
        </div>
      )}
      
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div
          className={cn(
            "rounded-2xl",
            padding,
            textSize,
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Available actions">
            {message.actions.map((action, actionIdx) => (
              <Button
                key={actionIdx}
                variant="outline"
                size={buttonSize}
                className={buttonClass}
                onClick={() => handleActionClick(action)}
                onKeyDown={(e) => handleActionKeyDown(e, action)}
                aria-label={action.label}
              >
                {action.label}
                <ChevronRight className={cn(isLarge ? "w-4 h-4 ml-1" : "w-3 h-3 ml-1")} />
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {isUser && (
        <div 
          className={cn(
            avatarSize, 
            "rounded-full bg-secondary flex items-center justify-center shrink-0",
            isLarge ? "" : "mt-1"
          )}
          aria-hidden="true"
        >
          <User className={cn(iconSize, "text-secondary-foreground")} />
        </div>
      )}
    </div>
  );
});

// Typing indicator component
type TypingIndicatorProps = {
  variant?: MessageVariant;
};

export const TypingIndicator = memo(function TypingIndicator({ 
  variant = "compact" 
}: TypingIndicatorProps) {
  const isLarge = variant === "large";
  const avatarSize = isLarge ? "w-9 h-9" : "w-7 h-7";
  const iconSize = isLarge ? "w-5 h-5" : "w-4 h-4";
  const gap = isLarge ? "gap-3" : "gap-2";

  return (
    <div 
      className={cn("flex justify-start", gap)}
      role="status"
      aria-live="polite"
      aria-label="Daisy is typing"
    >
      <div 
        className={cn(avatarSize, "rounded-full bg-primary flex items-center justify-center shrink-0")}
        aria-hidden="true"
      >
        <Bot className={cn(iconSize, "text-primary-foreground")} />
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
  );
});
