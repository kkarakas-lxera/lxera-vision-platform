import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Clock, Zap, CheckCircle, Star, TrendingUp } from "lucide-react";

interface WaitingListHeroProps {
  onEmailSubmit?: (email: string) => void;
  onProgressiveFormSubmit?: (data: any) => void;
}

const WaitingListHero = ({ onEmailSubmit, onProgressiveFormSubmit }: WaitingListHeroProps) => {
  const [email, setEmail] = useState("");
  const [showProgressiveForm, setShowProgressiveForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [progressiveData, setProgressiveData] = useState({
    fullName: "",
    role: "",
    company: "",
    industry: "",
    country: "",
    useCase: ""
  });

  // Progressive form options
  const roles = [
    "HR Professional",
    "Learning & Development Specialist", 
    "CHRO",
    "CEO",
    "Executive",
    "Consultant",
    "Education Designer"
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Education",
    "Consulting",
    "Government",
    "Retail",
    "Other"
  ];

  const useCases = [
    "Skills gap analysis",
    "Workforce planning",
    "CV screening automation",
    "Team capability assessment",
    "Learning path recommendations",
    "Talent acquisition",
    "Performance optimization"
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowProgressiveForm(true);
      onEmailSubmit?.(email);
    }
  };

  const handleProgressiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullData = { email, ...progressiveData };
    onProgressiveFormSubmit?.(fullData);
    setIsSubmitted(true);
  };

  const handleSkipProgressiveForm = () => {
    const basicData = { email };
    onProgressiveFormSubmit?.(basicData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              You're on the list! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for joining Lxera's early access program.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <p className="text-gray-700 mb-4">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  You'll receive a confirmation email within 5 minutes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Early access invitations go out weekly
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority access for complete profiles
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Limited Early Access
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Turn CV chaos into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              workforce clarity
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI-powered skills analysis for strategic hiring. Transform workforce insights, 
            automate CV processing, and eliminate skills gaps with intelligent automation.
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">200+ teams waiting</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">Trusted by Fortune 500</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">98% time savings</span>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="max-w-4xl mx-auto">
          {!showProgressiveForm ? (
            /* Initial Email Form */
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Get Early Access
                </h2>
                <p className="text-gray-600 text-lg">
                  Join innovative HR teams already transforming their workforce analysis
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-14 text-lg px-6 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg"
                    disabled={!email}
                  >
                    Join Waitlist
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
                
                <p className="text-center text-sm text-gray-500">
                  No spam, ever. Unsubscribe anytime. 
                  <span className="font-medium text-gray-700"> Free early access for first 100 users.</span>
                </p>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600 mb-4">Trusted by teams at</p>
                <div className="flex justify-center items-center gap-8 opacity-60">
                  <div className="text-lg font-semibold text-gray-700">Microsoft</div>
                  <div className="text-lg font-semibold text-gray-700">Deloitte</div>
                  <div className="text-lg font-semibold text-gray-700">IBM</div>
                  <div className="text-lg font-semibold text-gray-700">Accenture</div>
                </div>
              </div>
            </div>
          ) : (
            /* Progressive Form */
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-100">
              <div className="text-center mb-8">
                <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 border-green-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Move Up The Waitlist
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Help us personalize your experience
                </h2>
                <p className="text-gray-600">
                  Complete your profile to get priority access and better recommendations
                </p>
              </div>

              <form onSubmit={handleProgressiveSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Your full name"
                      value={progressiveData.fullName}
                      onChange={(e) => setProgressiveData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={progressiveData.role}
                      onChange={(e) => setProgressiveData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 bg-white"
                    >
                      <option value="">Select your role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <Input
                      type="text"
                      placeholder="Your company name"
                      value={progressiveData.company}
                      onChange={(e) => setProgressiveData(prev => ({ ...prev, company: e.target.value }))}
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={progressiveData.industry}
                      onChange={(e) => setProgressiveData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 bg-white"
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Use Case
                  </label>
                  <select
                    value={progressiveData.useCase}
                    onChange={(e) => setProgressiveData(prev => ({ ...prev, useCase: e.target.value }))}
                    className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 bg-white"
                  >
                    <option value="">What's your main goal?</option>
                    {useCases.map(useCase => (
                      <option key={useCase} value={useCase}>{useCase}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipProgressiveForm}
                    className="h-12 px-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    Skip for now
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  >
                    Complete Profile & Join
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Complete profiles get 3x faster access to early beta
              </p>
            </div>
          )}
        </div>

        {/* Value Props */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Analysis</h3>
            <p className="text-gray-600">Process hundreds of CVs in seconds with AI-powered skills extraction</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skills Intelligence</h3>
            <p className="text-gray-600">Identify gaps, predict needs, and build strategic workforce plans</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Optimization</h3>
            <p className="text-gray-600">Match talents to roles and optimize team compositions automatically</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitingListHero;
