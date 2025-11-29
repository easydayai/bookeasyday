import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate, useLocation } from "react-router-dom";
import { listings, parseListingNumber, getListingById, filterListingsByType, Listing } from "@/data/listings";

interface Message {
  from: "bot" | "user";
  text: string;
  buttons?: { label: string; action: string }[];
}

// FAQ responses
const faqResponses: Record<string, string> = {
  "why $20": "The $20 application fee covers your access to all our listings plus processing costs. Unlike traditional applications where you pay $50-100+ per apartment, with RentEZ you apply once and get access to multiple units!",
  "money back": "Yes! We offer a 30-day money-back guarantee. If you cooperate with us and we can't help you find housing within 30 days, you get a full refund.",
  "refund": "Yes! We offer a 30-day money-back guarantee. If you cooperate with us and we can't help you find housing within 30 days, you get a full refund.",
  "not approved": "If you're not approved for a specific unit, your $20 application still gives you access to other available listings. We'll work with you to find a match!",
  "multiple apartments": "Absolutely! Your single $20 application gives you access to ALL our available listings. Apply once, access everything.",
  "one application": "Yes! One $20 application lets you access all our listings. No need to pay separately for each apartment.",
};

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  // Initial welcome message with quick buttons
  const getWelcomeMessage = (): Message => ({
    from: "bot",
    text: "Hey! I'm the RentEZ assistant. What are you looking for today?",
    buttons: [
      { label: "View available listings", action: "view_listings" },
      { label: "I want a room", action: "filter_room" },
      { label: "I want a studio", action: "filter_studio" },
      { label: "I want a 2 bedroom", action: "filter_2br" },
      { label: "I want a 3 bedroom", action: "filter_3br" },
      { label: "Help me apply", action: "help_apply" },
    ],
  });

  // Auto-open chatbot on homepage (once per session)
  useEffect(() => {
    if (isHomePage && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
        setMessages([getWelcomeMessage()]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isHomePage, hasAutoOpened]);

  // Reset messages when opening
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([getWelcomeMessage()]);
    }
  };

  const formatListingSummary = (listing: Listing): string => {
    return `**Listing ${listing.listingNumber}** - ${listing.title}\n$${listing.price}/mo • ${listing.neighborhood}, ${listing.location}`;
  };

  const formatListingResults = (filteredListings: Listing[]): Message => {
    if (filteredListings.length === 0) {
      return {
        from: "bot",
        text: "I couldn't find any listings matching that criteria. Would you like to see all available listings?",
        buttons: [{ label: "View all listings", action: "view_listings" }],
      };
    }

    const listingTexts = filteredListings.map((l) => 
      `• Listing ${l.listingNumber}: ${l.bedrooms} in ${l.neighborhood} - $${l.price}/mo`
    ).join("\n");

    return {
      from: "bot",
      text: `Here's what I found:\n\n${listingTexts}\n\nType a listing number (like "101") to learn more, or click below:`,
      buttons: filteredListings.map((l) => ({
        label: `View ${l.listingNumber}`,
        action: `show_listing_${l.id}`,
      })),
    };
  };

  const getListingDetailMessage = (listing: Listing): Message => {
    return {
      from: "bot",
      text: `**Listing ${listing.listingNumber}**\n${listing.title}\n\n$${listing.price}/month • ${listing.bedrooms}\n📍 ${listing.neighborhood}, ${listing.location}\n\n${listing.description.substring(0, 150)}...`,
      buttons: [
        { label: `Open Listing ${listing.listingNumber}`, action: `open_listing_${listing.id}` },
        { label: `Apply for Listing ${listing.listingNumber}`, action: `apply_listing_${listing.id}` },
      ],
    };
  };

  const checkForFAQ = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    for (const [key, response] of Object.entries(faqResponses)) {
      if (lowerText.includes(key)) {
        return response;
      }
    }
    return null;
  };

  const handleButtonAction = (action: string) => {
    // Handle different button actions
    if (action === "view_listings") {
      setMessages((prev) => [
        ...prev,
        { from: "user", text: "View available listings" },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Taking you to our available listings now!",
          },
        ]);
        setTimeout(() => navigate("/listings"), 500);
      }, 300);
      return;
    }

    if (action.startsWith("filter_")) {
      const type = action.replace("filter_", "");
      const typeLabels: Record<string, string> = {
        room: "a room",
        studio: "a studio",
        "2br": "a 2 bedroom",
        "3br": "a 3 bedroom",
      };
      setMessages((prev) => [
        ...prev,
        { from: "user", text: `I want ${typeLabels[type]}` },
      ]);
      setTimeout(() => {
        const filtered = filterListingsByType(type);
        setMessages((prev) => [...prev, formatListingResults(filtered)]);
      }, 300);
      return;
    }

    if (action === "help_apply") {
      setMessages((prev) => [
        ...prev,
        { from: "user", text: "Help me apply" },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "I'd love to help you apply! For just $20, you get access to ALL our available listings. Would you like to browse listings first, or start your application now?",
            buttons: [
              { label: "Browse listings first", action: "view_listings" },
              { label: "Start $20 Application", action: "start_apply" },
            ],
          },
        ]);
      }, 300);
      return;
    }

    if (action === "start_apply") {
      setMessages((prev) => [
        ...prev,
        { from: "user", text: "Start application" },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "Great choice! Taking you to start your $20 application now. Remember, one application gives you access to all our listings!",
          },
        ]);
        setTimeout(() => navigate("/apply"), 500);
      }, 300);
      return;
    }

    if (action.startsWith("show_listing_")) {
      const id = parseInt(action.replace("show_listing_", ""), 10);
      const listing = getListingById(id);
      if (listing) {
        setMessages((prev) => [
          ...prev,
          { from: "user", text: `Tell me about Listing ${listing.listingNumber}` },
        ]);
        setTimeout(() => {
          setMessages((prev) => [...prev, getListingDetailMessage(listing)]);
        }, 300);
      }
      return;
    }

    if (action.startsWith("open_listing_")) {
      const id = parseInt(action.replace("open_listing_", ""), 10);
      const listing = getListingById(id);
      if (listing) {
        setMessages((prev) => [
          ...prev,
          { from: "user", text: `Open Listing ${listing.listingNumber}` },
        ]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: `Got it, opening Listing ${listing.listingNumber} for you now.` },
          ]);
          setTimeout(() => navigate(`/listings/${id}`), 500);
        }, 300);
      }
      return;
    }

    if (action.startsWith("apply_listing_")) {
      const id = parseInt(action.replace("apply_listing_", ""), 10);
      const listing = getListingById(id);
      if (listing) {
        setMessages((prev) => [
          ...prev,
          { from: "user", text: `Apply for Listing ${listing.listingNumber}` },
        ]);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              from: "bot",
              text: `I'll help you apply for Listing ${listing.listingNumber}. Click below to start your $20 application. Remember, this gives you access to ALL our listings!`,
              buttons: [
                { label: `Start $20 Application`, action: "start_apply" },
              ],
            },
          ]);
        }, 300);
      }
      return;
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");

    setTimeout(() => {
      // Check for listing number
      const listingId = parseListingNumber(userText);
      if (listingId) {
        const listing = getListingById(listingId);
        if (listing) {
          setMessages((prev) => [...prev, getListingDetailMessage(listing)]);
          return;
        }
      }

      // Check for FAQ
      const faqResponse = checkForFAQ(userText);
      if (faqResponse) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: faqResponse,
            buttons: [
              { label: "View listings", action: "view_listings" },
              { label: "Start application", action: "start_apply" },
            ],
          },
        ]);
        return;
      }

      // Check for unit type keywords
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("room") && !lowerText.includes("bedroom")) {
        const filtered = filterListingsByType("room");
        setMessages((prev) => [...prev, formatListingResults(filtered)]);
        return;
      }
      if (lowerText.includes("studio")) {
        const filtered = filterListingsByType("studio");
        setMessages((prev) => [...prev, formatListingResults(filtered)]);
        return;
      }
      if (lowerText.includes("2 bed") || lowerText.includes("2br") || lowerText.includes("two bed")) {
        const filtered = filterListingsByType("2br");
        setMessages((prev) => [...prev, formatListingResults(filtered)]);
        return;
      }
      if (lowerText.includes("3 bed") || lowerText.includes("3br") || lowerText.includes("three bed")) {
        const filtered = filterListingsByType("3br");
        setMessages((prev) => [...prev, formatListingResults(filtered)]);
        return;
      }

      // Check for listing/browse intent
      if (lowerText.includes("listing") || lowerText.includes("available") || lowerText.includes("browse") || lowerText.includes("show me")) {
        setMessages((prev) => [...prev, formatListingResults(listings)]);
        return;
      }

      // Check for apply intent
      if (lowerText.includes("apply") || lowerText.includes("application")) {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "I can help you with that! For just $20, you apply once and get access to all our listings. Would you like to start?",
            buttons: [
              { label: "Start $20 Application", action: "start_apply" },
              { label: "Browse listings first", action: "view_listings" },
            ],
          },
        ]);
        return;
      }

      // Default response
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I'm here to help you find housing! You can:\n• Ask about specific listings (e.g., '101' or 'Listing #102')\n• Tell me what type of unit you want\n• Ask about our $20 application\n\nWhat would you like to do?",
          buttons: [
            { label: "View listings", action: "view_listings" },
            { label: "Help me apply", action: "help_apply" },
          ],
        },
      ]);
    }, 400);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
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
              <h3 className="font-semibold">RentEZ Assistant</h3>
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
                <div key={idx}>
                  <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        msg.from === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                  {/* Quick reply buttons */}
                  {msg.from === "bot" && msg.buttons && msg.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.buttons.map((btn, btnIdx) => (
                        <Button
                          key={btnIdx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleButtonAction(btn.action)}
                          className="text-xs h-auto py-1.5 px-3"
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message or listing # ..."
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
