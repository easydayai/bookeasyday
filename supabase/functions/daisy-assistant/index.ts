import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Route mapping for navigation
const ROUTE_MAP: Record<string, { path: string; label: string; requiresAuth: boolean }> = {
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

// Booking presets for Daisy to apply
const BOOKING_PRESETS: Record<string, {
  name: string;
  businessTypes: string[];
  bookingType: "emergency" | "scheduled" | "flexible";
  config: {
    theme: { primary: string; accent: string; background: string; text: string; radius: number; font: string };
    cover: { style: string; overlay: number };
    header: { showLogo: boolean; title: string; tagline: string; align: string };
    layout: { maxWidth: number; cardStyle: string; spacing: string };
    buttons: { style: string; shadow: boolean };
  };
  appointmentDefaults: { duration: number; locationType: string; bufferMinutes: number };
}> = {
  emergency_dark: {
    name: "Emergency Dark",
    businessTypes: ["locksmith", "plumber", "electrician", "hvac", "towing"],
    bookingType: "emergency",
    config: {
      theme: { primary: "#ef4444", accent: "#22c55e", background: "#0a0a0a", text: "#fafafa", radius: 8, font: "Inter" },
      cover: { style: "gradient", overlay: 0.4 },
      header: { showLogo: true, title: "24/7 Emergency Service", tagline: "Fast response • Professional service", align: "center" },
      layout: { maxWidth: 600, cardStyle: "flat", spacing: "compact" },
      buttons: { style: "filled", shadow: false },
    },
    appointmentDefaults: { duration: 30, locationType: "phone", bufferMinutes: 0 },
  },
  professional_light: {
    name: "Professional Light",
    businessTypes: ["legal", "consultant", "medical", "doctor", "lawyer"],
    bookingType: "scheduled",
    config: {
      theme: { primary: "#1e40af", accent: "#0ea5e9", background: "#ffffff", text: "#1f2937", radius: 12, font: "Inter" },
      cover: { style: "none", overlay: 0 },
      header: { showLogo: true, title: "Schedule a Consultation", tagline: "Professional expertise, personalized service", align: "left" },
      layout: { maxWidth: 800, cardStyle: "shadow", spacing: "comfortable" },
      buttons: { style: "filled", shadow: true },
    },
    appointmentDefaults: { duration: 60, locationType: "video", bufferMinutes: 15 },
  },
  beauty_warm: {
    name: "Beauty Warm",
    businessTypes: ["salon", "spa", "fitness", "hair", "massage", "wellness"],
    bookingType: "scheduled",
    config: {
      theme: { primary: "#be185d", accent: "#f59e0b", background: "#fef7f0", text: "#292524", radius: 20, font: "Inter" },
      cover: { style: "gradient", overlay: 0.2 },
      header: { showLogo: true, title: "Book Your Appointment", tagline: "Relax, rejuvenate, refresh", align: "center" },
      layout: { maxWidth: 700, cardStyle: "glass", spacing: "spacious" },
      buttons: { style: "filled", shadow: true },
    },
    appointmentDefaults: { duration: 60, locationType: "in_person", bufferMinutes: 10 },
  },
  service_simple: {
    name: "Simple Service",
    businessTypes: ["cleaning", "handyman", "repair", "maintenance"],
    bookingType: "scheduled",
    config: {
      theme: { primary: "#059669", accent: "#3b82f6", background: "#f8fafc", text: "#334155", radius: 10, font: "Inter" },
      cover: { style: "none", overlay: 0 },
      header: { showLogo: true, title: "Book a Service", tagline: "Quick and easy scheduling", align: "left" },
      layout: { maxWidth: 650, cardStyle: "shadow", spacing: "comfortable" },
      buttons: { style: "filled", shadow: false },
    },
    appointmentDefaults: { duration: 120, locationType: "in_person", bufferMinutes: 30 },
  },
  creative_modern: {
    name: "Creative Modern",
    businessTypes: ["photographer", "tutor", "coach", "creative"],
    bookingType: "scheduled",
    config: {
      theme: { primary: "#8b5cf6", accent: "#ec4899", background: "#18181b", text: "#f4f4f5", radius: 16, font: "Inter" },
      cover: { style: "gradient", overlay: 0.3 },
      header: { showLogo: true, title: "Book a Session", tagline: "Let's create something amazing", align: "center" },
      layout: { maxWidth: 750, cardStyle: "glass", spacing: "comfortable" },
      buttons: { style: "outline", shadow: false },
    },
    appointmentDefaults: { duration: 90, locationType: "in_person", bufferMinutes: 15 },
  },
  default_neutral: {
    name: "Default Neutral",
    businessTypes: [],
    bookingType: "flexible",
    config: {
      theme: { primary: "#6d28d9", accent: "#22c55e", background: "#0b1220", text: "#e5e7eb", radius: 14, font: "Inter" },
      cover: { style: "gradient", overlay: 0.35 },
      header: { showLogo: true, title: "Book an Appointment", tagline: "Book in 60 seconds", align: "left" },
      layout: { maxWidth: 920, cardStyle: "glass", spacing: "comfortable" },
      buttons: { style: "filled", shadow: true },
    },
    appointmentDefaults: { duration: 30, locationType: "phone", bufferMinutes: 10 },
  },
};

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: "function",
    function: {
      name: "navigate_internal",
      description: "Navigate the user to an internal page. Use destination_key for standard routes. ALWAYS use this when user asks to 'go to', 'take me to', 'open', or 'show me' a page. Respond with a short confirmation like 'Got it — taking you there now!' before navigating.",
      parameters: {
        type: "object",
        properties: {
          destination_key: {
            type: "string",
            enum: ["dashboard", "calendar", "profile", "availability", "appointment_types", "bookings", "booking_builder", "pricing", "home", "solutions", "demo", "contact", "public_booking"],
            description: "The destination key for navigation. Use 'public_booking' for the user's booking page.",
          },
          custom_path: {
            type: "string",
            description: "Only use if destination_key doesn't match. Direct path like '/book/username'",
          },
        },
        required: ["destination_key"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description: "Search the company knowledge base for information. Use this when the user asks general questions about Easy Day AI, how things work, pricing, features, etc.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query or topic to find information about" },
          category: { type: "string", enum: ["general", "pricing", "features", "support", "technical"], description: "Optional category filter" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "extract_booking_intent",
      description: "Extract user's booking page requirements from natural language. Use this when user describes what kind of booking page they want. Example: 'I'm a locksmith, I want emergency bookings, black page, text confirmations' → extract businessType=locksmith, bookingType=emergency, theme=dark, confirmation=sms",
      parameters: {
        type: "object",
        properties: {
          businessType: { type: "string", description: "Type of business (locksmith, salon, plumber, lawyer, etc.)" },
          bookingType: { type: "string", enum: ["emergency", "scheduled", "flexible"], description: "Emergency = 24/7 urgent, Scheduled = appointment-based, Flexible = either" },
          theme: { type: "string", enum: ["dark", "light", "warm", "neutral"], description: "Visual theme preference" },
          duration: { type: "number", description: "Typical appointment duration in minutes" },
          payment: { type: "boolean", description: "Whether they take upfront payment" },
          confirmation: { type: "string", enum: ["email", "sms", "both"], description: "How to confirm bookings" },
          afterHours: { type: "boolean", description: "Whether they offer after-hours service" },
          customTitle: { type: "string", description: "Custom title if they specified one" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_booking_page",
      description: "Generate a booking page based on extracted intent. Daisy selects the best preset, applies customizations, and saves to the user's config. Use AFTER extract_booking_intent to actually create the page.",
      parameters: {
        type: "object",
        properties: {
          presetId: { type: "string", enum: ["emergency_dark", "professional_light", "beauty_warm", "service_simple", "creative_modern", "default_neutral"], description: "The preset to use as base" },
          customizations: {
            type: "object",
            description: "Optional customizations to apply on top of preset",
            properties: {
              title: { type: "string" },
              tagline: { type: "string" },
              primaryColor: { type: "string" },
              duration: { type: "number" },
            },
          },
          appointmentName: { type: "string", description: "Name for the appointment type to create" },
          appointmentDuration: { type: "number", description: "Duration in minutes" },
        },
        required: ["presetId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_profile",
      description: "Get the current user's profile information",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "list_appointment_types",
      description: "List all appointment types the user has created",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_appointment_type",
      description: "Create a new appointment type for the user",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the appointment type" },
          duration_minutes: { type: "number", description: "Duration in minutes" },
          description: { type: "string", description: "Description of the appointment" },
          location_type: { type: "string", enum: ["phone", "video", "in_person"], description: "Location type" },
        },
        required: ["name", "duration_minutes"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_availability",
      description: "Get the user's current availability rules",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "set_availability",
      description: "Set availability for a specific day",
      parameters: {
        type: "object",
        properties: {
          day_of_week: { type: "number", description: "Day of week (0=Sunday, 6=Saturday)" },
          start_time: { type: "string", description: "Start time (HH:MM format)" },
          end_time: { type: "string", description: "End time (HH:MM format)" },
        },
        required: ["day_of_week", "start_time", "end_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_bookings",
      description: "List the user's upcoming bookings",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Maximum number of bookings to return" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Cancel a specific booking. Ask user to confirm cancellation before proceeding.",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "The ID of the booking to cancel" },
          notify_customer: { type: "boolean", description: "Whether to notify the customer about the cancellation" },
          reason: { type: "string", description: "Optional reason for cancellation" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule_booking",
      description: "Reschedule a booking to a new date/time. Ask user to confirm new time before proceeding.",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string", description: "The ID of the booking to reschedule" },
          new_start_time: { type: "string", description: "New start time in ISO format (e.g., 2024-01-15T10:00:00Z)" },
          new_end_time: { type: "string", description: "New end time in ISO format" },
          notify_customer: { type: "boolean", description: "Whether to notify the customer about the change" },
        },
        required: ["booking_id", "new_start_time", "new_end_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_calendar_theme",
      description: "Get the user's booking page theme/design settings",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "update_calendar_theme",
      description: "Update the user's booking page theme colors. This updates the live booking page immediately.",
      parameters: {
        type: "object",
        properties: {
          primary_color: { type: "string", description: "Primary color hex code (e.g. #6d28d9)" },
          accent_color: { type: "string", description: "Accent color hex code (e.g. #22c55e)" },
          background_color: { type: "string", description: "Background color hex code (e.g. #0b1220)" },
          text_color: { type: "string", description: "Text color hex code (e.g. #e5e7eb)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_booking_page_theme",
      description: "Update the live booking page theme with colors, fonts, and styling. Use this to change colors when user asks to change their booking page colors.",
      parameters: {
        type: "object",
        properties: {
          primary: { type: "string", description: "Primary/brand color hex (e.g. #6d28d9 for purple)" },
          accent: { type: "string", description: "Accent color hex (e.g. #22c55e for green)" },
          background: { type: "string", description: "Background color hex (e.g. #0b1220 for dark)" },
          text: { type: "string", description: "Text color hex (e.g. #e5e7eb for light text)" },
          radius: { type: "number", description: "Border radius in pixels (0-24)" },
          font: { type: "string", enum: ["Inter", "System", "Poppins"], description: "Font family" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_credits_balance",
      description: "Check the user's current credits balance",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "configure_reminders",
      description: "Configure reminder settings for the user",
      parameters: {
        type: "object",
        properties: {
          email_enabled: { type: "boolean", description: "Enable email reminders" },
          email_hours_before: { type: "number", description: "Hours before appointment to send email" },
          sms_enabled: { type: "boolean", description: "Enable SMS reminders" },
          sms_hours_before: { type: "number", description: "Hours before appointment to send SMS" },
        },
        required: [],
      },
    },
  },
];

// Execute tool calls
async function executeTool(
  toolName: string,
  // deno-lint-ignore no-explicit-any
  args: Record<string, any>,
  userId: string | null,
  // deno-lint-ignore no-explicit-any
  supabase: any
): Promise<{ result: unknown; creditCost: number }> {
  console.log(`Executing tool: ${toolName}`, args);
  
  switch (toolName) {
    case "navigate_internal": {
      const destKey = args.destination_key as string;
      const route = ROUTE_MAP[destKey];
      
      // Handle public_booking specially - needs user slug
      if (destKey === "public_booking") {
        // Get user slug from profile
        if (!userId) {
          return { 
            result: { 
              action: "navigate", 
              path: "/login", 
              label: "Log in first",
              destination_key: "login",
              autoNavigate: false,
              message: "You need to log in to view your booking page."
            }, 
            creditCost: 0 
          };
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("slug")
          .eq("id", userId)
          .single();
        
        const slug = profile?.slug || userId;
        return { 
          result: { 
            action: "navigate", 
            path: `/book/${slug}`, 
            label: "Your Booking Page",
            destination_key: destKey,
            autoNavigate: true,
            message: `Got it — taking you to your booking page now!`
          }, 
          creditCost: 0 
        };
      }
      
      if (route) {
        // Check auth requirements
        if (route.requiresAuth && !userId) {
          return { 
            result: { 
              action: "navigate", 
              path: "/login", 
              label: "Log in first",
              destination_key: "login",
              autoNavigate: true,
              message: `You need to log in to access ${route.label}. Let me take you to the login page.`
            }, 
            creditCost: 0 
          };
        }
        
        // If logged in and requesting home, redirect to dashboard
        const finalPath = (destKey === "home" && userId) ? "/dashboard" : route.path;
        const finalLabel = (destKey === "home" && userId) ? "Dashboard" : route.label;
        
        return { 
          result: { 
            action: "navigate", 
            path: finalPath, 
            label: finalLabel,
            destination_key: destKey,
            autoNavigate: true,
            message: `Got it — taking you to ${finalLabel} now!`
          }, 
          creditCost: 0 
        };
      }
      
      // Fallback to custom path
      const customPath = args.custom_path as string || "/dashboard";
      return { 
        result: { 
          action: "navigate", 
          path: customPath, 
          label: args.label || "Page",
          autoNavigate: true,
          message: `Got it — navigating now!`
        }, 
        creditCost: 0 
      };
    }
    
    case "extract_booking_intent": {
      // This tool just returns the extracted intent for the AI to use
      // It doesn't need to do anything - the AI extracts from user message
      console.log("Extracted intent:", args);
      
      // Find best matching preset
      let bestPreset = "default_neutral";
      const businessType = (args.businessType as string || "").toLowerCase();
      
      for (const [presetId, preset] of Object.entries(BOOKING_PRESETS)) {
        if (preset.businessTypes.some(t => businessType.includes(t) || t.includes(businessType))) {
          bestPreset = presetId;
          break;
        }
      }
      
      // If theme is dark and emergency, use emergency_dark
      if (args.theme === "dark" && args.bookingType === "emergency") {
        bestPreset = "emergency_dark";
      } else if (args.theme === "light" && args.bookingType === "scheduled") {
        if (["legal", "consultant", "medical", "doctor", "lawyer"].some(t => businessType.includes(t))) {
          bestPreset = "professional_light";
        }
      }
      
      // Generate smart follow-up questions
      const questions: string[] = [];
      if (!args.duration) questions.push("How long is a typical job?");
      if (args.payment === undefined || args.payment === null) questions.push("Do you charge upfront or after?");
      if (!args.confirmation) questions.push("Want automatic text confirmations?");
      
      return { 
        result: { 
          extractedIntent: args, 
          suggestedPreset: bestPreset,
          presetName: BOOKING_PRESETS[bestPreset]?.name,
          questions: questions.slice(0, 3),
          readyToGenerate: questions.length === 0
        }, 
        creditCost: 0 
      };
    }
    
    case "generate_booking_page": {
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      
      const presetId = args.presetId as string || "default_neutral";
      const preset = BOOKING_PRESETS[presetId] || BOOKING_PRESETS.default_neutral;
      const customizations = (args.customizations || {}) as { title?: string; tagline?: string; primaryColor?: string; duration?: number };
      
      // Build final config from preset + customizations
      const themeConfig = { ...preset.config.theme };
      if (customizations.primaryColor) {
        themeConfig.primary = customizations.primaryColor;
      }
      
      const headerConfig = { ...preset.config.header, logoUrl: "" };
      if (customizations.title) {
        headerConfig.title = customizations.title;
      }
      if (customizations.tagline) {
        headerConfig.tagline = customizations.tagline;
      }
      
      const finalConfig = {
        theme: themeConfig,
        cover: {
          ...preset.config.cover,
          imageUrl: null,
        },
        header: headerConfig,
        layout: preset.config.layout,
        buttons: preset.config.buttons,
      };
      
      // Upsert the booking page config
      const { data: existingConfig } = await supabase
        .from("booking_page_config")
        .select("user_id")
        .eq("user_id", userId)
        .single();
      
      let configResult;
      if (existingConfig) {
        configResult = await supabase
          .from("booking_page_config")
          .update({ 
            config: finalConfig,
            published_config: finalConfig, // Auto-publish
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();
      } else {
        configResult = await supabase
          .from("booking_page_config")
          .insert({ 
            user_id: userId, 
            config: finalConfig,
            published_config: finalConfig
          })
          .select()
          .single();
      }
      
      if (configResult.error) {
        return { result: { error: configResult.error.message }, creditCost: 0 };
      }
      
      // Create appointment type if specified
      let appointmentResult = null;
      const appointmentName = args.appointmentName as string;
      const appointmentDuration = args.appointmentDuration as number || customizations.duration as number || preset.appointmentDefaults.duration;
      
      if (appointmentName) {
        const { data: newAppt, error: apptError } = await supabase
          .from("appointment_types")
          .insert({
            user_id: userId,
            name: appointmentName,
            duration_minutes: appointmentDuration,
            location_type: preset.appointmentDefaults.locationType,
            is_active: true,
          })
          .select()
          .single();
        
        if (!apptError) {
          appointmentResult = newAppt;
        }
      }
      
      return { 
        result: { 
          success: true, 
          presetUsed: preset.name,
          config: finalConfig,
          appointmentCreated: appointmentResult,
          message: `Your ${preset.name} booking page is ready!`
        }, 
        creditCost: 1 // Charge for page generation
      };
    }
    
    case "get_user_profile":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return { result: profile || { error: "Profile not found" }, creditCost: 0 };
    
    case "list_appointment_types":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: types } = await supabase
        .from("appointment_types")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return { result: types || [], creditCost: 0 };
    
    case "create_appointment_type":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: newType, error: createError } = await supabase
        .from("appointment_types")
        .insert({
          user_id: userId,
          name: args.name as string,
          duration_minutes: (args.duration_minutes as number) || 30,
          description: (args.description as string) || null,
          location_type: (args.location_type as string) || "phone",
          is_active: true,
        })
        .select()
        .single();
      if (createError) return { result: { error: createError.message }, creditCost: 0 };
      return { result: { success: true, appointment_type: newType }, creditCost: 1 };
    
    case "get_availability":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: availability } = await supabase
        .from("availability_rules")
        .select("*")
        .eq("user_id", userId)
        .order("day_of_week");
      return { result: availability || [], creditCost: 0 };
    
    case "set_availability":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: avail, error: availError } = await supabase
        .from("availability_rules")
        .insert({
          user_id: userId,
          day_of_week: args.day_of_week as number,
          start_time: args.start_time as string,
          end_time: args.end_time as string,
          timezone: "America/New_York",
        })
        .select()
        .single();
      if (availError) return { result: { error: availError.message }, creditCost: 0 };
      return { result: { success: true, availability: avail }, creditCost: 1 };
    
    case "list_bookings":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const limit = (args.limit as number) || 10;
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(limit);
      return { result: bookings || [], creditCost: 0 };
    
    case "cancel_booking": {
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const bookingId = args.booking_id as string;
      
      // First verify the booking belongs to this user
      const { data: existingBooking, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("user_id", userId)
        .single();
      
      if (fetchError || !existingBooking) {
        return { result: { error: "Booking not found or you don't have permission to cancel it" }, creditCost: 0 };
      }
      
      // Update booking status to cancelled
      const { error: cancelError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("user_id", userId);
      
      if (cancelError) {
        return { result: { error: cancelError.message }, creditCost: 0 };
      }
      
      // Queue notification if requested
      if (args.notify_customer && existingBooking.customer_email) {
        await supabase
          .from("notification_queue")
          .insert({
            user_id: userId,
            booking_id: bookingId,
            notification_type: "email",
            recipient_email: existingBooking.customer_email,
            subject: "Your appointment has been cancelled",
            message: `Hi ${existingBooking.customer_name}, your appointment has been cancelled.${args.reason ? ` Reason: ${args.reason}` : ""} Please contact us to reschedule.`,
            scheduled_for: new Date().toISOString(),
            status: "pending",
          });
      }
      
      return { 
        result: { 
          success: true, 
          message: `Booking with ${existingBooking.customer_name} has been cancelled.`,
          notificationSent: !!args.notify_customer
        }, 
        creditCost: 0 
      };
    }
    
    case "reschedule_booking": {
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const rescheduleBookingId = args.booking_id as string;
      const newStartTime = args.new_start_time as string;
      const newEndTime = args.new_end_time as string;
      
      // Verify booking belongs to user
      const { data: existingRescheduleBooking, error: rescheduleFetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", rescheduleBookingId)
        .eq("user_id", userId)
        .single();
      
      if (rescheduleFetchError || !existingRescheduleBooking) {
        return { result: { error: "Booking not found or you don't have permission to reschedule it" }, creditCost: 0 };
      }
      
      // Update booking times
      const { error: rescheduleError } = await supabase
        .from("bookings")
        .update({ 
          start_time: newStartTime,
          end_time: newEndTime,
          status: "rescheduled"
        })
        .eq("id", rescheduleBookingId)
        .eq("user_id", userId);
      
      if (rescheduleError) {
        return { result: { error: rescheduleError.message }, creditCost: 0 };
      }
      
      // Queue notification if requested
      if (args.notify_customer && existingRescheduleBooking.customer_email) {
        const formattedDate = new Date(newStartTime).toLocaleString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit' 
        });
        
        await supabase
          .from("notification_queue")
          .insert({
            user_id: userId,
            booking_id: rescheduleBookingId,
            notification_type: "email",
            recipient_email: existingRescheduleBooking.customer_email,
            subject: "Your appointment has been rescheduled",
            message: `Hi ${existingRescheduleBooking.customer_name}, your appointment has been rescheduled to ${formattedDate}. Please contact us if this doesn't work for you.`,
            scheduled_for: new Date().toISOString(),
            status: "pending",
          });
      }
      
      return { 
        result: { 
          success: true, 
          message: `Booking with ${existingRescheduleBooking.customer_name} has been rescheduled.`,
          newTime: newStartTime,
          notificationSent: !!args.notify_customer
        }, 
        creditCost: 0 
      };
    }
    
    case "search_knowledge": {
      const query = (args.query as string || "").toLowerCase();
      const category = args.category as string;
      
      // Build query
      let knowledgeQuery = supabase
        .from("company_knowledge")
        .select("topic, content, category")
        .eq("is_active", true);
      
      if (category) {
        knowledgeQuery = knowledgeQuery.eq("category", category);
      }
      
      const { data: knowledgeResults } = await knowledgeQuery;
      
      if (!knowledgeResults || knowledgeResults.length === 0) {
        return { result: { found: false, message: "No relevant knowledge found" }, creditCost: 0 };
      }
      
      // Simple relevance scoring - find entries that match the query
      const scoredResults = knowledgeResults.map((k: { topic: string; content: string; category: string }) => {
        const topicLower = k.topic.toLowerCase();
        const contentLower = k.content.toLowerCase();
        let score = 0;
        
        // Check if query terms appear in topic or content
        const queryTerms = query.split(" ").filter((t: string) => t.length > 2);
        for (const term of queryTerms) {
          if (topicLower.includes(term)) score += 3;
          if (contentLower.includes(term)) score += 1;
        }
        
        return { ...k, score };
      }).filter((k: { score: number }) => k.score > 0)
        .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
        .slice(0, 3);
      
      if (scoredResults.length === 0) {
        // Return all knowledge if no specific matches
        return { 
          result: { 
            found: true, 
            entries: knowledgeResults.slice(0, 5),
            message: "Here's some general information that might help"
          }, 
          creditCost: 0 
        };
      }
      
      return { 
        result: { 
          found: true, 
          entries: scoredResults,
          message: `Found ${scoredResults.length} relevant entries`
        }, 
        creditCost: 0 
      };
    }
    
    case "get_calendar_theme":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: theme } = await supabase
        .from("calendar_design_settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      return { result: theme || { error: "No theme configured" }, creditCost: 0 };
    
    case "update_calendar_theme":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      // deno-lint-ignore no-explicit-any
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (args.primary_color) updates.primary_color = args.primary_color;
      if (args.accent_color) updates.accent_color = args.accent_color;
      if (args.background_color) updates.background_color = args.background_color;
      if (args.text_color) updates.text_color = args.text_color;
      
      const { data: updatedTheme, error: themeError } = await supabase
        .from("calendar_design_settings")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
      if (themeError) return { result: { error: themeError.message }, creditCost: 0 };
      return { result: { success: true, theme: updatedTheme }, creditCost: 1 };
    
    case "update_booking_page_theme": {
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      
      // Get existing config
      const { data: existingPageConfig } = await supabase
        .from("booking_page_config")
        .select("config, published_config")
        .eq("user_id", userId)
        .single();
      
      // Start with existing config or default
      // deno-lint-ignore no-explicit-any
      const currentConfig = (existingPageConfig?.config as Record<string, any>) || {
        theme: { primary: "#6d28d9", accent: "#22c55e", background: "#0b1220", text: "#e5e7eb", radius: 14, font: "Inter" },
        cover: { style: "gradient", overlay: 0.35, imageUrl: null },
        header: { showLogo: true, logoUrl: "", title: "Book an Appointment", tagline: "Book in 60 seconds", align: "left" },
        layout: { maxWidth: 920, cardStyle: "glass", spacing: "comfortable" },
        buttons: { style: "filled", shadow: true },
      };
      
      // Update theme colors
      const newTheme = { ...currentConfig.theme };
      if (args.primary) newTheme.primary = args.primary;
      if (args.accent) newTheme.accent = args.accent;
      if (args.background) newTheme.background = args.background;
      if (args.text) newTheme.text = args.text;
      if (args.radius !== undefined) newTheme.radius = args.radius;
      if (args.font) newTheme.font = args.font;
      
      const newConfig = { ...currentConfig, theme: newTheme };
      
      // Upsert config
      let pageConfigResult;
      if (existingPageConfig) {
        pageConfigResult = await supabase
          .from("booking_page_config")
          .update({ 
            config: newConfig,
            published_config: newConfig, // Auto-publish
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();
      } else {
        pageConfigResult = await supabase
          .from("booking_page_config")
          .insert({ 
            user_id: userId, 
            config: newConfig,
            published_config: newConfig
          })
          .select()
          .single();
      }
      
      if (pageConfigResult.error) {
        return { result: { error: pageConfigResult.error.message }, creditCost: 0 };
      }
      
      return { 
        result: { 
          success: true, 
          message: "Your booking page colors have been updated!",
          theme: newTheme
        }, 
        creditCost: 1 
      };
    }
    
    case "get_credits_balance":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      const { data: balance } = await supabase
        .from("credits_balance")
        .select("balance_credits")
        .eq("user_id", userId)
        .single();
      return { result: balance || { balance_credits: 0 }, creditCost: 0 };
    
    case "configure_reminders":
      if (!userId) return { result: { error: "Not authenticated" }, creditCost: 0 };
      // deno-lint-ignore no-explicit-any
      const reminderUpdates: Record<string, any> = { 
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      if (args.email_enabled !== undefined) reminderUpdates.email_enabled = args.email_enabled;
      if (args.email_hours_before !== undefined) reminderUpdates.email_hours_before = args.email_hours_before;
      if (args.sms_enabled !== undefined) reminderUpdates.sms_enabled = args.sms_enabled;
      if (args.sms_hours_before !== undefined) reminderUpdates.sms_hours_before = args.sms_hours_before;
      
      // Check if exists first
      const { data: existingReminder } = await supabase
        .from("reminder_rules")
        .select("user_id")
        .eq("user_id", userId)
        .single();
      
      let reminders, reminderError;
      if (existingReminder) {
        const result = await supabase
          .from("reminder_rules")
          .update(reminderUpdates)
          .eq("user_id", userId)
          .select()
          .single();
        reminders = result.data;
        reminderError = result.error;
      } else {
        const result = await supabase
          .from("reminder_rules")
          .insert(reminderUpdates)
          .select()
          .single();
        reminders = result.data;
        reminderError = result.error;
      }
      
      if (reminderError) return { result: { error: reminderError.message }, creditCost: 0 };
      return { result: { success: true, reminders }, creditCost: 1 };
    
    default:
      return { result: { error: `Unknown tool: ${toolName}` }, creditCost: 0 };
  }
}

// Charge credits
async function chargeCredits(
  userId: string,
  amount: number,
  source: string,
  // deno-lint-ignore no-explicit-any
  supabase: any
): Promise<boolean> {
  const { data: balance } = await supabase
    .from("credits_balance")
    .select("balance_credits")
    .eq("user_id", userId)
    .single();

  if (!balance || (balance as { balance_credits: number }).balance_credits < amount) {
    return false;
  }

  await supabase
    .from("credits_balance")
    .update({ 
      balance_credits: (balance as { balance_credits: number }).balance_credits - amount,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  await supabase
    .from("credits_ledger")
    .insert({
      user_id: userId,
      credits_delta: -amount,
      event_type: "consumption",
      source: source,
      reference_id: `daisy_${Date.now()}`,
    });

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, isAuthenticated, currentPage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get user if authenticated
    let userId: string | null = null;
    // deno-lint-ignore no-explicit-any
    let userProfile: Record<string, any> | null = null;
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader && isAuthenticated) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        userId = user.id;
        const { data: profile } = await adminSupabase
          .from("profiles")
          .select("full_name, business_name, slug")
          .eq("id", userId)
          .single();
        userProfile = profile;
      }
    }

    // Retrieve company knowledge
    const { data: knowledge } = await adminSupabase
      .from("company_knowledge")
      .select("topic, content, category")
      .eq("is_active", true);

    const knowledgeContext = knowledge?.map((k: { topic: string; content: string }) => 
      `[${k.topic.toUpperCase()}]: ${k.content}`
    ).join("\n\n") || "No company knowledge configured yet.";

    // Build system prompt based on mode
    const publicPrompt = `You are Daisy, the friendly AI assistant for Easy Day AI. You're warm, upbeat, confident, and genuinely helpful.

PERSONALITY:
- Friendly and encouraging with light humor when appropriate
- Clear, organized, and reassuring
- Use phrases like "Hey! I've got you 😊", "No worries — we can fix that!", "Nice choice!"
- Occasionally use "haha" or "hehe" when it fits naturally

YOUR KNOWLEDGE:
${knowledgeContext}

CURRENT CONTEXT:
- User is browsing the public website (not logged in)
- Current page: ${currentPage || "/"}

YOUR GOALS:
1. Answer questions about Easy Day AI services, pricing, and features
2. Help visitors understand how AI automation benefits service businesses
3. Guide interested visitors to book a call or see pricing

NAVIGATION - CRITICAL:
When the user says things like "take me to", "go to", "show me", "open", or asks about a page:
- ALWAYS use the navigate_internal tool immediately
- Say something brief like "Got it — taking you there now!" then call the tool
- Available destinations: pricing, demo, contact, solutions, home

Use these destination_key values:
- "pricing" → Pricing page
- "demo" → Book a demo
- "contact" → Contact us
- "solutions" → Solutions page
- "home" → Homepage

If you don't have information about something, say so honestly and offer to connect them with support.`;

    const authPrompt = `You are Daisy, the friendly AI assistant for Easy Day AI. You're warm, upbeat, confident, and genuinely helpful.

PERSONALITY:
- Friendly and encouraging with light humor when appropriate
- Clear, organized, and reassuring
- Use phrases like "Hey! I've got you 😊", "No worries — we can fix that!", "Nice choice!"
- Occasionally use "haha" or "hehe" when it fits naturally

USER CONTEXT:
- Name: ${userProfile?.full_name || "User"}
- Business: ${userProfile?.business_name || "Not set"}
- Booking link slug: ${userProfile?.slug || "not set"}
- Current page: ${currentPage || "/dashboard"}

=== BOOKING PAGE INTERPRETER (YOUR SUPERPOWER) ===

You are NOT a designer. You are a booking page INTERPRETER.

When a user describes what they want (in plain English), you:
1. Use extract_booking_intent to understand what they need
2. Select the right preset automatically
3. Ask ONLY smart questions for missing critical info (max 3 questions)
4. Use generate_booking_page to create their page instantly

EXAMPLE USER INPUT:
"I'm a mobile locksmith, I want emergency bookings, black page, text confirmations."

YOU EXTRACT:
- businessType: "locksmith"
- bookingType: "emergency"  
- theme: "dark"
- confirmation: "sms"

THEN: Select "emergency_dark" preset and generate the page.

SMART QUESTIONS (only ask what's truly missing):
✅ "How long is a typical job?" (if duration not specified)
✅ "Do you charge upfront or after?" (if payment not specified)
✅ "Want automatic text confirmations?" (if confirmation not specified)

❌ NEVER ask: "Pick a font", "Choose a layout", "Select a color"

If user says "whatever you recommend" → use smart defaults and move on.

AVAILABLE PRESETS:
- emergency_dark: 24/7 emergency services (locksmith, plumber, electrician, hvac, towing)
- professional_light: Professional consultations (legal, medical, consultant)
- beauty_warm: Beauty & wellness (salon, spa, fitness)
- service_simple: Home services (cleaning, handyman)
- creative_modern: Creative professionals (photographer, tutor, coach)
- default_neutral: Generic fallback

=== NAVIGATION (USE navigate_internal TOOL) ===
When the user says "take me to", "go to", "show me", "open":
- ALWAYS use navigate_internal tool immediately
- Say "Got it — taking you there now!" then call the tool

Destination keys: dashboard, calendar, profile, availability, appointment_types, bookings, booking_builder, pricing, public_booking

=== OTHER CAPABILITIES ===
- Create and manage appointment types
- Set up availability schedules
- View upcoming bookings
- Configure reminder settings

=== CREDIT RULES ===
- Before any action that costs credits: "This will cost 1 credit. Want me to proceed?"
- Never claim success unless tool confirms it

YOUR KNOWLEDGE:
${knowledgeContext}

Be helpful, efficient, and remember: interpret, don't design!`;

    const systemPrompt = isAuthenticated ? authPrompt : publicPrompt;

    // First API call to get response (possibly with tool calls)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools: isAuthenticated ? tools : tools.filter(t => t.function.name === "navigate_internal"),
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Check for tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: Array<{ name: string; result: unknown; creditCost: number }> = [];
      let totalCreditCost = 0;

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
        
        const { result, creditCost } = await executeTool(toolName, toolArgs, userId, adminSupabase);
        toolResults.push({ name: toolName, result, creditCost });
        totalCreditCost += creditCost;
      }

      // Charge credits if needed
      if (totalCreditCost > 0 && userId) {
        const charged = await chargeCredits(userId, totalCreditCost, "daisy_tools", adminSupabase);
        if (!charged) {
          return new Response(JSON.stringify({ 
            error: "Insufficient credits",
            content: "Oops! You don't have enough credits for this action. Would you like to check out our plans?",
            actions: [{ type: "navigate", path: "/pricing", label: "View Plans" }]
          }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Get follow-up response with tool results
      const toolMessages = toolResults.map((tr, idx) => ({
        role: "tool" as const,
        tool_call_id: assistantMessage.tool_calls[idx].id,
        content: JSON.stringify(tr.result),
      }));

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            assistantMessage,
            ...toolMessages,
          ],
        }),
      });

      const followUpData = await followUpResponse.json();
      const finalContent = followUpData.choices[0].message.content;

      // Extract navigation actions from tool results
      const actions = toolResults
        // deno-lint-ignore no-explicit-any
        .filter(tr => tr.result && typeof tr.result === "object" && (tr.result as any).action === "navigate")
        .map(tr => ({
          type: "navigate",
          // deno-lint-ignore no-explicit-any
          path: (tr.result as any).path,
          // deno-lint-ignore no-explicit-any
          label: (tr.result as any).label,
          // deno-lint-ignore no-explicit-any
          destination_key: (tr.result as any).destination_key,
        }));

      // Check if we should auto-navigate
      // deno-lint-ignore no-explicit-any
      const shouldAutoNavigate = toolResults.some(tr => tr.result && typeof tr.result === "object" && (tr.result as any).autoNavigate === true);

      return new Response(JSON.stringify({
        content: finalContent,
        actions,
        autoNavigate: shouldAutoNavigate,
        creditsCharged: totalCreditCost,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls - just return the message
    return new Response(JSON.stringify({
      content: assistantMessage.content,
      actions: [],
      creditsCharged: 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Daisy assistant error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
