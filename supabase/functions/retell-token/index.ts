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
    const RETELL_API_KEY = Deno.env.get("RETELL_API_KEY");
    
    if (!RETELL_API_KEY) {
      throw new Error("RETELL_API_KEY is not configured");
    }

    const { agentId } = await req.json();
    
    if (!agentId) {
      throw new Error("Agent ID is required");
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
        // Consume 5 credits per voice call
        const result = await consumeCredits(user.id, 5, "voice_call", `call_${Date.now()}`);
        
        if (!result.success && result.error === "Insufficient credits") {
          return new Response(
            JSON.stringify({ 
              error: "Insufficient credits. Please upgrade your plan to make voice calls.",
              creditsRequired: 5,
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

    console.log("Creating web call for agent:", agentId);

    // Create a web call to get access token
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Retell API error:", response.status, errorText);
      throw new Error(`Retell API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Web call created successfully");

    return new Response(JSON.stringify({ 
      accessToken: data.access_token,
      callId: data.call_id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Retell token error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
