// Booking page presets - Daisy selects based on user intent
export interface BookingPreset {
  id: string;
  name: string;
  description: string;
  businessTypes: string[]; // Keywords that match this preset
  bookingType: "emergency" | "scheduled" | "flexible";
  
  // Default configuration
  config: {
    theme: {
      primary: string;
      accent: string;
      background: string;
      text: string;
      radius: number;
      font: string;
    };
    cover: {
      style: "none" | "gradient" | "image";
      imageUrl: string | null;
      overlay: number;
    };
    header: {
      showLogo: boolean;
      title: string;
      tagline: string;
      align: "left" | "center" | "right";
    };
    layout: {
      maxWidth: number;
      cardStyle: "flat" | "glass" | "shadow";
      spacing: "compact" | "comfortable" | "spacious";
    };
    buttons: {
      style: "filled" | "outline";
      shadow: boolean;
    };
  };
  
  // Suggested appointment defaults
  appointmentDefaults: {
    duration: number;
    locationType: "phone" | "video" | "in_person";
    bufferMinutes: number;
  };
}

// Business type → preset mapping keywords
export const BUSINESS_KEYWORDS: Record<string, string[]> = {
  locksmith: ["locksmith", "lock", "key", "car unlock", "lockout", "safe"],
  plumber: ["plumber", "plumbing", "pipe", "leak", "drain", "water heater"],
  electrician: ["electrician", "electrical", "wiring", "outlet", "breaker"],
  hvac: ["hvac", "heating", "cooling", "ac", "air conditioning", "furnace"],
  towing: ["tow", "towing", "roadside", "flatbed", "breakdown"],
  salon: ["salon", "hair", "barber", "haircut", "styling", "color"],
  spa: ["spa", "massage", "facial", "wellness", "beauty"],
  medical: ["medical", "doctor", "clinic", "healthcare", "dental", "dentist"],
  legal: ["lawyer", "legal", "attorney", "consultation", "law"],
  cleaning: ["cleaning", "cleaner", "maid", "housekeeping", "janitorial"],
  handyman: ["handyman", "repair", "fix", "home repair", "maintenance"],
  photographer: ["photographer", "photography", "photo", "shoot", "session"],
  consultant: ["consultant", "consulting", "advisor", "coach", "coaching"],
  fitness: ["fitness", "trainer", "gym", "personal training", "workout"],
  tutor: ["tutor", "tutoring", "teaching", "lesson", "education"],
};

