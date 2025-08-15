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


// Robust JSON parsing with multiple fallback strategies
async function safeParseAIResponse(response: string, context: string): Promise<any | null> {
  console.log(`[Market Research Agent] 🔍 Parsing AI response for ${context}...`);
  
  if (!response || response.trim().length === 0) {
    console.warn(`[Market Research Agent] ⚠️ Empty AI response for ${context}`);
    return null;
  }
  
  // Strategy 1: Clean markdown and basic parsing
  try {
    let cleanedResult = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsed = JSON.parse(cleanedResult);
    console.log(`[Market Research Agent] ✅ Successfully parsed JSON for ${context}`);
    return parsed;
    
  } catch (firstError) {
    console.warn(`[Market Research Agent] ⚠️ Strategy 1 failed for ${context}:`, firstError.message);
  }
  
  // Strategy 2: Fix common escape character issues
  try {
    let fixedResponse = response
      .replace(/```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/\\/g, '\\\\')  // Fix single backslashes
      .replace(/\\\\n/g, '\\n') // Fix over-escaped newlines
      .replace(/\\\\"/g, '\\"') // Fix over-escaped quotes
      .replace(/\n/g, ' ')      // Replace actual newlines with spaces
      .replace(/\t/g, ' ')      // Replace tabs with spaces
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim();
    
    const parsed = JSON.parse(fixedResponse);
    console.log(`[Market Research Agent] ✅ Strategy 2 successful for ${context}`);
    return parsed;
    
  } catch (secondError) {
    console.warn(`[Market Research Agent] ⚠️ Strategy 2 failed for ${context}:`, secondError.message);
  }
  
  // Strategy 3: Extract JSON from mixed content
  try {
    // Look for JSON array or object patterns
    const jsonMatch = response.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      const extracted = jsonMatch[1];
      const parsed = JSON.parse(extracted);
      console.log(`[Market Research Agent] ✅ Strategy 3 successful for ${context}`);
      return parsed;
    }
  } catch (thirdError) {
    console.warn(`[Market Research Agent] ⚠️ Strategy 3 failed for ${context}:`, thirdError.message);
  }
  
  // Strategy 4: AI-powered JSON fixing (last resort)
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (groqApiKey) {
      console.log(`[Market Research Agent] 🤖 Attempting AI-powered JSON fix for ${context}...`);
      
      const fixResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
              content: "You are a JSON repair specialist. Fix malformed JSON and return ONLY the corrected JSON. No explanations, no markdown blocks, just valid JSON."
            },
            {
              role: "user", 
              content: `Fix this malformed JSON:\n\n${response.slice(0, 2000)}` // Limit to prevent token overflow
            }
          ],
          temperature: 0.0,
          max_tokens: 1000
        })
      });
      
      if (fixResponse.ok) {
        const fixResult: GroqResponse = await fixResponse.json();
        const fixedJSON = fixResult.choices[0]?.message?.content?.trim();
        
        if (fixedJSON) {
          const parsed = JSON.parse(fixedJSON);
          console.log(`[Market Research Agent] ✅ AI-powered fix successful for ${context}`);
          return parsed;
        }
      }
    }
  } catch (aiFixError) {
    console.warn(`[Market Research Agent] ⚠️ AI-powered JSON fix failed for ${context}:`, aiFixError.message);
  }
  
  // All strategies failed
  console.error(`[Market Research Agent] ❌ All JSON parsing strategies failed for ${context}`);
  console.error(`[Market Research Agent] Raw response preview:`, response.slice(0, 300));
  
  return null;
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
      console.error(`[Market Research Agent] Error parsing job section:`, error instanceof Error ? error.message : JSON.stringify(error));
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
  
  let successfulBatches = 0;
  let failedBatches = 0;
  
  for (let i = 0; i < jobData.length; i += batchSize) {
    const batch = jobData.slice(i, i + batchSize);
    const batchNumber = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(jobData.length/batchSize);
    
    console.log(`[Market Research Agent] 🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} jobs)`);
    
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
        const parsedResults = await safeParseAIResponse(aiResult, `batch ${Math.floor(i/batchSize) + 1}`);
        
        if (parsedResults) {
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
              
              console.log(`[Market Research Agent] ✅ Successfully enhanced job: ${job.title}`);
            } else {
              console.warn(`[Market Research Agent] ⚠️ No AI analysis found for job ${i + batchIndex + 1}: ${job.title}`);
            }
            processedJobs.push(job);
          });
        } else {
          console.warn(`[Market Research Agent] ⚠️ Failed to parse AI response for batch, using fallback`);
          // Fallback: add basic structure to jobs
          batch.forEach(job => {
            job.ai_skills = { technical: [], soft: [], domain: [] };
            job.skills = job.skills || [];
            processedJobs.push(job);
          });
        }
      } else {
        console.warn(`[Market Research Agent] ⚠️ No AI response for batch, using fallback`);
        // Fallback: add basic structure to jobs
        batch.forEach(job => {
          job.ai_skills = { technical: [], soft: [], domain: [] };
          job.skills = job.skills || [];
          processedJobs.push(job);
        });
      }
      
      successfulBatches++;
      console.log(`[Market Research Agent] ✅ Batch ${batchNumber} completed successfully`);
      
    } catch (aiError) {
      failedBatches++;
      console.error(`[Market Research Agent] ❌ AI analysis error for batch ${batchNumber}:`, aiError.message);
      
      // Comprehensive fallback: add jobs with basic structure
      console.log(`[Market Research Agent] 🔧 Using fallback processing for batch ${batchNumber}`);
      batch.forEach((job, batchIndex) => {
        // Add basic AI structure to maintain compatibility
        job.ai_skills = { technical: [], soft: [], domain: [] };
        job.skills = job.skills || [];
        job.experience_level = job.experience_level || determineExperienceLevel(job.title);
        job.role_focus = `${job.title} role analysis unavailable`;
        job.seniority_indicators = [];
        
        console.log(`[Market Research Agent] 🔧 Fallback processing: ${job.title}`);
        processedJobs.push(job);
      });
      
      // Continue with other batches instead of failing completely
      console.log(`[Market Research Agent] ⚠️ Batch ${batchNumber} failed but continuing with remaining batches...`);
    }
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < jobData.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Comprehensive batch processing summary
  console.log(`[Market Research Agent] 📊 AI Skill Analysis Summary:`);
  console.log(`[Market Research Agent] ✅ Successful batches: ${successfulBatches}/${successfulBatches + failedBatches}`);
  console.log(`[Market Research Agent] ❌ Failed batches: ${failedBatches}/${successfulBatches + failedBatches}`);
  console.log(`[Market Research Agent] 📈 Success rate: ${Math.round((successfulBatches / (successfulBatches + failedBatches)) * 100)}%`);
  console.log(`[Market Research Agent] 🎯 Total jobs processed: ${processedJobs.length}`);
  
  const enhancedJobs = processedJobs.filter(job => job.ai_skills && Object.keys(job.ai_skills).length > 0);
  console.log(`[Market Research Agent] 🤖 AI-enhanced jobs: ${enhancedJobs.length}/${processedJobs.length}`);
  console.log(`[Market Research Agent] 📊 Enhancement rate: ${Math.round((enhancedJobs.length / processedJobs.length) * 100)}%`);
  
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
  
  // Scrape.do API - use HTML parsing to get job descriptions for certification extraction
  const params = new URLSearchParams();
  params.append('token', apiKey);
  params.append('url', targetUrl);
  // Remove markdown output to get full HTML with job descriptions
  
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
  
  // Parse LinkedIn content - prioritize HTML parsing for job descriptions
  let jobListings: ParsedJob[];
  if (scrapedContent.includes('<html') || scrapedContent.includes('<div') || scrapedContent.includes('<body')) {
    // HTML content - use HTML parser to get job descriptions for certification extraction
    jobListings = parseLinkedInJobs(scrapedContent, location, count);
  } else if (scrapedContent.includes('- Meta:') || scrapedContent.includes('###') || scrapedContent.includes('#### [')) {
    // Markdown fallback - but won't have job descriptions
    console.log('[Market Research Agent] Using markdown parser - job descriptions will be empty');
    jobListings = parseLinkedInMarkdown(scrapedContent, location, count);
  } else {
    // Try HTML parsing as default
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
    target_url: targetUrl,
    // Phase 2: Include raw content for quality validation
    raw_content: scrapedContent
  };
}

// Generic skill normalization function with smart language detection and consolidation
function normalizeSkill(skill: string): string {
  if (!skill || typeof skill !== 'string') return skill;
  
  // Convert to lowercase and trim
  let normalized = skill.toLowerCase().trim();
  
  // Generic translation patterns (language-agnostic)
  const genericTranslations: Record<string, string> = {
    // Turkish common patterns
    'analiz': 'analysis', 'analizci': 'analyst', 'pazarlama': 'marketing', 'satış': 'sales',
    'yönetim': 'management', 'liderlik': 'leadership', 'iletişim': 'communication',
    'proje yönetimi': 'project management', 'veri analizi': 'data analysis',
    'dijital pazarlama': 'digital marketing', 'sosyal medya': 'social media',
    'müşteri hizmetleri': 'customer service', 'insan kaynakları': 'human resources',
    'bilgi teknolojileri': 'information technology', 'yazılım geliştirme': 'software development',
    
    // French common patterns  
    'marketing': 'marketing', 'ventes': 'sales', 'gestion': 'management',
    'communication': 'communication', 'développement': 'development',
    'analyse': 'analysis', 'stratégie': 'strategy', 'finance': 'finance',
    'comptabilité': 'accounting', 'ressources humaines': 'human resources',
    'technologie': 'technology', 'informatique': 'information technology',
    
    // German common patterns
    'marketing': 'marketing', 'vertrieb': 'sales', 'verwaltung': 'management',
    'kommunikation': 'communication', 'entwicklung': 'development',
    'analyse': 'analysis', 'strategie': 'strategy', 'finanzen': 'finance',
    'buchhaltung': 'accounting', 'personalwesen': 'human resources',
    'technologie': 'technology', 'informatik': 'information technology',
    
    // Spanish common patterns
    'mercadeo': 'marketing', 'ventas': 'sales', 'gestión': 'management',
    'comunicación': 'communication', 'desarrollo': 'development',
    'análisis': 'analysis', 'estrategia': 'strategy', 'finanzas': 'finance',
    'contabilidad': 'accounting', 'recursos humanos': 'human resources',
    'tecnología': 'technology', 'informática': 'information technology'
  };
  
  // Apply generic translations
  if (genericTranslations[normalized]) {
    normalized = genericTranslations[normalized];
  }
  
  // Smart consolidation patterns (works for any domain)
  let consolidated = normalized;
  
  // Remove common prefixes/suffixes that create duplicates
  consolidated = consolidated
    .replace(/^(digital|online|web|mobile|social)\s+/, '') // Remove digital prefixes
    .replace(/\s+(specialist|expert|professional|manager|coordinator|assistant)$/, '') // Remove job titles
    .replace(/\s+(skills?|knowledge|experience)$/, '') // Remove redundant suffixes
    .replace(/\s+(and|&)\s+.+$/, '') // Remove "X and Y" - keep first part
    .replace(/^(advanced|basic|intermediate)\s+/, '') // Remove skill levels
    .replace(/\s+(services|solutions|systems|tools)$/, '') // Remove generic endings
    ;
  
  // Generic pluralization handling
  if (consolidated.endsWith('s') && consolidated.length > 3) {
    const singular = consolidated.slice(0, -1);
    // Only remove 's' if it makes sense (not for words like 'analysis', 'business')
    if (!['analysis', 'business', 'process', 'focus', 'class'].includes(consolidated)) {
      consolidated = singular;
    }
  }
  
  // Handle compound skills intelligently
  consolidated = consolidated
    .replace(/\s+management$/, ' management') // Preserve "X management"
    .replace(/\s+analysis$/, ' analysis') // Preserve "X analysis"
    .replace(/\s+marketing$/, ' marketing') // Preserve "X marketing"
    .replace(/\s+development$/, ' development') // Preserve "X development"
    ;
  
  // Common word variations
  const variations: Record<string, string> = {
    'communication': 'communication',
    'communications': 'communication',
    'analytic': 'analysis',
    'analytics': 'analysis',
    'analyzing': 'analysis',
    'analysing': 'analysis',
    'marketing': 'marketing',
    'marketings': 'marketing',
    'sale': 'sales',
    'selling': 'sales',
    'management': 'management',
    'managing': 'management',
    'leadership': 'leadership',
    'leading': 'leadership',
    'development': 'development',
    'developing': 'development',
    'problem solving': 'problem-solving',
    'problem-solving': 'problem-solving',
    'team work': 'teamwork',
    'team-work': 'teamwork',
    'customer service': 'customer support',
    'client service': 'customer support'
  };
  
  if (variations[consolidated]) {
    consolidated = variations[consolidated];
  }
  
  // Remove very generic terms that are not meaningful skills
  const stopWords = ['specialist', 'expert', 'professional', 'trainee', 'intern', 'services', 'business', 'work', 'experience', 'skills', 'knowledge'];
  if (stopWords.includes(consolidated) || consolidated.length < 2) {
    return ''; // Return empty to filter out
  }
  
  // Capitalize first letter for display
  return consolidated.charAt(0).toUpperCase() + consolidated.slice(1);
}

// Skill categorization function
function categorizeSkill(skill: string): string {
  const normalizedSkill = skill.toLowerCase();
  
  const categories = {
    'Core Marketing': ['marketing', 'brand management', 'digital marketing', 'content marketing', 'social media marketing', 'email marketing', 'seo', 'sem', 'advertising'],
    'Leadership & Management': ['leadership', 'management', 'team management', 'project management', 'people management', 'strategic planning'],
    'Communication': ['communication', 'presentation', 'public speaking', 'writing', 'storytelling', 'negotiation'],
    'Technical Skills': ['analytics', 'data analysis', 'crm', 'marketing automation', 'html', 'css', 'javascript', 'sql'],
    'Soft Skills': ['problem-solving', 'teamwork', 'creativity', 'critical thinking', 'adaptability', 'time management'],
    'Sales & Business': ['sales', 'business development', 'customer support', 'relationship building', 'account management']
  };
  
  for (const [category, skills] of Object.entries(categories)) {
    if (skills.some(s => normalizedSkill.includes(s) || s.includes(normalizedSkill))) {
      return category;
    }
  }
  
  return 'Other Skills';
}

async function analyzeSkillTrends(jobData: any[], focusArea: string): Promise<any> {
  console.log('[Market Research Agent] Analyzing skill trends and combinations...');
  
  const skillFrequency: Record<string, number> = {};
  const experienceLevels: Record<string, number> = {};
  const skillCombinations: Record<string, number> = {};
  const skillsByExperience: Record<string, Record<string, number>> = {};
  
  jobData.forEach((job: any) => {
    const jobSkills = job.skills || [];
    
    // Normalize and count skill frequency
    jobSkills.forEach((skill: string) => {
      const normalizedSkill = normalizeSkill(skill);
      if (normalizedSkill && normalizedSkill.trim()) { // Filter out empty skills
        skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1;
        
        // Track skills by experience level (using normalized skill)
        const expLevel = job.experience_level || 'Not specified';
        if (!skillsByExperience[expLevel]) {
          skillsByExperience[expLevel] = {};
        }
        skillsByExperience[expLevel][normalizedSkill] = (skillsByExperience[expLevel][normalizedSkill] || 0) + 1;
      }
    });
    
    // Analyze skill combinations (pairs and triads) using normalized skills
    const normalizedJobSkills = jobSkills
      .map((skill: string) => normalizeSkill(skill))
      .filter((skill: string) => skill && skill.trim()); // Filter out empty skills
    if (normalizedJobSkills.length > 1) {
      // Two-skill combinations
      for (let i = 0; i < normalizedJobSkills.length; i++) {
        for (let j = i + 1; j < normalizedJobSkills.length; j++) {
          const combo = [normalizedJobSkills[i], normalizedJobSkills[j]].sort().join(' + ');
          skillCombinations[combo] = (skillCombinations[combo] || 0) + 1;
        }
      }
      
      // Three-skill combinations (for comprehensive patterns)
      if (normalizedJobSkills.length > 2) {
        for (let i = 0; i < normalizedJobSkills.length; i++) {
          for (let j = i + 1; j < normalizedJobSkills.length; j++) {
            for (let k = j + 1; k < normalizedJobSkills.length; k++) {
              const trio = [normalizedJobSkills[i], normalizedJobSkills[j], normalizedJobSkills[k]].sort().join(' + ');
              skillCombinations[trio] = (skillCombinations[trio] || 0) + 1;
            }
          }
        }
      }
    }
    
    // Count experience levels
    if (job.experience_level && job.experience_level !== 'Not specified') {
      experienceLevels[job.experience_level] = (experienceLevels[job.experience_level] || 0) + 1;
    }
  });
  
  // Sort skills by frequency and add categories
  const topSkills = Object.entries(skillFrequency)
    .sort(([, a], [, b]) => b - a)
    // No limit - analyze ALL skills found
    .map(([skill, count]) => ({
      skill,
      demand: count,
      percentage: Math.round((count / jobData.length) * 100),
      category: categorizeSkill(skill)
    }));
  
  // Group skills by category
  const skillsByCategory: Record<string, any[]> = {};
  topSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });
  
  // Calculate category totals
  const categoryTotals = Object.entries(skillsByCategory).map(([category, skills]) => ({
    category,
    skills: skills.sort((a, b) => b.demand - a.demand),
    total_demand: skills.reduce((sum, skill) => sum + skill.demand, 0),
    total_percentage: Math.round(skills.reduce((sum, skill) => sum + skill.percentage, 0)),
    skill_count: skills.length
  })).sort((a, b) => b.total_percentage - a.total_percentage);
  
  // Sort skill combinations by frequency (minimum 3 occurrences for relevance)
  const topCombinations = Object.entries(skillCombinations)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a)
    // No limit on skill combinations
    .map(([combo, count]) => ({
      combination: combo,
      frequency: count,
      percentage: Math.round((count / jobData.length) * 100),
      skills_count: combo.split(' + ').length
    }));
  
  return {
    total_jobs_analyzed: jobData.length,
    top_skills: topSkills,
    skills_by_category: categoryTotals,
    experience_distribution: experienceLevels,
    skill_combinations: topCombinations,
    skills_by_experience: skillsByExperience,
    analysis_summary: `Analyzed ${jobData.length} job postings. Top skills: ${topSkills.slice(0, 3).map(s => s.skill).join(', ')}`
  };
}

// AI-powered skill context generation using Groq
async function generateSkillContextsWithAI(skillAnalysis: any): Promise<any> {
  console.log('[Market Research Agent] 🧠 Generating AI-powered skill contexts...');
  
  try {
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    // Process skills in batches to avoid token limits
    const batchSize = 15;
    const allSkills = skillAnalysis.top_skills;
    const processedCategories = [];

    console.log(`[Market Research Agent] 📝 Processing ${allSkills.length} skills in batches of ${batchSize}`);

    for (let i = 0; i < skillAnalysis.skills_by_category.length; i++) {
      const category = skillAnalysis.skills_by_category[i];
      
      // Debug category structure to identify [object Object] issues
      if (!category || typeof category !== 'object') {
        console.error(`[Market Research Agent] ❌ Invalid category structure at index ${i}:`, JSON.stringify(category));
        continue;
      }
      
      if (!category.category) {
        console.error(`[Market Research Agent] ❌ Missing category.category property at index ${i}:`, JSON.stringify(category));
        continue;
      }
      
      if (!Array.isArray(category.skills)) {
        console.error(`[Market Research Agent] ❌ Invalid category.skills structure at index ${i}:`, JSON.stringify(category));
        continue;
      }
      
      const categorySkills = category.skills.slice(0, batchSize); // Limit per category for quality
      
      console.log(`[Market Research Agent] 🔄 Processing category: ${typeof category.category === 'string' ? category.category : JSON.stringify(category.category)} (${categorySkills.length} skills)`);

      const skillNames = categorySkills.map(skill => skill.skill);
      
      const contextResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content: `You are a professional career and skills expert. Generate accurate, specific descriptions for job market skills and their associated tools/technologies.

IMPORTANT: Return a valid JSON object with this exact structure:
{
  "contexts": {
    "SkillName": {
      "description": "Professional 2-3 sentence description of this skill's role and importance",
      "tools": ["Tool1", "Tool2", "Tool3", "Tool4", "Tool5"]
    }
  }
}

Guidelines:
- Descriptions should be professional, specific, and market-relevant
- Tools should be actual software, platforms, frameworks, or technologies used
- Focus on real-world application and business value
- Be concise but informative`
            },
            {
              role: "user",
              content: `Generate professional skill contexts for these ${typeof category.category === 'string' ? category.category : JSON.stringify(category.category)} skills: ${skillNames.join(', ')}

Each skill needs:
1. A 2-3 sentence professional description explaining its importance and application
2. 5 specific tools/technologies commonly used with this skill

IMPORTANT: Return ONLY valid JSON. No markdown, no explanations, no code blocks.
- Escape all quotes inside strings with \"
- Do not use unescaped quotes, apostrophes, or newlines in descriptions
- Keep descriptions concise to avoid JSON formatting issues

Return valid JSON only.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!contextResponse.ok) {
        console.error(`[Market Research Agent] ❌ Groq API error: ${contextResponse.status}`);
        const errorText = await contextResponse.text();
        console.error(`[Market Research Agent] Error details: ${errorText}`);
        continue;
      }

      const groqResult = await contextResponse.json() as GroqResponse;
      const aiContent = groqResult.choices[0]?.message?.content;

      if (!aiContent) {
        console.error(`[Market Research Agent] ❌ Empty AI response for category: ${typeof category.category === 'string' ? category.category : JSON.stringify(category.category)}`);
        continue;
      }

      // Parse AI response using robust safeParseAIResponse function
      const parsedContexts = await safeParseAIResponse(aiContent, `skill contexts for ${typeof category.category === 'string' ? category.category : JSON.stringify(category.category)}`);
      
      if (!parsedContexts) {
        console.error(`[Market Research Agent] ❌ Failed to parse skill contexts for category ${typeof category.category === 'string' ? category.category : JSON.stringify(category.category)}`);
        continue;
      }

      // Apply contexts to skills
      const enhancedSkills = categorySkills.map(skill => {
        const skillContext = parsedContexts?.contexts?.[skill.skill];
        if (skillContext && skillContext.description && skillContext.tools) {
          return {
            ...skill,
            context: {
              description: skillContext.description,
              tools: skillContext.tools
            }
          };
        }
        // Skip skills without proper context - no fallbacks
        return null;
      }).filter(skill => skill !== null);

      processedCategories.push({
        ...category,
        skills: enhancedSkills
      });

      console.log(`[Market Research Agent] ✅ Enhanced ${enhancedSkills.length}/${categorySkills.length} skills in ${typeof category.category === 'string' ? category.category : JSON.stringify(category.category)}`);

      // Small delay between API calls to be respectful
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[Market Research Agent] 🎉 AI context generation complete! Enhanced ${processedCategories.length} categories`);

    return {
      ...skillAnalysis,
      skills_by_category: processedCategories,
      // Also update top_skills with contexts for backward compatibility
      top_skills: processedCategories.flatMap(cat => cat.skills)
    };
    
  } catch (error) {
    console.error('[Market Research Agent] ❌ Error in AI skill context generation:', error instanceof Error ? error.message : JSON.stringify(error));
    // Return original data without contexts rather than failing
    return skillAnalysis;
  }
}

async function enhanceSkillAnalysisWithLLM(jobData: any[], basicSkillAnalysis: any): Promise<any> {
  console.log('[Market Research Agent] Enhancing skill analysis with LLM insights...');
  
  try {
    const enhancedSkills = [];
    const certificationMap: Record<string, number> = {};
    const toolMap: Record<string, number> = {};
    let hardSkillsCount = 0;
    let softSkillsCount = 0;
    let skillsWithExperience = 0;
    let skillsWithCertifications = 0;
    let skillsWithTools = 0;
    
    // Process top skills for enhanced analysis
    for (const skillData of basicSkillAnalysis.top_skills) {
      const relevantJobs = jobData.filter(job => 
        job.skills?.some((s: string) => normalizeSkill(s) === skillData.skill)
      );
      
      if (relevantJobs.length === 0) continue;
      
      // Create sample job descriptions for LLM analysis
      const sampleDescriptions = relevantJobs.slice(0, 5).map(job => ({
        title: job.title,
        description: job.description.slice(0, 500), // Limit context size
        experience_level: job.experience_level
      }));
      
      const skillContextPrompt = `
