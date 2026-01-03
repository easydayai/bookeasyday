import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: "function",
    function: {
      name: "navigate_internal",
      description: "Navigate the user to an internal page in the app. Use this to guide users to specific features.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The internal route path (e.g., /pricing, /settings/availability, /book/slug)",
          },
          label: {
            type: "string",
            description: "The button label to show the user",
          },
        },
        required: ["path", "label"],
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
      name: "get_calendar_theme",
      description: "Get the user's booking page theme/design settings",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "update_calendar_theme",
      description: "Update the user's booking page theme colors",
      parameters: {
        type: "object",
        properties: {
          primary_color: { type: "string", description: "Primary color hex code" },
          accent_color: { type: "string", description: "Accent color hex code" },
          background_color: { type: "string", description: "Background color hex code" },
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
    case "navigate_internal":
      return { 
        result: { 
          action: "navigate", 
          path: args.path, 
          label: args.label,
          message: `I can take you to ${args.label}. Click the button below!`
        }, 
        creditCost: 0 
      };
    
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
      
      const { data: updatedTheme, error: themeError } = await supabase
        .from("calendar_design_settings")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
      if (themeError) return { result: { error: themeError.message }, creditCost: 0 };
      return { result: { success: true, theme: updatedTheme }, creditCost: 1 };
    
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
- User is browsing the public website
- Current page: ${currentPage || "/"}

YOUR GOALS:
1. Answer questions about Easy Day AI services, pricing, and features
2. Help visitors understand how AI automation benefits service businesses
3. Guide interested visitors to book a call or see pricing

NAVIGATION: You can suggest these pages:
- /pricing - View pricing plans
- /demo - Book a demo call
- /contact - Contact us
- /solutions - See our solutions

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
- Booking link: /book/${userProfile?.slug || ""}
- Current page: ${currentPage || "/dashboard"}

YOUR CAPABILITIES:
You can help the user:
1. Create and manage appointment types
2. Set up their availability schedule
3. View upcoming bookings
4. Customize their booking page design (colors, fonts)
5. Configure reminder settings
6. Navigate to different parts of the app

NAVIGATION PAGES:
- /dashboard - Main dashboard
- /settings/profile - Edit profile
- /settings/availability - Set availability
- /settings/appointment-types - Manage appointment types
- /booking-builder - Customize booking page
- /calendar - View calendar
- /pricing - View/change plans

IMPORTANT RULES:
1. For actions that modify data, ALWAYS use the appropriate tool
2. Before any action that costs credits, tell the user: "This will cost 1 credit. Would you like me to proceed?"
3. Never claim you did something unless the tool confirms success
4. Use navigate_internal to guide users to pages

YOUR KNOWLEDGE:
${knowledgeContext}

Be helpful, guide the user step-by-step, and stay with them as they navigate the app!`;

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
        }));

      return new Response(JSON.stringify({
        content: finalContent,
        actions,
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
