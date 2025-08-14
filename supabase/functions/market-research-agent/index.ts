// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// Using Groq API instead of OpenAI
interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MarketIntelligenceRequest {
  regions?: string[];
  countries?: string[];
  focus_area?: string;
  request_id: string;
  position_title?: string;
  industry?: string;
  custom_position?: boolean;
  position_requirements?: {
    required_skills?: any[];
    nice_to_have_skills?: any[];
    description?: string;
  };
  date_window?: '24h' | '7d' | '30d' | '90d' | 'custom';
  since_date?: string;
}

function resolveLinkedInGeoId(location: string): string | null {
  const normalized = (location || '').toLowerCase();
  const geoIdMap: Record<string, string> = {
    'turkey': '102105699', 'türkiye': '102105699', 'tr': '102105699',
    'istanbul': '102105699', 'ankara': '102105699',
    'us': '103644278', 'united states': '103644278',
    'united kingdom': '101165590', 'uk': '101165590',
    'germany': '101282230', 'france': '105015875', 'netherlands': '102890719',
    'sweden': '105117694', 'switzerland': '106693272', 'spain': '105646813', 'italy': '103350119',
    'uae': '104305776', 'united arab emirates': '104305776', 'saudi arabia': '100459316',
    'qatar': '104170880', 'kuwait': '100961350', 'bahrain': '100132971', 'oman': '103620775',
    'jordan': '106155005', 'lebanon': '104583659', 'egypt': '100963918',
    'singapore': '102454443', 'australia': '101452733', 'japan': '101355337',
    'south korea': '105149562', 'korea': '105149562', 'hong kong': '102890883',
    'malaysia': '106808692', 'india': '102713980', 'thailand': '105072130'
  };
  for (const [key, geoId] of Object.entries(geoIdMap)) {
    if (normalized.includes(key)) return geoId;
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
  scraped_at: string;
};

function parseLinkedInMarkdown(markdown: string, location: string, limit: number): ParsedJob[] {
  const results: ParsedJob[] = [];
  
  console.log(`[Market Research Agent] Parsing LinkedIn markdown for ${location}...`);
  
  // Split by job sections - each job starts with "### " (job title)
  const jobSections = markdown.split(/^- \[/m).slice(1); // Remove header section
  
  for (const section of jobSections.slice(0, limit)) {
    try {
      // Extract job title - between first '](' and ')'
      const titleMatch = section.match(/^([^\]]+)\]/);
      const title = titleMatch ? titleMatch[1].trim() : 'Unknown Position';
      
      // Skip navigation/footer elements that aren't job postings
      const navigationTerms = ['about', 'accessibility', 'user agreement', 'privacy policy', 'cookie policy', 'terms', 'help', 'contact', 'careers', 'support', 'cookie settings', 'ad choices', 'guest'];
      const isNavigation = navigationTerms.some(term => title.toLowerCase().includes(term));
      
      // Additional validation: job titles should have some meaningful length and structure
      const isValidJobTitle = title.length > 3 && 
                             !title.toLowerCase().startsWith('http') && 
                             !title.includes('linkedin.com') &&
                             title !== 'Unknown Position';
      
      if (isNavigation || !isValidJobTitle) {
        console.log(`[Market Research Agent] Skipping invalid/navigation element: ${title}`);
        continue;
      }
      
      // Extract company - look for "#### [CompanyName]"
      const companyMatch = section.match(/#### \[([^\]]+)\]/);
      const company = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
      
      // Extract location - usually after company line
      const locationMatch = section.match(/#### \[[^\]]+\][^\n]*\n\n\n([^\n]+)/);
      const jobLocation = locationMatch ? locationMatch[1].trim() : location;
      
      // Extract timing - look for "X days ago", "X weeks ago", etc.
      const timeMatch = section.match(/(\d+\s+(?:hour|day|week|month)s?\s+ago|just now)/i);
      const postedTime = timeMatch ? timeMatch[1] : 'Unknown';
      
      // Determine experience level from title
      const experienceLevel = determineExperienceLevel(title);
      
      results.push({
        title,
        company,
        location: jobLocation,
        description: '', // Markdown doesn't include full descriptions
        skills: [],
        experience_level: experienceLevel,
        scraped_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`[Market Research Agent] Error parsing job section:`, error);
      continue;
    }
  }
  
  console.log(`[Market Research Agent] Parsed ${results.length} jobs from LinkedIn markdown`);
  return results;
}


async function extractSkillsWithAI(jobData: any[]): Promise<any[]> {
  console.log('[Market Research Agent] Starting AI-powered skill analysis...');
  
  // Process jobs in batches for efficiency
  const batchSize = 10;
  const processedJobs: any[] = [];
  
  for (let i = 0; i < jobData.length; i += batchSize) {
    const batch = jobData.slice(i, i + batchSize);
    console.log(`[Market Research Agent] Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(jobData.length/batchSize)}`);
    
    // Prepare batch for AI analysis
    const jobTexts = batch.map((job, index) => 
      `Job ${i + index + 1}:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description || 'No description available'}
---`
    ).join('\n\n');

    try {
      // Use Groq API instead of OpenAI
      const groqApiKey = Deno.env.get('GROQ_API_KEY');
      if (!groqApiKey) {
        throw new Error('GROQ_API_KEY environment variable is not set');
      }

      const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are a skills analysis expert. Analyze job postings and extract:
1. Technical skills (programming languages, frameworks, tools, platforms)
2. Soft skills (communication, leadership, problem-solving)
3. Domain expertise (industry knowledge, certifications)
4. Experience level requirements
5. Role focus areas

Return ONLY a valid JSON array with one object per job containing:
{
  "job_index": number,
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"], 
    "domain": ["skill1", "skill2"]
  },
  "experience_level": "Entry|Mid|Senior|Executive",
  "role_focus": "description of main responsibilities",
  "seniority_indicators": ["specific phrases indicating level"]
}

IMPORTANT: Return only the JSON array, no markdown formatting, no explanations, no code blocks.
Extract actual skills mentioned, inferred skills from context, and standardize skill names.`
            },
            {
              role: "user",
              content: `Analyze these job postings and extract skills:\n\n${jobTexts}`
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`Groq API error: ${aiResponse.status} ${await aiResponse.text()}`);
      }

      const groqResult: GroqResponse = await aiResponse.json();

      const aiResult = groqResult.choices[0]?.message?.content;
      if (aiResult) {
        try {
          // Clean the AI response to extract JSON from markdown code blocks
          let cleanedResult = aiResult.trim();
          
          // Remove markdown code blocks if present
          if (cleanedResult.startsWith('```json')) {
            cleanedResult = cleanedResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanedResult.startsWith('```')) {
            cleanedResult = cleanedResult.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          const parsedResults = JSON.parse(cleanedResult);
          
          // Merge AI analysis back into job data
          batch.forEach((job, batchIndex) => {
            const aiAnalysis = parsedResults.find((r: any) => r.job_index === i + batchIndex + 1);
            if (aiAnalysis) {
              job.ai_skills = aiAnalysis.skills;
              job.experience_level = aiAnalysis.experience_level || job.experience_level;
              job.role_focus = aiAnalysis.role_focus;
              job.seniority_indicators = aiAnalysis.seniority_indicators;
              
              // Flatten skills for backward compatibility
              job.skills = [
                ...(aiAnalysis.skills.technical || []),
                ...(aiAnalysis.skills.soft || []),
                ...(aiAnalysis.skills.domain || [])
              ];
            }
            processedJobs.push(job);
          });
          
        } catch (parseError) {
          console.error('[Market Research Agent] Failed to parse AI response:', parseError);
          // Fallback: use original jobs without AI enhancement
          processedJobs.push(...batch);
        }
      } else {
        processedJobs.push(...batch);
      }
      
    } catch (aiError) {
      console.error('[Market Research Agent] AI analysis error:', aiError);
      // Fallback: use original jobs
      processedJobs.push(...batch);
    }
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < jobData.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`[Market Research Agent] AI skill analysis complete. Processed ${processedJobs.length} jobs`);
  return processedJobs;
}

