import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('Resend API Key exists:', !!resendApiKey);
    console.log('API Key length:', resendApiKey?.length);
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const resend = new Resend(resendApiKey);
    
    console.log('Attempting to send email to:', email);
    
    const { data, error } = await resend.emails.send({
      from: 'LXERA <onboarding@resend.dev>',
      to: email || 'test@example.com',
      subject: 'Test Email from LXERA',
      html: '<h1>Test Email</h1><p>This is a test email from LXERA edge function.</p>',
      text: 'Test Email - This is a test email from LXERA edge function.'
    });
    
    console.log('Resend response:', { data, error });
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent',
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Test email error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});