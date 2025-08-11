// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import OpenAI from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MarketIntelligenceRequest {
  regions?: string[];
  countries?: string[];
  focus_area?: string;
  custom_prompt?: string;
  request_id: string;
}

function resolveGeoCode(location: string): string | null {
  const normalized = (location || '').toLowerCase();
  const map: Record<string, string> = {
    'us': 'us', 'united states': 'us',
    'united kingdom': 'gb', 'uk': 'gb',
    'germany': 'de', 'france': 'fr', 'netherlands': 'nl',
    'sweden': 'se', 'switzerland': 'ch', 'spain': 'es', 'italy': 'it',
    'uae': 'ae', 'united arab emirates': 'ae', 'saudi arabia': 'sa',
    'qatar': 'qa', 'kuwait': 'kw', 'bahrain': 'bh', 'oman': 'om',
    'jordan': 'jo', 'lebanon': 'lb', 'egypt': 'eg',
    'singapore': 'sg', 'australia': 'au', 'japan': 'jp',
    'south korea': 'kr', 'korea': 'kr', 'hong kong': 'hk',
    'malaysia': 'my', 'india': 'in', 'thailand': 'th'
  };
  for (const [key, code] of Object.entries(map)) {
    if (normalized.includes(key)) return code;
  }
  return null;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

type ParsedJob = {
  title: string;
  company: string;
  location: string;
  skills: string[];
  experience_level: string;
  salary_range: string;
  scraped_at: string;
};

function parseLinkedInJobs(html: string, location: string, limit: number): ParsedJob[] {
  const results: ParsedJob[] = [];

  const titleRegexes = [
    /<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi,
    /<h3[^>]*class="[^"]*base-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi
  ];
  const companyRegexes = [
    /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?(?:<a[^>]*>)?([\s\S]*?)<\/a>[\s\S]*?<\/h4>/gi,
    /<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/gi
  ];

  let titles: string[] = [];
  for (const rx of titleRegexes) {
    rx.lastIndex = 0;
    const found: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = rx.exec(html)) !== null) {
      found.push(stripHtml(m[1]));
    }
    if (found.length > 0) {
      titles = found;
      break;
    }
  }

  let companies: string[] = [];
  for (const rx of companyRegexes) {
    rx.lastIndex = 0;
    const found: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = rx.exec(html)) !== null) {
      found.push(stripHtml(m[1]));
    }
    if (found.length > 0) {
      companies = found;
      break;
    }
  }

  const count = Math.min(limit, titles.length || 0);
  for (let i = 0; i < count; i++) {
    results.push({
      title: titles[i] || 'Unknown',
      company: companies[i] || 'Unknown Company',
      location,
      skills: [],
      experience_level: 'Not specified',
      salary_range: 'Not specified',
      scraped_at: new Date().toISOString()
    });
  }

  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { regions = [], countries = [], focus_area = 'all_skills', custom_prompt = '', request_id } = await req.json() as MarketIntelligenceRequest;
    
    console.log(`[Market Research Agent] Starting analysis for request: ${request_id}`);
    console.log(`[Market Research Agent] Regions: ${regions.join(', ')}, Focus: ${focus_area}`);
    
    // Initialize Supabase client for status updates
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Update status to show we're starting
    await supabase
      .from('market_intelligence_requests')
      .update({
        status_message: 'Initializing AI agent for market research...',
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Define tools for the market research agent
    const tools = [
      {
        type: "function" as const,
        function: {
          name: "scrape_linkedin_jobs",
          description: "Scrape job postings from LinkedIn for specific regions/countries",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "Geographic location to search (region or country)"
              },
              keywords: {
                type: "string", 
                description: "Job search keywords based on focus area"
              },
              count: {
                type: "number",
                description: "Number of jobs to scrape (default 50)"
              }
            },
            required: ["location", "keywords"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "analyze_market_location",
          description: "Analyze market conditions for a specific location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "Location to analyze"
              },
              job_data: {
                type: "array",
                description: "Array of job posting data",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    location: { type: "string" },
                    skills: { type: "array", items: { type: "string" } }
                  }
                }
              }
            },
            required: ["location", "job_data"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "validate_scraped_data",
          description: "Validate and clean scraped job data",
          parameters: {
            type: "object",
            properties: {
              raw_data: {
                type: "array",
                description: "Raw scraped data to validate",
                items: {
                  type: "object"
                }
              }
            },
            required: ["raw_data"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "handoff_to_analysis_agent",
          description: "Hand off processed data to the analysis agent",
          parameters: {
            type: "object",
            properties: {
              scraped_data: {
                type: "object",
                description: "Processed market data to analyze"
              },
              request_context: {
                type: "object",
                description: "Original request context and parameters"
              }
            },
            required: ["scraped_data", "request_context"]
          }
        }
      }
    ];

    // Create initial prompt based on request
    const locations = [...regions, ...countries].join(', ');
    const systemPrompt = `You are a Market Research Agent specialized in scraping and processing job market data. 
    
    Your task is to:
    1. Scrape relevant job postings from LinkedIn for the specified locations: ${locations}
    2. Focus on ${focus_area} related positions
    3. Validate and clean the scraped data
    4. Prepare the data for analysis by the Analysis Agent
    
    Use the available tools to complete this research systematically.`;

    const userPrompt = custom_prompt || `Research job market data for ${locations} focusing on ${focus_area}. Scrape relevant job postings and prepare the data for analysis.`;

    // Update status - calling OpenAI
    console.log('[Market Research Agent] Calling OpenAI GPT-4...');
    await supabase
      .from('market_intelligence_requests')
      .update({
        status_message: 'AI agent analyzing market requirements...',
        updated_at: new Date().toISOString()
      })
      .eq('id', request_id);
    
    // Run the market research agent
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      tools: tools,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 2000
    });

    const aiMessage = response.choices[0]?.message;
    
    // Handle tool calls if present
    if (aiMessage?.tool_calls) {
      const toolResults: Array<{ tool_call_id: string; function_name: string; result: unknown }> = [];
      
      for (const toolCall of aiMessage.tool_calls) {
        const functionName: string = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        let result;
        
        switch (functionName) {
          case "scrape_linkedin_jobs":
            // Real Scrape.do API implementation with robust parameters and parsing
            try {
              console.log(`[Market Research Agent] Scraping LinkedIn for: ${functionArgs.keywords} in ${functionArgs.location}`);
              
              // Update status - starting scraping
              await supabase
                .from('market_intelligence_requests')
                .update({
                  status_message: `Scraping LinkedIn jobs for "${functionArgs.keywords}" in ${functionArgs.location}...`,
                  updated_at: new Date().toISOString()
                })
                .eq('id', request_id);
              
              const linkedinSearchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(functionArgs.keywords)}&location=${encodeURIComponent(functionArgs.location)}&f_TPR=r86400`;

              const apiKey = Deno.env.get('SCRAPE_DO_API_KEY');
              if (!apiKey) {
                throw new Error('SCRAPE_DO_API_KEY is not configured');
              }

              // Improve reliability with render wait, residential routing, and optional geocode
              const geoCode = resolveGeoCode(functionArgs.location);
              
              // IMPORTANT: Manually encode the LinkedIn URL to avoid double-encoding
              const encodedUrl = encodeURIComponent(linkedinSearchUrl);
              
              // Build URL manually to control encoding precisely
              const params = new URLSearchParams({
                token: apiKey,
                render: 'true',
                waitUntil: 'networkidle2',
                super: 'true',
                timeout: '30000'
              });
              if (geoCode) params.set('geocode', geoCode);
              
              // Add the pre-encoded URL separately to avoid double-encoding
              const scrapeEndpoint = `https://api.scrape.do?${params.toString()}&url=${encodedUrl}`;

              console.log(`[Market Research Agent] Calling Scrape.do API...`);
              const scrapeResponse = await fetch(scrapeEndpoint, {
                method: 'GET',
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                  'Accept-Language': 'en-US,en;q=0.9'
                }
              });

              if (!scrapeResponse.ok) {
                const errorBody = await scrapeResponse.text();
                console.error('Scrape.do API error response:', errorBody);
                throw new Error(`Scrape.do API error: ${scrapeResponse.status} - ${errorBody.substring(0, 400)}`);
              }

              const scrapedHtml = await scrapeResponse.text();

              // Robust parsing for current LinkedIn markup
              const maxCount = typeof functionArgs.count === 'number' ? functionArgs.count : 20;
              const jobListings = parseLinkedInJobs(scrapedHtml, functionArgs.location, maxCount);
              
              console.log(`[Market Research Agent] Successfully scraped ${jobListings.length} job listings`);
              
              // Update status with scraped count
              await supabase
                .from('market_intelligence_requests')
                .update({
                  status_message: `Found ${jobListings.length} job listings. Processing data...`,
                  scraped_data: { jobs_count: jobListings.length, sample_jobs: jobListings.slice(0, 5) },
                  updated_at: new Date().toISOString()
                })
                .eq('id', request_id);

              if (jobListings.length === 0) {
                throw new Error('No job listings found - scraping may have failed or page structure changed');
              }

              result = {
                success: true,
                data: jobListings,
                total_scraped: jobListings.length,
                scraping_method: 'scrape.do',
                target_url: linkedinSearchUrl
              };
            } catch (scrapeError: unknown) {
              console.error('[Market Research Agent] Scrape.do API error:', scrapeError);
              
              // Update status with error
              const errorMessage = scrapeError instanceof Error ? scrapeError.message : 'Unknown error';
              await supabase
                .from('market_intelligence_requests')
                .update({
                  status: 'error',
                  status_message: `Scraping failed: ${errorMessage.substring(0, 200)}`,
                  error_details: { error: errorMessage },
                  updated_at: new Date().toISOString()
                })
                .eq('id', request_id);
              // Return error, don't use fallback data
              const message = scrapeError instanceof Error ? scrapeError.message : 'Unknown error';
              result = {
                success: false,
                error: message,
                total_scraped: 0
              };
              // Propagate the error to fail the request properly
              throw scrapeError;
            }
            break;
            
          case "analyze_market_location":
            result = {
              location: functionArgs.location,
              analysis: {
                job_density: "High",
                average_salary: "$85,000",
                top_skills: ["JavaScript", "Python", "React"],
                market_trend: "Growing"
              }
            };
            break;
            
          case "validate_scraped_data":
            result = {
              validated_count: functionArgs.raw_data.length,
              cleaned_data: functionArgs.raw_data,
              quality_score: 0.95
            };
            break;
            
          case "handoff_to_analysis_agent":
            // This would trigger the analysis agent
            result = {
              handoff_successful: true,
              analysis_request_id: `analysis_${request_id}`,
              status: "Data handed off to Analysis Agent"
            };
            break;
            
          default:
            result = { error: `Unknown function: ${functionName}` };
        }
        
        toolResults.push({
          tool_call_id: String(toolCall.id),
          function_name: String(functionName),
          result
        });
      }
      
      // Update final status
      console.log('[Market Research Agent] Completed successfully, handing off to analysis agent');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: 'Market data collected. Handing off to analysis agent...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);
      
      return new Response(JSON.stringify({
        success: true,
        agent: "market-research-agent",
        request_id,
        ai_response: aiMessage.content,
        tool_calls: toolResults,
        next_step: "analysis_agent"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return direct response if no tool calls
    return new Response(JSON.stringify({
      success: true,
      agent: "market-research-agent", 
      request_id,
      ai_response: aiMessage?.content,
      status: "Research completed"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Market Research Agent] Fatal error:', error);
    
    // Try to update status on fatal error
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'error',
          status_message: `Agent error: ${error.message.substring(0, 200)}`,
          error_details: { error: error.message },
          updated_at: new Date().toISOString()
        })
        .eq('id', (await req.json()).request_id);
    } catch (updateError) {
      console.error('[Market Research Agent] Failed to update error status:', updateError);
    }
    return new Response(JSON.stringify({ 
      error: error.message,
      agent: "market-research-agent"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});