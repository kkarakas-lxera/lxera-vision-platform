import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Test webhook received:', req.method, req.url);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    // Log everything for debugging
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, eventType, formId } = payload;

    // Extract form data from Tally's structure
    const fields = data.fields || [];
    const fieldMap: any = {};
    
    // Convert array of fields to a map for easier access
    fields.forEach((field: any) => {
      console.log(`Processing field: ${field.label} = ${JSON.stringify(field.value)}`);
      
      if (field.type === 'MULTIPLE_CHOICE' && Array.isArray(field.value)) {
        // For multiple choice, get the text of the selected option
        const selectedOption = field.options?.find((opt: any) => field.value.includes(opt.id));
        fieldMap[field.label.toLowerCase().replace(/[^a-z0-9]/g, '_')] = selectedOption?.text || field.value[0];
        console.log(`Multiple choice mapped: ${field.label} -> ${selectedOption?.text}`);
      } else {
        fieldMap[field.label.toLowerCase().replace(/[^a-z0-9]/g, '_')] = field.value;
      }
    });
    
    console.log('Field map:', fieldMap);
    
    const email = fieldMap.email;
    
    // Test database insertion
    const testData = {
      email: email || 'test@example.com',
      name: fieldMap.what_s_your_name_ || 'Test Name',
      company: fieldMap.where_do_you_work_ || 'Test Company',
      role: fieldMap.i_m_responsible_for___ || 'Test Role',
      use_case: fieldMap.i_need_help_with___ || 'Test Use Case',
      status: 'profile_completed',
      onboarded_at: new Date().toISOString()
    };
    
    console.log('Attempting to insert:', testData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('early_access_leads')
      .insert(testData)
      .select();
      
    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          testData
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Insert successful:', insertResult);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test webhook processed',
        fieldMap,
        insertResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Test webhook error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});