import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Clock, 
  Target, 
  Award,
  GraduationCap,
  TrendingUp
} from 'lucide-react';

interface WelcomeOnboardingProps {
  coursesCount: number;
  estimatedHours: number;
  onStartLearning: () => void;
}

export default function WelcomeOnboarding({ coursesCount, estimatedHours, onStartLearning }: WelcomeOnboardingProps) {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <GraduationCap className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to Your Learning Platform!
          </h1>
          <p className="text-xl text-gray-600">
            Hi {userProfile?.full_name?.split(' ')[0]}! Your learning journey starts here
          </p>
        </div>

        {/* Main Welcome Card */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Ready to Level Up Your Skills?</CardTitle>
            <CardDescription className="text-lg">
              Your personalized courses have been prepared based on your role as{' '}
              <span className="font-semibold text-blue-600">{userProfile?.position}</span>.
              Start with the fundamentals and progress at your own pace.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Learning Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{coursesCount}</div>
                  <div className="text-sm text-blue-700">courses assigned</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900">{estimatedHours}h</div>
                  <div className="text-sm text-green-700">estimated total</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">100%</div>
                  <div className="text-sm text-purple-700">Multimedia supported</div>
                </div>
              </div>
            </div>

            {/* What You'll Achieve */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                What You'll Achieve
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Develop job-relevant skills</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Track your progress in real-time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Earn certificates upon completion</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Apply skills to real-world scenarios</span>
                </div>
              </div>
            </div>

            {/* Learning Path Preview */}
            <div className="bg-white border border-gray-200 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Your Learning Path</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm font-medium">Start with fundamentals</span>
                </div>
                <div className="hidden md:block w-16 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm text-gray-600">Practice with real scenarios</span>
                </div>
                <div className="hidden md:block w-16 h-0.5 bg-gray-300"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm text-gray-600">Earn your certificate</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center pt-4">
              <Button 
                onClick={onStartLearning}
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Start Learning →
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Takes less than 2 minutes to get started
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}