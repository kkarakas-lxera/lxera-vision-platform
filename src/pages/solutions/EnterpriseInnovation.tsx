import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Lightbulb, CheckCircle, Rocket, Zap, Trophy, Building2, Target, TrendingUp } from "lucide-react";

const EnterpriseInnovation = () => {
  const innovationFramework = [
    {
      phase: "Discover",
      icon: Lightbulb,
      title: "Strategic Innovation Discovery",
      description: "Identify opportunities and challenges across your enterprise organization with strategic focus",
      duration: "2-4 weeks",
      deliverables: ["Innovation audit", "Strategic opportunity mapping", "Executive stakeholder analysis"]
    },
    {
      phase: "Design",
      icon: Target,
      title: "Strategic Framework Development", 
      description: "Create comprehensive innovation strategies aligned with enterprise business goals and objectives",
      duration: "4-6 weeks",
      deliverables: ["Innovation roadmap", "Strategic resource allocation", "Executive success metrics"]
    },
    {
      phase: "Deploy",
      icon: Rocket,
      title: "Enterprise Implementation",
      description: "Execute innovation initiatives with continuous monitoring and strategic optimization",
      duration: "12+ weeks",
      deliverables: ["Strategic pilot programs", "Enterprise-wide deployment", "Strategic impact measurement"]
    }
  ];

  const caseStudies = [
    {
      company: "Global Financial Services Corp",
      industry: "Finance Services",
      challenge: "Legacy processes limiting digital transformation",
      solution: "Cross-functional innovation labs with strategic focus",
      result: "300% increase in digital product launches",
      icon: Building2
    },
    {
      company: "Enterprise Tech Solutions Inc",
      industry: "Technology",
      challenge: "Siloed departments hindering strategic collaboration",
      solution: "Innovation culture transformation across leadership",
      result: "50% faster strategic time-to-market",
      icon: Zap
    },
    {
      company: "Government Innovation Network",
      industry: "Government",
      challenge: "Limited citizen engagement solutions",
      solution: "Rapid prototyping framework for public services",
      result: "95% citizen satisfaction improvement",
      icon: Trophy
    }
  ];

  const roiMetrics = [
    { metric: "Strategic ROI Increase", value: "340%", description: "Average return on innovation investment" },
    { metric: "Time-to-Market", value: "3x", description: "Faster innovation cycles" },
    { metric: "Leadership Engagement", value: "85%", description: "Innovation participation rate" },
    { metric: "Success Rate", value: "92%", description: "Innovation project completion" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-smart-beige to-slate-50">
      <SEO 
        title="Enterprise Innovation Enablement - LXERA"
        description="Accelerate innovation across your enterprise. Build a culture of innovation with collaborative platforms and rapid deployment capabilities."
        keywords="enterprise innovation, innovation labs, rapid deployment, cross-functional teams, innovation culture"
      />
      <Navigation />
      
      {/* Hero Section - Enterprise Grade */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-orange-100 text-orange-700 border-orange-200 px-4 py-2 text-sm font-medium">
              <Building2 className="w-4 h-4 mr-2" />
              Strategic Enterprise Innovation Platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-6 leading-tight">
              Strategic Innovation at
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent block"> Enterprise Scale</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your organization into a strategic innovation powerhouse. Break down silos, accelerate ideation, and deliver breakthrough solutions that drive competitive advantage.
            </p>
          </div>

          {/* ROI Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {roiMetrics.map((item, index) => (
              <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{item.value}</div>
                  <div className="text-sm font-semibold text-business-black mb-1">{item.metric}</div>
                  <div className="text-xs text-business-black/70">{item.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Schedule Strategic Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg rounded-xl"
            >
              View Executive Case Studies
            </Button>
          </div>
        </div>
      </section>

      {/* Innovation Framework */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
              Proven Strategic Innovation Methodology
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Our structured approach to enterprise innovation transformation for strategic leaders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {innovationFramework.map((phase, index) => {
              const IconComponent = phase.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group" style={{ animationDelay: `${index * 200}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-10 h-10 text-orange-600" />
                      </div>
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white">
                        {phase.phase}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-business-black group-hover:text-orange-600 transition-colors">
                      {phase.title}
                    </CardTitle>
                    <Badge variant="outline" className="mt-2">{phase.duration}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 leading-relaxed mb-6">
                      {phase.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-business-black mb-2">Key Deliverables:</div>
                      {phase.deliverables.map((deliverable, i) => (
                        <div key={i} className="flex items-center text-sm text-business-black/80">
                          <CheckCircle className="w-3 h-3 text-orange-600 mr-2 flex-shrink-0" />
                          {deliverable}
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

      {/* Case Studies */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
              Success Stories
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Real enterprises, real results, real transformation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => {
              const IconComponent = study.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <IconComponent className="w-8 h-8 text-orange-600 mr-3" />
                      <div>
                        <CardTitle className="text-lg font-bold text-business-black">{study.company}</CardTitle>
                        <Badge variant="outline" className="mt-1">{study.industry}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold text-business-black mb-1">Challenge:</div>
                        <div className="text-sm text-business-black/70">{study.challenge}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-business-black mb-1">Solution:</div>
                        <div className="text-sm text-business-black/70">{study.solution}</div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-business-black mb-1">Result:</div>
                        <div className="text-sm font-bold text-orange-600">{study.result}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implementation Benefits */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
                Strategic Enterprise Innovation Impact
              </h2>
              <div className="space-y-4">
                {[
                  "3x faster innovation cycles",
                  "Strategic cross-functional collaboration",
                  "Idea-to-market acceleration", 
                  "Innovation culture building",
                  "Knowledge sharing platforms",
                  "Rapid prototype development tools"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-fade-in group" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-business-black/80 group-hover:text-business-black transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 text-center shadow-xl">
              <TrendingUp className="w-16 h-16 text-orange-600 mx-auto mb-6" />
              <div className="text-5xl font-bold text-orange-600 mb-2">340%</div>
              <div className="text-xl font-semibold text-business-black mb-4">Strategic Innovation ROI</div>
              <div className="text-business-black/70 leading-relaxed mb-6">
                Enterprise organizations implementing our strategic innovation framework see exceptional returns on their innovation investments
              </div>
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">92%</div>
                <div className="text-sm text-business-black/70">Strategic Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Lead Strategic Innovation?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join strategic leaders who are transforming their organizations through strategic innovation. The future belongs to those who innovate strategically today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Schedule Strategic Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-orange-600 hover:border-white px-8 py-4 text-lg rounded-xl"
              >
                Request Executive Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnterpriseInnovation;
