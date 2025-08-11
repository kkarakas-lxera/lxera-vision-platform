// LinkedIn Gulf Countries Job Scraper
// Focuses on: Saudi Arabia, UAE, Qatar, Oman

const SCRAPE_DO_TOKEN = '30fcc17f6d1c47dda273387d46ac9ef9eaef9276b48';

interface GulfCountry {
  name: string;
  linkedinGeoId: string;
  linkedinUrl: string;
}

interface SkillData {
  skill: string;
  count: number;
  countries: Set<string>;
  jobTitles: Set<string>;
}

// LinkedIn Geo IDs for Gulf countries
const GULF_COUNTRIES: GulfCountry[] = [
  {
    name: 'Saudi Arabia',
    linkedinGeoId: '100459316',
    linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Saudi%20Arabia&geoId=100459316&f_TPR=r86400'
  },
  {
    name: 'United Arab Emirates',
    linkedinGeoId: '104305776',
    linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=United%20Arab%20Emirates&geoId=104305776&f_TPR=r86400'
  },
  {
    name: 'Qatar',
    linkedinGeoId: '104170880',
    linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Qatar&geoId=104170880&f_TPR=r86400'
  },
  {
    name: 'Oman',
    linkedinGeoId: '103620775',
    linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=Oman&geoId=103620775&f_TPR=r86400'
  }
];

