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
  description: string;
  skills: string[];
  experience_level: string;
  salary_range: string;
  scraped_at: string;
};

function parseLinkedInJobs(html: string, location: string, limit: number): ParsedJob[] {
  const results: ParsedJob[] = [];

  // Extract job cards - LinkedIn typically wraps each job in a div with base-card class
  const jobCardRegex = /<div[^>]*class="[^"]*base-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  const jobCards: string[] = [];
  let cardMatch: RegExpExecArray | null;
  while ((cardMatch = jobCardRegex.exec(html)) !== null && jobCards.length < limit) {
    jobCards.push(cardMatch[1]);
  }

  // If no cards found, fall back to simpler parsing
  if (jobCards.length === 0) {
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
        description: '',
        skills: [],
        experience_level: 'Not specified',
        salary_range: 'Not specified',
        scraped_at: new Date().toISOString()
      });
    }
  } else {
    // Parse each job card for detailed information
    for (const card of jobCards.slice(0, limit)) {
      // Extract title
      const titleMatch = /<h3[^>]*>([\s\S]*?)<\/h3>/i.exec(card);
      const title = titleMatch ? stripHtml(titleMatch[1]) : 'Unknown';

      // Extract company
      const companyMatch = /<h4[^>]*>([\s\S]*?)<\/h4>/i.exec(card);
      const company = companyMatch ? stripHtml(companyMatch[1]) : 'Unknown Company';

      // Extract location (sometimes in a span with location class)
      const locationMatch = /<span[^>]*class="[^"]*location[^"]*"[^>]*>([\s\S]*?)<\/span>/i.exec(card);
      const jobLocation = locationMatch ? stripHtml(locationMatch[1]) : location;

      // Extract description/snippet if available
      const descMatch = /<div[^>]*class="[^"]*snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(card) ||
                       /<p[^>]*>([\s\S]*?)<\/p>/i.exec(card);
      const description = descMatch ? stripHtml(descMatch[1]).substring(0, 500) : '';

      // Try to extract salary if mentioned
      const salaryMatch = /\$[\d,]+\s*-?\s*\$?[\d,]*|€[\d,]+\s*-?\s*€?[\d,]*|£[\d,]+\s*-?\s*£?[\d,]*/i.exec(card);
      const salary = salaryMatch ? salaryMatch[0] : 'Not specified';

      // Extract experience level from title or description
      let experienceLevel = 'Not specified';
      const expPatterns = {
        'Entry': /entry|junior|graduate|intern/i,
        'Mid': /mid|intermediate|[2-5]\+?\s*years/i,
        'Senior': /senior|lead|principal|staff|[5-9]\+?\s*years/i,
        'Executive': /executive|director|vp|president|c-level/i
      };
      
      for (const [level, pattern] of Object.entries(expPatterns)) {
        if (pattern.test(title) || pattern.test(description)) {
          experienceLevel = level;
          break;
        }
      }

      // Extract skills from description - look for common tech keywords
      const skillKeywords = [
        'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
        'SQL', 'MongoDB', 'TypeScript', 'Angular', 'Vue', 'Machine Learning', 'AI', 'DevOps',
        'CI/CD', 'Git', 'Agile', 'Scrum', 'REST', 'API', 'Cloud', 'Azure', 'GCP',
        'Microservices', 'Spring', 'Django', 'Flask', '.NET', 'C#', 'Ruby', 'Rails',
        'Golang', 'Rust', 'Swift', 'iOS', 'Android', 'Mobile', 'Frontend', 'Backend',
        'Full Stack', 'Data Science', 'Analytics', 'Tableau', 'Power BI', 'Salesforce'
      ];

      const foundSkills: string[] = [];
      const combinedText = `${title} ${description}`.toLowerCase();
      for (const skill of skillKeywords) {
        if (combinedText.includes(skill.toLowerCase())) {
          foundSkills.push(skill);
        }
      }

      results.push({
        title,
        company,
        location: jobLocation,
        description,
        skills: foundSkills,
        experience_level: experienceLevel,
        salary_range: salary,
        scraped_at: new Date().toISOString()
      });
    }
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

    // Define tools for the market research and analysis agent
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
          name: "analyze_skill_trends",
          description: "Analyze skill trends from scraped job market data",
          parameters: {
            type: "object",
            properties: {
              job_data: {
                type: "array",
                description: "Array of job postings with skills data",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    location: { type: "string" },
                    skills: { type: "array", items: { type: "string" } },
                    salary_range: { type: "string" },
                    experience_level: { type: "string" }
                  }
                }
              },
              focus_area: {
                type: "string",
                description: "Area to focus analysis on"
              }
            },
            required: ["job_data", "focus_area"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "analyze_salary_trends",
          description: "Analyze salary trends and compensation patterns",
          parameters: {
            type: "object",
            properties: {
              job_data: {
                type: "array",
                description: "Job postings with salary information",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    salary_range: { type: "string" },
                    location: { type: "string" },
                    experience_level: { type: "string" }
                  }
                }
              }
            },
            required: ["job_data"]
          }
        }
      },
      {
        type: "function" as const,
        function: {
          name: "generate_market_insights",
          description: "Generate comprehensive market insights report",
          parameters: {
            type: "object",
            properties: {
              scraped_data: {
                type: "object",
                description: "All scraped job data"
              },
              skill_analysis: {
                type: "object",
                description: "Results from skill trend analysis"
              },
              salary_analysis: {
                type: "object",
                description: "Results from salary analysis"
              },
              request_id: {
                type: "string",
                description: "Original request ID"
              }
            },
            required: ["scraped_data", "request_id"]
          }
        }
      }
    ];

    // Create initial prompt based on request
    const locations = [...regions, ...countries].join(', ');
    const systemPrompt = `You are a Market Intelligence Agent specialized in scraping and analyzing job market data. 
    
    Your task is to:
    1. Scrape relevant job postings from LinkedIn for the specified locations: ${locations}
    2. Focus on ${focus_area} related positions
    3. Analyze skill trends and identify the most in-demand skills
    4. Analyze salary trends and compensation patterns
    5. Generate comprehensive market insights and recommendations
    
    Use the available tools to complete this research and analysis systematically. 
    IMPORTANT: You must call scrape_linkedin_jobs first, then analyze the data, and finally generate insights.`;

    const userPrompt = custom_prompt || `Research and analyze job market data for ${locations} focusing on ${focus_area}. Scrape job postings, analyze trends, and provide actionable insights.`;

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
            
          case "analyze_skill_trends":
            console.log('[Market Research Agent] Analyzing skill trends...');
            await supabase
              .from('market_intelligence_requests')
              .update({
                status: 'analyzing',
                status_message: 'Analyzing skill trends and market demand...',
                updated_at: new Date().toISOString()
              })
              .eq('id', request_id);
            
            // Analyze the scraped job data for skill trends
            const jobData = functionArgs.job_data || [];
            const skillFrequency: Record<string, number> = {};
            const experienceLevels: Record<string, number> = {};
            
            jobData.forEach((job: any) => {
              // Count skill frequency
              (job.skills || []).forEach((skill: string) => {
                skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
              });
              
              // Count experience levels
              if (job.experience_level && job.experience_level !== 'Not specified') {
                experienceLevels[job.experience_level] = (experienceLevels[job.experience_level] || 0) + 1;
              }
            });
            
            // Sort skills by frequency
            const topSkills = Object.entries(skillFrequency)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([skill, count]) => ({
                skill,
                demand: count,
                percentage: Math.round((count / jobData.length) * 100)
              }));
            
            result = {
              total_jobs_analyzed: jobData.length,
              top_skills: topSkills,
              experience_distribution: experienceLevels,
              analysis_summary: `Analyzed ${jobData.length} job postings. Top skills: ${topSkills.slice(0, 3).map(s => s.skill).join(', ')}`
            };
            break;
            
          case "analyze_salary_trends":
            console.log('[Market Research Agent] Analyzing salary trends...');
            await supabase
              .from('market_intelligence_requests')
              .update({
                status_message: 'Analyzing compensation trends and salary ranges...',
                updated_at: new Date().toISOString()
              })
              .eq('id', request_id);
            
            const salaryData = functionArgs.job_data || [];
            const salariesByLevel: Record<string, string[]> = {};
            let salaryCount = 0;
            
            salaryData.forEach((job: any) => {
              if (job.salary_range && job.salary_range !== 'Not specified') {
                salaryCount++;
                const level = job.experience_level || 'Unknown';
                if (!salariesByLevel[level]) salariesByLevel[level] = [];
                salariesByLevel[level].push(job.salary_range);
              }
            });
            
            result = {
              jobs_with_salary: salaryCount,
              total_jobs: salaryData.length,
              salary_transparency: Math.round((salaryCount / salaryData.length) * 100),
              salaries_by_level: salariesByLevel,
              analysis_summary: `${salaryCount} out of ${salaryData.length} jobs (${Math.round((salaryCount / salaryData.length) * 100)}%) include salary information`
            };
            break;
            
          case "generate_market_insights":
            console.log('[Market Research Agent] Generating final market insights...');
            await supabase
              .from('market_intelligence_requests')
              .update({
                status_message: 'Generating comprehensive market insights report...',
                updated_at: new Date().toISOString()
              })
              .eq('id', request_id);
            
            const scrapedData = functionArgs.scraped_data || {};
            const skillAnalysis = functionArgs.skill_analysis || {};
            const salaryAnalysis = functionArgs.salary_analysis || {};
            
            // Generate comprehensive insights report
            const insights = `# Market Intelligence Report

## Executive Summary
Based on analysis of ${scrapedData.total_scraped || 0} job postings in ${locations}, here are the key findings:

## Skill Trends
${skillAnalysis.top_skills ? skillAnalysis.top_skills.slice(0, 5).map((s: any) => 
  `- **${s.skill}**: ${s.percentage}% of jobs (${s.demand} postings)`
).join('\n') : '- No skill data available'}

## Experience Requirements
${skillAnalysis.experience_distribution ? Object.entries(skillAnalysis.experience_distribution).map(([level, count]) => 
  `- **${level}**: ${count} positions`
).join('\n') : '- No experience level data available'}

## Salary Insights
- Salary transparency: ${salaryAnalysis.salary_transparency || 0}% of jobs include salary information
- Jobs with salary data: ${salaryAnalysis.jobs_with_salary || 0} out of ${salaryAnalysis.total_jobs || 0}

## Key Recommendations
1. Focus on upskilling in the most in-demand technologies
2. Consider the experience level distribution when planning hiring
3. ${salaryAnalysis.salary_transparency > 50 ? 'Good salary transparency in this market' : 'Limited salary transparency - negotiate carefully'}

## Action Items
1. Prioritize training in top skills identified
2. Align job descriptions with market standards
3. Review compensation against market benchmarks

*Generated on ${new Date().toISOString()}*`;

            // Save insights to database
            await supabase
              .from('market_intelligence_requests')
              .update({
                status: 'completed',
                status_message: 'Analysis complete! Market insights ready.',
                ai_insights: insights,
                scraped_data: scrapedData,
                updated_at: new Date().toISOString()
              })
              .eq('id', functionArgs.request_id);
            
            console.log('[Market Research Agent] Analysis completed successfully');
            
            result = {
              report_generated: true,
              insights: insights,
              database_updated: true
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
      console.log('[Market Research Agent] All processing completed successfully');
      
      return new Response(JSON.stringify({
        success: true,
        agent: "market-research-agent",
        request_id,
        ai_response: aiMessage.content,
        tool_calls: toolResults,
        status: "Analysis completed"
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