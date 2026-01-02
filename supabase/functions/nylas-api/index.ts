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

        // Format the date for the description
        const formattedDate = startDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const formattedTime = startDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          timeZone: timeZone || "America/New_York"
        });

        // Generate cancel/reschedule link
        const siteUrl = Deno.env.get("SITE_URL") || "https://easydayai.com";

        // Build a comprehensive description with manage links
        const descriptionParts = [
          `📞 Easy Day AI - Phone Consultation`,
          ``,
          `👤 Attendee Details:`,
          `   Name: ${attendee.name}`,
          `   Email: ${attendee.email}`,
          metadata?.phone ? `   Phone: ${metadata.phone}` : null,
          ``,
          `⏰ Scheduled Time:`,
          `   ${formattedDate} at ${formattedTime}`,
          `   Duration: ${durationMinutes} minutes`,
          ``,
          metadata?.phone ? `📱 We will call you at: ${metadata.phone}` : null,
          ``,
          `📝 Call Agenda:`,
          `   • Discuss your current business processes`,
          `   • Identify automation opportunities`,
          `   • Review Easy Day AI solutions`,
          ``,
          `---`,
          ``,
          `🔄 Need to cancel or reschedule?`,
          `Visit: ${siteUrl}/contact`,
          `Use your email (${attendee.email}) to look up and manage this booking.`,
          ``,
          `---`,
          `Booked via Easy Day AI | https://easydayai.com`
        ].filter(Boolean).join('\n');

        const eventData = {
          title: `Easy Day AI Call - ${attendee.name}`,
          busy: true,
          participants: [
            {
              name: attendee.name,
              email: attendee.email,
              status: "yes"
            }
          ],
          description: descriptionParts,
          location: metadata?.phone ? `Phone Call: ${metadata.phone}` : "Phone Call",
          when: {
            start_time: Math.floor(startDate.getTime() / 1000),
            end_time: Math.floor(endDate.getTime() / 1000),
            start_timezone: timeZone || "America/New_York",
            end_timezone: timeZone || "America/New_York"
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

      case "getBooking": {
        // Get a specific booking/event by ID
        const { eventId } = params;

        if (!eventId) {
          return new Response(
            JSON.stringify({ error: "eventId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const url = `${NYLAS_API_URL}/grants/${NYLAS_GRANT_ID}/events/${eventId}?calendar_id=primary`;
        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        const data = await response.json();
        console.log(`Nylas get event response status: ${response.status}`, JSON.stringify(data).slice(0, 500));

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: data.message || "Event not found", details: data }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ status: "success", event: data.data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancelBooking": {
        // Delete/cancel a booking
        const { eventId } = params;

        if (!eventId) {
          return new Response(
            JSON.stringify({ error: "eventId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Cancelling event: ${eventId}`);

        const url = `${NYLAS_API_URL}/grants/${NYLAS_GRANT_ID}/events/${eventId}?calendar_id=primary&notify_participants=true`;
        const response = await fetch(url, {
          method: "DELETE",
          headers,
        });

        if (!response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({ error: data.message || "Failed to cancel booking", details: data }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Event ${eventId} cancelled successfully`);

        return new Response(
          JSON.stringify({ status: "success", message: "Booking cancelled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "rescheduleBooking": {
        // Reschedule a booking to a new time
        const { eventId, newStart, durationMinutes: rescheduleDuration = 15, timeZone: rescheduleTimeZone } = params;

        if (!eventId || !newStart) {
          return new Response(
            JSON.stringify({ error: "eventId and newStart are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const newStartDate = new Date(newStart);
        const newEndDate = new Date(newStartDate.getTime() + rescheduleDuration * 60 * 1000);

        console.log(`Rescheduling event ${eventId} to ${newStart}`);

        const updateData = {
          when: {
            start_time: Math.floor(newStartDate.getTime() / 1000),
            end_time: Math.floor(newEndDate.getTime() / 1000),
            start_timezone: rescheduleTimeZone || "America/New_York",
            end_timezone: rescheduleTimeZone || "America/New_York"
          }
        };

        const url = `${NYLAS_API_URL}/grants/${NYLAS_GRANT_ID}/events/${eventId}?calendar_id=primary&notify_participants=true`;
        const response = await fetch(url, {
          method: "PUT",
          headers,
          body: JSON.stringify(updateData),
        });

        const data = await response.json();
        console.log(`Nylas reschedule response status: ${response.status}`, JSON.stringify(data).slice(0, 500));

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: data.message || "Failed to reschedule", details: data }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ status: "success", event: data.data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sendConfirmationEmail": {
        // Send confirmation email with cancel/reschedule links
        const { eventId, attendeeEmail, attendeeName, appointmentDate, appointmentTime, phone } = params;

        if (!eventId || !attendeeEmail || !attendeeName) {
          return new Response(
            JSON.stringify({ error: "eventId, attendeeEmail, and attendeeName are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get the site URL for links
        const siteUrl = Deno.env.get("SITE_URL") || "https://easydayai.com";
        const manageUrl = `${siteUrl}/contact?manage=${eventId}&email=${encodeURIComponent(attendeeEmail)}`;

        const emailBody = {
          subject: "Your Easy Day AI Consultation is Confirmed! 🎉",
          body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; color: white;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Easy Day AI</h1>
        <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px;">Your consultation is confirmed</p>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #e2e8f0;">📅 Appointment Details</h2>
        <p style="margin: 8px 0; color: #cbd5e1;"><strong>Date:</strong> ${appointmentDate}</p>
        <p style="margin: 8px 0; color: #cbd5e1;"><strong>Time:</strong> ${appointmentTime}</p>
        <p style="margin: 8px 0; color: #cbd5e1;"><strong>Duration:</strong> 15 minutes</p>
        ${phone ? `<p style="margin: 8px 0; color: #cbd5e1;"><strong>Phone:</strong> ${phone}</p>` : ''}
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #e2e8f0;">📋 What to Expect</h2>
        <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
          <li style="margin-bottom: 8px;">We'll call you at the scheduled time</li>
          <li style="margin-bottom: 8px;">Discuss your current business processes</li>
          <li style="margin-bottom: 8px;">Identify automation opportunities</li>
          <li style="margin-bottom: 8px;">Review Easy Day AI solutions</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 16px;">Need to make changes?</p>
        <a href="${manageUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Cancel or Reschedule</a>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
        <p style="margin: 0; color: #64748b; font-size: 12px;">Booking ID: ${eventId}</p>
        <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">
          Questions? Reply to this email or contact us at hello@easydayai.com
        </p>
      </div>
    </div>
  </div>
</body>
</html>
          `,
          to: [{ name: attendeeName, email: attendeeEmail }]
        };

        console.log(`Sending confirmation email to ${attendeeEmail} for event ${eventId}`);

        const emailUrl = `${NYLAS_API_URL}/grants/${NYLAS_GRANT_ID}/messages/send`;
        const emailResponse = await fetch(emailUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(emailBody),
        });

        const emailData = await emailResponse.json();
        console.log(`Nylas email response status: ${emailResponse.status}`, JSON.stringify(emailData).slice(0, 500));

        if (!emailResponse.ok) {
          return new Response(
            JSON.stringify({ error: emailData.message || "Failed to send email", details: emailData }),
            { status: emailResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ status: "success", message: "Confirmation email sent" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "findBookingByEmail": {
        // Find bookings by attendee email
        const { email } = params;

        if (!email) {
          return new Response(
            JSON.stringify({ error: "email is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log(`Finding bookings for email: ${email}`);

        // Get events from the calendar
        const now = Math.floor(Date.now() / 1000);
        const futureDate = now + (30 * 24 * 60 * 60); // 30 days from now
        
        const url = `${NYLAS_API_URL}/grants/${NYLAS_GRANT_ID}/events?calendar_id=primary&start=${now}&end=${futureDate}&limit=50`;
        const response = await fetch(url, {
          method: "GET",
          headers,
        });

        const data = await response.json();
        console.log(`Nylas events response status: ${response.status}`, JSON.stringify(data).slice(0, 500));

        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: data.message || "Failed to fetch events", details: data }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Filter events by attendee email
        const matchingEvents = (data.data || []).filter((event: { participants?: Array<{ email?: string }> }) => {
          return event.participants?.some((p: { email?: string }) => 
            p.email?.toLowerCase() === email.toLowerCase()
          );
        });

        console.log(`Found ${matchingEvents.length} bookings for ${email}`);

        return new Response(
          JSON.stringify({ status: "success", events: matchingEvents }),
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