Analyze how "${skillData.skill}" is mentioned in these job postings and extract:

Job Data:
${sampleDescriptions.map(job => `
Job: ${job.title} (${job.experience_level || 'Not specified'})
Description: ${job.description}
`).join('\n')}

For the skill "${skillData.skill}", extract:
1. Experience requirements (years mentioned, seniority level)
2. Certifications required (any certifications, licenses, or qualifications mentioned)
3. Tools/technologies associated with this skill
4. Classification: "hard" (technical/measurable) or "soft" (interpersonal/behavioral)
5. Context examples (specific phrases mentioning this skill)

Return ONLY valid JSON:
{
  "experience_patterns": {
    "years_mentioned": ["3+ years", "5-7 years"],
    "seniority_levels": ["mid", "senior"]
  },
  "certifications": ["PMP", "AWS"],
  "tools": ["Excel", "Tableau"],
  "skill_type": "hard" or "soft",
  "context_examples": ["specific quote mentioning the skill"]
}
`;

      try {
        // Call Groq API for skill analysis
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
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are a market research analyst. Return ONLY valid JSON. Do NOT use markdown code blocks, backticks, or any formatting. Start directly with { and end with }. No explanations.'
              },
              {
                role: 'user',
                content: skillContextPrompt
              }
            ],
            max_tokens: 1500,
            temperature: 0.1
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`Groq API error: ${aiResponse.status} ${await aiResponse.text()}`);
        }

        const groqResult: GroqResponse = await aiResponse.json();
        const enhancedData = groqResult.choices[0]?.message?.content;
        
        if (!enhancedData) {
          throw new Error('No response from Groq API');
        }
        
        // Clean the response to handle markdown formatting and escape characters
        let cleanedData = enhancedData;
        
        // Remove markdown code blocks if present
        if (cleanedData.includes('```json')) {
          cleanedData = cleanedData.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        }
        
        // Remove any leading/trailing whitespace
        cleanedData = cleanedData.trim();
        
        // Try to parse, with fallback for common issues
        let parsedData;
        try {
          parsedData = JSON.parse(cleanedData);
        } catch (parseError) {
          console.log(`[Market Research Agent] JSON parse failed for skill: ${skillData.skill}, attempting to fix common issues`);
          // Try to fix common escape character issues
          const fixedData = cleanedData
            .replace(/\\/g, '\\\\') // Fix single backslashes
            .replace(/\\\\n/g, '\\n') // Fix over-escaped newlines
            .replace(/\\\\"/g, '\\"') // Fix over-escaped quotes
            .replace(/\n/g, ' ') // Replace actual newlines with spaces
            .replace(/\t/g, ' '); // Replace tabs with spaces
          
          try {
            parsedData = JSON.parse(fixedData);
          } catch (secondError) {
            console.log(`[Market Research Agent] Failed to parse JSON for skill: ${skillData.skill}, skipping enhanced analysis for this skill`);
            continue; // Skip this skill if we can't parse the JSON
          }
        }
        
        // Aggregate certification and tool data
        if (parsedData.certifications?.length > 0) {
          skillsWithCertifications++;
          parsedData.certifications.forEach((cert: string) => {
            certificationMap[cert] = (certificationMap[cert] || 0) + 1;
          });
        }
        
        if (parsedData.tools?.length > 0) {
          skillsWithTools++;
          parsedData.tools.forEach((tool: string) => {
            toolMap[tool] = (toolMap[tool] || 0) + 1;
          });
        }
        
        if (parsedData.experience_patterns?.years_mentioned?.length > 0) {
          skillsWithExperience++;
        }
        
        // Count skill types
        if (parsedData.skill_type === 'hard') hardSkillsCount++;
        else if (parsedData.skill_type === 'soft') softSkillsCount++;
        
        enhancedSkills.push({
          skill: skillData.skill,
          frequency: skillData.demand,
          percentage: skillData.percentage,
          category: skillData.category,
          enhanced_data: parsedData
        });
        
      } catch (llmError) {
        console.warn(`[Market Research Agent] LLM analysis failed for skill: ${skillData.skill}`, llmError instanceof Error ? llmError.message : JSON.stringify(llmError));
        // Add basic structure without LLM data
        enhancedSkills.push({
          skill: skillData.skill,
          frequency: skillData.demand,
          percentage: skillData.percentage,
          category: skillData.category,
          enhanced_data: {
            experience_patterns: { years_mentioned: [], seniority_levels: [] },
            certifications: [],
            tools: [],
            skill_type: skillData.category.includes('Technical') ? 'hard' : 'soft',
            context_examples: []
          }
        });
      }
    }
    
    // Generate summary analytics
    const totalSkillsAnalyzed = enhancedSkills.length;
    const hardSkillsPercentage = totalSkillsAnalyzed > 0 ? Math.round((hardSkillsCount / totalSkillsAnalyzed) * 100) : 0;
    const softSkillsPercentage = totalSkillsAnalyzed > 0 ? Math.round((softSkillsCount / totalSkillsAnalyzed) * 100) : 0;
    
    // Top certifications and tools
    const topCertifications = Object.entries(certificationMap)
      .sort(([, a], [, b]) => b - a)
      // No limit on certifications
      .map(([cert, count]) => ({
        name: cert,
        frequency: count,
        percentage: Math.round((count / totalSkillsAnalyzed) * 100)
      }));
      
    const topTools = Object.entries(toolMap)
      .sort(([, a], [, b]) => b - a)
      // No limit on tools
      .map(([tool, count]) => ({
        name: tool,
        frequency: count,
        category: categorizeSkill(tool) // Reuse existing categorization
      }));
    
    return {
      enhanced_skill_analysis: enhancedSkills,
      technical_depth_summary: {
        hard_skills_percentage: hardSkillsPercentage,
        soft_skills_percentage: softSkillsPercentage,
        total_skills_analyzed: totalSkillsAnalyzed,
        skills_with_experience_req: skillsWithExperience,
        skills_with_certifications: skillsWithCertifications,
        skills_with_tools: skillsWithTools
      },
      certification_landscape: {
        total_certifications_mentioned: Object.keys(certificationMap).length,
        certification_categories: groupCertificationsByCategory(topCertifications),
        top_certifications: topCertifications,
        // Frontend-expected format for display
        most_requested: topCertifications.slice(0, 8).map(cert => cert.name),
        high_value: topCertifications
          .filter(cert => cert.frequency >= Math.max(1, Math.floor(totalSkillsAnalyzed * 0.15))) // High frequency certs
          .slice(0, 6)
          .map(cert => cert.name),
        emerging: topCertifications
          .filter(cert => cert.frequency >= 2 && cert.frequency < Math.floor(totalSkillsAnalyzed * 0.1)) // Medium frequency certs
          .slice(0, 5)
          .map(cert => cert.name)
      },
      tool_requirements: {
        total_tools_mentioned: Object.keys(toolMap).length,
        tool_categories: groupToolsByCategory(topTools),
        most_demanded_tools: topTools
      },
      context_intelligence: {
        experience_context_available: skillsWithExperience > 0,
        skills_with_context: enhancedSkills.filter(s => s.enhanced_data.context_examples.length > 0).length,
        context_quality_score: Math.round((skillsWithExperience / totalSkillsAnalyzed) * 100)
      }
    };
    
  } catch (error) {
    console.error('[Market Research Agent] Enhanced skill analysis failed:', error instanceof Error ? error.message : JSON.stringify(error));
    // Return empty enhanced structure if analysis fails
    return {
      enhanced_skill_analysis: [],
      technical_depth_summary: {
        hard_skills_percentage: 0,
        soft_skills_percentage: 0,
        total_skills_analyzed: 0,
        skills_with_experience_req: 0,
        skills_with_certifications: 0,
        skills_with_tools: 0
      },
      certification_landscape: {
        total_certifications_mentioned: 0,
        certification_categories: [],
        top_certifications: [],
        most_requested: [],
        high_value: [],
        emerging: []
      },
      tool_requirements: {
        total_tools_mentioned: 0,
        tool_categories: [],
        most_demanded_tools: []
      },
      context_intelligence: {
        experience_context_available: false,
        skills_with_context: 0,
        context_quality_score: 0
      }
    };
  }
}

