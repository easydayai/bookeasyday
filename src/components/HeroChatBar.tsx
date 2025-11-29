import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { listings, parseListingNumber, getListingById, filterListingsByType } from "@/data/listings";

interface Message {
  sender: "bot" | "user";
  text: string;
  buttons?: { label: string; action: string }[];
}

const faqResponses: Record<string, string> = {
  price: "The application fee is just $20—way less than typical $100+ fees. This one application works for all our partner landlords.",
  refund: "Yes! If we don't help you get approved and moved in within 30 days, you get a full refund. See our Policies page for details.",
  how: "Simple: pay $20, fill out one application, and we match you with landlords who fit your profile. You could be approved in as little as 2 weeks!",
  requirements: "Basic requirements: verifiable income, no serious active evictions, no violent felonies. Check our Policies page for full details.",
  documents: "You'll upload income proof, ID, and any supporting documents. Everything stays secure and is only shared with matched landlords.",
};

export function HeroChatBar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addBotMessage = (text: string, buttons?: { label: string; action: string }[]) => {
    setMessages((prev) => [...prev, { sender: "bot", text, buttons }]);
  };

  // Show welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(
        "Hi! I'm the RentEZ assistant. Tell me what you're looking for or give me a listing number (like #101), and I'll help you apply for $20.",
        [
          { label: "View Available Listings", action: "browse" },
          { label: "Apply for $20", action: "apply" },
          { label: "I have a listing number", action: "listing_prompt" },
        ]
      );
    }
  }, []);

  const handleButtonAction = (action: string) => {
    if (action === "browse") {
      navigate("/listings");
    } else if (action === "apply") {
      addBotMessage(
        "Great! Our $20 application fee lets you apply once and get matched with landlords who fit your profile. You'll be approved and moved in within 30 days—or your money back!",
        [
          { label: "Start Application Now", action: "start_apply" },
          { label: "View Listings First", action: "browse" },
        ]
      );
    } else if (action === "start_apply") {
      navigate("/apply");
    } else if (action === "listing_prompt") {
      addBotMessage(
        "Sure! Just type the listing number (like #101 or 101) and I'll show you the details.",
      );
    } else if (action === "how") {
      addBotMessage(
        "It's easy! Pay just $20, fill out one application, and we match you with landlords. If you're not approved in 30 days, you get a refund!",
        [
          { label: "Start Application", action: "apply" },
          { label: "View Listings", action: "browse" },
        ]
      );
    } else if (action.startsWith("listing-")) {
      const id = parseInt(action.replace("listing-", ""), 10);
      navigate(`/listings/${id}`);
    } else if (action === "rooms" || action === "studios" || action === "2br" || action === "3br") {
      const typeMap: Record<string, string> = {
        rooms: "room",
        studios: "studio",
        "2br": "2br",
        "3br": "3br",
      };
      const filtered = filterListingsByType(typeMap[action]);
      if (filtered.length > 0) {
        const list = filtered
          .map((l) => `${l.listingNumber} - ${l.title} ($${l.price}/mo)`)
          .join("\n");
        addBotMessage(
          `Here are the available ${action}:\n\n${list}\n\nType a listing number to learn more!`,
          filtered.map((l) => ({ label: l.listingNumber, action: `listing-${l.id}` }))
        );
      } else {
        addBotMessage(`Sorry, no ${action} are currently available. Check back soon!`);
      }
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    // Check for listing number
    const listingId = parseListingNumber(text);
    if (listingId) {
      const listing = getListingById(listingId);
      if (listing) {
        addBotMessage(
          `${listing.listingNumber} - ${listing.title}\n📍 ${listing.neighborhood}\n💰 $${listing.price}/month\n🏠 ${listing.bedrooms}\n\n${listing.description}`,
          [
            { label: "View Details", action: `listing-${listing.id}` },
            { label: "Apply Now", action: "apply" },
          ]
        );
        return;
      }
    }

    // Check for unit type keywords
    const lower = text.toLowerCase();
    if (lower.includes("room") && !lower.includes("bedroom")) {
      handleButtonAction("rooms");
      return;
    }
    if (lower.includes("studio")) {
      handleButtonAction("studios");
      return;
    }
    if (lower.includes("2 bed") || lower.includes("2br") || lower.includes("two bed")) {
      handleButtonAction("2br");
      return;
    }
    if (lower.includes("3 bed") || lower.includes("3br") || lower.includes("three bed")) {
      handleButtonAction("3br");
      return;
    }

    // Check for FAQ keywords
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (lower.includes(keyword)) {
        addBotMessage(response);
        return;
      }
    }

    // Check for listing/browse intent
    if (lower.includes("listing") || lower.includes("available") || lower.includes("browse") || lower.includes("see")) {
      addBotMessage("What type of unit are you looking for?", [
        { label: "Rooms", action: "rooms" },
        { label: "Studios", action: "studios" },
        { label: "2 Bedrooms", action: "2br" },
        { label: "3 Bedrooms", action: "3br" },
      ]);
      return;
    }

    // Default response
    addBotMessage(
      "I can help you find a place or start your application! What would you like to do?",
      [
        { label: "Browse Listings", action: "browse" },
        { label: "Apply for $20", action: "apply" },
        { label: "How It Works", action: "how" },
      ]
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Chat with RentEZ</h2>
        <p className="text-sm text-muted-foreground">Tell us what you're looking for and we'll guide you.</p>
      </div>
      
      {/* Chat Panel */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 border-b border-border/30">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">RentEZ Assistant</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </span>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
                {msg.buttons && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.buttons.map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleButtonAction(btn.action)}
                        className="px-3 py-1.5 text-xs font-medium bg-primary/20 hover:bg-primary/30 text-primary rounded-full transition-colors border border-primary/30"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/30 bg-background/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a listing # or ask a question..."
              className="flex-1 h-10"
            />
            <Button type="submit" size="sm" className="h-10 px-4">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