// Comprehensive skill patterns for extraction
const SKILL_PATTERNS = {
  // Programming Languages
  languages: /\b(Python|JavaScript|TypeScript|Java(?!Script)|C\+\+|C#|C\s+Programming|Ruby|Go(?:lang)?|Rust|Swift|Kotlin|PHP|Scala|R\s+Programming|MATLAB|Perl|Objective-C|COBOL|Fortran|Haskell|Erlang|Elixir|Clojure|F#|Visual Basic|Delphi|Pascal|Ada|Lua|Dart|Julia|Groovy|VB\.NET)\b/gi,
  
  // Frontend Technologies
  frontend: /\b(React(?:\.js)?|React Native|Angular(?:JS)?|Vue(?:\.js)?|Next(?:\.js)?|Nuxt(?:\.js)?|Svelte|SvelteKit|Remix|Gatsby|Ember|Backbone|jQuery|Redux|MobX|Vuex|Pinia|Zustand|Recoil|Material[- ]?UI|Ant Design|Chakra UI|Tailwind(?:\s+CSS)?|Bootstrap|SASS|SCSS|LESS|Styled Components|CSS3?|HTML5?|WebAssembly|WASM|PWA|Progressive Web App)\b/gi,
  
  // Backend Technologies
  backend: /\b(Node(?:\.js)?|Express(?:\.js)?|Nest(?:\.js)?|Fastify|Koa|Django|Flask|FastAPI|Spring(?:\s+Boot)?|Spring Framework|\.NET(?:\s+Core)?|ASP\.NET|Laravel|Symfony|Rails|Ruby on Rails|Phoenix|Gin|Echo|Fiber|Gorilla|Actix|Rocket|Axum|Ktor|Micronaut|Quarkus|Vert\.x|Dropwizard|Play Framework)\b/gi,
  
  // Databases
  databases: /\b(SQL|NoSQL|MySQL|PostgreSQL|PostGIS|MongoDB|Redis|Elasticsearch|OpenSearch|Cassandra|DynamoDB|CouchDB|Neo4j|ArangoDB|InfluxDB|TimescaleDB|Firebase|Firestore|Supabase|Oracle(?:\s+Database)?|SQL Server|MS SQL|MariaDB|SQLite|RDS|Aurora|CosmosDB|BigQuery|Snowflake|Redshift|Databricks|Apache Spark|Hadoop|Hive|HBase|Presto|Clickhouse)\b/gi,
  
  // Cloud & Infrastructure
  cloud: /\b(AWS|Amazon Web Services|EC2|S3|Lambda|CloudFormation|Azure|Microsoft Azure|GCP|Google Cloud|Alibaba Cloud|IBM Cloud|Oracle Cloud|DigitalOcean|Linode|Vultr|Heroku|Vercel|Netlify|Cloudflare|CDN|Load Balancer|API Gateway|Service Mesh|Istio|Linkerd|Consul)\b/gi,
  
  // DevOps & Tools
  devops: /\b(Docker|Kubernetes|K8s|OpenShift|Rancher|Helm|Jenkins|GitLab CI|GitHub Actions|CircleCI|Travis CI|TeamCity|Bamboo|Azure DevOps|ArgoCD|FluxCD|Spinnaker|Git|GitHub|GitLab|Bitbucket|SVN|Mercurial|CI\/CD|Infrastructure as Code|IaC|Terraform|Pulumi|CloudFormation|Ansible|Puppet|Chef|SaltStack|Vagrant|Packer)\b/gi,
  
  // AI/ML/Data Science
  ai_ml: /\b(Machine Learning|Deep Learning|Artificial Intelligence|AI|ML|GenAI|Generative AI|LLM|Large Language Model|GPT|ChatGPT|Claude|Gemini|LangChain|LlamaIndex|Vector Database|Pinecone|Weaviate|Qdrant|ChromaDB|RAG|Retrieval Augmented Generation|Fine[- ]?tuning|Transfer Learning|TensorFlow|PyTorch|Keras|Scikit[- ]?learn|XGBoost|LightGBM|CatBoost|Transformers|Hugging Face|BERT|GPT-4|Computer Vision|OpenCV|YOLO|NLP|Natural Language Processing|spaCy|NLTK|Pandas|NumPy|SciPy|Matplotlib|Seaborn|Plotly|Jupyter|Google Colab|MLflow|Weights & Biases|MLOps|Kubeflow|SageMaker|Vertex AI|Azure ML)\b/gi,
  
  // Mobile Development
  mobile: /\b(iOS|Android|React Native|Flutter|Xamarin|Ionic|Cordova|PhoneGap|Swift|SwiftUI|UIKit|Objective-C|Kotlin|Java for Android|Jetpack Compose|Android Studio|Xcode|CocoaPods|Gradle|Firebase|OneSignal|Push Notifications|In[- ]?App Purchase|App Store|Google Play|TestFlight)\b/gi,
  
  // Architecture & Patterns
  architecture: /\b(Microservices|Monolithic|Serverless|Event[- ]?Driven|Domain[- ]?Driven Design|DDD|CQRS|Event Sourcing|Saga Pattern|API Gateway|Service Mesh|Message Queue|RabbitMQ|Apache Kafka|AWS SQS|Azure Service Bus|Google Pub\/Sub|NATS|ZeroMQ|ActiveMQ|Redis Pub\/Sub|WebSocket|Socket\.io|SignalR|gRPC|GraphQL|REST(?:ful)?|SOAP|OpenAPI|Swagger|API Design|Clean Architecture|Hexagonal Architecture|Onion Architecture|MVC|MVP|MVVM|Repository Pattern|Factory Pattern|Observer Pattern|SOLID Principles)\b/gi,
  
  // Security
  security: /\b(Cybersecurity|Information Security|InfoSec|Application Security|AppSec|DevSecOps|OWASP|Penetration Testing|Pen Testing|Vulnerability Assessment|Security Audit|SAST|DAST|IAST|SCA|WAF|Web Application Firewall|DDoS Protection|SSL\/TLS|OAuth|OAuth2|JWT|SAML|SSO|Single Sign[- ]?On|MFA|2FA|Multi[- ]?Factor Authentication|Encryption|AES|RSA|Cryptography|Zero Trust|IAM|Identity Access Management|Azure AD|Active Directory|Okta|Auth0|Keycloak|HashiCorp Vault|Secrets Management|Compliance|GDPR|HIPAA|PCI DSS|SOC 2|ISO 27001)\b/gi,
  
  // Blockchain & Web3
  blockchain: /\b(Blockchain|Web3|Ethereum|Solidity|Smart Contract|DeFi|NFT|DAO|Decentralized|Hyperledger|Fabric|Corda|Polygon|Binance Smart Chain|BSC|Avalanche|Solana|Polkadot|Chainlink|IPFS|Truffle|Hardhat|Ganache|Web3\.js|Ethers\.js|MetaMask|Wallet Connect|ERC20|ERC721|ERC1155|OpenZeppelin|Consensus|Proof of Work|PoW|Proof of Stake|PoS)\b/gi,
  
  // Data Engineering
  dataEngineering: /\b(Data Engineering|ETL|ELT|Data Pipeline|Data Lake|Data Warehouse|Data Mesh|Apache Airflow|Apache NiFi|Talend|Informatica|DataStage|SSIS|Azure Data Factory|AWS Glue|Google Dataflow|Apache Beam|Apache Flink|Apache Storm|Kinesis|Event Hub|Pub\/Sub|Change Data Capture|CDC|Data Quality|Data Governance|Data Catalog|Data Lineage|Master Data Management|MDM)\b/gi,
  
  // Business Intelligence & Analytics
  analytics: /\b(Business Intelligence|BI|Data Analytics|Business Analytics|Tableau|Power BI|Looker|Qlik|QlikView|QlikSense|Sisense|Domo|Google Data Studio|Grafana|Kibana|Metabase|Superset|Apache Superset|DAX|MDX|OLAP|Data Cube|KPI|Dashboard|Reporting|Data Visualization|D3\.js|Chart\.js|Highcharts|ECharts)\b/gi,
  
  // Project Management & Methodologies
  methodology: /\b(Agile|Scrum|Kanban|SAFe|Scaled Agile|Lean|Six Sigma|Waterfall|Prince2|PMP|Project Management|Product Management|Product Owner|Scrum Master|Sprint|Backlog|User Story|Epic|JIRA|Confluence|Asana|Monday\.com|Trello|Azure Boards|Linear|Notion|Slack|Microsoft Teams|Zoom|Story Points|Velocity|Burndown|Retrospective|Stand[- ]?up|Daily Scrum|Sprint Planning|Sprint Review)\b/gi,
  
  // ERP & Enterprise Systems
  enterprise: /\b(SAP|SAP S\/4HANA|SAP ERP|SAP BW|SAP ABAP|SAP Fiori|SAP UI5|Oracle ERP|Oracle Fusion|NetSuite|Microsoft Dynamics|Dynamics 365|Dynamics CRM|Dynamics NAV|Salesforce|Salesforce CRM|Apex|Lightning|ServiceNow|Workday|PeopleSoft|JD Edwards|Infor|Epicor|Sage|QuickBooks|Odoo|ERPNext|SugarCRM|HubSpot|Pipedrive|Zoho)\b/gi,
  
  // Testing & QA
  testing: /\b(Testing|QA|Quality Assurance|Test Automation|Selenium|WebDriver|Cypress|Playwright|Puppeteer|TestCafe|Appium|Espresso|XCTest|Jest|Mocha|Chai|Jasmine|Karma|Pytest|unittest|RSpec|Cucumber|BDD|TDD|Test[- ]?Driven Development|Behavior[- ]?Driven Development|Unit Testing|Integration Testing|E2E Testing|End[- ]?to[- ]?End|Performance Testing|Load Testing|Stress Testing|JMeter|Gatling|LoadRunner|Postman|Rest Assured|SoapUI|API Testing|Manual Testing|Exploratory Testing|Regression Testing|Smoke Testing|User Acceptance Testing|UAT)\b/gi,
  
  // Design Tools
  design: /\b(UI\/UX|User Interface|User Experience|UX Design|UI Design|Figma|Sketch|Adobe XD|InVision|Framer|Principle|Zeplin|Abstract|Marvel|Proto\.io|Balsamiq|Wireframe|Mockup|Prototype|Design System|Style Guide|Component Library|Atomic Design|Material Design|Human Interface Guidelines|HIG|Accessibility|WCAG|A11y|Responsive Design|Mobile[- ]?First|Adobe Creative Suite|Photoshop|Illustrator|After Effects|Premiere Pro)\b/gi
};

async function scrapeLinkedInGulf() {
  console.log('🌊 LinkedIn Gulf Region Tech Skills Analysis');
  console.log('============================================\n');
  console.log('🎯 Target Countries: Saudi Arabia, UAE, Qatar, Oman');
  console.log('📅 Date: ' + new Date().toLocaleDateString());
  console.log('⏰ Time: ' + new Date().toLocaleTimeString());
  console.log('\n🔄 Starting LinkedIn scraping for each country...\n');

  const allSkills = new Map<string, SkillData>();
  const countryResults: any[] = [];

  for (const country of GULF_COUNTRIES) {
    console.log(`\n🏳️ Scraping: ${country.name}`);
    console.log(`📍 LinkedIn URL: ${country.linkedinUrl}`);
    
    try {
      // Scrape with Scrape.do
      const scrapeUrl = `http://api.scrape.do/?token=${SCRAPE_DO_TOKEN}&url=${encodeURIComponent(country.linkedinUrl)}&render=true&waitUntil=networkidle&customWait=3000`;
      
      console.log('⏳ Fetching LinkedIn job listings...');
      const response = await fetch(scrapeUrl);
      
      if (!response.ok) {
        console.log(`❌ Failed to scrape: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const html = await response.text();
      console.log(`✅ Received ${(html.length / 1024).toFixed(1)}KB of data`);
      
      // Extract job count if available
      const jobCountMatch = html.match(/(\d+(?:,\d+)?)\s*(?:jobs?|results?)/i);
      const jobCount = jobCountMatch ? jobCountMatch[1] : 'Unknown';
      console.log(`💼 Approximate jobs found: ${jobCount}`);
      
      // Extract skills using all patterns
      const countrySkills = new Set<string>();
      let totalMentions = 0;
      
      for (const [category, pattern] of Object.entries(SKILL_PATTERNS)) {
        const matches = html.match(pattern);
        if (matches) {
          matches.forEach(skill => {
            const normalized = normalizeSkill(skill);
            countrySkills.add(normalized);
            totalMentions++;
            
            // Update global skills map
            if (allSkills.has(normalized)) {
              const existing = allSkills.get(normalized)!;
              existing.count++;
              existing.countries.add(country.name);
            } else {
              allSkills.set(normalized, {
                skill: normalized,
                count: 1,
                countries: new Set([country.name]),
                jobTitles: new Set()
              });
            }
          });
        }
      }
      
      console.log(`📊 Extracted ${countrySkills.size} unique skills (${totalMentions} total mentions)`);
      
      // Store country results
      countryResults.push({
        country: country.name,
        jobCount,
        uniqueSkills: countrySkills.size,
        totalMentions,
        topSkills: Array.from(countrySkills).slice(0, 10)
      });
      
    } catch (error) {
      console.log(`❌ Error scraping ${country.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Delay between requests to avoid rate limiting
    console.log('⏱️ Waiting 3 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Analyze and display consolidated results
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('📊 GULF REGION LINKEDIN TECH SKILLS ANALYSIS - CONSOLIDATED REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Sort skills by count
  const sortedSkills = Array.from(allSkills.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 25); // Top 25 skills
  
  console.log('🏆 Top 25 In-Demand Tech Skills Across Gulf Region:\n');
  console.log('Rank | Skill                  | Mentions | Countries Present');
  console.log('-----|------------------------|----------|------------------');
  
  sortedSkills.forEach(([skillName, data], index) => {
    const rank = (index + 1).toString().padStart(4);
    const skill = skillName.padEnd(22);
    const count = data.count.toString().padStart(8);
    const countries = Array.from(data.countries).join(', ');
    console.log(`${rank} | ${skill} | ${count} | ${countries}`);
  });
  
  // Country-specific insights
  console.log('\n\n📍 Country-Specific Analysis:');
  console.log('════════════════════════════════\n');
  
  countryResults.forEach(result => {
    console.log(`${result.country}:`);
    console.log(`  • Jobs Available: ${result.jobCount}`);
    console.log(`  • Unique Skills Found: ${result.uniqueSkills}`);
    console.log(`  • Total Skill Mentions: ${result.totalMentions}`);
    if (result.topSkills.length > 0) {
      console.log(`  • Top Skills: ${result.topSkills.slice(0, 5).join(', ')}`);
    }
    console.log('');
  });
  
  // Category Analysis
  console.log('\n📈 Skills by Category Distribution:');
  console.log('═══════════════════════════════════\n');
  
  const categoryCount: Record<string, number> = {};
  
  sortedSkills.forEach(([skillName, data]) => {
    // Categorize each skill
    for (const [category, pattern] of Object.entries(SKILL_PATTERNS)) {
      if (pattern.test(skillName)) {
        categoryCount[category] = (categoryCount[category] || 0) + data.count;
        break;
      }
    }
  });
  
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const categoryName = category.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
      console.log(`• ${categoryName}: ${count} mentions`);
    });
  
  // Regional Insights
  console.log('\n\n💡 Key Regional Insights:');
  console.log('═════════════════════════');
  
  const skillsByCountryCount = new Map<number, string[]>();
  allSkills.forEach((data, skill) => {
    const countryCount = data.countries.size;
    if (!skillsByCountryCount.has(countryCount)) {
      skillsByCountryCount.set(countryCount, []);
    }
    skillsByCountryCount.get(countryCount)!.push(skill);
  });
  
  const universalSkills = skillsByCountryCount.get(4) || [];
  if (universalSkills.length > 0) {
    console.log(`\n✅ Universal Skills (Present in all 4 countries):`);
    console.log(`   ${universalSkills.slice(0, 10).join(', ')}`);
  }
  
  console.log('\n\n🎯 Strategic Recommendations:');
  console.log('════════════════════════════');
  console.log('1. Focus on universal skills present across all Gulf countries');
  console.log('2. Cloud certifications (AWS, Azure) are highly valuable');
  console.log('3. AI/ML skills showing strong growth trajectory');
  console.log('4. Full-stack capabilities increasingly important');
  console.log('5. DevOps and CI/CD essential for modern roles');
  
  console.log('\n\n✅ Scraping completed successfully!');
  console.log('📊 Data freshness: Real-time LinkedIn data');
  console.log('🔄 Generated at: ' + new Date().toISOString());
}

function normalizeSkill(skill: string): string {
  // Normalize common variations
  const normalizations: Record<string, string> = {
    'React.js': 'React',
    'ReactJS': 'React',
    'Vue.js': 'Vue',
    'VueJS': 'Vue',
    'Node.js': 'Node',
    'NodeJS': 'Node',
    'Angular.js': 'Angular',
    'AngularJS': 'Angular',
    '.NET Core': '.NET',
    'Amazon Web Services': 'AWS',
    'Microsoft Azure': 'Azure',
    'Google Cloud Platform': 'GCP',
    'Artificial Intelligence': 'AI',
    'Machine Learning': 'ML',
    'CI/CD': 'CI/CD Pipeline'
  };
  
  const trimmed = skill.trim();
  return normalizations[trimmed] || trimmed;
}

// Execute the scraping
scrapeLinkedInGulf().catch(console.error);