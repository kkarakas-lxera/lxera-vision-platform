# CV Analysis to Course Generation Pipeline

This system analyzes employee CVs using OpenAI, maps skills to the NESTA UK taxonomy, calculates skill gaps, and generates personalized courses.

## 🚀 Features

- **CV Analysis with OpenAI GPT-4**: Extracts skills, experience, and qualifications
- **NESTA Skills Mapping**: Maps extracted skills to 7,036 standardized UK skills
- **Skills Gap Analysis**: Compares current vs required skills for positions
- **Automated Course Generation**: Creates personalized 4-6 week learning paths
- **Bulk Processing**: Handle 100+ employees simultaneously

## 📋 Prerequisites

1. **OpenAI API Key**: Required for CV analysis
2. **Node.js 18+**: For running the scripts
3. **Supabase Access**: Database and authentication

## 🛠️ Setup

1. **Install Dependencies**:
```bash
npm install openai pdf-parse mammoth form-data dotenv
```

2. **Set Environment Variables**:
Create a `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 🔄 Complete Workflow

### 1. Import Employees (CSV)
```bash
node scripts/test-employee-import.js
```
- Uploads employee data from CSV
- Creates user accounts and employee records

### 2. Analyze CVs
```bash
node scripts/cv-analysis-service.js
```
- Extracts text from PDF/DOCX/TXT files
- Uses OpenAI to identify skills and experience
- Maps skills to NESTA taxonomy
- Stores in `st_employee_skills_profile` table

### 3. Calculate Skills Gaps
```bash
node scripts/calculate-skills-gap.js
```
- Compares extracted skills vs position requirements
- Calculates gap severity (critical/moderate/minor)
- Generates skills match score (0-100%)

### 4. Generate Courses
```bash
node scripts/generate-course-from-gaps.js
```
- Creates ModuleSpec from skill gaps
- Uses ContentManager to generate course content
- Assigns courses to employees with due dates

### 5. Test Complete Pipeline
```bash
node scripts/test-cv-to-course-pipeline.js
```
- Runs the entire workflow end-to-end
- Processes sample CVs for test employees

## 📊 Data Flow

```
Employee CSV → User Creation → CV Upload → OpenAI Analysis 
→ Skill Extraction → NESTA Mapping → Gap Calculation 
→ Course Generation → Assignment Creation → Dashboard
```

## 🗄️ Database Schema

### Key Tables:
- `st_skills_taxonomy`: 7,036 NESTA skills
- `st_company_positions`: Job templates with skill requirements
- `st_employee_skills_profile`: CV analysis results
- `cm_module_content`: Generated course content
- `course_assignments`: Employee-course mappings

### Skills Profile Structure:
```json
{
  "skill_id": "UUID",
  "skill_name": "React.js",
  "proficiency_level": 3,
  "years_experience": 2.5,
  "evidence": "Built 5 React applications...",
  "is_nesta_skill": true
}
```

## 🎯 Example Results

### CV Analysis Output:
- Total skills extracted: 25
- NESTA mapped skills: 18 (72%)
- Experience years: 8
- Skills match score: 65%

### Skills Gap Analysis:
- Position: Senior Frontend Developer
- Required skills: 15
- Current skills meeting requirements: 10
- Critical gaps: 3 (React Advanced, TypeScript, GraphQL)
- Training hours needed: 120

### Generated Course:
- Name: "Skills Development Program: Senior Frontend Developer"
- Duration: 4 weeks
- Total hours: 120
- Focus areas: React Advanced, TypeScript, GraphQL
- Personalized content based on current skill level

## 🔧 API Integration

### OpenAI Configuration:
- Model: GPT-4 Turbo
- Temperature: 0.3 (for consistent extraction)
- Response format: JSON
- Max tokens: 4000

### NESTA Skills Search:
- Full-text search across 7K+ skills
- Relevance scoring
- Hierarchical matching (category → skill_group → skill)

## 📈 Performance

- CV Analysis: ~10-15 seconds per CV
- Skills mapping: ~5 seconds
- Gap calculation: <1 second
- Course generation: ~20-30 seconds
- Total per employee: ~1 minute

## 🚨 Error Handling

- Validates CV file formats (PDF, DOCX, TXT)
- Handles OpenAI rate limits
- Falls back to custom skills if no NESTA match
- Comprehensive logging for debugging

## 🌐 Dashboard Integration

Access the results at: http://localhost:8080/dashboard/onboarding

Features:
- Real-time progress tracking
- Skills gap visualization
- Course assignment monitoring
- Bulk CV upload interface

## 📝 Next Steps

1. Set up automated CV processing queue
2. Add support for more file formats
3. Implement batch processing for 1000+ employees
4. Add skills verification through assessments
5. Create employee self-service portal

## 🤝 Support

For issues or questions:
- Check error logs in console
- Verify OpenAI API key is valid
- Ensure employees have positions assigned
- Confirm NESTA skills data is loaded