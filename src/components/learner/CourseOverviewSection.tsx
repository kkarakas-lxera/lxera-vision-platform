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
  Star,
  Play
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
  const totalHours = 8; // Total 8 hours across 4 weeks
  
  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Hero Section - More compact */}
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financial Consulting Excellence: From Tech to Finance
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transform your technical expertise into financial consulting mastery with healthcare-focused 
          financial modeling, analysis, and advisory skills.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalHours} hours
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {totalModules} modules
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            Certificate
          </span>
        </div>
      </div>

      {/* Introduction Video */}
      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Play className="h-4 w-4 text-blue-500" />
            Welcome to Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              className="w-full h-full object-contain"
              controls
              poster="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop"
              src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/b6f14ac207e94c25bda062b335337c1f.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center">
            Watch this personalized introduction from your instructor Sarah
          </p>
        </CardContent>
      </Card>

      {/* What You'll Learn - Compact */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Target className="h-4 w-4 text-blue-500" />
            What You'll Learn
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Master Excel for Financial Analysis</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Build professional models with healthcare-specific functions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Create Three-Statement Models</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Integrated statements and DCF valuations for healthcare
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Healthcare Budgeting & Forecasting</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Department budgeting and revenue cycle forecasting
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Strategic Advisory Skills</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Present insights to executives with confidence
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills You'll Gain - Compact */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            Skills You'll Gain
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="space-y-3">
            {/* Technical Skills */}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Technical</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs py-0.5 px-2 h-6">
                  Excel Modeling
                </Badge>
                <Badge variant="secondary" className="text-xs py-0.5 px-2 h-6">
                  DCF Valuation
                </Badge>
                <Badge variant="secondary" className="text-xs py-0.5 px-2 h-6">
                  Forecasting
                </Badge>
                <Badge variant="secondary" className="text-xs py-0.5 px-2 h-6">
                  Power Query
                </Badge>
                <Badge variant="secondary" className="text-xs py-0.5 px-2 h-6">
                  Dashboards
                </Badge>
              </div>
            </div>

            {/* Industry Knowledge */}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Industry</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6">
                  Healthcare Finance
                </Badge>
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6">
                  DRG Analysis
                </Badge>
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6">
                  Medicare
                </Badge>
                <Badge variant="outline" className="text-xs py-0.5 px-2 h-6">
                  Payer Mix
                </Badge>
              </div>
            </div>

            {/* Professional Skills */}
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Professional</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className="text-xs py-0.5 px-2 h-6">
                  Executive Presentation
                </Badge>
                <Badge className="text-xs py-0.5 px-2 h-6">
                  Strategic Advisory
                </Badge>
                <Badge className="text-xs py-0.5 px-2 h-6">
                  Data Storytelling
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Journey - Compact */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="h-4 w-4 text-green-500" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="space-y-3">
            {modules.map((module: any, index: number) => {
              const moduleId = module.id || `M${String(index + 1).padStart(2, '0')}`;
              const moduleName = module.name || module.title || `Module ${index + 1}`;
              const isActive = index === 0;
              const isLocked = index > 0;
              
              return (
                <div key={moduleId} className="flex items-start gap-3">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                      ${isActive ? 'bg-blue-500 text-white' : 
                        isLocked ? 'bg-gray-100 text-gray-400 dark:bg-gray-800' : 
                        'bg-green-500 text-white'}`}>
                      {index + 1}
                    </div>
                    {index < modules.length - 1 && (
                      <div className="absolute top-8 left-4 w-0.5 h-12 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {moduleName}
                      </h3>
                      {isActive && <Badge variant="default" className="text-xs py-0 px-1.5 h-5">Current</Badge>}
                      {isLocked && <Badge variant="secondary" className="text-xs py-0 px-1.5 h-5">Locked</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Week {index + 1} • {module.duration || '2 hours'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* What to Expect - Compact */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            What to Expect
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                Hands-on Practice
              </h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Healthcare practice acquisition model</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Interactive KPI dashboards</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">DRG profitability analysis</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                <Award className="h-3 w-3" />
                Assessments
              </h4>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Module exercises</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Real-world case studies</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Certificate of completion</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action - Compact */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="text-center py-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Ready to Transform Your Career?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Start with Module 1 and begin your journey into healthcare financial consulting
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Continue to the first module to begin your learning journey
          </p>
        </CardContent>
      </Card>
    </div>
  );
}