function determineExperienceLevel(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
    return 'Senior';
  } else if (titleLower.includes('junior') || titleLower.includes('entry')) {
    return 'Entry';
  } else if (titleLower.includes('mid') || titleLower.includes('intermediate')) {
    return 'Mid';
  }
  
  return 'Not specified';
}

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


      results.push({
        title,
        company,
        location: jobLocation,
        description,
        skills: [],
        experience_level: experienceLevel,
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
  count: number = 500,
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
  
  // Use LinkedIn geo ID for better targeting
  const geoId = resolveLinkedInGeoId(location);
  let targetUrl: string;
  if (geoId) {
    targetUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&geoId=${geoId}&f_TPR=${timeFilter}&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true`;
  } else {
    targetUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&f_TPR=${timeFilter}`;
  }

  const apiKey = Deno.env.get('SCRAPE_DO_API_KEY');
  if (!apiKey) {
    console.error('[Market Research Agent] SCRAPE_DO_API_KEY environment variable is not set');
    throw new Error('SCRAPE_DO_API_KEY is not configured');
  }
  console.log(`[Market Research Agent] API Key present: ${apiKey ? 'Yes' : 'No'}, length: ${apiKey?.length}`);
  
  // Scrape.do API with markdown output for better parsing
  const params = new URLSearchParams();
  params.append('token', apiKey);
  params.append('url', targetUrl);
  params.append('output', 'markdown'); // Add markdown output for better parsing
  
  const scrapeEndpoint = `https://api.scrape.do?${params.toString()}`;

  console.log(`[Market Research Agent] Calling Scrape.do API (Hobby plan)...`);
  console.log(`[Market Research Agent] Target URL: ${targetUrl}`);
  console.log(`[Market Research Agent] Scrape.do params: token=***${apiKey.slice(-4)}, url=${targetUrl.substring(0, 50)}...`);
  console.log(`[Market Research Agent] Full endpoint (first 150 chars): ${scrapeEndpoint.substring(0, 150)}`);
  
  const scrapeResponse = await fetch(scrapeEndpoint, {
    method: 'GET'
    // Custom headers not supported in Hobby plan
  });

  console.log(`[Market Research Agent] Scrape.do response status: ${scrapeResponse.status}`);
  
  if (!scrapeResponse.ok) {
    const errorBody = await scrapeResponse.text();
    console.error(`[Market Research Agent] Scrape.do API error response (${scrapeResponse.status}):`, errorBody.substring(0, 500));
    
    // Check if it's a JS render error and provide helpful message
    if (scrapeResponse.status === 401 && errorBody.includes('JS Render')) {
      console.warn('[Market Research Agent] JS Render not available in current plan - falling back to basic scraping');
      // Could implement alternative scraping method here if needed
    }
    
    // Check if it's an auth error
    if (scrapeResponse.status === 401 || scrapeResponse.status === 403) {
      console.error('[Market Research Agent] Authentication error - check SCRAPE_DO_API_KEY');
    }
    
    throw new Error(`Scrape.do API error: ${scrapeResponse.status} - ${errorBody.substring(0, 400)}`);
  }

  const scrapedContent = await scrapeResponse.text();
  
  // Parse LinkedIn content - check if we got markdown output
  let jobListings: ParsedJob[];
  if (scrapedContent.includes('- Meta:') || scrapedContent.includes('###') || scrapedContent.includes('#### [')) {
    jobListings = parseLinkedInMarkdown(scrapedContent, location, count);
  } else {
    jobListings = parseLinkedInJobs(scrapedContent, location, count);
  }
  
  console.log(`[Market Research Agent] Successfully scraped ${jobListings.length} job listings`);
  
  if (jobListings.length === 0) {
    // Log first 1000 chars of content to debug
    console.log(`[Market Research Agent] No jobs found. Content preview: ${scrapedContent.substring(0, 1000)}`);
    throw new Error('No job listings found - scraping may have failed or page structure changed');
  }

  return {
    success: true,
    data: jobListings,
    total_scraped: jobListings.length,
    scraping_method: 'scrape.do',
    target_url: targetUrl
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

function comparePositionToMarket(positionRequirements: any, marketAnalysis: any): any {
  console.log('[Market Research Agent] Comparing position requirements to market demand...');
  
  const requiredSkills = positionRequirements.required_skills || [];
  const niceToHaveSkills = positionRequirements.nice_to_have_skills || [];
  const marketSkills = marketAnalysis.top_skills || [];
  
  // Check how many of our required skills appear in market
  const requiredInMarket = requiredSkills.filter((reqSkill: any) => 
    marketSkills.some((mktSkill: any) => 
      mktSkill.skill.toLowerCase().includes(reqSkill.skill_name?.toLowerCase() || '')
    )
  );
  
  // Check market skills not in our requirements
  const marketNotInRequirements = marketSkills.filter((mktSkill: any) =>
    !requiredSkills.some((reqSkill: any) => 
      mktSkill.skill.toLowerCase().includes(reqSkill.skill_name?.toLowerCase() || '')
    ) &&
    !niceToHaveSkills.some((niceSkill: any) => 
      mktSkill.skill.toLowerCase().includes(niceSkill.skill_name?.toLowerCase() || '')
    )
  );
  
  return {
    required_skills_in_market: requiredInMarket.length,
    total_required_skills: requiredSkills.length,
    market_alignment_score: requiredSkills.length > 0 ? Math.round((requiredInMarket.length / requiredSkills.length) * 100) : 0,
    missing_from_market: requiredSkills.filter((reqSkill: any) => 
      !marketSkills.some((mktSkill: any) => 
        mktSkill.skill.toLowerCase().includes(reqSkill.skill_name?.toLowerCase() || '')
      )
    ),
    trending_skills_missing: marketNotInRequirements.slice(0, 5),
    mismatch_alerts: generateMismatchAlerts(requiredSkills, marketSkills, marketNotInRequirements)
  };
}

function generateMismatchAlerts(requiredSkills: any[], marketSkills: any[], missingSkills: any[]): string[] {
  const alerts = [];
  
  if (missingSkills.length > 2) {
    alerts.push(`🔥 ${missingSkills.slice(0, 3).map((s: any) => s.skill).join(', ')} are in high market demand but not in your requirements`);
  }
  
  const lowDemandRequired = requiredSkills.filter((reqSkill: any) => {
    const marketSkill = marketSkills.find((mktSkill: any) => 
      mktSkill.skill.toLowerCase().includes(reqSkill.skill_name?.toLowerCase() || '')
    );
    return marketSkill && marketSkill.percentage < 10;
  });
  
  if (lowDemandRequired.length > 0) {
    alerts.push(`⚠️ ${lowDemandRequired.slice(0, 2).map((s: any) => s.skill_name).join(', ')} required but rare in market (<10%)`);
  }
  
  return alerts;
}


async function generateMarketInsights(
  scrapedData: any,
  skillAnalysis: any,
  locations: string,
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
    sample_jobs: scrapedData.data.slice(0, 5)
  };

  // Use Groq API to generate sophisticated insights
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a market intelligence analyst. Generate a comprehensive, actionable market report based on the provided job market data. Focus on:
        1. Key talent trends and skill gaps
        2. Competitive landscape insights
        3. Strategic training recommendations
        4. Emerging technology trends
        Format the response in markdown with clear sections and bullet points.`
        },
        {
          role: "user",
          content: `Generate a market intelligence report based on this data:\n${JSON.stringify(dataContext, null, 2)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!aiResponse.ok) {
    throw new Error(`Groq API error: ${aiResponse.status} ${await aiResponse.text()}`);
  }

  const groqResult: GroqResponse = await aiResponse.json();

  const aiInsights = groqResult.choices[0]?.message?.content || '';

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
    const { regions = [], countries = [], focus_area = 'all_skills', request_id, position_title, industry, custom_position, position_requirements, date_window, since_date } = await req.json() as MarketIntelligenceRequest;
    
    console.log(`[Market Research Agent] Starting analysis for request: ${request_id}`);
    console.log(`[Market Research Agent] Regions: ${regions.join(', ')}, Focus: ${focus_area}`);
    
    // Initialize Supabase client for status updates
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    // Groq API will be used directly in analysis functions

    const locations = [...regions, ...countries];
    const allJobData: any[] = [];

    try {
      // STEP 1: Web Scraping - Scrape job data from each location
      console.log('[Market Research Agent] Step 1: Starting web scraping phase...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'scraping',
          status_message: 'Step 1/3: Scraping job market data from LinkedIn...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      // Determine search keywords based on position title, industry, or focus area
      let searchKeywords = position_title || 'software engineer developer technology';
      
      // Enhance keywords with industry context if provided
      if (industry && custom_position) {
        const industryKeywords: Record<string, string> = {
          'Technology & Software': 'software engineer developer programmer tech',
          'Financial Services': 'fintech financial analyst quantitative developer banking',
          'Healthcare & Biotechnology': 'healthcare biotech medical data scientist clinical',
          'Manufacturing & Automotive': 'manufacturing automotive engineer industrial IoT',
          'Retail & E-commerce': 'ecommerce retail digital marketing product manager',
          'Media & Entertainment': 'media entertainment content creator digital marketing',
          'Education & Training': 'education training instructional designer curriculum',
          'Government & Public Sector': 'government public sector policy analyst data',
          'Consulting & Professional Services': 'consultant analyst strategy business',
          'Energy & Utilities': 'energy utilities engineer sustainability data'
        };
        
        const industryKeyword = industryKeywords[industry] || '';
        if (industryKeyword) {
          searchKeywords = `${searchKeywords} ${industryKeyword}`;
        }
      }
      
      // If no position title, use focus area mapping
      if (!position_title) {
        const keywordMap: Record<string, string> = {
          'all_skills': 'software engineer developer technology data analyst',
          'technical': 'software engineer developer programmer coding'
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
                status_message: `Step 1/3: Scraping jobs in ${location}... (attempt ${retryCount + 1})`,
                updated_at: new Date().toISOString()
              })
              .eq('id', request_id);

            const scrapedResult = await executeScraping(location, searchKeywords, 500, date_window);
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

      // Filter out invalid jobs (those that are clearly not job postings)
      const validJobs = allJobData.filter(job => {
        const isValidTitle = job.title && 
                           job.title.length > 3 && 
                           !['about', 'privacy', 'terms', 'help', 'contact'].some(term => 
                             job.title.toLowerCase().includes(term)
                           );
        return isValidTitle;
      });

      if (validJobs.length === 0) {
        throw new Error(`Scraped ${allJobData.length} items but found no valid job postings - scraping may have captured navigation elements instead`);
      }

      console.log(`[Market Research Agent] Total jobs scraped: ${allJobData.length}, valid jobs: ${validJobs.length}`);
      
      // STEP 1.5: AI-Powered Skill Analysis
      console.log('[Market Research Agent] Step 1.5: Running AI skill analysis...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: 'Step 1.5/3: Analyzing skills with AI...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      const aiEnhancedJobs = await extractSkillsWithAI(validJobs);
      console.log(`[Market Research Agent] AI skill analysis complete. Enhanced ${aiEnhancedJobs.length} jobs`);
      
      // Update with scraping results
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: `Step 1.5/3 Complete: AI analysis of ${aiEnhancedJobs.length} job listings`,
          scraped_data: { 
            total_jobs: aiEnhancedJobs.length,
            jobs_count: aiEnhancedJobs.length, 
            locations_scraped: locations,
            sample_jobs: aiEnhancedJobs.slice(0, 5) 
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
          status_message: 'Step 2/3: Analyzing skill demand and trends...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      const skillAnalysis = await analyzeSkillTrends(aiEnhancedJobs, focus_area);
      console.log(`[Market Research Agent] Skill analysis complete. Top skills identified: ${skillAnalysis.top_skills.length}`);
      
      // Add position requirements comparison
      let requirementsComparison = null;
      if (position_requirements) {
        requirementsComparison = comparePositionToMarket(position_requirements, skillAnalysis);
      }

      // STEP 3: Generate Comprehensive Insights
      console.log('[Market Research Agent] Step 3: Generating market insights report...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: 'Step 3/3: Generating comprehensive market intelligence report...',
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      let marketInsights = '';
      try {
        // Add timeout protection for AI insights generation
        const insightsPromise = generateMarketInsights(
          { total_scraped: aiEnhancedJobs.length, data: aiEnhancedJobs },
          skillAnalysis,
          locations.join(', '),
          position_title,
          date_window
        );
        
        // Race between the AI call and a 30-second timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI insights generation timed out')), 30000)
        );
        
        marketInsights = await Promise.race([insightsPromise, timeoutPromise]) as string;
      } catch (insightsError) {
        console.error('[Market Research Agent] AI insights generation failed:', insightsError);
        // Generate basic insights without AI if it fails
        marketInsights = `# Market Intelligence Report - ${position_title || 'General'}

## Data Overview
- **Total Jobs Analyzed**: ${aiEnhancedJobs.length}
- **Locations**: ${locations.join(', ')}
- **Time Period**: ${date_window === '24h' ? 'Last 24 hours' : date_window === '7d' ? 'Last 7 days' : date_window === '30d' ? 'Last 30 days' : 'Last 90 days'}

## Top Skills Analysis
${skillAnalysis.top_skills ? skillAnalysis.top_skills.slice(0, 10).map((s: any) => 
  `- **${s.skill}**: ${s.percentage}% of jobs (${s.demand} postings)`
).join('\n') : '- No skill data available'}

*Note: Advanced AI insights unavailable due to processing timeout. Basic analysis provided.*`;
      }

      // Save final results
      console.log('[Market Research Agent] Saving final analysis results...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'completed',
          status_message: 'Analysis complete! Market intelligence report ready.',
          ai_insights: marketInsights,
          scraped_data: {
            total_jobs: aiEnhancedJobs.length,
            locations: locations,
            job_listings: aiEnhancedJobs
          },
          analysis_data: {
            skill_trends: skillAnalysis,
            requirements_comparison: requirementsComparison
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
          total_jobs_analyzed: aiEnhancedJobs.length,
          locations_covered: locations,
          top_skills: skillAnalysis.top_skills.slice(0, 5)
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
          status: 'failed',
          status_message: `Pipeline failed: ${errorMessage.substring(0, 200)}`,
          error_details: { 
            error: errorMessage,
            partial_data: {
              jobs_scraped: aiEnhancedJobs?.length || validJobs?.length || allJobData.length,
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