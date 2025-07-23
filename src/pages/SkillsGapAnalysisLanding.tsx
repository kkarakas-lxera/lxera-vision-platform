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

  const funnel = [
    {
      step: "1",
      title: "Upload Team CVs",
      description: "Drop your team's resumes or connect your HRIS. We handle PDFs, Word docs, and direct integrations.",
      time: "2 minutes"
    },
    {
      step: "2", 
      title: "AI Analyzes Skills",
      description: "Our AI extracts skills, maps them to industry standards, and identifies gaps with 92% accuracy.",
      time: "3 minutes"
    },
    {
      step: "3",
      title: "See Your Gaps",
      description: "Get a complete skills inventory showing exactly what's missing and what it's costing you.",
      time: "Instant"
    },
    {
      step: "4",
      title: "Generate Custom Courses",
      description: "AI creates personalized learning paths for each gap. No generic content - everything is tailored to your team.",
      time: "5 minutes"
    }
  ];

  const results = [
    {
      metric: "95%",
      label: "Completion Rate",
      description: "vs 23% industry average"
    },
    {
      metric: "60%",
      label: "Faster Learning",
      description: "Personalized content works"
    },
    {
      metric: "$347K",
      label: "Average Savings",
      description: "In first 6 months"
    },
    {
      metric: "10min",
      label: "Time to Insight",
      description: "vs 3-6 month audits"
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
              className="bg-future-green text-business-black text-sm px-6 py-3 rounded-full hover:bg-future-green/90 transition-all shadow-md"
            >
              Discovery Call
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Landing page style */}
      <section className="px-10 pt-[80px] pb-[60px]">
        <div className="max-w-[900px]">
          <h1 className="text-[72px] leading-[72px] font-bold mb-6">
            From skills gaps to
            <br />
            <span className="text-future-green">personalized courses</span>
            <br />
            in minutes, not months
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-[600px]">
            AI analyzes your team's skills gaps and instantly generates custom training that actually gets completed. No more generic courses.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-future-green text-business-black px-10 py-5 rounded-full text-base font-semibold hover:bg-future-green/90 transition-all shadow-lg"
            >
              Start Free Analysis →
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-full text-base font-semibold hover:border-gray-400 transition-all"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-10 py-[80px] bg-smart-beige/30">
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="text-[48px] font-bold mb-6">
            The skills gap crisis is real
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-[700px] mx-auto">
            And it's costing you more than you think
          </p>
          
          <div className="grid grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-[56px] font-bold text-future-green mb-2">73%</div>
              <p className="text-gray-600">of employees lack skills needed for their current role</p>
            </div>
            <div className="text-center">
              <div className="text-[56px] font-bold text-lxera-red mb-2">$1.5M</div>
              <p className="text-gray-600">average annual cost of skills gaps per company</p>
            </div>
            <div className="text-center">
              <div className="text-[56px] font-bold text-emerald mb-2">23%</div>
              <p className="text-gray-600">completion rate for generic training programs</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 font-medium">
            Manual assessments take months. Generic training doesn't work.
            <br />
            <span className="text-business-black font-bold">There's a better way.</span>
          </p>
        </div>
      </section>

      {/* How It Works - The Funnel */}
      <section id="how-it-works" className="px-10 py-[100px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[48px] font-bold mb-4">
              Skills gap to custom courses in 10 minutes
            </h2>
            <p className="text-xl text-gray-600">
              Our AI-powered funnel transforms your workforce data into actionable learning paths
            </p>
          </div>
          
          <div className="relative">
            {/* Funnel Flow */}
            <div className="absolute top-[60px] left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-future-green/50 to-future-green"></div>
            
            <div className="grid grid-cols-4 gap-8 relative">
              {funnel.map((item, i) => (
                <div key={i} className="relative">
                  <div className="bg-white rounded-full w-[120px] h-[120px] flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg relative z-10">
                    <span className="text-[48px] font-bold text-future-green">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-center">{item.title}</h3>
                  <p className="text-gray-600 text-center mb-3">{item.description}</p>
                  <p className="text-sm text-future-green font-semibold text-center">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Button 
              onClick={handleGetStarted}
              className="bg-future-green text-business-black px-12 py-5 rounded-full text-lg font-semibold hover:bg-future-green/90 transition-all shadow-lg"
            >
              Try It Free - No Credit Card Required
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="px-10 py-[100px] bg-gradient-to-b from-smart-beige/50 to-white">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[48px] font-bold text-center mb-16">
            Results that speak for themselves
          </h2>
          
          <div className="grid grid-cols-4 gap-8 mb-20">
            {results.map((result, i) => (
              <div key={i} className="text-center">
                <div className="text-[64px] font-bold text-future-green mb-2">{result.metric}</div>
                <h3 className="text-xl font-bold mb-1">{result.label}</h3>
                <p className="text-gray-600 text-sm">{result.description}</p>
              </div>
            ))}
          </div>
          
          <Card className="p-12 rounded-3xl border-2 border-future-green/20 bg-white">
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">Before LXERA</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-lxera-red mt-1">✗</span>
                    3-6 months for manual skills audits
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lxera-red mt-1">✗</span>
                    Generic training with 23% completion
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lxera-red mt-1">✗</span>
                    No visibility into skill gaps
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lxera-red mt-1">✗</span>
                    Wasted L&D budget on irrelevant content
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">After LXERA</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-future-green mt-1">✓</span>
                    10-minute automated analysis
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-future-green mt-1">✓</span>
                    Personalized courses with 95% completion
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-future-green mt-1">✓</span>
                    Complete skills inventory and gap report
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-future-green mt-1">✓</span>
                    Targeted training that drives real ROI
                  </li>
                </ul>
              </div>
            </div>
          </Card>
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
            <Card key={i} className="p-8 rounded-2xl border-2 border-future-green/20 hover:border-future-green/40 bg-white transition-all hover:shadow-lg">
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
      <section className="px-10 py-[100px] bg-gradient-to-b from-white to-smart-beige/50">
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
      <section className="px-10 py-[100px] bg-gradient-to-br from-business-black to-emerald/90 text-white">
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