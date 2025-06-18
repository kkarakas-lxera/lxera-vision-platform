
import { Button } from "@/components/ui/button";
import { Check, Info, Star, Zap, ArrowRight, Users, Shield, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PlanComparisonSection from "@/components/PlanComparisonSection";

const Pricing = () => {
  const featureExplanations: {[key: string]: string} = {
    "AI Hyper-Personalized Learning Engine": "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
    "AI Avatar-Powered Content Creation": "Generate dynamic video lessons with lifelike avatars.",
    "Real-Time Adaptive Gamification": "Game mechanics adjust to each learner's behavior and progress.",
    "Smart Nudging & Behavioral Triggers": "Nudges and reminders based on user behavior via Slack/email.",
    "Human-in-the-Loop Intelligence": "Combine scalable AI with human review for high-trust learning.",
    "Executive-Ready Analytics Dashboard": "Visualize outcomes and innovation metrics across departments.",
    "Knowledge Base Transformation": "Turn SOPs and reports into microlearning modules.",
    "Taxonomist Skill Gap Engine": "Automatically detects role-based skill gaps and maps them to personalized learning paths.",
    "Organization-Specific AI Mentor": "Private AI chatbot trained on your company's content to support contextual, role-specific learning.",
    "Enterprise-Grade Security & Compliance": "SOC2 & GDPR aligned, encryption, role-based access.",
    "Low-Code / No-Code Innovation Sandbox": "Enable bottom-up innovation through app building and automation.",
    "SSO/HRIS Integrations": "Sync with HR systems to personalize content by job role."
  };

  const plans = [
    {
      name: "Core",
      price: "$199",
      period: "per month",
      description: "Perfect for growing businesses ready to scale learning",
      features: [
        "AI Hyper-Personalized Learning Engine",
        "AI Avatar-Powered Content Creation",
        "Real-Time Adaptive Gamification",
        "Smart Nudging & Behavioral Triggers",
        "Human-in-the-Loop Intelligence",
        "Executive-Ready Analytics Dashboard",
        "Knowledge Base Transformation",
        "Taxonomist Skill Gap Engine"
      ],
      popular: false,
      highlight: "Most Popular",
      users: "Up to 100 users"
    },
    {
      name: "Enterprise",
      subtitle: "Everything in Core, plus:",
      price: "Custom",
      period: "contact us",
      description: "Tailored for large organizations with advanced needs",
      features: [
        "Organization-Specific AI Mentor",
        "Enterprise-Grade Security & Compliance",
        "Low-Code / No-Code Innovation Sandbox",
        "SSO/HRIS Integrations",
        "White-label Branding",
        "Dedicated Success Manager",
        "Priority Support"
      ],
      popular: true,
      highlight: "Enterprise Ready",
      users: "Unlimited users"
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-smart-beige via-white to-smart-beige">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-white via-smart-beige/30 to-future-green/10 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-future-green/20 text-business-black text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Transparent, Simple Pricing
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-8 leading-tight">
              Choose Your
              <span className="bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent"> Learning </span>
              Journey
            </h1>
            <p className="text-xl lg:text-2xl text-business-black/70 max-w-4xl mx-auto mb-10 leading-relaxed">
              Transform your organization with AI-powered learning. Start your journey today with our comprehensive plans designed for every stage of growth.
            </p>
            
            {/* Enhanced Trust badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-base text-business-black/60">
              <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-xl">
                <Star className="h-5 w-5 text-future-green" />
                <span className="font-medium">14-day free trial</span>
              </div>
              <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-xl">
                <Zap className="h-5 w-5 text-future-green" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-xl">
                <Shield className="h-5 w-5 text-future-green" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Pricing Cards */}
        <div className="py-20 lg:py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-3xl p-10 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-3 border-2 group ${
                    plan.popular 
                      ? 'border-business-black scale-105 bg-gradient-to-br from-business-black/5 to-business-black/10' 
                      : 'border-future-green/30 hover:border-future-green'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <span className="bg-business-black text-white px-8 py-3 rounded-full text-base font-bold shadow-xl">
                        {plan.highlight}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-10">
                    <div className="flex items-center justify-center mb-4">
                      <h3 className={`text-3xl font-bold transition-colors duration-300 ${
                        plan.popular ? 'text-business-black' : 'text-business-black group-hover:text-future-green'
                      }`}>
                        {plan.name}
                      </h3>
                      {!plan.popular && (
                        <span className="ml-3 bg-future-green/20 text-business-black px-3 py-1 rounded-full text-sm font-medium">
                          {plan.highlight}
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-business-black/70 mb-6 leading-relaxed">
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      <span className="text-6xl font-bold text-business-black group-hover:scale-110 transition-transform duration-300 inline-block">
                        {plan.price}
                      </span>
                      <span className="text-xl text-business-black/60 ml-3">
                        {plan.period}
                      </span>
                    </div>
                    <div className="flex items-center justify-center text-business-black/60 mb-2">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{plan.users}</span>
                    </div>
                    {plan.subtitle && (
                      <p className="text-base text-business-black/70 font-medium bg-smart-beige/30 px-4 py-2 rounded-xl">
                        {plan.subtitle}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-5 mb-10">
                    {plan.features.map((feature, featureIndex) => {
                      const hasExplanation = featureExplanations[feature];
                      
                      return (
                        <li key={featureIndex}>
                          <div className="flex items-start group/feature">
                            <Check className={`h-6 w-6 mr-4 flex-shrink-0 mt-0.5 group-hover/feature:scale-110 transition-transform duration-200 ${
                              plan.popular ? 'text-business-black' : 'text-future-green'
                            }`} />
                            <span className="text-business-black/80 flex-1 group-hover/feature:text-business-black transition-colors duration-200 leading-relaxed">
                              {feature}
                            </span>
                            {hasExplanation && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="ml-3 p-1 hover:bg-future-green/10 rounded-full transition-all duration-200 hover:scale-110 group">
                                    <Info className="h-4 w-4 text-future-green/70 group-hover:text-future-green transition-colors duration-200" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="left" 
                                  className="max-w-xs bg-white border border-future-green/20 shadow-xl p-4 text-sm text-business-black/80"
                                  sideOffset={8}
                                >
                                  {featureExplanations[feature]}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <Button
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                      plan.popular
                        ? 'bg-business-black hover:bg-business-black/90 text-white hover:shadow-business-black/25'
                        : 'bg-future-green hover:bg-emerald text-business-black hover:text-white hover:shadow-future-green/25'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Comparison Section */}
        <PlanComparisonSection />

        {/* Enhanced FAQ Section */}
        <div className="py-20 lg:py-28 bg-gradient-to-b from-white to-smart-beige/30">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-business-black/70">
                Everything you need to know about our pricing and plans
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: "Can I change my plan anytime?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
                },
                {
                  question: "Is there a free trial?",
                  answer: "We offer a 14-day free trial for all plans. No credit card required. You'll have full access to all features during your trial period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely."
                },
                {
                  question: "Do you offer custom pricing for large teams?",
                  answer: "Yes! For teams over 100 users, we offer custom pricing and additional enterprise features. Contact our sales team for a personalized quote."
                },
                {
                  question: "What kind of support do you provide?",
                  answer: "Core plans include email support and extensive documentation. Enterprise plans get priority support, dedicated success managers, and phone support."
                },
                {
                  question: "How secure is my data?",
                  answer: "We take security seriously with SOC2 compliance, GDPR alignment, end-to-end encryption, and role-based access controls for all enterprise features."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <h3 className="text-xl font-bold text-business-black mb-4 leading-tight">
                    {faq.question}
                  </h3>
                  <p className="text-business-black/70 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Pricing;
