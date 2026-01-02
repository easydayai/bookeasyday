import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NYLAS_API_KEY = Deno.env.get("NYLAS_API_KEY");
const NYLAS_GRANT_ID = Deno.env.get("NYLAS_GRANT_ID");
const NYLAS_CALENDAR_EMAIL = Deno.env.get("NYLAS_CALENDAR_EMAIL");
const NYLAS_API_URL = "https://api.us.nylas.com/v3";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Nylas API action: ${action}`, JSON.stringify(params).slice(0, 500));

    if (!NYLAS_API_KEY) {
      throw new Error("NYLAS_API_KEY is not configured");
    }

    if (!NYLAS_GRANT_ID) {
      throw new Error("NYLAS_GRANT_ID is not configured");
    }

    const headers = {
      "Authorization": `Bearer ${NYLAS_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    switch (action) {
      case "getAvailability": {
        // Get available time slots
        const { startTime, endTime, durationMinutes = 15, intervalMinutes = 15 } = params;

        // Convert ISO strings to Unix timestamps
        const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
        const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

        const availabilityRequest = {
          participants: [
            {
              email: NYLAS_CALENDAR_EMAIL,
              calendar_ids: ["primary"],
              open_hours: [
                {
                  days: [1, 2, 3, 4, 5], // Monday to Friday
                  timezone: params.timeZone || "America/New_York",
                  start: "09:00",
                  end: "17:00"
                }
              ]
            }
          ],
          start_time: startTimestamp,
          end_time: endTimestamp,
          duration_minutes: durationMinutes,
          interval_minutes: intervalMinutes,
          round_to: 15,
          availability_rules: {
            availability_method: "collective"
          }
        };

        console.log("Nylas availability request:", JSON.stringify(availabilityRequest));

        const url = `${NYLAS_API_URL}/calendars/availability`;
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(availabilityRequest),
        });

        const data = await response.json();
        console.log(`Nylas availability response status: ${response.status}`, JSON.stringify(data).slice(0, 1000));

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: data.message || "Nylas API error", details: data }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Transform Nylas response to match our expected format
        // Nylas returns: { data: { time_slots: [{ start_time, end_time }] } }
        const normalizedSlots: Record<string, { start: string }[]> = {};
        
        if (data.data?.time_slots) {
          for (const slot of data.data.time_slots) {
            const startDate = new Date(slot.start_time * 1000);
            const dateKey = startDate.toISOString().split("T")[0];
            
            if (!normalizedSlots[dateKey]) {
              normalizedSlots[dateKey] = [];
            }
            
            normalizedSlots[dateKey].push({
              start: startDate.toISOString()
            });
          }
        }

        return new Response(
          JSON.stringify({ status: "success", data: normalizedSlots }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "createBooking": {
        // Create a calendar event (booking)
        const { start, attendee, timeZone, durationMinutes = 15, metadata } = params;

        const startDate = new Date(start);
        const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

        const eventData = {
          title: `Meeting with ${attendee.name}`,
          busy: true,
          participants: [
            {
              name: attendee.name,
              email: attendee.email
            }
          ],
          description: metadata?.phone ? `Phone: ${metadata.phone}` : "",
          when: {
            start_time: Math.floor(startDate.getTime() / 1000),
            end_time: Math.floor(endDate.getTime() / 1000),
            start_timezone: timeZone || "America/New_York",
            end_timezone: timeZone || "America/New_York"
          },
          conferencing: {
            provider: "Google Meet",
            autocreate: {}
          }
        };

        console.log("Nylas create event request:", JSON.stringify(eventData));

        const url = `${NYLAS_API_URL}/grants/${NYLAS_GRANT_ID}/events?calendar_id=primary&notify_participants=true`;
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(eventData),
        });

        const data = await response.json();
        console.log(`Nylas create event response status: ${response.status}`, JSON.stringify(data).slice(0, 1000));

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: data.message || data.error?.message || "Nylas API error", details: data }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Return success response matching expected format
        return new Response(
          JSON.stringify({ 
            status: "success",
            id: data.data?.id,
            uid: data.data?.id,
            booking: data.data
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("Nylas API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