// The presets themselves
export const BOOKING_PRESETS: BookingPreset[] = [
  // Emergency services - dark, urgent, simple
  {
    id: "emergency_dark",
    name: "Emergency Dark",
    description: "Bold dark theme for 24/7 emergency services",
    businessTypes: ["locksmith", "plumber", "electrician", "hvac", "towing"],
    bookingType: "emergency",
    config: {
      theme: {
        primary: "#ef4444",
        accent: "#22c55e",
        background: "#0a0a0a",
        text: "#fafafa",
        radius: 8,
        font: "Inter",
      },
      cover: {
        style: "gradient",
        imageUrl: null,
        overlay: 0.4,
      },
      header: {
        showLogo: true,
        title: "24/7 Emergency Service",
        tagline: "Fast response • Professional service",
        align: "center",
      },
      layout: {
        maxWidth: 600,
        cardStyle: "flat",
        spacing: "compact",
      },
      buttons: {
        style: "filled",
        shadow: false,
      },
    },
    appointmentDefaults: {
      duration: 30,
      locationType: "phone",
      bufferMinutes: 0,
    },
  },
  
  // Professional services - clean, trustworthy
  {
    id: "professional_light",
    name: "Professional Light",
    description: "Clean and professional for consultants and legal",
    businessTypes: ["legal", "consultant", "medical"],
    bookingType: "scheduled",
    config: {
      theme: {
        primary: "#1e40af",
        accent: "#0ea5e9",
        background: "#ffffff",
        text: "#1f2937",
        radius: 12,
        font: "Inter",
      },
      cover: {
        style: "none",
        imageUrl: null,
        overlay: 0,
      },
      header: {
        showLogo: true,
        title: "Schedule a Consultation",
        tagline: "Professional expertise, personalized service",
        align: "left",
      },
      layout: {
        maxWidth: 800,
        cardStyle: "shadow",
        spacing: "comfortable",
      },
      buttons: {
        style: "filled",
        shadow: true,
      },
    },
    appointmentDefaults: {
      duration: 60,
      locationType: "video",
      bufferMinutes: 15,
    },
  },
  
  // Beauty & wellness - warm, inviting
  {
    id: "beauty_warm",
    name: "Beauty Warm",
    description: "Warm and inviting for salons and spas",
    businessTypes: ["salon", "spa", "fitness"],
    bookingType: "scheduled",
    config: {
      theme: {
        primary: "#be185d",
        accent: "#f59e0b",
        background: "#fef7f0",
        text: "#292524",
        radius: 20,
        font: "Inter",
      },
      cover: {
        style: "gradient",
        imageUrl: null,
        overlay: 0.2,
      },
      header: {
        showLogo: true,
        title: "Book Your Appointment",
        tagline: "Relax, rejuvenate, refresh",
        align: "center",
      },
      layout: {
        maxWidth: 700,
        cardStyle: "glass",
        spacing: "spacious",
      },
      buttons: {
        style: "filled",
        shadow: true,
      },
    },
    appointmentDefaults: {
      duration: 60,
      locationType: "in_person",
      bufferMinutes: 10,
    },
  },
  
  // Service trades - simple, functional
  {
    id: "service_simple",
    name: "Simple Service",
    description: "Clean and functional for home services",
    businessTypes: ["cleaning", "handyman"],
    bookingType: "scheduled",
    config: {
      theme: {
        primary: "#059669",
        accent: "#3b82f6",
        background: "#f8fafc",
        text: "#334155",
        radius: 10,
        font: "Inter",
      },
      cover: {
        style: "none",
        imageUrl: null,
        overlay: 0,
      },
      header: {
        showLogo: true,
        title: "Book a Service",
        tagline: "Quick and easy scheduling",
        align: "left",
      },
      layout: {
        maxWidth: 650,
        cardStyle: "shadow",
        spacing: "comfortable",
      },
      buttons: {
        style: "filled",
        shadow: false,
      },
    },
    appointmentDefaults: {
      duration: 120,
      locationType: "in_person",
      bufferMinutes: 30,
    },
  },
  
  // Creative - modern, distinctive
  {
    id: "creative_modern",
    name: "Creative Modern",
    description: "Modern and distinctive for creatives",
    businessTypes: ["photographer", "tutor"],
    bookingType: "scheduled",
    config: {
      theme: {
        primary: "#8b5cf6",
        accent: "#ec4899",
        background: "#18181b",
        text: "#f4f4f5",
        radius: 16,
        font: "Inter",
      },
      cover: {
        style: "gradient",
        imageUrl: null,
        overlay: 0.3,
      },
      header: {
        showLogo: true,
        title: "Book a Session",
        tagline: "Let's create something amazing",
        align: "center",
      },
      layout: {
        maxWidth: 750,
        cardStyle: "glass",
        spacing: "comfortable",
      },
      buttons: {
        style: "outline",
        shadow: false,
      },
    },
    appointmentDefaults: {
      duration: 90,
      locationType: "in_person",
      bufferMinutes: 15,
    },
  },
  
  // Generic fallback - neutral, works for anything
  {
    id: "default_neutral",
    name: "Default Neutral",
    description: "Clean neutral theme that works for any business",
    businessTypes: [],
    bookingType: "flexible",
    config: {
      theme: {
        primary: "#6d28d9",
        accent: "#22c55e",
        background: "#0b1220",
        text: "#e5e7eb",
        radius: 14,
        font: "Inter",
      },
      cover: {
        style: "gradient",
        imageUrl: null,
        overlay: 0.35,
      },
      header: {
        showLogo: true,
        title: "Book an Appointment",
        tagline: "Book in 60 seconds",
        align: "left",
      },
      layout: {
        maxWidth: 920,
        cardStyle: "glass",
        spacing: "comfortable",
      },
      buttons: {
        style: "filled",
        shadow: true,
      },
    },
    appointmentDefaults: {
      duration: 30,
      locationType: "phone",
      bufferMinutes: 10,
    },
  },
];

// Intent extraction types
export interface ExtractedIntent {
  businessType: string | null;
  bookingType: "emergency" | "scheduled" | "flexible" | null;
  theme: "dark" | "light" | "warm" | "neutral" | null;
  duration: number | null;
  payment: boolean | null;
  confirmation: "email" | "sms" | "both" | null;
  afterHours: boolean | null;
  customTitle: string | null;
}

// Find best preset for extracted intent
export function findBestPreset(intent: ExtractedIntent): BookingPreset {
  let bestMatch = BOOKING_PRESETS.find(p => p.id === "default_neutral")!;
  let bestScore = 0;

  for (const preset of BOOKING_PRESETS) {
    let score = 0;

    // Business type match
    if (intent.businessType) {
      const normalizedType = intent.businessType.toLowerCase();
      if (preset.businessTypes.includes(normalizedType)) {
        score += 10;
      } else {
        // Check keyword matches
        for (const [bType, keywords] of Object.entries(BUSINESS_KEYWORDS)) {
          if (keywords.some(k => normalizedType.includes(k) || k.includes(normalizedType))) {
            if (preset.businessTypes.includes(bType)) {
              score += 8;
            }
          }
        }
      }
    }

    // Booking type match
    if (intent.bookingType && preset.bookingType === intent.bookingType) {
      score += 5;
    }

    // Theme preference
    if (intent.theme) {
      const isDark = preset.config.theme.background.startsWith("#0") || 
                     preset.config.theme.background.startsWith("#1");
      if (intent.theme === "dark" && isDark) score += 3;
      if (intent.theme === "light" && !isDark) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = preset;
    }
  }

  return bestMatch;
}

// Generate smart follow-up questions based on what's missing
export function generateSmartQuestions(intent: ExtractedIntent): string[] {
  const questions: string[] = [];

  if (!intent.duration) {
    questions.push("How long is a typical job or appointment?");
  }

  if (intent.payment === null) {
    questions.push("Do you charge upfront or after the service?");
  }

  if (!intent.confirmation) {
    questions.push("Do you want automatic text confirmations?");
  }

  if (intent.bookingType === "emergency" && intent.afterHours === null) {
    questions.push("Do you offer after-hours service?");
  }

  // Limit to 3 questions max
  return questions.slice(0, 3);
}
