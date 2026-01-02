import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, amount, source, referenceId } = await req.json();
    
    if (!userId || !amount || !source) {
      throw new Error("userId, amount, and source are required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    console.log(`Consuming ${amount} credits for user ${userId} from ${source}`);

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabase
      .from("credits_balance")
      .select("balance_credits")
      .eq("user_id", userId)
      .maybeSingle();

    if (balanceError) {
      console.error("Error fetching balance:", balanceError);
      throw new Error("Failed to fetch credit balance");
    }

    if (!balanceData) {
      throw new Error("No credit balance found for user");
    }

    const currentBalance = balanceData.balance_credits;
    
    if (currentBalance < amount) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Insufficient credits",
          currentBalance,
          required: amount 
        }),
        { 
          status: 402, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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
      throw new Error("Failed to update credit balance");
    }

    // Log the transaction in credits_ledger
    const { error: ledgerError } = await supabase
      .from("credits_ledger")
      .insert({
        user_id: userId,
        credits_delta: -amount,
        event_type: "consumption",
        source: source,
        reference_id: referenceId || null,
      });

    if (ledgerError) {
      console.error("Error logging to ledger:", ledgerError);
      // Don't throw - the deduction was successful
    }

    console.log(`Credits consumed successfully. New balance: ${newBalance}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        previousBalance: currentBalance,
        newBalance,
        consumed: amount 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Consume credits error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
