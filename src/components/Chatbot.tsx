import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    {
      from: "bot",
      text: "Hey! I'm the Rent EZ Assistant. Want help applying or checking if you qualify?",
    },
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const quickButtons = [
    { label: "See if I qualify", action: "qualify" },
    { label: "Start my application", action: "apply" },
    { label: "Check application status", action: "status" },
    { label: "Learn how Rent EZ works", action: "learn" },
  ];

  const handleQuickAction = (action: string) => {
    setMessages((prev) => [...prev, { from: "user", text: quickButtons.find((b) => b.action === action)?.label || "" }]);

    setTimeout(() => {
      let response = "";
      switch (action) {
        case "qualify":
          response = "Great! To qualify, you need verifiable income, a reasonable credit score, no recent serious evictions or violent felonies, and the ability to provide required documents. Ready to apply?";
          break;
        case "apply":
          response = "Perfect! I'll take you to our application page where you can get started for just $20.";
          setTimeout(() => navigate("/apply"), 1000);
          break;
        case "status":
          response = "Please provide your email address so I can look up your application status.";
          break;
        case "learn":
          response = "Rent EZ helps you apply once for $20 instead of paying $100+ for each rental application. We match you with rental specialists and landlords, and guarantee you'll move in within 30 days or get your money back!";
          break;
      }
      setMessages((prev) => [...prev, { from: "bot", text: response }]);
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Thanks for your message! For specific questions, you can check our FAQ page or contact us directly. Would you like to start your application now?",
        },
      ]);
    }, 500);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-purple-glow z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Rent EZ Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.from === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}

              {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {quickButtons.map((btn) => (
                    <Button
                      key={btn.action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(btn.action)}
                      className="text-xs h-auto py-2"
                    >
                      {btn.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