function groupCertificationsByCategory(certifications: any[]): any[] {
  const categories: Record<string, any[]> = {
    'Financial': [],
    'Technology': [],
    'Project Management': [],
    'Risk Management': [],
    'Other': []
  };
  
  certifications.forEach(cert => {
    const name = cert.name.toLowerCase();
    if (['cfa', 'frm', 'cpa', 'cia'].some(fin => name.includes(fin))) {
      categories['Financial'].push(cert);
    } else if (['aws', 'azure', 'google', 'cisco', 'microsoft'].some(tech => name.includes(tech))) {
      categories['Technology'].push(cert);
    } else if (['pmp', 'prince2', 'agile', 'scrum'].some(pm => name.includes(pm))) {
      categories['Project Management'].push(cert);
    } else if (['frm', 'prmia', 'garp'].some(risk => name.includes(risk))) {
      categories['Risk Management'].push(cert);
    } else {
      categories['Other'].push(cert);
    }
  });
  
  return Object.entries(categories)
    .filter(([, certs]) => certs.length > 0)
    .map(([category, certs]) => ({ category, certifications: certs }));
}

function groupToolsByCategory(tools: any[]): any[] {
  const categories: Record<string, any[]> = {
    'Analytics & Data': [],
    'Communication': [],
    'Productivity': [],
    'Development': [],
    'Finance': [],
    'Other': []
  };
  
  tools.forEach(tool => {
    const name = tool.name.toLowerCase();
    if (['tableau', 'power bi', 'python', 'sql', 'r', 'excel'].some(analytics => name.includes(analytics))) {
      categories['Analytics & Data'].push(tool);
    } else if (['slack', 'teams', 'zoom', 'outlook'].some(comm => name.includes(comm))) {
      categories['Communication'].push(tool);
    } else if (['office', 'word', 'powerpoint', 'sheets'].some(prod => name.includes(prod))) {
      categories['Productivity'].push(tool);
    } else if (['github', 'jira', 'jenkins', 'docker'].some(dev => name.includes(dev))) {
      categories['Development'].push(tool);
    } else if (['bloomberg', 'sap', 'oracle', 'quickbooks'].some(fin => name.includes(fin))) {
      categories['Finance'].push(tool);
    } else {
      categories['Other'].push(tool);
    }
  });
  
  return Object.entries(categories)
    .filter(([, tools]) => tools.length > 0)
    .map(([category, tools]) => ({ category, tools }));
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
    trending_skills_missing: marketNotInRequirements.slice(0, 5)
  };
}


