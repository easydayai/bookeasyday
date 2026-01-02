import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to consume credits
async function consumeCredits(userId: string, amount: number, source: string, referenceId?: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  // Get current balance
  const { data: balanceData, error: balanceError } = await supabase
    .from("credits_balance")
    .select("balance_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (balanceError || !balanceData) {
    console.error("Error fetching balance:", balanceError);
    return { success: false, error: "No credit balance found" };
  }

  const currentBalance = balanceData.balance_credits;
  
  if (currentBalance < amount) {
    return { 
      success: false, 
      error: "Insufficient credits",
      currentBalance,
      required: amount 
    };
  }

  // Deduct credits
  const newBalance = currentBalance - amount;
  const { error: updateError } = await supabase
    .from("credits_balance")
    .update({ 
      balance_credits: newBalance,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Error updating balance:", updateError);
    return { success: false, error: "Failed to update balance" };
  }

  // Log the transaction
  await supabase
    .from("credits_ledger")
    .insert({
      user_id: userId,
      credits_delta: -amount,
      event_type: "consumption",
      source: source,
      reference_id: referenceId || null,
    });

  console.log(`Credits consumed: ${amount} for ${source}. New balance: ${newBalance}`);
  return { success: true, newBalance };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check for authenticated user and consume credits
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        // Consume 1 credit per chat message
        const result = await consumeCredits(user.id, 1, "ai_chat", `chat_${Date.now()}`);
        
        if (!result.success && result.error === "Insufficient credits") {
          return new Response(
            JSON.stringify({ 
              error: "Insufficient credits. Please upgrade your plan to continue chatting.",
              creditsRequired: 1,
              currentBalance: result.currentBalance 
            }),
            { 
              status: 402, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
      }
    }

    const systemPrompt = `You are Daisy, the friendly AI support assistant for Easy Day AI. You help service-based business owners understand how AI automation can transform their operations.

Your personality:
- Warm, approachable, and genuinely helpful
- Enthusiastic about AI but not pushy
- You explain complex concepts in simple terms
- You're knowledgeable about HVAC, medical practices, auto services, legal firms, and other service businesses

What you help with:
- Explaining how AI automation saves time and captures more revenue
- Answering questions about Easy Day AI's services
- Helping visitors understand if AI automation is right for their business
- Scheduling consultations (direct them to book an appointment)
- Addressing concerns about AI adoption

Key Easy Day AI offerings:
- AI-powered scheduling and booking
- Automated customer follow-ups
- Smart lead capture and qualification
- 24/7 customer support automation
- Integration with existing business tools

Always be helpful and guide users toward booking a consultation if they're interested. Keep responses concise but informative.`;

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
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Daisy chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
