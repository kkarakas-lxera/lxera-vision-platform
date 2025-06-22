
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Play, MousePointer, Eye, Zap, Target, Users, BarChart3, Brain } from "lucide-react";

const ProductTour = () => {
  const tourSteps = [
    {
      title: "AI-Powered Personalization",
      description: "Experience how LXERA adapts content and learning paths to each individual's needs, preferences, and pace.",
      icon: Brain,
      color: "bg-gradient-to-br from-pink-100 to-rose-100",
      iconColor: "text-pink-600",
      duration: "3 min"
    },
    {
      title: "Interactive Learning Hub",
      description: "Explore our collaborative workspace where teams innovate, share knowledge, and build together.",
      icon: Users,
      color: "bg-gradient-to-br from-blue-100 to-indigo-100",
      iconColor: "text-blue-600",
      duration: "4 min"
    },
    {
      title: "Real-Time Analytics",
      description: "Discover how our analytics dashboard provides actionable insights into learning progress and engagement.",
      icon: BarChart3,
      color: "bg-gradient-to-br from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600",
      duration: "2 min"
    },
    {
      title: "Gamification Engine",
      description: "See how dynamic rewards, challenges, and achievements keep learners motivated and engaged.",
      icon: Target,
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600",
      duration: "3 min"
    }
  ];

  const features = [
    {
      title: "Interactive Demos",
      description: "Click through actual LXERA features",
      icon: MousePointer
    },
    {
      title: "Live Examples",
      description: "See real use cases and scenarios",
      icon: Eye
    },
    {
      title: "Quick Overview",
      description: "Get started in under 15 minutes",
      icon: Zap
    }
  ];

  return (
    <>
      <SEO 
        title="Product Tour - Interactive LXERA Walkthrough"
        description="Take an interactive tour of LXERA's AI-powered learning platform. Explore features, see real examples, and discover how LXERA transforms workplace learning."
      />
      <div className="min-h-screen bg-smart-beige">
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="lxera-headline mb-6">
              Experience LXERA in Action
            </h1>
            <p className="lxera-subheadline mb-8">
              Take an interactive tour of our AI-powered learning platform. 
              See how LXERA transforms workplace learning through personalization, 
              engagement, and intelligent insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button className="lxera-btn-secondary px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Interactive Tour
              </Button>
              <Button variant="outline" className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg">
                Watch Demo Video
              </Button>
            </div>

            {/* Tour Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="lxera-card p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-future-green/20 to-emerald/20 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-future-green" />
                    </div>
                    <h3 className="font-medium text-business-black mb-2">{feature.title}</h3>
                    <p className="lxera-body text-business-black/70">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tour Sections */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="lxera-section-title mb-4">
                What You'll Explore
              </h2>
              <p className="lxera-section-subtitle">
                Each section of the tour showcases key LXERA capabilities with hands-on examples
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tourSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="lxera-card lxera-card-hover p-8">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-8 h-8 ${step.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="lxera-card-title">{step.title}</h3>
                          <span className="text-xs font-medium text-business-black/60 bg-smart-beige px-2 py-1 rounded-full">
                            {step.duration}
                          </span>
                        </div>
                        <p className="lxera-card-description mb-4">{step.description}</p>
                        <Button variant="outline" className="border-future-green/30 text-future-green hover:bg-future-green hover:text-business-black">
                          <Play className="w-4 h-4 mr-2" />
                          Start This Section
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-future-green/10 to-emerald/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="lxera-section-title mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="lxera-section-subtitle mb-8">
              After the tour, see how LXERA can be customized for your organization's specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="lxera-btn-secondary px-8 py-4">
                Request Live Demo
              </Button>
              <Button variant="outline" className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ProductTour;
