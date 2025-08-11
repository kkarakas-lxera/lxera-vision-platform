// Real scraping test using Scrape.do API
const SCRAPE_DO_TOKEN = '30fcc17f6d1c47dda273387d46ac9ef9eaef9276b48';

interface ExtractedSkill {
  name: string;
  count: number;
  sources: Set<string>;
}

async function scrapeRealJobData() {
  console.log('🔍 Starting REAL job market scraping for MENA region...\n');
  
  // Test URLs for MENA job markets
  const targets = [
    {
      name: 'Bayt.com - Software Jobs',
      url: 'https://www.bayt.com/en/uae/jobs/software-engineer-jobs/',
      selector: 'job listings'
    },
    {
      name: 'LinkedIn UAE Jobs',
      url: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=United%20Arab%20Emirates&locationId=&geoId=104305776&f_TPR=r86400',
      selector: 'job cards'
    },
    {
      name: 'Indeed UAE',
      url: 'https://ae.indeed.com/jobs?q=software+developer&l=Dubai',
      selector: 'job results'
    }
  ];

  const allSkills = new Map<string, ExtractedSkill>();
  
  // Common tech skills to search for
  const skillPatterns = [
    // Programming Languages
    /\b(Python|JavaScript|TypeScript|Java(?!Script)|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|PHP|Scala|R|MATLAB|Perl|Objective-C)\b/gi,
    // Frontend Frameworks
    /\b(React(?:\.js)?|Angular(?:JS)?|Vue(?:\.js)?|Next(?:\.js)?|Nuxt(?:\.js)?|Svelte|Ember|Backbone|jQuery)\b/gi,
    // Backend Frameworks
    /\b(Node(?:\.js)?|Express(?:\.js)?|Django|Flask|FastAPI|Spring(?:\s+Boot)?|\.NET(?:\s+Core)?|Laravel|Rails|Symfony)\b/gi,
    // Databases
    /\b(SQL|MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Cassandra|DynamoDB|Firebase|Oracle|SQL\s+Server|MariaDB|CouchDB|Neo4j)\b/gi,
    // Cloud Platforms
    /\b(AWS|Amazon\s+Web\s+Services|Azure|Microsoft\s+Azure|GCP|Google\s+Cloud|Alibaba\s+Cloud|IBM\s+Cloud|DigitalOcean|Heroku)\b/gi,
    // DevOps & Tools
    /\b(Docker|Kubernetes|K8s|Jenkins|Git(?:Hub|Lab)?|CI\/CD|Terraform|Ansible|Puppet|Chef|CircleCI|Travis\s*CI|GitOps|ArgoCD)\b/gi,
    // AI/ML/Data
    /\b(Machine\s+Learning|Deep\s+Learning|Artificial\s+Intelligence|AI|ML|TensorFlow|PyTorch|Scikit-learn|Keras|OpenCV|NLP|Computer\s+Vision|Data\s+Science|Big\s+Data|Spark|Hadoop|Kafka|Airflow)\b/gi,
    // Mobile Development
    /\b(iOS|Android|React\s+Native|Flutter|Xamarin|Swift|Kotlin|Ionic|Cordova)\b/gi,
    // Other Technologies
    /\b(REST(?:ful)?|GraphQL|gRPC|Microservices|Serverless|WebSocket|RabbitMQ|Kafka|Blockchain|Ethereum|Solidity|Web3|DevOps|Agile|Scrum|JIRA)\b/gi,
    // Data & Analytics
    /\b(Tableau|Power\s+BI|Looker|Grafana|Prometheus|ELK\s+Stack|Splunk|DataDog|New\s+Relic)\b/gi,
    // Security
    /\b(Cybersecurity|Security|OWASP|Penetration\s+Testing|SSL\/TLS|OAuth|JWT|SAML|IAM)\b/gi,
    // Design & UX
    /\b(UI\/UX|Figma|Sketch|Adobe\s+XD|InVision|Photoshop|Illustrator)\b/gi
  ];

  console.log('📡 Scraping job boards with Scrape.do API...\n');

  for (const target of targets) {
    console.log(`\n🌐 Scraping: ${target.name}`);
    console.log(`   URL: ${target.url}`);
    
    try {
      // Use Scrape.do with rendering for dynamic content
      const scrapeUrl = `http://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(target.url)}&render=true&waitUntil=networkidle&customWait=3000`;
      
      console.log('   ⏳ Fetching page content...');
      const response = await fetch(scrapeUrl);
      
      if (!response.ok) {
        console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`   ✅ Received ${html.length} characters of HTML`);
      
      // Extract skills from HTML
      const foundSkills = new Set<string>();
      let totalMatches = 0;
      
      for (const pattern of skillPatterns) {
        const matches = html.match(pattern);
        if (matches) {
          matches.forEach(skill => {
            const normalized = skill.trim();
            foundSkills.add(normalized);
            totalMatches++;
            
            // Update global skills map
            if (allSkills.has(normalized)) {
              const existing = allSkills.get(normalized)!;
              existing.count++;
              existing.sources.add(target.name);
            } else {
              allSkills.set(normalized, {
                name: normalized,
                count: 1,
                sources: new Set([target.name])
              });
            }
          });
        }
      }
      
      console.log(`   📊 Found ${foundSkills.size} unique skills (${totalMatches} total mentions)`);
      
      // Show top skills from this source
      const topFromSource = Array.from(foundSkills).slice(0, 5);
      if (topFromSource.length > 0) {
        console.log(`   🏆 Top skills: ${topFromSource.join(', ')}`);
      }
      
      // Check for job count indicators
      const jobCountMatch = html.match(/(\d+(?:,\d+)?)\s*(?:jobs?|results?|positions?)/i);
      if (jobCountMatch) {
        console.log(`   💼 Approximate jobs available: ${jobCountMatch[1]}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Analyze and display results
  console.log('\n\n═══════════════════════════════════════════════');
  console.log('📊 REAL MENA JOB MARKET ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════\n');
  
  if (allSkills.size === 0) {
    console.log('❌ No skills data extracted. The scraping might have been blocked or the page structure changed.');
    return;
  }
  
  // Sort skills by count
  const sortedSkills = Array.from(allSkills.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15); // Top 15 skills
  
  console.log(`📈 Top ${sortedSkills.length} In-Demand Skills (REAL DATA):\n`);
  
  const maxCount = sortedSkills[0]?.[1].count || 1;
  
  sortedSkills.forEach(([skillName, skill], index) => {
    const percentage = Math.round((skill.count / maxCount) * 100);
    const barLength = Math.round(percentage / 2);
    const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);
    
    console.log(`${(index + 1).toString().padStart(2)}. ${skillName.padEnd(20)} ${bar} ${percentage}%`);
    console.log(`    Mentions: ${skill.count} | Found on: ${Array.from(skill.sources).join(', ')}`);
    console.log('');
  });
  
  // Summary statistics
  console.log('\n📈 Summary Statistics:');
  console.log('═══════════════════════');
  console.log(`• Total unique skills identified: ${allSkills.size}`);
  console.log(`• Data sources scraped: ${targets.length}`);
  console.log(`• Most mentioned skill: ${sortedSkills[0]?.[0] || 'N/A'} (${sortedSkills[0]?.[1].count || 0} mentions)`);
  
  // Group skills by category
  const categories = {
    'Programming Languages': ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'PHP'],
    'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform'],
    'AI/ML': ['Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science'],
    'Frontend': ['React', 'Angular', 'Vue', 'Next.js', 'HTML', 'CSS'],
    'Backend': ['Node.js', 'Django', 'Spring', '.NET', 'Express'],
    'Databases': ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis']
  };
  
  console.log('\n📂 Skills by Category:');
  console.log('═════════════════════');
  
  for (const [category, keywords] of Object.entries(categories)) {
    const categorySkills = Array.from(allSkills.entries())
      .filter(([name]) => keywords.some(kw => name.toLowerCase().includes(kw.toLowerCase())))
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);
    
    if (categorySkills.length > 0) {
      console.log(`\n${category}:`);
      categorySkills.forEach(([name, skill]) => {
        console.log(`  • ${name}: ${skill.count} mentions`);
      });
    }
  }
  
  console.log('\n\n✅ Real-time scraping completed successfully!');
  console.log('📝 Note: These are ACTUAL results from live job boards.');
  console.log('🔄 Data freshness: Real-time as of', new Date().toLocaleString());
}

// Run the real scraping
scrapeRealJobData().catch(console.error);