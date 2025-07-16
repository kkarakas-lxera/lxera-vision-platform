import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const systemPrompt = `You are an expert CV analyzer. Extract structured data from the CV text to populate an employee profile.

Extract the following information in a structured JSON format:
{
  "basicInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "headline": "string (professional title/tagline)",
    "summary": "string (professional summary)"
  },
  "workExperience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null if current",
      "isCurrent": boolean,
      "description": "string",
      "location": "string",
      "technologies": ["array of technologies used"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "grade": "string (optional)",
      "activities": "string (optional)",
      "description": "string (optional)"
    }
  ],
  "skills": [
    {
      "name": "string",
      "proficiency": "beginner|intermediate|advanced|expert",
      "category": "technical|soft|language|other"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "dateIssued": "YYYY-MM-DD",
      "expirationDate": "YYYY-MM-DD or null",
      "credentialId": "string (optional)",
      "credentialUrl": "string (optional)"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "basic|conversational|professional|native"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "role": "string",
      "technologies": ["array of technologies"],
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD or null",
      "url": "string (optional)"
    }
  ],
  "tools": [
    {
      "name": "string",
      "category": "ide|database|cloud|framework|language|devops|design|project_management|other",
      "proficiency": "beginner|intermediate|advanced|expert",
      "yearsExperience": number
    }
  ]
}

Important instructions:
1. Infer proficiency levels based on years of experience and context
2. Extract all technologies mentioned and categorize them appropriately
3. For current positions, set endDate to null and isCurrent to true
4. Standardize date formats to YYYY-MM-DD
5. If a date is partial (e.g., "2023"), assume January 1st
6. Extract both explicitly stated and implied tools/technologies
7. Be comprehensive but accurate - don't invent information not in the CV`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { cvText, employeeId } = await req.json();
    
    if (!cvText) {
      throw new Error('CV text is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call OpenAI to analyze the CV
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please analyze this CV and extract structured data:\n\n${cvText}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const extractedData = JSON.parse(completion.choices[0].message.content || "{}");

    // Store the analysis results
    if (employeeId) {
      const { error } = await supabase
        .from('employees')
        .update({
          cv_analysis_data: extractedData,
          cv_uploaded_at: new Date().toISOString(),
          cv_data_verified: false
        })
        .eq('id', employeeId);

      if (error) {
        console.error('Error updating employee:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        message: 'CV analyzed successfully. Please review and edit the extracted information.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('CV analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});