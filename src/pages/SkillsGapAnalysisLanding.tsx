import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  Mail, 
  Target, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Zap,
  Timer,
  LinkedinIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

interface LiveActivityItem {
  id: string;
  company: string;
  location: string;
  action: string;
  timestamp: Date;
}

interface TestimonialItem {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  savings?: string;
  photo?: string;
}

const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [showPreview, setShowPreview] = useState(false);
  const [liveActivities, setLiveActivities] = useState<LiveActivityItem[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Mock data for testimonials
  const testimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'VP Engineering',
      company: 'TechCorp',
      content: 'We had no idea 73% of our developers were missing React Server Components skills. LXERA\'s AI found gaps that saved us $180K in productivity losses.',
      savings: '$180K'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      title: 'Chief People Officer',
      company: 'ScaleUp Inc',
      content: 'The AI revealed skill gaps in 5 minutes that would have taken our HR team 3 months to identify manually.',
      savings: '$347K'
    },
    {
      id: '3',
      name: 'Lisa Wang',
      title: 'Director of Learning & Development',
      company: 'GrowthCo',
      content: 'Found 12 critical gaps across 200 employees in minutes. This would have been impossible manually.',
      savings: '$89K'
    }
  ];

  // Mock live activity data
  const mockActivities: LiveActivityItem[] = [
    {
      id: '1',
      company: 'Tech company in Austin',
      location: 'Austin, TX',
      action: 'found 15 critical skill gaps',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: '2',
      company: 'Manufacturing firm',
      location: 'Detroit, MI',
      action: 'saved $89K in training costs',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      id: '3',
      company: 'SaaS startup',
      location: 'San Francisco, CA',
      action: 'identified critical React gaps',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '4',
      company: 'Healthcare organization',
      location: 'Boston, MA',
      action: 'found 23 skill mismatches',
      timestamp: new Date(Date.now() - 22 * 60 * 1000)
    },
    {
      id: '5',
      company: 'Financial services',
      location: 'New York, NY',
      action: 'cut training time by 60%',
      timestamp: new Date(Date.now() - 35 * 60 * 1000)
    }
  ];

  // Simulate live activity updates
  useEffect(() => {
    setLiveActivities(mockActivities);
    
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % mockActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate spots decreasing
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsRemaining((prev) => {
        if (prev > 35) {
          return prev - 1;
        }
        return prev;
      });
    }, 45000); // Decrease every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to signup with email prefilled
    navigate(`/signup?email=${encodeURIComponent(email)}&source=skills-gap-landing`);
    
    setIsLoading(false);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  const spotsProgress = ((100 - spotsRemaining) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-slate-900"
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/early-access-signup')}
                className="hidden sm:inline-flex"
              >
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full px-4 py-2 mb-8">
              <span className="text-sm font-medium text-blue-800">
                🏆 500+ companies have saved $2.3M in wasted training costs this year
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Discover What Your Competitors
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Already Know About Your Team
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto">
              Our AI reveals the exact skills costing you money
              <br className="hidden sm:block" />
              <span className="text-blue-600 font-semibold">(in under 5 minutes)</span>
            </p>

            {/* Email Capture Form */}
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Enter work email to see your team's gaps"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base border-2 border-slate-300 focus:border-blue-500 focus:ring-0"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      Reveal My Gaps
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-600 mb-8">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <span>Only {spotsRemaining} spots left this month</span>
              </div>
            </div>

            {/* Scarcity Indicator */}
            <Card className="max-w-md mx-auto bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-800">Analysis spots filling up</span>
                  <Badge variant="destructive" className="bg-red-500">
                    {spotsRemaining} left
                  </Badge>
                </div>
                <Progress value={spotsProgress} className="h-2" />
                <p className="text-xs text-orange-700 mt-2">
                  🔥 3 companies joined in the last hour
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mystery Preview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              See What We Found About Teams Like Yours
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Companies in your industry are missing these critical skills
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden">
              <CardContent className="p-8">
                <div className={cn(
                  "transition-all duration-500",
                  !showPreview && "filter blur-md"
                )}>
                  {/* Mock Dashboard Preview */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-slate-900">Critical Skills Gaps Identified</h3>
                      <Badge variant="destructive">78% Gap Rate</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">React Server Components</span>
                        <div className="flex items-center gap-3">
                          <Progress value={78} className="w-32" />
                          <span className="text-sm text-slate-600">78% gap</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Performance Optimization</span>
                        <div className="flex items-center gap-3">
                          <Progress value={65} className="w-32" />
                          <span className="text-sm text-slate-600">65% gap</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Advanced TypeScript</span>
                        <div className="flex items-center gap-3">
                          <Progress value={52} className="w-32" />
                          <span className="text-sm text-slate-600">52% gap</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Impact:</strong> 34 employees affected • $127K potential savings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overlay */}
                {!showPreview && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                    <div className="text-center">
                      <Button
                        onClick={() => setShowPreview(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Eye className="mr-2 h-5 w-5" />
                        Unlock Your Team's Specific Gaps
                      </Button>
                      <p className="text-sm text-slate-600 mt-3">
                        ⚠️ This analysis is only available for {spotsRemaining} more companies this month
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Companies discovering gaps right now:
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {liveActivities.slice(0, 4).map((activity, index) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                        index === currentActivityIndex ? "bg-green-50 border border-green-200" : "bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        index === currentActivityIndex ? "bg-green-500 animate-pulse" : "bg-slate-400"
                      )} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">{activity.company}</span> just {activity.action}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-lg text-slate-600 mb-6">
                This could be you in the next 5 minutes
              </p>
              <Button
                onClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start My Analysis Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              What Companies Discovered in Their First Week
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <p className="text-slate-700 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.title}</p>
                      <p className="text-sm text-slate-500">{testimonial.company}</p>
                    </div>
                    <LinkedinIcon className="h-4 w-4 text-blue-600 ml-auto" />
                  </div>
                  {testimonial.savings && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-green-800">
                        💰 Saved {testimonial.savings} in first year
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              See What We'll Find in Your Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Competitors Are Already Ahead
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              While you're reading this, <span className="text-blue-400 font-semibold">23 companies</span> just discovered their skills gaps with LXERA
            </p>

            {/* Final Email Form */}
            <form id="email-form" onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="email"
                    placeholder="Enter work email to join them"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-0"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Analyzing...
                    </div>
                  ) : (
                    <>
                      Get My Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-300 mb-8">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-400" />
                <span>Only {spotsRemaining} spots left this month</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span>Results in 4 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Completely free (no strings attached)</span>
              </div>
            </div>

            {/* Final Scarcity */}
            <Card className="max-w-md mx-auto bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-400/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-orange-300 mb-2">
                  🔥 LAST CHANCE FOR JANUARY
                </h3>
                <p className="text-sm text-slate-300 mb-4">
                  Analysis spots are filling up fast
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">{spotsRemaining} companies left</span>
                  <Badge variant="destructive" className="bg-red-500">
                    {spotsRemaining} spots
                  </Badge>
                </div>
                <Progress value={spotsProgress} className="h-2" />
                <p className="text-xs text-slate-400 mt-2">
                  ⚡ 3 companies joined in the last hour
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <Logo className="text-white" />
              <p className="text-slate-400 text-sm mt-2">
                © 2025 LXERA. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/privacy')}
                className="text-slate-400 hover:text-white"
              >
                Privacy Policy
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/terms')}
                className="text-slate-400 hover:text-white"
              >
                Terms of Service
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/contact')}
                className="text-slate-400 hover:text-white"
              >
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SkillsGapAnalysisLanding;