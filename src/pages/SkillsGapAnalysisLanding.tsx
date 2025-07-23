import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import * as Accordion from '@radix-ui/react-accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/Logo';
import { ArrowRight, TrendingUp, Target, BarChart3, Shield, Star, ChevronDown } from 'lucide-react';


const SkillsGapAnalysisLanding = () => {
  const navigate = useNavigate();
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
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
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Navigation - InBold style with animation */}
      <motion.nav 
        className="fixed top-0 w-full bg-smart-beige backdrop-blur-md z-50 border-b border-future-green/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <Logo className="text-business-black" />
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleGetStarted}
                  className="text-sm font-semibold bg-future-green text-business-black px-8 py-3 rounded-full hover:bg-future-green/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Book Free Analysis
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with parallax effect */}
      <section className="pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-b from-smart-beige to-white">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          style={{ y }}
        >
          <motion.h1 
            className="text-5xl lg:text-7xl font-black text-business-black mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Turn your skills gap into a 
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-future-green to-emerald"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            > growth opportunity</motion.span> ⚡
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            With AI that reveals hidden gaps and builds personalized learning paths.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 bg-future-green text-business-black px-10 py-5 rounded-full text-lg font-semibold hover:bg-future-green/90 transition-all shadow-2xl hover:shadow-3xl"
            >
              Book a free skills analysis
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Challenges Section with smooth scroll */}
      <section className="py-16 bg-gradient-to-b from-white to-smart-beige/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Do any of these sound similar to you?
          </motion.h2>
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex gap-6"
              animate={{ x: ["-50%", "0%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...challenges, ...challenges].map((challenge, i) => (
                <motion.div 
                  key={i} 
                  className="flex-shrink-0 w-96 p-8 bg-white rounded-3xl shadow-lg border-2 border-future-green/20 hover:border-future-green/40 transition-colors"
                  whileHover={{ y: -5 }}
                >
                  <p className="text-gray-800 text-lg">{challenge}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges with animation */}
      <section className="py-16 border-y border-future-green/20 bg-smart-beige/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p 
            className="text-center text-sm text-gray-500 mb-8 uppercase tracking-wider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Trusted by growing tech companies
          </motion.p>
          <motion.div 
            className="flex justify-center items-center gap-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.6, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {['TechCorp', 'DataDrive', 'FinanceFlow', 'CloudScale'].map((company, i) => (
              <motion.div
                key={company}
                className="text-2xl font-bold text-gray-400"
                whileHover={{ scale: 1.1, opacity: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: i * 0.1 }}
              >
                {company}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section with animations */}
      <section className="py-20" id="services">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">Know Your Workforce Like Never Before</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-lg">
              Get complete visibility into your organization's skills landscape.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.1,
              });
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                  onMouseEnter={() => setHoveredService(i)}
                  onMouseLeave={() => setHoveredService(null)}
                >
                  <Card className="p-10 h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-future-green/20 hover:border-future-green/40 relative overflow-hidden bg-white">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-future-green/10 to-transparent opacity-0"
                      animate={{ opacity: hoveredService === i ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-future-green/20 to-future-green/10 rounded-2xl"
                        whileHover={{ rotate: 5 }}
                      >
                        <Icon className="h-8 w-8 text-emerald" />
                      </motion.div>
                      <div className="flex-1 relative z-10">
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">{service.description}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {service.features.map((feature, j) => (
                            <motion.div
                              key={j}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 + j * 0.05 }}
                            >
                              <Badge variant="secondary" className="bg-future-green/10 text-emerald border border-future-green/30 px-4 py-1.5 font-medium">
                                {feature}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <motion.button 
                      className="text-emerald font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      View Details <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section with counter animation */}
      <section className="py-20 bg-gradient-to-b from-white to-smart-beige/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">From confusion to clarity in 4 steps</h2>
            <p className="text-gray-600 text-lg">A systematic approach to understanding your workforce capabilities.</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {process.map((step, i) => {
              const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.5,
              });
              return (
                <motion.div 
                  key={i} 
                  ref={ref}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 bg-future-green text-business-black rounded-full font-bold text-xl mb-6"
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ type: "spring", stiffness: 200, delay: i * 0.15 + 0.3 }}
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What You'll Discover Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">What your skills analysis reveals</h2>
            <p className="text-gray-600 text-lg">Insights that transform how you manage talent</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Hidden Talent",
                description: "Employees with underutilized skills you didn't know existed",
                metric: "avg. 23%",
                label: "untapped skills",
                color: "text-emerald-600"
              },
              {
                title: "Critical Gaps",
                description: "Missing skills blocking your strategic initiatives",
                metric: "avg. 5-7",
                label: "per team",
                color: "text-lxera-red"
              },
              {
                title: "Risk Areas",
                description: "Single points of failure where only one person has key skills",
                metric: "avg. 3",
                label: "per department",
                color: "text-lxera-yellow"
              }
            ].map((item, i) => {
              const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.1,
              });
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 border-2 border-future-green/20 hover:border-future-green/40 bg-white">
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="pt-4 border-t border-gray-100">
                      <div className={`text-3xl font-bold ${item.color}`}>
                        {item.metric}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials with hover effects */}
      <section className="py-20 bg-gradient-to-b from-smart-beige/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Hear stories straight from the people we helped!
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => {
              const [ref, inView] = useInView({
                triggerOnce: true,
                threshold: 0.1,
              });
              return (
                <motion.div
                  key={i}
                  ref={ref}
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="p-8 h-full bg-white border-2 border-future-green/20 hover:border-future-green/40 hover:shadow-xl transition-all duration-300">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={inView ? { opacity: 1, scale: 1 } : {}}
                          transition={{ delay: i * 0.15 + j * 0.05 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-future-green to-emerald rounded-full"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div>
                        <p className="font-bold text-base">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-future-green/20 text-emerald border-0 px-4 py-2 text-sm font-semibold">
                      {testimonial.metric}
                    </Badge>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section with gradient background */}
      <section className="py-24 bg-gradient-to-br from-business-black to-emerald text-white relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundImage: [
              "radial-gradient(circle at 20% 80%, #7AE5C6 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #7AE5C6 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, #7AE5C6 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h2 
            className="text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Finally see what skills you actually have
          </motion.h2>
          <motion.p 
            className="text-gray-300 mb-10 text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join the 30% of organizations who truly understand their workforce capabilities. Get insights that drive smarter talent decisions.
          </motion.p>
          <motion.div 
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleGetStarted}
                className="bg-future-green text-business-black px-8 py-4 rounded-full font-semibold hover:bg-future-green/90 transition-all text-lg shadow-xl"
              >
                Analyze Your Team
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-full font-semibold text-lg"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section with Radix Accordion */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            FAQ - Let's clear things up!
          </motion.h2>
          <Accordion.Root type="single" collapsible className="space-y-4">
            {[
              {
                question: "How accurate is the skills extraction?",
                answer: "Our analysis achieves 92% accuracy, compared to 27% for self-reported skills. We validate against industry standards."
              },
              {
                question: "What happens after the analysis?",
                answer: "You get a complete skills inventory and gap report. Use it for hiring decisions, L&D planning, or succession planning. Further action is entirely up to you."
              },
              {
                question: "Can we do this manually?",
                answer: "Manual audits take 3-6 months and often miss critical gaps. Our analysis completes in minutes with comprehensive coverage."
              },
              {
                question: "What data do you need?",
                answer: "Just employee names, roles, and CVs. We can import from your HRIS or you can upload a simple CSV file."
              }
            ].map((faq, i) => (
              <Accordion.Item key={i} value={`item-${i}`} className="bg-smart-beige/50 rounded-2xl overflow-hidden border border-future-green/20">
                <Accordion.Header>
                  <Accordion.Trigger className="w-full p-6 text-left font-semibold text-lg flex items-center justify-between hover:bg-smart-beige/80 transition-colors group">
                    {faq.question}
                    <motion.div
                      animate={{ rotate: 0 }}
                      className="transition-transform duration-300 group-data-[state=open]:rotate-180"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-6">
                  <motion.p 
                    className="text-gray-600 leading-relaxed"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </section>

      {/* Footer - InBold style: minimal */}
      <footer className="border-t border-future-green/20 py-8 bg-smart-beige/30">
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

    </div>
  );
};

export default SkillsGapAnalysisLanding;