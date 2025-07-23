import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';


const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleGetStarted = () => {
    navigate('/skills-gap-signup?source=skills-gap-landing');
  };

  const challenges = [
    {
      title: "Struggling to measure skills gaps across your organization?",
      description: "You're not alone. Most companies rely on outdated methods that miss critical skill deficiencies."
    },
    {
      title: "Wasting resources on generic training programs?",
      description: "Industry reports show 70% of training budgets are wasted on irrelevant content."
    },
    {
      title: "No clear visibility into team capabilities?",
      description: "Without accurate skills data, strategic workforce planning becomes guesswork."
    },
    {
      title: "Manual assessments taking months to complete?",
      description: "Traditional audits average 3-6 months and still miss hidden talent and gaps."
    }
  ];

  const services = [
    {
      category: "Analysis",
      title: "Skills Gap Discovery",
      description: "Upload CVs or connect your HRIS. Our AI analyzes your entire workforce in minutes, revealing skill deficiencies, hidden talent, and single points of failure.",
      features: [
        "✓ CV & resume analysis",
        "✓ Skills taxonomy mapping", 
        "✓ Gap severity ranking",
        "✓ Department breakdowns"
      ]
    },
    {
      category: "Insights",
      title: "Strategic Workforce Planning",
      description: "Transform raw skills data into actionable insights. See exactly which skills are blocking your initiatives and where to invest your L&D budget.",
      features: [
        "✓ Cost impact analysis",
        "✓ Risk assessment",
        "✓ Succession planning",
        "✓ Hiring recommendations"
      ]
    },
    {
      category: "Action",
      title: "Targeted Interventions",
      description: "Move from insight to action with AI-generated learning paths, strategic hiring plans, and internal mobility recommendations.",
      features: [
        "✓ Custom learning paths",
        "✓ Internal talent matching",
        "✓ Reskilling roadmaps",
        "✓ Progress tracking"
      ]
    }
  ];

  const testimonials = [
    {
      company: "TechCorp",
      quote: "LXERA revealed $347K in productivity losses we didn't know existed. Their analysis helped us close critical gaps in 6 weeks.",
      author: "Sarah Chen, VP Engineering"
    },
    {
      company: "FinanceFlow", 
      quote: "What took us 3 months manually, LXERA did in 5 minutes. The accuracy was eye-opening - we found skills we didn't know we had.",
      author: "Michael Rodriguez, Head of L&D"
    },
    {
      company: "DataDrive",
      quote: "The ROI was immediate. We saved $180K in the first quarter by focusing training on actual gaps instead of guesswork.",
      author: "Jennifer Park, CHRO"
    }
  ];

  const faqItems = [
    {
      question: "How accurate is the AI analysis?",
      answer: "Our analysis achieves 92% accuracy compared to 27% for self-reported skills. We validate against industry-standard taxonomies."
    },
    {
      question: "What data do you need from us?",
      answer: "Just employee names and CVs. We can import from your HRIS or you can upload a CSV file. No complex integration required."
    },
    {
      question: "How long does the analysis take?",
      answer: "Initial results in 5 minutes for up to 100 employees. Full departmental analysis completes within an hour."
    },
    {
      question: "What happens after the analysis?",
      answer: "You get a complete skills inventory, gap report, and cost impact analysis. Use it for workforce planning or let our AI generate targeted solutions."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - InBold exact style */}
      <nav className="relative px-10 py-2.5">
        <div className="flex justify-between items-center h-16">
          <Logo className="text-business-black" />
          <div className="flex items-center gap-8">
            <button className="text-sm hover:opacity-70 transition-opacity">Services</button>
            <button className="text-sm hover:opacity-70 transition-opacity">Process</button>
            <button className="text-sm hover:opacity-70 transition-opacity">Blog</button>
            <Button 
              onClick={handleGetStarted}
              className="bg-business-black text-white text-sm px-6 py-3 rounded-full hover:bg-business-black/90 transition-all"
            >
              Discovery Call
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - InBold style */}
      <section className="px-10 pt-[60px]">
        <div className="max-w-[820px]">
          <h1 className="text-[65px] leading-[65px] font-bold mb-4">
            Let's solve your skills gap
            <br />
            puzzles to drive growth
            <br />
            in months! <span className="text-future-green">⚡</span>
          </h1>
          <p className="text-gray-600 mb-8 text-base">
            With AI-powered analysis and strategies that deliver.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-future-green text-business-black px-8 py-4 rounded-full text-sm font-medium hover:bg-future-green/90 transition-all shadow-lg"
          >
            Book a free consultancy call
          </Button>
        </div>
      </section>

      {/* Challenges Section - InBold style with carousel */}
      <section className="px-10 pt-[60px]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-2 rounded-full bg-business-black"></div>
          <h2 className="text-sm uppercase tracking-wider">Challenges</h2>
        </div>
        <h2 className="text-[28px] font-bold mb-12">
          Do any of these sound similar to you?
        </h2>
        
        <div className="relative">
          <div className="flex gap-5 transition-transform duration-500 ease-out"
               style={{ transform: `translateX(-${currentSlide * 420}px)` }}>
            {challenges.map((challenge, i) => (
              <div key={i} className="w-[400px] flex-shrink-0">
                <Card className="p-8 h-full rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold mb-3">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{challenge.description}</p>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mt-8">
            <button 
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentSlide(Math.min(challenges.length - 1, currentSlide + 1))}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={currentSlide === challenges.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section - InBold style */}
      <section className="px-10 py-[100px]">
        <div className="text-center">
          <h2 className="text-[32px] font-bold mb-2">
            Trusted by <span className="text-future-green">growing</span>
          </h2>
          <p className="text-[32px] font-bold mb-12">tech companies</p>
          
          <div className="flex justify-center items-center gap-12 opacity-60">
            <div className="text-xl font-semibold">TechCorp</div>
            <div className="text-xl font-semibold">DataDrive</div>
            <div className="text-xl font-semibold">FinanceFlow</div>
            <div className="text-xl font-semibold">CloudScale</div>
            <div className="text-xl font-semibold">InnovateLab</div>
          </div>
        </div>
      </section>

      {/* Services Section - InBold style */}
      <section className="px-10 py-[100px] bg-smart-beige">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-2 rounded-full bg-business-black"></div>
          <h2 className="text-sm uppercase tracking-wider">Services</h2>
        </div>
        <h2 className="text-[48px] font-bold mb-16 max-w-2xl">
          Designed for Skills Gap Analysis
        </h2>
        
        <div className="space-y-16">
          {services.map((service, i) => (
            <div key={i} className="">
              <div className="flex gap-8 mb-6">
                <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">
                  {service.category}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
                    {service.description}
                  </p>
                  <div className="space-y-2">
                    {service.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm text-gray-700">
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {i < services.length - 1 && (
                <div className="border-b border-gray-200 mt-12"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-16">
          <Button 
            onClick={handleGetStarted}
            className="bg-future-green text-business-black px-8 py-4 rounded-full text-sm font-medium hover:bg-future-green/90 transition-all shadow-lg"
          >
            View Details
          </Button>
        </div>
      </section>

      {/* Testimonials Section - InBold style */}
      <section className="px-10 py-[100px]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-2 rounded-full bg-business-black"></div>
          <h2 className="text-sm uppercase tracking-wider">Success Stories</h2>
        </div>
        <h2 className="text-[48px] font-bold mb-16">
          Real results from real companies
        </h2>
        
        <div className="grid grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-8 rounded-2xl border border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-4">
                {testimonial.company}
              </div>
              <p className="text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <p className="text-sm text-gray-500">
                — {testimonial.author}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section - InBold style */}
      <section className="px-10 py-[100px] bg-smart-beige">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-2 h-2 rounded-full bg-business-black"></div>
          <h2 className="text-sm uppercase tracking-wider">FAQ</h2>
        </div>
        <h2 className="text-[48px] font-bold mb-16">
          Common questions answered
        </h2>
        
        <div className="max-w-3xl">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-300 py-8 first:pt-0 last:border-0">
              <h3 className="text-xl font-semibold mb-4">{item.question}</h3>
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA Section - InBold style */}
      <section className="px-10 py-[100px] bg-business-black text-white">
        <div className="max-w-3xl">
          <h2 className="text-[48px] font-bold mb-6 leading-tight">
            Ready to unlock your organization's hidden potential?
          </h2>
          <p className="text-gray-300 mb-12 text-lg leading-relaxed">
            Get a complete skills inventory in minutes. See exactly where your gaps are and what they're costing you.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-future-green text-business-black px-8 py-4 rounded-full font-medium hover:bg-future-green/90 transition-all"
            >
              Start Free Analysis
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-business-black px-8 py-4 rounded-full font-medium transition-all"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>


      {/* Footer - InBold minimal style */}
      <footer className="px-10 py-12 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Logo className="text-business-black" />
            <span className="text-sm text-gray-500">© 2025 LXERA AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <button onClick={() => navigate('/privacy')} className="hover:opacity-70 transition-opacity">
              Privacy
            </button>
            <button onClick={() => navigate('/terms')} className="hover:opacity-70 transition-opacity">
              Terms
            </button>
            <button onClick={() => navigate('/contact')} className="hover:opacity-70 transition-opacity">
              Contact
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SkillsGapAnalysisLanding;