// Multi-step AI analysis with chain-of-thought reasoning
// Generate structured JSON insights instead of markdown
async function generateStructuredInsights(
  scrapedData: any,
  skillAnalysis: any,
  locations: string,
  positionTitle?: string,
  dateWindow?: string,
  groqApiKey: string
): Promise<any> {
  console.log('[Market Research Agent] Generating structured JSON insights...');

  // Prepare data for AI analysis
  const topSkills = skillAnalysis.top_skills?.slice(0, 10) || [];
  const skillCombinations = skillAnalysis.skill_combinations?.slice(0, 8) || [];
  const experienceDistribution = skillAnalysis.experience_distribution || {};
  const skillsByCategory = skillAnalysis.skills_by_category || [];

  const analysisData = {
    position: positionTitle || 'General Market Analysis',
    locations: locations,
    date_range: dateWindow || '30d',
    total_jobs: scrapedData.total_scraped || 0,
    top_skills: topSkills.map(skill => ({
      name: skill.skill,
      demand_percentage: skill.percentage,
      job_count: skill.demand
    })),
    skill_combinations: skillCombinations.map(combo => ({
      skills: combo.combination,
      frequency: combo.frequency,
      percentage: combo.percentage
    })),
    experience_levels: experienceDistribution,
    categories: skillsByCategory.map(cat => ({
      name: cat.category,
      total_percentage: cat.total_percentage,
      skill_count: cat.skill_count
    }))
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a market intelligence analyst. Generate structured JSON insights for market research data.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks. Start with { and end with }.

Required JSON structure:
{
  "executive_summary": {
    "overview": "2-3 sentence market overview",
    "key_insight": "Most important finding",
    "market_health": "Strong/Moderate/Weak",
    "total_opportunities": number
  },
  "key_findings": [
    {
      "type": "critical|opportunity|trend",
      "title": "Finding title",
      "description": "2-3 sentence description",
      "impact": "High/Medium/Low"
    }
  ],
  "strategic_recommendations": [
    {
      "priority": "immediate|short_term|long_term",
      "title": "Recommendation title",
      "description": "Actionable description",
      "skills_focus": ["skill1", "skill2"],
      "expected_impact": "Business impact description"
    }
  ],
  "market_opportunities": {
    "skill_gaps": ["gap1", "gap2"],
    "emerging_trends": ["trend1", "trend2"],
    "competitive_advantages": ["advantage1", "advantage2"],
    "hiring_insights": "Market hiring insights"
  }
}`
        },
        {
          role: "user",
          content: `Generate structured market intelligence insights for this data:

Position: ${analysisData.position}
Locations: ${analysisData.locations}
Total Jobs Analyzed: ${analysisData.total_jobs}

Top Skills by Demand:
${analysisData.top_skills.map(s => `- ${s.name}: ${s.demand_percentage}% (${s.job_count} jobs)`).join('\n')}

Key Skill Combinations:
${analysisData.skill_combinations.map(c => `- ${c.skills}: ${c.frequency} jobs (${c.percentage}%)`).join('\n')}

Skill Categories:
${analysisData.categories.map(c => `- ${c.name}: ${c.total_percentage}% total demand, ${c.skill_count} skills`).join('\n')}

Experience Distribution:
${Object.entries(analysisData.experience_levels).map(([level, count]) => `- ${level}: ${count} positions`).join('\n')}

Generate comprehensive market intelligence in the specified JSON format.`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`Structured insights generation failed: ${response.status}`);
  }

  const result: GroqResponse = await response.json();
  const jsonContent = result.choices[0]?.message?.content;

  if (!jsonContent) {
    throw new Error('No content received from AI');
  }

  // Parse and validate JSON response
  try {
    const parsedInsights = JSON.parse(jsonContent);
    console.log('[Market Research Agent] ✅ Successfully generated structured JSON insights');
    return parsedInsights;
  } catch (parseError) {
    console.error('[Market Research Agent] ❌ Failed to parse AI JSON response:', parseError);
    // Return fallback structure
    return {
      executive_summary: {
        overview: `Analysis of ${analysisData.total_jobs} job postings for ${analysisData.position} positions.`,
        key_insight: `${topSkills[0]?.skill || 'Technical skills'} shows highest market demand at ${topSkills[0]?.percentage || 0}%.`,
        market_health: "Moderate",
        total_opportunities: topSkills.length
      },
      key_findings: [
        {
          type: "trend",
          title: "High Skill Demand Identified",
          description: `Market shows strong demand for ${topSkills.slice(0, 3).map(s => s.skill).join(', ')}.`,
          impact: "High"
        }
      ],
      strategic_recommendations: [
        {
          priority: "immediate",
          title: "Focus on Top Skills",
          description: `Prioritize training in ${topSkills.slice(0, 2).map(s => s.skill).join(' and ')}.`,
          skills_focus: topSkills.slice(0, 3).map(s => s.skill),
          expected_impact: "Improved market competitiveness"
        }
      ],
      market_opportunities: {
        skill_gaps: topSkills.slice(0, 3).map(s => s.skill),
        emerging_trends: ["Market analysis in progress"],
        competitive_advantages: ["Strong skill foundation"],
        hiring_insights: `${analysisData.total_jobs} positions analyzed across ${analysisData.locations}`
      }
    };
  }
}

async function generateMarketInsights(
  scrapedData: any,
  skillAnalysis: any,
  locations: string,
  positionTitle?: string,
  dateWindow?: string
): Promise<any> {
  console.log('[Market Research Agent] Generating structured JSON insights with AI analysis...');
  
  const groqApiKey = Deno.env.get('GROQ_API_KEY');
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  // Generate structured JSON insights
  const insights = await generateStructuredInsights(
    scrapedData, 
    skillAnalysis, 
    locations, 
    positionTitle, 
    dateWindow,
    groqApiKey
  );
  
  console.log('[Market Research Agent] ✅ Structured JSON insights generation complete');
  return insights;
}

// STEP 1: Generate Executive Summary with 4-part professional structure
async function generateExecutiveSummary(
  scrapedData: any, 
  skillAnalysis: any, 
  locations: string, 
  positionTitle?: string, 
  dateWindow?: string,
  groqApiKey: string
): Promise<string> {
  console.log('[Market Research Agent] Step 1: Generating Executive Summary...');
  
  // Format data for AI consumption - avoid object serialization issues
  const topSkills = skillAnalysis.top_skills?.slice(0, 5) || [];
  const skillCombinations = skillAnalysis.skill_combinations?.slice(0, 3) || [];
  const experienceDistribution = skillAnalysis.experience_distribution || {};
  
  const dataContext = {
    total_jobs: scrapedData.total_scraped,
    locations: locations,
    position_title: positionTitle,
    date_window: dateWindow,
    // Format skills as readable strings
    top_skills_formatted: topSkills.map(skill => 
      `${skill.skill} (${skill.percentage}% of jobs, ${skill.demand} positions)`
    ).join(', '),
    top_skill_names: topSkills.map(skill => skill.skill).join(', '),
    // Format experience distribution as readable string
    experience_levels_formatted: Object.entries(experienceDistribution)
      .map(([level, count]) => `${level}: ${count} positions`)
      .join(', '),
    // Format skill combinations as readable strings
    skill_combinations_formatted: skillCombinations.map(combo => 
      `"${combo.combination}" (${combo.percentage}% of jobs)`
    ).join(', ')
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a senior market intelligence analyst. Generate a professional Executive Summary with enhanced visual callouts.

STRUCTURE: Follow the 4-part McKinsey structure:
1. **Problem/Market Context** - Current market landscape and challenges
2. **Solution/Analysis Approach** - What this analysis covers and methodology 
3. **Value/Key Insights** - Most critical findings with specific numbers and percentages
4. **Conclusion/Strategic Impact** - Why these insights matter and next steps

VISUAL ELEMENTS: Include these callout patterns for enhanced readability:
- Use "💡 Key Insight" for critical findings
- Use "⚠️ Market Alert" for urgent trends or challenges  
- Use "🚀 Opportunity" for growth areas or advantages

DELIVERABLE: Professional Executive Summary (300-400 words) with:
- Specific job counts, percentages, and quantitative data
- Top 3-4 skills with exact demand percentages
- Experience level insights with numbers
- Strategic market implications
- Visual callouts using emoji patterns

FORMAT: Use markdown with ## Executive Summary header and clear paragraph breaks.

EXAMPLE OUTPUT STRUCTURE:
## Executive Summary

The current market for [position] in [locations] shows a competitive landscape with [X] job postings within the last [timeframe].

💡 Key Insight: [Top skill] and [Second skill] are the most sought-after, appearing in [X%] and [Y%] of positions, respectively.

Our analysis approach involved examining [methodology details]...

⚠️ Market Alert: [Critical trend or challenge that needs attention]...

🚀 Opportunity: [Growth area or strategic advantage available]...

These insights indicate [strategic implication] requiring [recommended action]...`
        },
        {
          role: "user", 
          content: `Generate Executive Summary for this market data:

**Market Overview:**
- Total Jobs Analyzed: ${dataContext.total_jobs}
- Locations: ${dataContext.locations}
- Position: ${dataContext.position_title || 'General Market Analysis'}
- Time Period: ${dataContext.date_window || 'Recent'}

**Top Skills in Demand:**
${dataContext.top_skills_formatted}

**Experience Level Distribution:**
${dataContext.experience_levels_formatted}

**Popular Skill Combinations:**
${dataContext.skill_combinations_formatted}

Generate a professional executive summary focusing on quantitative insights and strategic implications for ${positionTitle || 'the analyzed role'}.`
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    throw new Error(`Executive Summary generation failed: ${response.status}`);
  }

  const result: GroqResponse = await response.json();
  return result.choices[0]?.message?.content || '## Executive Summary\n\nAnalysis in progress...';
}

