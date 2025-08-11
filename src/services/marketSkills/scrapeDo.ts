// Scrape.do Integration for Market Skills Trend Detection
// This service scrapes job market data to identify trending skills

const SCRAPE_DO_TOKEN = '30fcc17f6d1c47dda273387d46ac9ef9eaef9276b48';
const SCRAPE_DO_API = 'http://api.scrape.do';

interface ScrapedJobData {
  title: string;
  company: string;
  location: string;
  skills: string[];
  postedDate?: string;
  salary?: string;
  url: string;
}

interface SkillTrend {
  skill: string;
  mentions: number;
  percentage: number;
  trend: 'rising' | 'stable' | 'declining';
  sources: string[];
  lastSeen: Date;
  regions?: string[];
}

interface MarketReport {
  region: string;
  period: string;
  topSkills: SkillTrend[];
  totalJobs: number;
  sources: string[];
  generatedAt: Date;
}

export class ScrapeDoService {
  private apiToken: string;

  constructor(token?: string) {
    this.apiToken = token || SCRAPE_DO_TOKEN;
  }

  /**
   * Scrape job listings from multiple sources for MENA region
   */
  async scrapeMENAJobMarket(query: string = 'software engineer', period: string = 'May-July 2025'): Promise<MarketReport> {
    const sources = [
      { 
        name: 'LinkedIn Jobs MENA',
        url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=Middle%20East%20and%20North%20Africa&f_TPR=r2592000`
      },
      {
        name: 'Bayt.com',
        url: `https://www.bayt.com/en/international/jobs/${encodeURIComponent(query)}-jobs/`
      },
      {
        name: 'Indeed UAE',
        url: `https://ae.indeed.com/jobs?q=${encodeURIComponent(query)}&fromage=30`
      },
      {
        name: 'GulfTalent',
        url: `https://www.gulftalent.com/jobs/${encodeURIComponent(query.replace(' ', '-'))}`
      }
    ];

    const allSkills: Map<string, SkillTrend> = new Map();
    let totalJobs = 0;

    for (const source of sources) {
      try {
        const data = await this.scrapeWithRender(source.url);
        const jobs = this.extractJobData(data, source.name);
        
        // Aggregate skills from all jobs
        jobs.forEach(job => {
          totalJobs++;
          job.skills.forEach(skill => {
            const normalizedSkill = this.normalizeSkillName(skill);
            if (allSkills.has(normalizedSkill)) {
              const existing = allSkills.get(normalizedSkill)!;
              existing.mentions++;
              existing.sources = [...new Set([...existing.sources, source.name])];
              existing.lastSeen = new Date();
            } else {
              allSkills.set(normalizedSkill, {
                skill: normalizedSkill,
                mentions: 1,
                percentage: 0,
                trend: 'stable',
                sources: [source.name],
                lastSeen: new Date()
              });
            }
          });
        });
      } catch (error) {
        console.error(`Failed to scrape ${source.name}:`, error);
      }
    }

    // Calculate percentages and sort by mentions
    const sortedSkills = Array.from(allSkills.values())
      .map(skill => ({
        ...skill,
        percentage: Math.round((skill.mentions / totalJobs) * 100)
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);

    // Determine trends based on historical data or patterns
    sortedSkills.forEach(skill => {
      skill.trend = this.determineTrend(skill.skill, skill.mentions);
    });

    return {
      region: 'MENA',
      period,
      topSkills: sortedSkills,
      totalJobs,
      sources: sources.map(s => s.name),
      generatedAt: new Date()
    };
  }

  /**
   * Scrape a URL with JavaScript rendering enabled
   */
  private async scrapeWithRender(url: string): Promise<string> {
    const scrapeUrl = `${SCRAPE_DO_API}/?token=${this.apiToken}&url=${encodeURIComponent(url)}&render=true&waitUntil=networkidle2&customWait=2000`;
    
    const response = await fetch(scrapeUrl);
    if (!response.ok) {
      throw new Error(`Scrape failed: ${response.statusText}`);
    }
    
    return response.text();
  }

  /**
   * Extract job data and skills from HTML
   */
  private extractJobData(html: string, source: string): ScrapedJobData[] {
    const jobs: ScrapedJobData[] = [];
    
    // Pattern matching for common skill keywords
    const skillPatterns = [
      // Programming Languages
      /\b(Python|JavaScript|TypeScript|Java|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|Scala|R|MATLAB)\b/gi,
      // Frontend
      /\b(React|Angular|Vue\.js|Next\.js|Svelte|HTML5?|CSS3?|SASS|LESS|Tailwind|Bootstrap)\b/gi,
      // Backend
      /\b(Node\.js|Express|Django|Flask|Spring|\.NET|Laravel|Rails|FastAPI)\b/gi,
      // Databases
      /\b(SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Cassandra|DynamoDB|Firebase)\b/gi,
      // Cloud & DevOps
      /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|CI\/CD|Terraform|Ansible|DevOps)\b/gi,
      // AI/ML
      /\b(Machine Learning|Deep Learning|TensorFlow|PyTorch|Scikit-learn|NLP|Computer Vision|AI|LLM|GPT)\b/gi,
      // Data
      /\b(Data Science|Data Analysis|Pandas|NumPy|Spark|Hadoop|Tableau|Power BI|ETL|Data Engineering)\b/gi,
      // Mobile
      /\b(iOS|Android|React Native|Flutter|Xamarin|SwiftUI)\b/gi,
      // Others
      /\b(Agile|Scrum|REST API|GraphQL|Microservices|Blockchain|Cybersecurity|UI\/UX|Figma)\b/gi
    ];

    // Extract skills from the entire HTML
    const allSkills: Set<string> = new Set();
    
    skillPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(skill => allSkills.add(skill));
      }
    });

    // Create mock job entries with extracted skills
    // In production, you'd parse actual job listings
    if (allSkills.size > 0) {
      jobs.push({
        title: 'Aggregated Skills',
        company: source,
        location: 'MENA',
        skills: Array.from(allSkills),
        url: source
      });
    }

    return jobs;
  }

  /**
   * Normalize skill names for consistency
   */
  private normalizeSkillName(skill: string): string {
    const normalizations: Record<string, string> = {
      'JS': 'JavaScript',
      'TS': 'TypeScript',
      'React.js': 'React',
      'Vue': 'Vue.js',
      'Node': 'Node.js',
      'K8s': 'Kubernetes',
      'ML': 'Machine Learning',
      'DL': 'Deep Learning',
      'AI/ML': 'Machine Learning',
      'CICD': 'CI/CD',
      'RestAPI': 'REST API'
    };

    const normalized = skill.trim();
    return normalizations[normalized] || normalized;
  }

  /**
   * Determine trend based on historical data
   */
  private determineTrend(skill: string, currentMentions: number): 'rising' | 'stable' | 'declining' {
    // In production, compare with historical data
    const trendingSkills = ['AI', 'Machine Learning', 'TypeScript', 'Kubernetes', 'React'];
    const decliningSkills = ['jQuery', 'PHP', 'Angular.js'];
    
    if (trendingSkills.some(s => skill.includes(s))) return 'rising';
    if (decliningSkills.some(s => skill.includes(s))) return 'declining';
    
    return 'stable';
  }

  /**
   * Get mock data for MENA region skills (May-July 2025)
   * This simulates what real scraping would return
   */
  async getMENASkillsTrends(): Promise<MarketReport> {
    // Simulated data based on current MENA market trends
    const topSkills: SkillTrend[] = [
      {
        skill: 'Python',
        mentions: 892,
        percentage: 68,
        trend: 'rising',
        sources: ['LinkedIn', 'Bayt.com', 'Indeed UAE'],
        lastSeen: new Date(),
        regions: ['UAE', 'Saudi Arabia', 'Egypt']
      },
      {
        skill: 'JavaScript',
        mentions: 756,
        percentage: 58,
        trend: 'stable',
        sources: ['LinkedIn', 'GulfTalent', 'Bayt.com'],
        lastSeen: new Date(),
        regions: ['UAE', 'Qatar', 'Kuwait']
      },
      {
        skill: 'React',
        mentions: 623,
        percentage: 48,
        trend: 'rising',
        sources: ['LinkedIn', 'Indeed UAE'],
        lastSeen: new Date(),
        regions: ['UAE', 'Saudi Arabia']
      },
      {
        skill: 'AWS',
        mentions: 589,
        percentage: 45,
        trend: 'rising',
        sources: ['LinkedIn', 'Bayt.com', 'GulfTalent'],
        lastSeen: new Date(),
        regions: ['UAE', 'Saudi Arabia', 'Bahrain']
      },
      {
        skill: 'Machine Learning',
        mentions: 521,
        percentage: 40,
        trend: 'rising',
        sources: ['LinkedIn', 'Indeed UAE'],
        lastSeen: new Date(),
        regions: ['UAE', 'Saudi Arabia', 'Egypt']
      },
      {
        skill: 'Docker',
        mentions: 478,
        percentage: 37,
        trend: 'stable',
        sources: ['LinkedIn', 'GulfTalent'],
        lastSeen: new Date(),
        regions: ['UAE', 'Qatar']
      },
      {
        skill: 'SQL',
        mentions: 445,
        percentage: 34,
        trend: 'stable',
        sources: ['Bayt.com', 'Indeed UAE', 'LinkedIn'],
        lastSeen: new Date(),
        regions: ['All MENA']
      },
      {
        skill: 'Kubernetes',
        mentions: 412,
        percentage: 32,
        trend: 'rising',
        sources: ['LinkedIn', 'GulfTalent'],
        lastSeen: new Date(),
        regions: ['UAE', 'Saudi Arabia']
      },
      {
        skill: 'TypeScript',
        mentions: 389,
        percentage: 30,
        trend: 'rising',
        sources: ['LinkedIn', 'Indeed UAE'],
        lastSeen: new Date(),
        regions: ['UAE', 'Egypt']
      },
      {
        skill: 'Azure',
        mentions: 367,
        percentage: 28,
        trend: 'stable',
        sources: ['LinkedIn', 'Bayt.com'],
        lastSeen: new Date(),
        regions: ['Saudi Arabia', 'UAE', 'Qatar']
      }
    ];

    return {
      region: 'MENA',
      period: 'May-July 2025',
      topSkills,
      totalJobs: 1305,
      sources: ['LinkedIn Jobs MENA', 'Bayt.com', 'Indeed UAE', 'GulfTalent'],
      generatedAt: new Date()
    };
  }
}

// Export a singleton instance
export const scrapeDoService = new ScrapeDoService();