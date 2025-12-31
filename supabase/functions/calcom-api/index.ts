import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CALCOM_API_KEY = Deno.env.get("CALCOM_API_KEY");
const CALCOM_API_URL = "https://api.cal.com/v2";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Cal.com API action: ${action}`, params);

    if (!CALCOM_API_KEY) {
      throw new Error("CALCOM_API_KEY is not configured");
    }

    const headers = {
      "Authorization": `Bearer ${CALCOM_API_KEY}`,
      "Content-Type": "application/json",
      "cal-api-version": "2024-09-04",
    };

    let response;

    switch (action) {
      case "getEventTypes": {
        // Get user's event types
        response = await fetch(`${CALCOM_API_URL}/event-types`, {
          method: "GET",
          headers,
        });
        break;
      }

      case "getSlots": {
        // Get available slots for an event type
        const { eventTypeId, startTime, endTime, eventTypeSlug, username } = params;
        
        const queryParams = new URLSearchParams();
        if (eventTypeId) queryParams.append("eventTypeId", eventTypeId);
        if (eventTypeSlug) queryParams.append("eventTypeSlug", eventTypeSlug);
        if (username) queryParams.append("username", username);
        if (startTime) queryParams.append("startTime", startTime);
        if (endTime) queryParams.append("endTime", endTime);

        console.log(`Fetching slots: ${CALCOM_API_URL}/slots?${queryParams.toString()}`);
        
        response = await fetch(`${CALCOM_API_URL}/slots?${queryParams.toString()}`, {
          method: "GET",
          headers,
        });
        break;
      }

      case "createBooking": {
        // Create a new booking
        const { eventTypeId, start, attendee, timeZone, metadata } = params;

        const bookingData = {
          eventTypeId: Number(eventTypeId),
          start,
          attendee: {
            name: attendee.name,
            email: attendee.email,
            timeZone: timeZone || "America/New_York",
            language: "en",
          },
          metadata: metadata || {},
        };

        console.log("Creating booking:", JSON.stringify(bookingData));

        response = await fetch(`${CALCOM_API_URL}/bookings`, {
          method: "POST",
          headers,
          body: JSON.stringify(bookingData),
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const data = await response.json();
    console.log(`Cal.com API response status: ${response.status}`, JSON.stringify(data).slice(0, 500));

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Cal.com API error", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Cal.com API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