// STEP 2: Generate Key Findings with bullet points
async function generateKeyFindings(
  scrapedData: any,
  skillAnalysis: any, 
  groqApiKey: string
): Promise<any> {
  console.log('[Market Research Agent] Step 2: Generating Key Findings...');

  // Format findings data properly for AI consumption
  const topSkills = skillAnalysis.top_skills || [];
  const topSkill = topSkills[0] || null;
  const skillCombinations = skillAnalysis.skill_combinations?.slice(0, 5) || [];
  const experienceDistribution = skillAnalysis.experience_distribution || {};
  const sampleCompanies = scrapedData.data?.slice(0, 10).map((job: any) => job.company).filter(Boolean) || [];
  
  const findingsData = {
    total_jobs: scrapedData.total_scraped,
    skills_count: topSkills.length,
    // Format top skill as readable string
    top_skill_formatted: topSkill ? `${topSkill.skill} appears in ${topSkill.percentage}% of positions (${topSkill.demand} jobs)` : 'No skills identified',
    top_skill_name: topSkill?.skill || 'Unknown',
    top_skill_percentage: topSkill?.percentage || 0,
    // Format skill combinations as readable strings
    skill_combinations_formatted: skillCombinations.map(combo => 
      `"${combo.combination}" found in ${combo.frequency} jobs (${combo.percentage}% of total)`
    ).join('; '),
    // Format experience levels
    experience_levels_count: Object.keys(experienceDistribution).length,
    experience_distribution_formatted: Object.entries(experienceDistribution)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([level, count]) => `${level}: ${count} positions (${Math.round(((count as number) / scrapedData.total_scraped) * 100)}%)`)
      .join(', '),
    sample_companies_formatted: sampleCompanies.slice(0, 8).join(', ')
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          content: `You are a data analyst. Extract the most important findings from market research data and return them as structured JSON.

DELIVERABLE: Return JSON with "key_findings" array containing 5-7 key findings, each highlighting:
- Most critical quantitative insights (use "High Demand" for top skills)
- Skill demand patterns with specific percentages
- Experience level trends with numbers
- Skill combination patterns with frequencies (use "Opportunity" for emerging patterns)
- Competitive landscape observations (use "Market" for competition insights)

RETURN ONLY VALID JSON in this exact format:
{
  "key_findings": [
    {
      "type": "high_demand|opportunity|market|skill_pattern",
      "title": "Brief title for the finding",
      "description": "Detailed finding with specific numbers",
      "metrics": {
        "percentage": 38,
        "count": 65,
        "skill_name": "Marketing"
      }
    }
  ]
}

VISUAL CUES: Use these types for color coding:
- "high_demand" for critical skills (triggers red highlighting)
- "opportunity" for growth areas (triggers green highlighting)  
- "market" for competitive insights (triggers blue highlighting)
- "skill_pattern" for general skill trends

NO MARKDOWN. NO CODE BLOCKS. Return only the JSON object.`
        },
        {
          role: "user",
          content: `Extract key findings from this market research data:

**Market Overview:**
- Total Jobs Analyzed: ${findingsData.total_jobs}
- Total Unique Skills Identified: ${findingsData.skills_count}
- Experience Levels Found: ${findingsData.experience_levels_count}

**Top Skill Analysis:**
- Most In-Demand Skill: ${findingsData.top_skill_formatted}

**Skill Combination Patterns:**
${findingsData.skill_combinations_formatted}

**Experience Level Distribution:**
${findingsData.experience_distribution_formatted}

**Sample Companies Hiring:**
${findingsData.sample_companies_formatted}

Extract the most actionable and quantifiable insights from this data.`
        }
      ],
      temperature: 0.1,
      max_tokens: 600
    })
  });

  if (!response.ok) {
    throw new Error(`Key Findings generation failed: ${response.status}`);
  }

  const result: GroqResponse = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    return {
      key_findings: [
        {
          type: "high_demand",
          title: "Analysis in Progress",
          description: "Market analysis is currently being processed",
          metrics: {}
        }
      ]
    };
  }
  
  // Parse the JSON response
  const parsedFindings = await safeParseAIResponse(content, 'Key Findings');
  return parsedFindings || {
    key_findings: [
      {
        type: "high_demand", 
        title: "Analysis Error",
        description: "Unable to generate key findings at this time",
        metrics: {}
      }
    ]
  };
}

