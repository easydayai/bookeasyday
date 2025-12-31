import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CALCOM_API_KEY = Deno.env.get("CALCOM_API_KEY");
const CALCOM_API_V1 = "https://api.cal.com/v1";
const CALCOM_API_V2 = "https://api.cal.com/v2";

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

    let response;

    switch (action) {
      case "getEventTypes": {
        // Get event types using v1 API
        const url = `${CALCOM_API_V1}/event-types?apiKey=${CALCOM_API_KEY}`;
        console.log(`Fetching event types from v1 API`);
        
        response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        break;
      }

      case "getSlots": {
        // Get available slots using v1 API
        const { eventTypeId, eventTypeSlug, username, startTime, endTime, timeZone } = params;
        
        const queryParams = new URLSearchParams();
        queryParams.append("apiKey", CALCOM_API_KEY);
        
        if (eventTypeId) {
          queryParams.append("eventTypeId", eventTypeId.toString());
        } else if (eventTypeSlug && username) {
          queryParams.append("eventTypeSlug", eventTypeSlug);
          queryParams.append("usernameList", username);
        }
        
        if (startTime) queryParams.append("startTime", startTime);
        if (endTime) queryParams.append("endTime", endTime);
        if (timeZone) queryParams.append("timeZone", timeZone);

        const url = `${CALCOM_API_V1}/slots?${queryParams.toString()}`;
        console.log(`Fetching slots from: ${url.replace(CALCOM_API_KEY, "***")}`);
        
        response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        break;
      }

      case "createBooking": {
        // Create a new booking using v2 API
        const { eventTypeId, start, attendee, timeZone, metadata } = params;

        const headers = {
          "Authorization": `Bearer ${CALCOM_API_KEY}`,
          "Content-Type": "application/json",
          "cal-api-version": "2024-09-04",
        };

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

        response = await fetch(`${CALCOM_API_V2}/bookings`, {
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

    // Normalize v1 slots response to match expected format
    if (action === "getSlots" && data.slots) {
      // v1 API returns { slots: { "date": [{ time: "..." }] } }
      // Normalize to { data: { "date": [{ start: "..." }] } }
      const normalizedSlots: Record<string, { start: string }[]> = {};
      for (const [date, times] of Object.entries(data.slots)) {
        normalizedSlots[date] = (times as { time: string }[]).map(t => ({ start: t.time }));
      }
      return new Response(JSON.stringify({ status: "success", data: normalizedSlots }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
