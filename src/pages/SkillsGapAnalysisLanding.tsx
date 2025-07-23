import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';


const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedStep, setExpandedStep] = useState(0);

  const challenges = [
    {
      title: "Can't see who knows what across your organization?",
      description: "<u>64% of managers don't think their employees can keep pace with future skill needs</u> while 70% of employees haven't mastered the skills they need today. Manual tracking leaves capabilities hidden from decision makers (Gartner)."
    },
    {
      title: "Still using outdated skills audits?",
      description: "<u>SHRM found that HR teams often procrastinate on skills analysis</u> because traditional methods are overwhelming. Modern AI-powered analysis delivers comprehensive results in rapid timeframes (SHRM)."
    },
    {
      title: "Generic training with 23% completion rates?",
      description: "<u>McKinsey reports 87% of companies face skill gaps</u> but most L&D programs fail because they're not personalized to actual needs. Connected learners achieve 95% completion when content matches their gaps (McKinsey)."
    },
    {
      title: "Losing productivity to invisible skill gaps?",
      description: "<u>InStride research shows skill gaps cost companies millions</u> in decreased productivity and increased turnover. Organizations waste 9.3 hours weekly searching for expertise that already exists internally (InStride)."
    }
  ];

  const handleGetStarted = () => {
    navigate('/skills-gap-signup?source=skills-gap-landing');
  };

  const funnel = [
    {
      step: "1",
      title: "Build Team Profiles",
      description: "Simple form with basic info - name, tools used, education. Just public data that takes seconds to fill.",
      time: "Quick setup"
    },
    {
      step: "2", 
      title: "AI Skills Mapping",
      description: "Our AI maps your team's capabilities to industry standards and identifies skill levels across your organization.",
      time: "Real-time analysis"
    },
    {
      step: "3",
      title: "Gap Analysis Report",
      description: "Comprehensive report showing skill gaps, their severity, cost impact, and which teams are affected.",
      time: "Instant insights"
    },
    {
      step: "4",
      title: "Strategic Recommendations",
      description: "Get actionable next steps - whether it's hiring, training, or reorganizing teams for better skill coverage.",
      time: "Data-driven decisions"
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
      description: "From rapid implementation"
    },
    {
      metric: "92%",
      label: "Accuracy Rate",
      description: "vs 27% self-reporting"
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
      quote: "What took months manually, LXERA completed rapidly. The accuracy was eye-opening - we found skills we didn't know we had.",
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
      answer: "Just basic info like names, tools they use, and where they studied. Simple data that's already public - nothing sensitive or complex."
    },
    {
      question: "How long does the analysis take?",
      answer: "Initial results appear rapidly for teams of any size. Full departmental analysis completes with real-time processing."
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
          <Button 
            onClick={handleGetStarted}
            className="bg-future-green text-business-black text-sm px-6 py-3 rounded-full hover:bg-future-green/90 transition-all shadow-md"
          >
            Get Free Analysis
          </Button>
        </div>
      </nav>

      {/* Hero Section - Landing page style */}
      <section className="px-10 pt-[80px] pb-[60px]">
        <div className="max-w-[900px]">
          <h1 className="text-[72px] leading-[72px] font-bold mb-6">
            Your complete
            <br />
            <span className="text-future-green">skills gap analysis</span>
            <br />
            with rapid analysis
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-[600px]">
            Build simple team profiles, get AI-powered analysis, and receive a comprehensive report showing exactly where your skills gaps are and what they're costing you.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-future-green text-business-black px-10 py-5 rounded-full text-base font-semibold hover:bg-future-green/90 transition-all shadow-lg"
            >
              Get Your Skills Report →
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

      {/* Challenges Section - InBold style */}
      <section className="px-10 py-[80px] bg-smart-beige/30">
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
                <Card className="p-8 h-full rounded-2xl border-2 border-future-green/20 hover:border-future-green/40 bg-white transition-all hover:shadow-lg">
                  <h3 className="text-lg font-semibold mb-3">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: challenge.description }} />
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
      
      {/* Problem Stats Section */}
      <section className="px-10 py-[60px]">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-[56px] font-bold text-future-green mb-2">87%</div>
              <p className="text-gray-600">of companies face skill gaps according to McKinsey</p>
            </div>
            <div className="text-center">
              <div className="text-[56px] font-bold text-lxera-red mb-2">9.3hrs</div>
              <p className="text-gray-600">per week wasted searching for information</p>
            </div>
            <div className="text-center">
              <div className="text-[56px] font-bold text-emerald mb-2">94%</div>
              <p className="text-gray-600">would stay longer if companies invested in learning</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Vertical Accordion Card Component */}
      <section id="how-it-works" className="px-10 py-[100px]">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-business-black"></div>
            <h2 className="text-sm uppercase tracking-wider">Here is how it works</h2>
          </div>
          <h2 className="text-[48px] font-bold mb-20 leading-tight">
            From team profiles<br />
            to skills gap report<br />
            with AI-powered analysis
          </h2>
          
          {/* Vertical Accordion Cards */}
          <div className="space-y-4">
            {funnel.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className={`
                    relative overflow-hidden cursor-pointer transition-all duration-500 rounded-2xl
                    ${expandedStep === i 
                      ? 'bg-business-black text-white border-0' 
                      : 'bg-gray-100 hover:bg-gray-200 border-0'
                    }
                  `}
                  onClick={() => setExpandedStep(i)}
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div className={`text-[72px] font-bold leading-none transition-colors duration-500 ${
                        expandedStep === i ? 'text-white' : 'text-future-green'
                      }`}>
                        {item.step}
                      </div>
                      
                      <div className="flex-1 pt-4">
                        <h3 className={`text-2xl font-bold transition-colors duration-500 ${
                          expandedStep === i ? 'text-white' : 'text-business-black'
                        }`}>
                          {item.title}
                        </h3>
                        
                        <AnimatePresence mode="wait">
                          {expandedStep === i && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <p className="text-gray-300 leading-relaxed mt-4 text-lg">
                                {item.description}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
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
          <h2 className="text-[48px] font-bold text-center mb-16 leading-tight">
            Results that speak<br />
            for themselves
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
                    Months of manual skills audits
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
                    Rapid automated analysis
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
        <h2 className="text-[48px] font-bold mb-16 leading-tight">
          Real results from<br />
          real companies
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
        <h2 className="text-[48px] font-bold mb-16 leading-tight">
          Common questions<br />
          answered
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
            Ready to unlock your<br />
            organization's hidden potential?
          </h2>
          <p className="text-gray-300 mb-12 text-lg leading-relaxed">
            Get a complete skills inventory with rapid analysis. See exactly where your gaps are and what they're costing you.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={handleGetStarted}
              className="bg-future-green text-business-black px-8 py-4 rounded-full font-medium hover:bg-future-green/90 transition-all"
            >
              Get Skills Gap Report
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