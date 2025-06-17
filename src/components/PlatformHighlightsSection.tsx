
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
    <section className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-emerald/25 via-emerald/15 to-emerald/30 relative overflow-hidden z-0">
      {/* Animated background for consistency */}
      <div className="absolute inset-0 opacity-3 z-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-business-black/5 rounded-full animate-float-gentle"></div>
        <div className="absolute top-1/3 right-16 w-24 h-24 bg-emerald/15 rounded-full animate-float-gentle" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-business-black/8 rounded-full animate-float-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-20 h-20 bg-emerald/20 rounded-full animate-float-gentle" style={{animationDelay: '3s'}}></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Section Header matching Built for Innovators */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
            Platform Highlights
          </h2>
          <p className="text-xl text-business-black/80 mb-2 max-w-3xl mx-auto">
            10+ features fueling impact, engagement, and innovation.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-4">
          {highlightsData.slice(0, 12).map((item, index) => (
            <Card
              key={index}
              className="
                bg-gradient-to-br from-white/90 via-emerald/10 to-white/80 
                lxera-shadow text-center group 
                hover:from-white hover:via-emerald/15 hover:to-white/90 
                hover:shadow-xl transition-all duration-500 lxera-hover animate-fade-in-up
                "
              style={{
                animationDelay: `${250 + index * 60}ms`,
              }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald/30 to-business-black/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <item.icon className="w-8 h-8 text-business-black group-hover:animate-bounce transition-all duration-300" />
                  </div>
                </div>
                <p className="text-business-black font-bold text-lg mb-1">{item.title}</p>
                <p className="text-business-black/70 mb-3 text-sm min-h-[34px]">{item.description}</p>
                {/* Microcopy/ROI reveals on hover */}
                <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-14 opacity-0 group-hover:opacity-100">
                  <p className="text-sm text-business-black/60 italic border-t border-emerald/20 pt-2">
                    {item.microcopy}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Optional: subtle "impact note" at bottom */}
        <p className="text-business-black/70 mb-2 text-center text-base mt-8">
          Each feature designed and refined with real-world feedback for measurable results.
        </p>
      </div>
    </section>
  );
};

export default PlatformHighlightsSection;