// STEP 3: Generate Strategic Recommendations
async function generateStrategicRecommendations(
  skillAnalysis: any,
  positionTitle?: string,
  groqApiKey: string
): Promise<any> {
  console.log('[Market Research Agent] Step 3: Generating Strategic Recommendations...');

  // Format recommendations data for AI consumption
  const topSkills = skillAnalysis.top_skills?.slice(0, 8) || [];
  const skillCombinations = skillAnalysis.skill_combinations?.slice(0, 6) || [];
  const skillsByCategory = skillAnalysis.skills_by_category || [];
  
  const recommendationsData = {
    position_title: positionTitle,
    // Format top skills as readable strings
    top_skills_formatted: topSkills.map(skill => 
      `${skill.skill} (${skill.percentage}% demand)`
    ).join(', '),
    highest_demand_skills: topSkills.slice(0, 3).map(skill => skill.skill).join(', '),
    // Format skill combinations
    skill_combinations_formatted: skillCombinations.map(combo => 
      `"${combo.combination}" appears in ${combo.frequency} positions`
    ).join('; '),
    // Format categories
    categories_formatted: skillsByCategory.map(cat => 
      `${typeof cat.category === 'string' ? cat.category : JSON.stringify(cat.category)}: ${cat.skills.length} skills (${cat.total_percentage}% total demand)`
    ).join(', ')
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system", 
          content: `You are a strategic workforce consultant. Generate actionable training and hiring recommendations as structured JSON.

DELIVERABLE: JSON with "strategic_recommendations" array containing 3-4 prioritized recommendations:
1. **Immediate Training Priorities** - Top skills to develop now
2. **Skill Combination Focus** - Critical skill pairs/clusters to build
3. **Hiring Strategy** - Market-informed recruitment approach
4. **Competitive Positioning** - How to leverage market gaps

RETURN ONLY VALID JSON in this exact format:
{
  "strategic_recommendations": [
    {
      "category": "training_priorities|skill_combinations|hiring_strategy|competitive_positioning",
      "title": "Brief recommendation title",
      "strategy": "2-3 sentences explaining the strategy",
      "focus_areas": ["specific skill", "skill combination"],
      "business_impact": "Expected business impact statement",
      "priority": "high|medium|low"
    }
  ]
}

Each recommendation should have:
- Clear category classification
- Specific skills/combinations to focus on
- Actionable strategy explanation
- Expected business impact

Keep recommendations specific and actionable.
NO MARKDOWN. NO CODE BLOCKS. Return only the JSON object.`
        },
        {
          role: "user",
          content: `Generate strategic recommendations based on this market analysis:

**Position:** ${recommendationsData.position_title || 'General Market Analysis'}

**Highest Demand Skills:** ${recommendationsData.highest_demand_skills}

**All Top Skills by Demand:** ${recommendationsData.top_skills_formatted}

**Key Skill Combinations:** ${recommendationsData.skill_combinations_formatted}

**Skill Categories:** ${recommendationsData.categories_formatted}

Generate strategic recommendations for training, hiring, and competitive positioning based on this market intelligence.`
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    throw new Error(`Strategic Recommendations generation failed: ${response.status}`);
  }

  const result: GroqResponse = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    return {
      strategic_recommendations: [
        {
          category: "training_priorities",
          title: "Analysis in Progress",
          strategy: "Strategic recommendations are currently being generated",
          focus_areas: [],
          business_impact: "Analysis pending",
          priority: "high"
        }
      ]
    };
  }
  
  // Parse the JSON response
  const parsedRecommendations = await safeParseAIResponse(content, 'Strategic Recommendations');
  return parsedRecommendations || {
    strategic_recommendations: [
      {
        category: "training_priorities",
        title: "Analysis Error",
        strategy: "Unable to generate strategic recommendations at this time",
        focus_areas: [],
        business_impact: "Please retry analysis",
        priority: "high"
      }
    ]
  };
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
              console.log(`[Market Research Agent] ✅ Added ${scrapedResult.data.length} jobs from ${location}`);
              break; // Success, exit retry loop
            } else {
              throw new Error('No data returned from scraping');
            }
            
          } catch (locationError) {
            console.error(`[Market Research Agent] Failed to scrape ${location} (attempt ${retryCount + 1}):`, locationError instanceof Error ? locationError.message : JSON.stringify(locationError));
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

      // Scraping summary
      console.log(`[Market Research Agent] 📊 Web Scraping Summary:`);
      console.log(`[Market Research Agent] 📈 Total items scraped: ${allJobData.length}`);
      console.log(`[Market Research Agent] ✅ Valid job postings: ${validJobs.length}`);
      console.log(`[Market Research Agent] 🧹 Filtered out: ${allJobData.length - validJobs.length} navigation/invalid items`);
      console.log(`[Market Research Agent] 🎯 Post-filter data quality: ${Math.round((validJobs.length / allJobData.length) * 100)}%`);
      console.log(`[Market Research Agent] 🌍 Locations processed: ${locations.join(', ')}`);
      
      // STEP 1.5: AI-Powered Skill Analysis
      console.log('[Market Research Agent] 🤖 Step 1.5: Running AI skill analysis...');
      await supabase
        .from('market_intelligence_requests')
        .update({
          status_message: `Step 1.5/3: AI analyzing ${validJobs.length} job postings...`,
          updated_at: new Date().toISOString()
        })
        .eq('id', request_id);

      const startTime = Date.now();
      const aiEnhancedJobs = await extractSkillsWithAI(validJobs);
      const analysisTime = Math.round((Date.now() - startTime) / 1000);
      
      console.log(`[Market Research Agent] ⚡ AI analysis completed in ${analysisTime} seconds`);
      console.log(`[Market Research Agent] 🎯 Enhanced ${aiEnhancedJobs.length} jobs with AI insights`);
      
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
      
      // AI-powered skill context generation
      const skillAnalysisWithContexts = await generateSkillContextsWithAI(skillAnalysis);
      console.log(`[Market Research Agent] AI skill contexts generated for ${skillAnalysisWithContexts.skills_by_category.length} categories`);
      
      // Enhanced LLM-powered skill analysis
      const enhancedAnalysis = await enhanceSkillAnalysisWithLLM(aiEnhancedJobs, skillAnalysisWithContexts);
      console.log(`[Market Research Agent] Enhanced analysis complete. Skills with context: ${enhancedAnalysis.context_intelligence.skills_with_context}`);
      
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
      let insightsResult: any = null;
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
        
        insightsResult = await Promise.race([insightsPromise, timeoutPromise]) as any;
        marketInsights = typeof insightsResult === 'string' ? insightsResult : insightsResult.markdown || 'Analysis completed.';
      } catch (insightsError) {
        console.error('[Market Research Agent] AI insights generation failed:', insightsError);
        // Generate basic insights without AI if it fails
        marketInsights = `# Market Intelligence Report - ${position_title || 'General'}

## Executive Summary

Analysis of ${aiEnhancedJobs.length} job postings across ${locations.join(', ')} has been completed. This report provides market intelligence for ${position_title || 'the selected role'} based on recent hiring activity.

## Key Findings

- **Market Activity**: ${aiEnhancedJobs.length} active positions analyzed
- **Geographic Coverage**: ${locations.join(', ')}
- **Analysis Period**: ${date_window === '24h' ? 'Last 24 hours' : date_window === '7d' ? 'Last 7 days' : date_window === '30d' ? 'Last 30 days' : 'Last 90 days'}
- **Skills Identified**: ${skillAnalysis.top_skills?.length || 0} distinct skill categories

The job market shows active demand for ${position_title || 'this role'} across the analyzed regions. Detailed skill breakdowns and experience requirements are available in the Skills Demand Analysis section.

*Note: Advanced AI insights temporarily unavailable. Detailed skill analysis available in interactive sections below.*`;
      }

      // Save final results
      console.log('[Market Research Agent] Saving final analysis results...');
      
      // Extract structured insights if available
      let structuredInsights = null;
      try {
        if (typeof insightsResult === 'object' && insightsResult.structured) {
          structuredInsights = insightsResult.structured;
        }
      } catch (e) {
        console.warn('[Market Research Agent] Could not extract structured insights:', e);
      }
      
      await supabase
        .from('market_intelligence_requests')
        .update({
          status: 'completed',
          status_message: 'Analysis complete! Market intelligence report ready.',
          ai_insights: marketInsights,
          structured_insights: structuredInsights,
          scraped_data: {
            total_jobs: aiEnhancedJobs.length,
            locations: locations,
            job_listings: aiEnhancedJobs
          },
          analysis_data: {
            skill_trends: skillAnalysisWithContexts,
            requirements_comparison: requirementsComparison,
            // Enhanced LLM analysis
            ...enhancedAnalysis
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
          top_skills: skillAnalysis.top_skills // Show all skills found
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
    console.error('[Market Research Agent] Fatal error:', error instanceof Error ? error.message : JSON.stringify(error));
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