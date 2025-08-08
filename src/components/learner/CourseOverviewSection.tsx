import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle,
  TrendingUp,
  Briefcase,
  DollarSign,
  FileSpreadsheet,
  PieChart,
  Users,
  Building2,
  ArrowRight,
  Lightbulb,
  Star
} from 'lucide-react';

interface CourseOverviewProps {
  courseTitle: string;
  coursePlan: any;
  totalModules: number;
  employeeName?: string;
}

export default function CourseOverviewSection({ 
  courseTitle, 
  coursePlan,
  totalModules,
  employeeName 
}: CourseOverviewProps) {
  // Extract module information from course structure
  const modules = coursePlan?.course_structure?.modules || [];
  
  // Calculate total duration (4 weeks for this course)
  const totalWeeks = 4;
  const totalHours = totalWeeks * 2; // Approximate 2 hours per week
  
  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Financial Consulting Excellence: From Tech to Finance
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Transform your technical expertise into financial consulting mastery with healthcare-focused 
          financial modeling, analysis, and advisory skills.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {totalHours} hours
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {totalModules} modules
          </span>
          <span className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificate upon completion
          </span>
        </div>
      </div>

      {/* What You'll Learn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Master Excel for Financial Analysis</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build professional financial models with healthcare-specific functions and best practices
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Create Three-Statement Models</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Develop integrated financial statements and DCF valuations for healthcare organizations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Healthcare Budgeting & Forecasting</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Master department-level budgeting and revenue cycle forecasting techniques
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Strategic Advisory Skills</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Present financial insights to healthcare executives with confidence and clarity
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills You'll Gain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Skills You'll Gain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Technical Skills */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  Excel Financial Modeling
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <PieChart className="h-3 w-3" />
                  DCF Valuation
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Revenue Forecasting
                </Badge>
                <Badge variant="secondary">XLOOKUP & Power Query</Badge>
                <Badge variant="secondary">Scenario Analysis</Badge>
                <Badge variant="secondary">Dashboard Creation</Badge>
              </div>
            </div>

            {/* Industry Knowledge */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Industry Knowledge</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Healthcare Finance
                </Badge>
                <Badge variant="outline">DRG Analysis</Badge>
                <Badge variant="outline">Medicare Reimbursement</Badge>
                <Badge variant="outline">Payer Mix Optimization</Badge>
                <Badge variant="outline">Regulatory Compliance</Badge>
              </div>
            </div>

            {/* Professional Skills */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Professional Skills</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Executive Presentation
                </Badge>
                <Badge>Client Communication</Badge>
                <Badge>Strategic Advisory</Badge>
                <Badge>Data Storytelling</Badge>
                <Badge>Business Analysis</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.map((module: any, index: number) => {
              const moduleId = module.id || `M${String(index + 1).padStart(2, '0')}`;
              const moduleName = module.name || module.title || `Module ${index + 1}`;
              const isActive = index === 0;
              const isLocked = index > 0;
              
              return (
                <div key={moduleId} className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                      ${isActive ? 'bg-blue-500 text-white' : 
                        isLocked ? 'bg-gray-200 text-gray-400' : 
                        'bg-green-500 text-white'}`}>
                      {index + 1}
                    </div>
                    {index < modules.length - 1 && (
                      <div className="absolute top-10 left-5 w-0.5 h-16 bg-gray-300 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {moduleName}
                      </h3>
                      {isActive && <Badge variant="default" className="text-xs">Current</Badge>}
                      {isLocked && <Badge variant="secondary" className="text-xs">Locked</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Week {index + 1} • {module.duration || '1 week'}
                    </p>
                    {module.content?.sections && (
                      <div className="space-y-1">
                        {module.content.sections.slice(0, 3).map((section: any, sIndex: number) => (
                          <div key={sIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <ArrowRight className="h-3 w-3" />
                            <span>{section.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            What to Expect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Hands-on Practice
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Build a complete financial model for a healthcare practice acquisition</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Create interactive dashboards with real healthcare KPIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Analyze DRG profitability and payer mix scenarios</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Assessments & Certification
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Practical exercises after each module section</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-world case studies from healthcare consulting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Certificate of completion to showcase your expertise</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ready to Transform Your Career?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start with Module 1 and begin your journey into healthcare financial consulting
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Continue to the first module to begin your learning journey
          </p>
        </CardContent>
      </Card>
    </div>
  );
}