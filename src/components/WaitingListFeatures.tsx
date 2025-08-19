import { 
  FileText, 
  Brain, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target, 
  BarChart3,
  Clock,
  CheckCircle
} from "lucide-react";

const WaitingListFeatures = () => {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Smart CV Processing",
      description: "Extract skills, experience, and qualifications from any CV format with 99.7% accuracy.",
      benefits: ["50+ file formats supported", "Bulk processing", "Instant results"]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Skills Analysis",
      description: "Advanced algorithms identify skill gaps, competency levels, and learning opportunities.",
      benefits: ["10,000+ skill categories", "Competency mapping", "Gap identification"]
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Role Matching",
      description: "Automatically match candidates to roles based on skills, experience, and potential.",
      benefits: ["Intelligent matching", "Fit scoring", "Bias reduction"]
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Workforce Insights",
      description: "Get strategic insights into your team's capabilities and future needs.",
      benefits: ["Predictive analytics", "Trend analysis", "Strategic planning"]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Optimization",
      description: "Build balanced teams and identify collaboration opportunities across departments.",
      benefits: ["Team composition", "Skill distribution", "Collaboration insights"]
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Dashboards",
      description: "Monitor workforce metrics, track progress, and make data-driven decisions.",
      benefits: ["Live dashboards", "Custom reports", "KPI tracking"]
    }
  ];

  const stats = [
    { number: "98%", label: "Time Savings", description: "Reduce manual CV screening time" },
    { number: "40%", label: "Better Matches", description: "Improve role-candidate fit" },
    { number: "60%", label: "Faster Hiring", description: "Accelerate recruitment process" },
    { number: "85%", label: "User Satisfaction", description: "HR teams love the platform" }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to transform your workforce
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful AI-driven features that turn workforce chaos into strategic clarity. 
            Built for modern HR teams who demand results.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Proven results from our beta users
            </h3>
            <p className="text-gray-600 text-lg">
              Join 200+ teams already seeing transformational results
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 sm:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Enterprise-ready from day one
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-200" />
                  <span>SOC 2 Type II certified security</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-200" />
                  <span>99.9% uptime SLA guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-200" />
                  <span>Unlimited team members</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-200" />
                  <span>24/7 dedicated support</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h4 className="text-xl font-semibold mb-4">Ready to get started?</h4>
              <p className="text-blue-100 mb-6">
                Join the waitlist and get priority access to our enterprise features.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-sm text-blue-100">Early Access</div>
                  <div className="font-bold">Free</div>
                </div>
                <div className="flex-1 bg-white/20 rounded-lg p-3 text-center">
                  <div className="text-sm text-blue-100">Full Platform</div>
                  <div className="font-bold">$99/month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitingListFeatures;
