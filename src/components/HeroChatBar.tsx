import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Search } from "lucide-react";
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
  price: "The $20 covers listing access and processing. One application works for multiple listings—way better than paying $100+ per listing elsewhere!",
  "$20": "The $20 covers listing access and processing. One application works for multiple listings—way better than paying $100+ per listing elsewhere!",
  why: "The $20 covers listing access and processing. One application works for multiple listings—way better than paying $100+ per listing elsewhere!",
  address: "Addresses are shared after approval for safety. Once you're approved, you'll get full details to schedule viewings!",
  refund: "Refund terms apply if move-in isn't completed within the guaranteed 30-day timeframe. Full refund if we don't deliver!",
  how: "Simple: pay $20, fill out one application, and we match you with landlords who fit your profile. You could be approved in as little as 2 weeks!",
  requirements: "Basic requirements: verifiable income, no serious active evictions, no violent felonies. Check our Policies page for full details.",
  documents: "You'll upload income proof, ID, and any supporting documents. Everything stays secure and is only shared with matched landlords.",
};

export function HeroChatBar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addBotMessage = (text: string, buttons?: { label: string; action: string }[]) => {
    setMessages((prev) => [...prev, { sender: "bot", text, buttons }]);
  };

  // Show welcome message when expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      addBotMessage(
        "Hey 👋 I'm the RentEZ assistant.\nTell me what you're looking for (room, studio, 2BR, 3BR) or give me a listing number like #101, and I'll help you apply.",
        [
          { label: "View available listings", action: "browse" },
          { label: "I want a room", action: "rooms" },
          { label: "I want a studio", action: "studios" },
          { label: "I want a 2 bedroom", action: "2br" },
          { label: "I want a 3 bedroom", action: "3br" },
          { label: "I'm ready to apply", action: "apply" },
          { label: "I have a listing number", action: "listing_prompt" },
        ]
      );
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleButtonAction = (action: string) => {
    if (action === "browse") {
      navigate("/listings");
    } else if (action === "apply") {
      addBotMessage(
        "The application is $20 and gives you access to all available listings on RentEZ.\nOnce approved, you can schedule viewings immediately.",
        [
          { label: "Start $20 application", action: "start_apply" },
          { label: "View listings first", action: "browse" },
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
    } else if (action.startsWith("apply-listing-")) {
      const id = parseInt(action.replace("apply-listing-", ""), 10);
      navigate(`/apply?listing=${id}`);
    } else if (action.startsWith("similar-")) {
      const id = parseInt(action.replace("similar-", ""), 10);
      const listing = getListingById(id);
      if (listing) {
        // Find similar listings by type
        const similar = listings.filter(l => l.id !== id && l.bedrooms === listing.bedrooms).slice(0, 3);
        if (similar.length > 0) {
          addBotMessage(
            `Here are similar listings:\n\n${similar.map(l => `${l.listingNumber} - ${l.title} ($${l.price}/mo)`).join("\n")}`,
            similar.map(l => ({ label: l.listingNumber, action: `listing-${l.id}` }))
          );
        } else {
          addBotMessage("No similar listings found right now. Check out all available listings!", [
            { label: "View all listings", action: "browse" }
          ]);
        }
      }
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

    // Auto-expand if not already
    if (!isExpanded) {
      setIsExpanded(true);
    }

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    // Check for listing number
    const listingId = parseListingNumber(text);
    if (listingId) {
      const listing = getListingById(listingId);
      if (listing) {
        addBotMessage(
          `Opening Listing ${listing.listingNumber} ✅\n\n${listing.title}\n📍 ${listing.neighborhood}\n💰 $${listing.price}/month\n🏠 ${listing.bedrooms}\n\nWant to apply for this one?`,
          [
            { label: "View listing", action: `listing-${listing.id}` },
            { label: "Apply for this listing", action: `apply-listing-${listing.id}` },
            { label: "Show similar listings", action: `similar-${listing.id}` },
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
        { label: "View available listings", action: "browse" },
        { label: "I'm ready to apply", action: "apply" },
        { label: "How does it work?", action: "how" },
      ]
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!isExpanded ? (
        /* Collapsed Oval Bar */
        <div 
          onClick={handleExpand}
          className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-full px-6 py-4 shadow-2xl cursor-text flex items-center gap-3 hover:border-primary/50 transition-colors"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (!isExpanded) setIsExpanded(true);
            }}
            onFocus={handleExpand}
            placeholder="Type here to find a place or start your application…"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
      ) : (
        /* Expanded Chat Panel */
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
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
          <div className="h-72 overflow-y-auto p-4 space-y-3">
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
                ref={inputRef}
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
      )}
    </div>
  );
}
