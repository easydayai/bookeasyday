import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const applicationData = await req.json();
    console.log('Received application submission:', { 
      email: applicationData.email,
      name: `${applicationData.firstName} ${applicationData.lastName}`
    });

    // Validate minimum required fields
    const requiredFields = {
      firstName: applicationData.firstName || 'Not',
      lastName: applicationData.lastName || 'Provided',
      email: applicationData.email || 'noemail@example.com',
      phone: applicationData.phone || '0000000000',
      city: applicationData.city || 'Not Provided',
      state: applicationData.state || 'N/A'
    };

    // Insert application into database
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        user_id: applicationData.userId || null,
        applicant_name: `${requiredFields.firstName} ${requiredFields.lastName}`,
        email: requiredFields.email,
        phone: requiredFields.phone,
        address: applicationData.address || null,
        city: requiredFields.city,
        state: requiredFields.state,
        desired_move_in_date: applicationData.moveInDate || null,
        monthly_income: applicationData.income ? parseFloat(applicationData.income) : null,
        bedroom_count: applicationData.bedrooms ? parseInt(applicationData.bedrooms) : null,
        employment_type: applicationData.employmentStatus || null,
        status: 'pending',
        background_info: {
          dob: applicationData.dob,
          zip: applicationData.zip,
          desiredCity: applicationData.desiredCity,
          desiredState: applicationData.desiredState,
          budget: applicationData.budget,
          bathrooms: applicationData.bathrooms,
          pets: applicationData.pets,
          assistance: applicationData.assistance,
          employer: applicationData.employer,
          jobTitle: applicationData.jobTitle,
          timeAtJob: applicationData.timeAtJob,
          payFrequency: applicationData.payFrequency,
          additionalIncome: applicationData.additionalIncome,
          creditScore: applicationData.creditScore,
          evictions: applicationData.evictions,
          criminalHistory: applicationData.criminalHistory,
          references: [
            {
              name: applicationData.ref1Name,
              relationship: applicationData.ref1Relationship,
              phone: applicationData.ref1Phone,
            },
            {
              name: applicationData.ref2Name,
              relationship: applicationData.ref2Relationship,
              phone: applicationData.ref2Phone,
            },
          ],
        },
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Database error:', applicationError);
      throw applicationError;
    }

    console.log('Application created successfully:', application.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        applicationId: application.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in submit-application function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to submit application' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
