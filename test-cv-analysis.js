// Test script to debug CV analysis
const testCVAnalysis = async () => {
  // Sample CV text that was successfully extracted
  const cvText = `Kubilay Cenk Karakas
Senior Software Engineer | Full Stack Developer
Email: kubilay@example.com | Phone: +1234567890

PROFESSIONAL SUMMARY
Experienced Senior Software Engineer with 8+ years developing scalable web applications.
Expertise in React, Node.js, TypeScript, and cloud infrastructure (AWS, Azure).
Led teams of 5-10 developers on enterprise projects worth $2M+.

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, Java, Go
Frontend: React, Vue.js, Angular, Next.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express, Django, Spring Boot, GraphQL
Databases: PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch
Cloud & DevOps: AWS (EC2, S3, Lambda), Azure, Docker, Kubernetes, CI/CD
Tools: Git, Jira, Jenkins, Webpack, Jest, Cypress

WORK EXPERIENCE
Senior Software Engineer - Tech Corp (2020-Present)
- Led development of microservices architecture serving 1M+ users
- Reduced API response time by 60% through optimization
- Mentored junior developers and conducted code reviews
- Implemented CI/CD pipelines reducing deployment time by 80%

Software Engineer - StartupXYZ (2017-2020)
- Built real-time chat system using WebSockets and Redis
- Developed RESTful APIs handling 10K requests/minute
- Migrated legacy codebase from PHP to Node.js
- Improved test coverage from 30% to 85%

Junior Developer - WebAgency (2015-2017)
- Created responsive websites for 50+ clients
- Developed custom WordPress plugins
- Collaborated with designers on UI/UX improvements

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2011-2015)
GPA: 3.8/4.0

CERTIFICATIONS
- AWS Certified Solutions Architect (2022)
- Google Cloud Professional Developer (2021)
- Scrum Master Certification (2020)

LANGUAGES
- English (Native)
- Spanish (Intermediate)
- German (Basic)`;

  // Test the AI prompt
  const systemPrompt = 'You are an expert HR analyst specializing in technical skill assessment and CV analysis. Extract information accurately and comprehensively.';
  
  const promptTemplate = `
    Analyze this CV comprehensively and extract the following information:
    
    1. Personal Information (name, contact details)
    2. Professional Summary
    3. Work Experience (with dates, companies, positions, key achievements)
    4. Education (degrees, institutions, dates)
    5. Certifications (name, issuer, date if available)
    6. Skills:
       - Technical Skills (programming languages, tools, frameworks, databases)
       - Soft Skills (leadership, communication, teamwork, etc.)
       - Domain Knowledge (industry-specific expertise)
    7. Languages (with proficiency levels)
    8. Notable Projects or Achievements
    9. Total years of experience
    
    For each skill, provide:
    - skill_name: The specific skill
    - category: technical|soft|domain|tool|language
    - proficiency_level: 1-5 (1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert)
    - years_experience: estimated years (can be null)
    - evidence: specific evidence from CV
    - context: where/how this skill was used
    
    Format the response as a structured JSON object with this structure:
    {
      "personal_info": {
        "name": "string",
        "email": "string",
        "phone": "string"
      },
      "professional_summary": "string",
      "work_experience": [
        {
          "company": "string",
          "position": "string",
          "duration": "string",
          "responsibilities": ["string"]
        }
      ],
      "education": [
        {
          "degree": "string",
          "institution": "string",
          "year": "string"
        }
      ],
      "certifications": [
        {
          "name": "string",
          "issuer": "string",
          "year": "string"
        }
      ],
      "skills": [
        {
          "skill_name": "string",
          "category": "technical|soft|domain|tool|language",
          "proficiency_level": 1-5,
          "years_experience": number|null,
          "evidence": "string",
          "context": "string"
        }
      ],
      "languages": [
        {
          "language": "string",
          "proficiency": "string"
        }
      ],
      "total_experience_years": number
    }
  `;

  const prompt = `${promptTemplate}\n\nCV Content:\n${cvText}`;
  
  console.log('Prompt length:', prompt.length);
  console.log('Expected skills to extract:', [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go',
    'React', 'Vue.js', 'Angular', 'Next.js',
    'Node.js', 'Express', 'Django', 'Spring Boot',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
    'AWS', 'Docker', 'Kubernetes',
    'Leadership', 'Mentoring', 'Team Management'
  ]);
};

testCVAnalysis();