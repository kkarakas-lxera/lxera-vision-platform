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
  position_title?: string;
  date_window?: '24h' | '7d' | '30d' | '90d' | 'custom';
  since_date?: string;
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

// Direct execution functions without GPT tool calling
async function executeScraping(
  location: string,
  keywords: string,
  count: number = 20,
  dateWindow?: string
): Promise<any> {
  console.log(`[Market Research Agent] Scraping LinkedIn for: ${keywords} in ${location} (${dateWindow || '24h'})`);
  
  // Map date window to LinkedIn time posted filter
  let timeFilter = 'r86400'; // Default to 24 hours
  if (dateWindow === '24h') {
    timeFilter = 'r86400'; // Past 24 hours
  } else if (dateWindow === '7d') {
    timeFilter = 'r604800'; // Past week
  } else if (dateWindow === '30d' || dateWindow === '90d') {
    timeFilter = 'r2592000'; // Past month (LinkedIn doesn't have 90 days, so we use month)
  }
  
  const linkedinSearchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&f_TPR=${timeFilter}`;

  const apiKey = Deno.env.get('SCRAPE_DO_API_KEY');
  if (!apiKey) {
    throw new Error('SCRAPE_DO_API_KEY is not configured');
  }

  const geoCode = resolveGeoCode(location);
  const encodedUrl = encodeURIComponent(linkedinSearchUrl);
  
  const params = new URLSearchParams({
    token: apiKey,
    // Removed JS render to work with basic plan
    // render: 'true',
    // waitUntil: 'networkidle2',
    super: 'true',
    timeout: '40000',
    customHeaders: 'true'
  });
  if (geoCode) params.set('geocode', geoCode);
  
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
    
    // Check if it's a JS render error and provide helpful message
    if (scrapeResponse.status === 401 && errorBody.includes('JS Render')) {
      console.warn('[Market Research Agent] JS Render not available in current plan - falling back to basic scraping');
      // Could implement alternative scraping method here if needed
    }
    
    throw new Error(`Scrape.do API error: ${scrapeResponse.status} - ${errorBody.substring(0, 400)}`);
  }

  const scrapedHtml = await scrapeResponse.text();
  const jobListings = parseLinkedInJobs(scrapedHtml, location, count);
  
  console.log(`[Market Research Agent] Successfully scraped ${jobListings.length} job listings`);
  
  if (jobListings.length === 0) {
    throw new Error('No job listings found - scraping may have failed or page structure changed');
  }

  return {
    success: true,
    data: jobListings,
    total_scraped: jobListings.length,
    scraping_method: 'scrape.do',
    target_url: linkedinSearchUrl
  };
}

async function analyzeSkillTrends(jobData: any[], focusArea: string): Promise<any> {
  console.log('[Market Research Agent] Analyzing skill trends...');
  
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
  
  return {
    total_jobs_analyzed: jobData.length,
    top_skills: topSkills,
    experience_distribution: experienceLevels,
    analysis_summary: `Analyzed ${jobData.length} job postings. Top skills: ${topSkills.slice(0, 3).map(s => s.skill).join(', ')}`
  };
}

async function analyzeSalaryTrends(jobData: any[]): Promise<any> {
  console.log('[Market Research Agent] Analyzing salary trends...');
  
  const salariesByLevel: Record<string, string[]> = {};
  let salaryCount = 0;
  
  jobData.forEach((job: any) => {
    if (job.salary_range && job.salary_range !== 'Not specified') {
      salaryCount++;
      const level = job.experience_level || 'Unknown';
      if (!salariesByLevel[level]) salariesByLevel[level] = [];
      salariesByLevel[level].push(job.salary_range);
    }
  });
  
  return {
    jobs_with_salary: salaryCount,
    total_jobs: jobData.length,
    salary_transparency: Math.round((salaryCount / jobData.length) * 100),
    salaries_by_level: salariesByLevel,
    analysis_summary: `${salaryCount} out of ${jobData.length} jobs (${Math.round((salaryCount / jobData.length) * 100)}%) include salary information`
  };
}

async function generateMarketInsights(
  scrapedData: any,
  skillAnalysis: any,
  salaryAnalysis: any,
  locations: string,
  openai: OpenAI,
  positionTitle?: string,
  dateWindow?: string
): Promise<string> {
  console.log('[Market Research Agent] Generating enhanced market insights with AI...');
  
  // Create a structured summary for AI enhancement
  const dataContext = {
    total_jobs: scrapedData.total_scraped,
    locations: locations,
    top_skills: skillAnalysis.top_skills,
    experience_distribution: skillAnalysis.experience_distribution,
    salary_transparency: salaryAnalysis.salary_transparency,
    salary_data: salaryAnalysis.salaries_by_level,
    sample_jobs: scrapedData.data.slice(0, 5)
  };

  // Use AI to generate more sophisticated insights
  const aiResponse = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a market intelligence analyst. Generate a comprehensive, actionable market report based on the provided job market data. Focus on:
        1. Key talent trends and skill gaps
        2. Competitive landscape insights
        3. Salary benchmarking recommendations
        4. Strategic hiring recommendations
        5. Emerging technology trends
        Format the response in markdown with clear sections and bullet points.`
      },
      {
        role: "user",
        content: `Generate a market intelligence report based on this data:\n${JSON.stringify(dataContext, null, 2)}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000
  });

  const aiInsights = aiResponse.choices[0]?.message?.content || '';

  // Combine structured data with AI insights
  const fullReport = `# Market Intelligence Report${positionTitle ? ` - ${positionTitle}` : ''}

## Data Overview
- **Position**: ${positionTitle || 'General'}
- **Total Jobs Analyzed**: ${scrapedData.total_scraped}
- **Locations**: ${locations}
- **Time Period**: ${dateWindow === '24h' ? 'Last 24 hours' : dateWindow === '7d' ? 'Last 7 days' : dateWindow === '30d' ? 'Last 30 days' : dateWindow === '90d' ? 'Last 90 days' : 'Last 30 days'}
- **Data Collection**: ${new Date().toISOString()}

## Skills Analysis
${skillAnalysis.top_skills ? skillAnalysis.top_skills.slice(0, 10).map((s: any) => 
  `- **${s.skill}**: ${s.percentage}% of jobs (${s.demand} postings)`
).join('\n') : '- No skill data available'}

## Experience Requirements
${skillAnalysis.experience_distribution ? Object.entries(skillAnalysis.experience_distribution).map(([level, count]) => 
  `- **${level}**: ${count} positions`
).join('\n') : '- No experience level data available'}

## Salary Intelligence
- **Transparency Rate**: ${salaryAnalysis.salary_transparency}%
- **Jobs with Salary**: ${salaryAnalysis.jobs_with_salary} out of ${salaryAnalysis.total_jobs}

${aiInsights}

---
*Report generated on ${new Date().toISOString()}*`;

  return fullReport;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { regions = [], countries = [], focus_area = 'all_skills', custom_prompt = '', request_id, position_title, date_window, since_date } = await req.json() as MarketIntelligenceRequest;
    
    console.log(`[Market Research Agent] Starting analysis for request: ${request_id}`);
    console.log(`[Market Research Agent] Regions: ${regions.join(', ')}, Focus: ${focus_area}`);
    
    // Initialize Supabase client for status updates
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Initialize OpenAI for insights generation
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const locations = [...regions, ...countries];
    const allJobData: any[] = [];

    try {
      // STEP 1: Web Scraping - Scrape job data from each location
      console.log('[Market Research Agent] Step 1: Starting web scraping phase...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'scraping',
          status_message: 'Step 1/4: Scraping job market data from LinkedIn...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      // Determine search keywords based on position title or focus area
      let searchKeywords = position_title || 'software engineer developer technology'; // Use position title if provided
      
      // If no position title, use focus area mapping
      if (!position_title) {
        // Map focus areas to better search keywords
        const keywordMap: Record<string, string> = {
          'all_skills': 'software engineer developer technology data analyst',
          'technical': 'software engineer developer programmer coding',
          'ai_ml': 'machine learning artificial intelligence data scientist AI ML',
          'data_science': 'data scientist data analyst data engineer analytics',
          'cloud': 'cloud engineer devops AWS Azure GCP kubernetes',
          'frontend': 'frontend developer react angular vue javascript UI UX',
          'backend': 'backend developer API microservices java python node',
          'mobile': 'mobile developer iOS android react native flutter',
          'cybersecurity': 'security engineer cybersecurity infosec penetration testing',
          'product': 'product manager product owner agile scrum',
          'design': 'UX designer UI designer product designer figma'
        };
        
        searchKeywords = keywordMap[focus_area] || keywordMap['all_skills'];
      }

      // Scrape data for each location with retry logic
      for (const location of locations) {
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            console.log(`[Market Research Agent] Scraping jobs for location: ${location} (attempt ${retryCount + 1})`);
            await supabase
              .from('market_intelligence_requests')
              .update({
                status_message: `Step 1/4: Scraping jobs in ${location}... (attempt ${retryCount + 1})`,
                updated_at: new Date().toISOString()
              })
              .eq('id', request_id);

            const scrapedResult = await executeScraping(location, searchKeywords, 30, date_window);
            if (scrapedResult.success && scrapedResult.data) {
              allJobData.push(...scrapedResult.data);
              console.log(`[Market Research Agent] Added ${scrapedResult.data.length} jobs from ${location}`);
              break; // Success, exit retry loop
            }
          } catch (locationError) {
            console.error(`[Market Research Agent] Failed to scrape ${location} (attempt ${retryCount + 1}):`, locationError);
            retryCount++;
            
            if (retryCount > maxRetries) {
              console.error(`[Market Research Agent] Max retries reached for ${location}, skipping...`);
              // Continue with other locations even if one fails after retries
            } else {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
      }

      if (allJobData.length === 0) {
        throw new Error('No job data could be scraped from any location');
      }

      console.log(`[Market Research Agent] Total jobs scraped: ${allJobData.length}`);
      
      // Update with scraping results
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: `Step 1/4 Complete: Scraped ${allJobData.length} job listings`,
          scraped_data: { 
            jobs_count: allJobData.length, 
            locations_scraped: locations,
            sample_jobs: allJobData.slice(0, 5) 
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      // STEP 2: Skill Analysis
      console.log('[Market Research Agent] Step 2: Analyzing skill trends...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'analyzing',
          status_message: 'Step 2/4: Analyzing skill demand and trends...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      const skillAnalysis = await analyzeSkillTrends(allJobData, focus_area);
      console.log(`[Market Research Agent] Skill analysis complete. Top skills identified: ${skillAnalysis.top_skills.length}`);

      // STEP 3: Salary Analysis
      console.log('[Market Research Agent] Step 3: Analyzing salary trends...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: 'Step 3/4: Analyzing compensation and salary trends...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      const salaryAnalysis = await analyzeSalaryTrends(allJobData);
      console.log(`[Market Research Agent] Salary analysis complete. Transparency: ${salaryAnalysis.salary_transparency}%`);

      // STEP 4: Generate Comprehensive Insights
      console.log('[Market Research Agent] Step 4: Generating market insights report...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: 'Step 4/4: Generating comprehensive market intelligence report...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      const marketInsights = await generateMarketInsights(
        { total_scraped: allJobData.length, data: allJobData },
        skillAnalysis,
        salaryAnalysis,
        locations.join(', '),
        openai,
        position_title,
        date_window
      );

      // Save final results
      console.log('[Market Research Agent] Saving final analysis results...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'completed',
          status_message: 'Analysis complete! Market intelligence report ready.',
          ai_insights: marketInsights,
          scraped_data: {
            total_jobs: allJobData.length,
            locations: locations,
            job_listings: allJobData
          },
          analysis_data: {
            skill_trends: skillAnalysis,
            salary_trends: salaryAnalysis
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      console.log('[Market Research Agent] Pipeline completed successfully!');

      return new Response(JSON.stringify({
        success: true,
        agent: "market-research-agent",
        request_id,
        summary: {
          total_jobs_analyzed: allJobData.length,
          locations_covered: locations,
          top_skills: skillAnalysis.top_skills.slice(0, 5),
          salary_transparency: `${salaryAnalysis.salary_transparency}%`
        },
        status: "Pipeline completed successfully"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (pipelineError) {
      console.error('[Market Research Agent] Pipeline error:', pipelineError);
      
      // Update status with error
      const errorMessage = pipelineError instanceof Error ? pipelineError.message : 'Unknown error';
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'error',
          status_message: `Pipeline failed: ${errorMessage.substring(0, 200)}`,
          error_details: { 
            error: errorMessage,
            partial_data: {
              jobs_scraped: allJobData.length,
              locations_attempted: locations
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);
      
      throw pipelineError;
    }

  } catch (error) {
    console.error('[Market Research Agent] Fatal error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      agent: "market-research-agent"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});