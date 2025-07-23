import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/Logo';
import { ArrowRight, TrendingUp, Target, BarChart3, Shield, Star } from 'lucide-react';


const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [spotsRemaining, setSpotsRemaining] = useState(47);

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

  const handleGetStarted = () => {
    navigate('/skills-gap-signup?source=skills-gap-landing');
  };

  const challenges = [
    "73% of your developers missing critical React skills",
    "$180K annual productivity loss from skills gaps",
    "Manual assessments taking 3+ months",
    "Generic training with 23% completion rates",
    "No visibility into actual team capabilities"
  ];

  const services = [
    {
      title: "AI Skills Gap Analysis",
      description: "Discover your team's exact skill deficiencies in 5 minutes with our AI-powered assessment.",
      features: ["CV analysis", "Skills mapping", "Gap identification", "Cost calculation", "Priority ranking"],
      icon: BarChart3
    },
    {
      title: "Personalized Learning Paths",
      description: "AI generates custom courses specifically for YOUR team's gaps - not generic content.",
      features: ["AI course creation", "Personalized content", "60% faster learning", "Progress tracking", "Skill validation"],
      icon: Target
    },
    {
      title: "ROI Dashboard",
      description: "Track the real business impact of closing skills gaps with executive-ready metrics.",
      features: ["Cost savings", "Productivity gains", "Completion rates", "Skill improvements", "Team analytics"],
      icon: TrendingUp
    },
    {
      title: "Enterprise Integration",
      description: "Seamlessly connect with your existing HRIS and learning ecosystem.",
      features: ["HRIS sync", "SSO support", "API access", "Bulk operations", "Compliance ready"],
      icon: Shield
    }
  ];

  const process = [
    {
      number: "1",
      title: "Free Skills Analysis",
      description: "Upload team CVs or connect HRIS. Get instant visibility into skills gaps affecting your bottom line."
    },
    {
      number: "2",
      title: "See the Impact",
      description: "Discover exactly how much skills gaps are costing you in lost productivity and missed opportunities."
    },
    {
      number: "3",
      title: "AI Course Generation",
      description: "Watch our AI create personalized learning paths that address your specific gaps - not generic training."
    },
    {
      number: "4",
      title: "Track ROI",
      description: "Monitor skill improvements, completion rates, and real business impact with executive dashboards."
    }
  ];

  const testimonials = [
    {
      quote: "We discovered $347K in productivity losses we didn't know existed. LXERA helped us close those gaps in 6 weeks.",
      author: "Sarah Chen",
      role: "VP of Engineering, TechCorp",
      metric: "73% skills improvement"
    },
    {
      quote: "Manual assessments took us 3 months. LXERA did it in 5 minutes and the AI courses actually get completed.",
      author: "Michael Rodriguez",
      role: "Head of L&D, FinanceFlow",
      metric: "95% completion rate"
    },
    {
      quote: "The ROI was immediate. We saved $180K in the first quarter by targeting the right skills.",
      author: "Jennifer Park",
      role: "CHRO, DataDrive",
      metric: "3x ROI in 90 days"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - InBold style: minimal and clean */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <Logo className="text-business-black" />
            <div className="flex items-center gap-6">
              <Button 
                onClick={handleGetStarted}
                className="text-sm font-medium bg-business-black text-white px-6 py-2.5 rounded-full hover:bg-business-black/90 transition-all"
              >
                Book Free Analysis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - InBold style: bold statement + immediate value */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-6 leading-tight">
            Turn your skills gap into a 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-future-green to-emerald-600"> growth opportunity</span> ⚡
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            With AI that reveals hidden gaps and builds personalized learning paths.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 bg-business-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-business-black/90 transition-all shadow-xl hover:shadow-2xl"
          >
            Book a free skills analysis
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Challenges Section - InBold style: rotating carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center mb-12">Do any of these sound similar to you?</h2>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll">
              {[...challenges, ...challenges].map((challenge, i) => (
                <div key={i} className="flex-shrink-0 w-80 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-700">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - InBold style */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-6">Trusted by growing tech companies</p>
          <div className="flex justify-center items-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">TechCorp</div>
            <div className="text-2xl font-bold text-gray-400">DataDrive</div>
            <div className="text-2xl font-bold text-gray-400">FinanceFlow</div>
            <div className="text-2xl font-bold text-gray-400">CloudScale</div>
          </div>
        </div>
      </section>

      {/* Services Section - InBold style: clean cards */}
      <section className="py-20" id="services">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Designed for HR & L&D Leaders</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Stop guessing. Start knowing. Fix skills gaps with AI-powered precision.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <Card key={i} className="p-8 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-future-green/10 rounded-xl group-hover:bg-future-green/20 transition-colors">
                      <Icon className="h-6 w-6 text-future-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {service.features.map((feature, j) => (
                          <Badge key={j} variant="secondary" className="bg-gray-100">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="text-future-green font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section - InBold style */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">From skills gap to impact in 4 steps</h2>
          <p className="text-gray-600 text-center mb-12">Our outcome-focused process delivers results, not reports.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-future-green text-white rounded-full font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - InBold style */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Hear stories straight from the people we helped!</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-6 bg-gray-50 border-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <Badge className="mt-4 bg-future-green/10 text-future-green border-0">
                  {testimonial.metric}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - InBold style */}
      <section className="py-20 bg-business-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Built by L&D experts who've been in your shoes</h2>
          <p className="text-gray-300 mb-8 text-lg">
            After 10+ years helping companies identify and close skills gaps, we built the AI-powered solution we wished we had.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-future-green text-business-black px-6 py-3 rounded-full font-medium hover:bg-future-green/90 transition-all"
            >
              Book a Call
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-business-black"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section - InBold style */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">FAQ - Let's clear things up!</h2>
          <div className="space-y-6">
            <details className="p-6 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold">How accurate is the AI skills analysis?</summary>
              <p className="mt-4 text-gray-600">Our AI achieves 92% accuracy in skills extraction and gap identification, validated across 500+ companies.</p>
            </details>
            <details className="p-6 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold">What happens after the free analysis?</summary>
              <p className="mt-4 text-gray-600">You'll see your complete skills gap report and can choose to activate AI course generation for your team.</p>
            </details>
            <details className="p-6 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold">How long does implementation take?</summary>
              <p className="mt-4 text-gray-600">Analysis takes 5 minutes. Course generation is instant. Most teams see first completions within 48 hours.</p>
            </details>
            <details className="p-6 bg-gray-50 rounded-xl cursor-pointer">
              <summary className="font-semibold">Do you integrate with our HRIS?</summary>
              <p className="mt-4 text-gray-600">Yes! We support Workday, BambooHR, ADP, and 250+ other systems for seamless employee data sync.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer - InBold style: minimal */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <Logo className="text-business-black" />
              <span className="text-sm text-gray-500">© 2025 LXERA</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => navigate('/privacy')} className="text-gray-600 hover:text-business-black transition-colors">
                Privacy
              </button>
              <button onClick={() => navigate('/terms')} className="text-gray-600 hover:text-business-black transition-colors">
                Terms
              </button>
              <button onClick={() => navigate('/contact')} className="text-gray-600 hover:text-business-black transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Add animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `
      }} />
    </div>
  );
};

export default SkillsGapAnalysisLanding;