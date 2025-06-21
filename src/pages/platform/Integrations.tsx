import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Users, Calendar, BarChart3, ArrowRight, CheckCircle, Zap, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Integrations = () => {
  const integrationCategories = [
    {
      title: "Learning Management Systems",
      description: "Seamlessly connect with existing LMS platforms to enhance learning experiences",
      icon: BarChart3,
      platforms: ["Moodle", "Blackboard", "Canvas", "D2L Brightspace", "TalentLMS", "Docebo"]
    },
    {
      title: "HR Information Systems",
      description: "Integrate with HRIS for employee data, performance tracking, and career development",
      icon: Users,
      platforms: ["Workday", "BambooHR", "ADP", "SAP SuccessFactors", "Oracle HCM", "Cornerstone OnDemand"]
    },
    {
      title: "Collaboration Platforms",
      description: "Embed learning experiences directly into daily workflow and communication tools",
      icon: Calendar,
      platforms: ["Microsoft Teams", "Slack", "Zoom", "Google Workspace", "Asana", "Monday.com"]
    },
    {
      title: "Business Intelligence",
      description: "Connect learning data with business metrics for comprehensive analytics",
      icon: Puzzle,
      platforms: ["Power BI", "Tableau", "Looker", "Qlik Sense", "Salesforce Analytics", "Google Analytics"]
    }
  ];

  const integrationBenefits = [
    {
      title: "Single Sign-On (SSO)",
      description: "Seamless access through existing authentication systems",
      impact: "95% reduction in login friction"
    },
    {
      title: "Data Synchronization",
      description: "Real-time sync of user profiles, progress, and performance data",
      impact: "Eliminates data silos"
    },
    {
      title: "Workflow Integration",
      description: "Learning opportunities delivered within existing work processes",
      impact: "60% increase in engagement"
    },
    {
      title: "Unified Reporting",
      description: "Consolidated dashboards combining learning and business metrics",
      impact: "Complete ROI visibility"
    }
  ];

  const apiFeatures = [
    "RESTful API architecture",
    "Real-time webhooks",
    "GraphQL endpoint support",
    "Comprehensive documentation",
    "SDK for popular languages",
    "Sandbox environment"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <LinkIcon className="w-4 h-4 mr-2" />
            Seamless Connectivity
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Platform
            <span className="text-business-black"> Integrations</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Connect LXERA with your existing technology stack. From LMS platforms to collaboration tools, 
            create a unified learning ecosystem that works within your current workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              View All Integrations
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              API Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Connect With Your Tech Stack
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Pre-built integrations with the tools and platforms your organization already uses
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {integrationCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Zap className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {category.platforms.map((platform, platformIndex) => (
                        <div key={platformIndex} className="text-sm text-business-black/70 bg-future-green/10 rounded-lg px-3 py-2 text-center">
                          {platform}
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

      {/* Integration Benefits */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Integration Benefits
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Streamline workflows and maximize the value of your existing technology investments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {integrationBenefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {benefit.title}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
                        {benefit.impact}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API & Developer Tools */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Developer-Friendly APIs
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Build custom integrations with our comprehensive API suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {apiFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center text-white/90">
                    <CheckCircle className="w-5 h-5 text-future-green mr-3 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Ready to Connect Your Systems?
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Explore our integrations and discover how LXERA fits seamlessly into your existing workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Browse Integrations
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/solutions">
                Explore Solutions <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Integrations;
