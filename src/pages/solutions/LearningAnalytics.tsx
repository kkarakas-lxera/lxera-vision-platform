import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, BarChart3, CheckCircle, TrendingUp, Target, Eye, PieChart, Activity, Users } from "lucide-react";

const LearningAnalytics = () => {
  const analyticsTools = [
    {
      icon: BarChart3,
      title: "Real-time Dashboards",
      description: "Monitor learning progress and engagement across your organization in real-time",
      metrics: ["Completion rates", "Engagement scores", "Progress tracking"]
    },
    {
      icon: Target,
      title: "Performance Analytics",
      description: "Identify learning gaps and optimize training programs based on data-driven insights",
      metrics: ["Skill assessments", "Gap analysis", "ROI measurement"]
    },
    {
      icon: Eye,
      title: "Predictive Insights",
      description: "Forecast learning outcomes and predict skill development trajectories",
      metrics: ["Success prediction", "Risk identification", "Trend analysis"]
    }
  ];

  const dashboardData = [
    { label: "Active Learners", value: "12,487", change: "+15%", icon: Users, color: "text-blue-600" },
    { label: "Course Completion", value: "94.2%", change: "+8%", icon: Target, color: "text-green-600" },
    { label: "Engagement Score", value: "87.5", change: "+12%", icon: Activity, color: "text-purple-600" },
    { label: "Skills Acquired", value: "3,241", change: "+23%", icon: TrendingUp, color: "text-orange-600" }
  ];

  const reportingFeatures = [
    "Custom dashboard creation",
    "Automated report generation", 
    "Multi-dimensional analysis",
    "Predictive modeling",
    "ROI calculation tools",
    "Compliance tracking"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-smart-beige to-emerald-50">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Transform learning data into actionable insights. Advanced analytics to measure, track, and optimize learning outcomes across your organization."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data"
      />
      <Navigation />
      
      {/* Hero Section - Dashboard Style */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
              <BarChart3 className="w-4 h-4 mr-2" />
              Learning Analytics Platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-medium text-business-black mb-6 leading-tight">
              Data-Driven
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block"> Learning Intelligence</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform raw learning data into powerful insights. Make informed decisions, optimize programs, and prove ROI with comprehensive analytics that reveal the true impact of your learning initiatives.
            </p>
          </div>

          {/* Live Dashboard Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-16 animate-fade-in-scale">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-business-black mb-2">Live Analytics Dashboard</h3>
              <p className="text-business-black/70">Real-time insights from your learning programs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardData.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <IconComponent className={`w-6 h-6 ${item.color}`} />
                        <Badge className="bg-green-100 text-green-700">{item.change}</Badge>
                      </div>
                      <div className="text-3xl font-semibold text-business-black mb-1">{item.value}</div>
                      <div className="text-sm text-business-black/70">{item.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Explore Analytics
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg rounded-xl"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Analytics Tools */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              Comprehensive Analytics Suite
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              From real-time monitoring to predictive insights, get the complete picture of your learning ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {analyticsTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-green-600 transition-colors">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 leading-relaxed mb-6">
                      {tool.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-business-black mb-2">Key Metrics:</div>
                      {tool.metrics.map((metric, i) => (
                        <div key={i} className="flex items-center text-sm text-business-black/80">
                          <PieChart className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" />
                          {metric}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Reporting */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-8">
                Advanced Reporting Engine
              </h2>
              <p className="text-lg text-business-black/70 mb-8">
                Generate comprehensive reports that tell the complete story of your learning programs' impact and effectiveness.
              </p>
              
              <div className="space-y-4">
                {reportingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-fade-in group" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-business-black/80 group-hover:text-business-black transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <BarChart3 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-business-black mb-2">Impact Measurement</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">Learning Effectiveness</span>
                    <span className="text-2xl font-semibold text-green-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">ROI Achievement</span>
                    <span className="text-2xl font-semibold text-blue-600">340%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">User Satisfaction</span>
                    <span className="text-2xl font-semibold text-purple-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Preview */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
            Prove Your Learning ROI
          </h2>
          <p className="text-lg text-business-black/70 mb-12 max-w-2xl mx-auto">
            Demonstrate the tangible business impact of your learning initiatives with comprehensive ROI analytics
          </p>
          
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-semibold mb-2">85%</div>
                <div className="text-white/90">Improved Performance</div>
              </div>
              <div>
                <div className="text-4xl font-semibold mb-2">340%</div>
                <div className="text-white/90">Training ROI</div>
              </div>
              <div>
                <div className="text-4xl font-semibold mb-2">60%</div>
                <div className="text-white/90">Time Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-medium text-white mb-6">
              Transform Data Into Decisions
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Stop guessing about your learning programs' effectiveness. Get the insights you need to optimize, improve, and prove ROI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Start Analytics Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-green-600 hover:border-white px-8 py-4 text-lg rounded-xl"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearningAnalytics;
