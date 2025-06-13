
import { Card, CardContent } from "@/components/ui/card";
import { Users, Bot, Target, Brain, Wrench, Rocket } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    { step: "01", title: "Connect Your Team", desc: "Upload or sync with your HR system to onboard users.", icon: <Users className="w-8 h-8" /> },
    { step: "02", title: "Feed in Your Knowledge Base", desc: "Integrate internal documents, SOPs, wikis, and project data — so LXERA generates content grounded in your actual operations.", icon: <Bot className="w-8 h-8" /> },
    { step: "03", title: "Map Skills and Gaps", desc: "AI analyzes team roles, skills, and goals to define learning and innovation paths.", icon: <Target className="w-8 h-8" /> },
    { step: "04", title: "Deliver Personalized Learning", desc: "Every learner receives content and simulations tailored by role, behavior, and live performance — powered by RAG.", icon: <Brain className="w-8 h-8" /> },
    { step: "05", title: "Prototype in the Sandbox", desc: "Low-code tools let learners create real solutions and apply what they learn immediately.", icon: <Wrench className="w-8 h-8" /> },
    { step: "06", title: "Track & Support Innovation", desc: "Your CoE can monitor progress, provide mentorship, and drive project-based transformation.", icon: <Rocket className="w-8 h-8" /> }
  ];

  return (
    <section id="how-it-works" className="w-full py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black text-center mb-8">
          How It Works
        </h2>
        <p className="text-xl text-business-black/80 text-center mb-16 max-w-3xl mx-auto">
          A Seamless, Dynamic Experience
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <Card key={index} className="bg-white border-0 lxera-shadow lxera-hover">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-business-black font-bold text-xl">{item.step}</span>
                </div>
                <div className="text-future-green mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-business-black mb-4">{item.title}</h3>
                <p className="text-business-black/70">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
