import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface IntentContext {
  currentStep: number;
  currentFocus?: string;
  recentInteractions?: any[];
  formData: any;
  activeUI?: string;
}

interface AnalyzedIntent {
  type: 'provide_info' | 'correction' | 'navigation' | 'bulk_operation' | 'question' | 'confirmation' | 'add_item' | 'remove_item' | 'edit_item' | 'review';
  confidence: number;
  entities: {
    field?: string;
    value?: any;
    target?: string;
    index?: number;
  };
  suggestedAction: {
    type: 'update_field' | 'show_ui' | 'navigate' | 'confirm' | 'ask_clarification';
    params?: any;
  };
  naturalResponse: string;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input, context, formData } = await req.json() as { 
      input: string; 
      context: IntentContext; 
      formData: any;
    };

    console.log('Analyzing intent:', { input, currentStep: context.currentStep });

    // Create system prompt based on current context
    const systemPrompt = `You are analyzing user intent in a 7-step profile builder conversation.
    
Current context:
- Step ${context.currentStep}: ${getStepName(context.currentStep)}
- Current focus: ${context.currentFocus || 'general'}
- Form data collected: ${JSON.stringify(formData, null, 2)}

Analyze the user's input and determine:
1. What they're trying to do (intent type)
2. What specific data or fields they're referring to
3. The best action to take
4. A natural response

Intent types:
- provide_info: User is giving new information
- correction: User is correcting something previously entered
- navigation: User wants to go to a different step or review something
- bulk_operation: User wants to do something to multiple items
- question: User is asking for clarification
- confirmation: User is confirming something
- add_item: User wants to add a new item (job, education, etc)
- remove_item: User wants to remove something
- edit_item: User wants to edit a specific item
- review: User wants to see what they've entered

Return JSON in this exact format:
{
  "type": "intent_type",
  "confidence": 0.95,
  "entities": {
    "field": "field_name_if_applicable",
    "value": "extracted_value_if_any",
    "target": "what_they're_referring_to",
    "index": 0
  },
  "suggestedAction": {
    "type": "action_type",
    "params": {}
  },
  "naturalResponse": "Natural language response to the user"
}`;

    const userPrompt = `User input: "${input}"
    
Examples of expected analysis:
- "I'm a software engineer" → provide_info with field: title
- "Actually make that senior software engineer" → correction with field: title  
- "Add another job" → add_item with target: work_experience
- "Change the year to 2020" → correction with field: year
- "Show me my education" → navigation with target: education
- "Remove the second one" → remove_item with index: 1
- "I work with 10 people" → provide_info with field: teamSize`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const result = JSON.parse(data.choices[0].message.content) as AnalyzedIntent;
    console.log('Intent analysis result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-profile-intent:', error);
    
    // Return a fallback intent
    return new Response(
      JSON.stringify({
        type: 'question',
        confidence: 0.5,
        entities: {},
        suggestedAction: {
          type: 'ask_clarification'
        },
        naturalResponse: "I didn't quite understand that. Could you rephrase?"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});

function getStepName(step: number): string {
  const steps = [
    'Initial greeting',
    'CV Upload',
    'Work Experience', 
    'Education',
    'Skills Review',
    'Current Work Context',
    'Professional Challenges',
    'Growth Opportunities'
  ];
  return steps[step] || 'Unknown';
}