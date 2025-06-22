import { 
  Bot,
  Shield, 
  BarChart3, 
  Users, 
  Code, 
  Gamepad, 
  Bell,
  FileText, 
  Target,
  Settings,
  UserCheck,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Import the highlights data (just like before)
const highlightsData = [
  {
    icon: Bot,
    title: "AI Hyper-Personalized Learning Engine",
    microcopy: "Truly individualized journeys",
    description: "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
  },
  {
    icon: Users,
    title: "AI Avatar-Powered Content Creation",
    microcopy: "90% content efficiency",
    description: "Generate dynamic video lessons with lifelike avatars.",
  },
  {
    icon: Bot,
    title: "Organization-Specific Mentor Chatbot",
    microcopy: "Always available & tailored",
    description: "Private AI mentor trained on internal content.",
  },
  {
    icon: Gamepad,
    title: "Real-Time Adaptive Gamification",
    microcopy: "+40% engagement",
    description: "Game mechanics adjust to each learner's behavior and progress.",
  },
  {
    icon: Bell,
    title: "Smart Nudging & Behavioral Triggers",
    microcopy: "+35% completion",
    description: "Nudges and reminders based on user behavior via Slack/email.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security & Compliance",
    microcopy: "Trust & compliance ready",
    description: "SOC2 & GDPR aligned, encryption, role-based access.",
  },
  {
    icon: UserCheck,
    title: "Human-in-the-Loop Intelligence",
    microcopy: "Expert accuracy",
    description: "Combine scalable AI with human review for high-trust learning.",
  },
  {
    icon: BarChart3,
    title: "Executive-Ready Analytics Dashboard",
    microcopy: "Predict learning ROI",
    description: "Visualize outcomes and innovation metrics across departments.",
  },
  {
    icon: Code,
    title: "Low-Code / No-Code Innovation Sandbox",
    microcopy: "10x faster prototyping",
    description: "Enable bottom-up innovation through app building and automation.",
  },
  {
    icon: FileText,
    title: "Knowledge Base Transformation",
    microcopy: "+70% engagement",
    description: "Turn SOPs and reports into microlearning modules.",
  },
  {
    icon: Settings,
    title: "Automated Role-Based Learning (HRIS Integration)",
    microcopy: "Fully automated journeys",
    description: "Sync with HR systems to personalize content by job role.",
  },
  {
    icon: Users,
    title: "Social Learning Communities",
    microcopy: "+50% collaboration",
    description: "Spaces for discussion, mentorship, and informal learning.",
  }
];

const PlatformHighlightsSection = () => {
  return (
    <>
      <section className="w-full py-24 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/30 via-white/60 to-smart-beige/40 relative overflow-hidden z-0 font-inter transition-all duration-1000 ease-in-out">
        <div className="max-w-7xl mx-auto relative z-0">
          {/* Enhanced section header with benefit-focused messaging */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-future-green/20 to-emerald/20 border border-future-green/30 rounded-full mb-6">
              <div className="w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-business-black font-inter">
                12+ Powerful Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-business-black mb-6 font-inter">
              Everything You Need to Transform Learning
            </h2>
            <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 mb-8 max-w-4xl mx-auto font-normal font-inter">
              From AI-powered personalization to innovation enablement — built for results that matter.
            </p>
            
            {/* ROI preview stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-future-green mb-1 font-inter">3x</div>
                <p className="text-business-black/70 text-sm font-inter">Faster Learning</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-future-green mb-1 font-inter">85%</div>
                <p className="text-business-black/70 text-sm font-inter">Higher Engagement</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-future-green mb-1 font-inter">70%</div>
                <p className="text-business-black/70 text-sm font-inter">Better Retention</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-future-green mb-1 font-inter">40%</div>
                <p className="text-business-black/70 text-sm font-inter">ROI Increase</p>
              </div>
            </div>
          </div>

          {/* Enhanced feature cards grid with better hover effects */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {highlightsData.slice(0, 12).map((item, index) => (
              <Card
                key={index}
                className="
                  bg-gradient-to-br from-white/90 via-smart-beige/20 to-white/80 
                  lxera-shadow text-center group 
                  hover:from-white hover:via-future-green/10 hover:to-white 
                  hover:shadow-2xl hover:border-future-green/30 transition-all duration-500 
                  animate-fade-in-up border border-transparent hover:scale-[1.02]
                  font-inter rounded-2xl cursor-pointer relative overflow-hidden
                  "
                style={{
                  animationDelay: `${250 + index * 60}ms`,
                }}
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                <CardContent className="p-6 relative z-10">
                  <div className="mb-4 flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-future-green/20 to-emerald/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                      <item.icon className="w-7 h-7 text-business-black group-hover:text-future-green transition-colors duration-300" />
                    </div>
                  </div>
                  <p className="text-business-black font-semibold text-base mb-2 font-inter group-hover:text-future-green transition-colors duration-300">{item.title}</p>
                  <p className="text-business-black/70 mb-3 text-sm min-h-[40px] font-normal font-inter leading-relaxed">{item.description}</p>
                  
                  {/* Enhanced microcopy reveal with better animation */}
                  <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-16 opacity-0 group-hover:opacity-100">
                    <div className="border-t border-future-green/20 pt-3 mt-3">
                      <p className="text-sm text-future-green font-medium font-inter">
                        ✨ {item.microcopy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Enhanced bottom section with conversion focus */}
          <div className="text-center">
            <p className="text-business-black/70 mb-6 text-base font-normal font-inter max-w-2xl mx-auto">
              Each feature is designed with real-world feedback and proven to deliver measurable impact for modern teams.
            </p>
            
            {/* Feature exploration CTA */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-future-green/10 to-emerald/10 border border-future-green/30 rounded-full hover:from-future-green/20 hover:to-emerald/20 transition-all duration-300 cursor-pointer">
              <span className="text-sm font-medium text-business-black font-inter">
                Want to see these features in action?
              </span>
              <ArrowRight className="w-4 h-4 text-future-green animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PlatformHighlightsSection;
