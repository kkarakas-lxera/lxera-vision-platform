
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, BarChart3, Settings, Network, CheckCircle } from "lucide-react";

const WhyLXERASection = () => {
  return (
    <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/30 to-future-green/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-future-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-lxera-blue rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
            🌟 Why LXERA
          </h2>
          <p className="text-2xl font-semibold text-business-black mb-6">
            Real Impact. Not Just Theory.
          </p>
          <p className="text-xl text-business-black/80 max-w-4xl mx-auto leading-relaxed">
            LXERA is built to deliver measurable transformation—for individuals, teams, and organizations. Each feature is strategically designed to drive tangible results across five core pillars.
          </p>
        </div>
        
        <div className="space-y-16">
          {/* Pillar 1 - Personalized Learning Journeys */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-future-green rounded-2xl flex items-center justify-center mr-6">
                <Brain className="w-8 h-8 text-business-black" />
              </div>
              <Badge className="bg-future-green/20 text-business-black border-future-green text-lg px-4 py-2">
                🚀 <span className="font-bold">60% faster</span> completion
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-business-black mb-4">
              Personalized Learning Journeys
            </h3>
            <p className="text-lg text-future-green font-semibold mb-6">
              Smarter paths. Faster mastery. Deeper learning.
            </p>
            <p className="text-business-black/80 mb-6">
              Our AI adapts to each learner's preferences, behavior, and feedback in real time.
            </p>
            <ul className="space-y-3 text-business-black/80 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                Tailored learning paths that reflect unique cognitive styles
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-future-green mr-3 mt-0.5 flex-shrink-0" />
                Content personalized through AI diagnostics and adaptive algorithms
              </li>
            </ul>
            <div className="bg-future-green/10 p-4 rounded-lg border-l-4 border-future-green">
              <p className="text-sm text-business-black font-medium">
                Learners complete content 60% faster and retain up to 85% more using personalized experiences.
              </p>
            </div>
          </div>

          {/* Pillar 2 - Enhanced Engagement */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-lxera-red rounded-2xl flex items-center justify-center mr-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-lxera-red/20 text-business-black border-lxera-red text-lg px-4 py-2">
                🚀 <span className="font-bold">3x higher</span> engagement
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-business-black mb-4">
              Enhanced Engagement and Motivation
            </h3>
            <p className="text-lg text-lxera-red font-semibold mb-6">
              Where emotion meets education.
            </p>
            <p className="text-business-black/80 mb-6">
              LXERA uses emotional intelligence and gamification to keep learners connected and inspired.
            </p>
            <ul className="space-y-3 text-business-black/80 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                Real-time sentiment tracking for personalized emotional responses
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-lxera-red mr-3 mt-0.5 flex-shrink-0" />
                Storytelling, avatars, and gamified elements to boost motivation
              </li>
            </ul>
            <div className="bg-lxera-red/10 p-4 rounded-lg border-l-4 border-lxera-red">
              <p className="text-sm text-business-black font-medium">
                Engagement rates increase by 3x, while dropout rates decrease by 40% in emotionally optimized learning environments.
              </p>
            </div>
          </div>

          {/* Pillar 3 - Data-Driven Decision Making */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-lxera-blue rounded-2xl flex items-center justify-center mr-6">
                <BarChart3 className="w-8 h-8 text-business-black" />
              </div>
              <Badge className="bg-lxera-blue/20 text-business-black border-lxera-blue text-lg px-4 py-2">
                🚀 <span className="font-bold">50% faster</span> decisions
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-business-black mb-4">
              Data-Driven Decision-Making
            </h3>
            <p className="text-lg text-lxera-blue font-semibold mb-6">
              Every interaction becomes an insight.
            </p>
            <p className="text-business-black/80 mb-6">
              We transform behavioral data into performance breakthroughs.
            </p>
            <ul className="space-y-3 text-business-black/80 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                Actionable insights for learners, instructors, and managers
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-lxera-blue mr-3 mt-0.5 flex-shrink-0" />
                Continuous feedback loops from engagement and outcome analytics
              </li>
            </ul>
            <div className="bg-lxera-blue/10 p-4 rounded-lg border-l-4 border-lxera-blue">
              <p className="text-sm text-business-black font-medium">
                Learning leaders make training decisions 50% faster, with 30% better alignment to performance goals.
              </p>
            </div>
          </div>

          {/* Pillar 4 - Rapid Prototyping */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-light-green rounded-2xl flex items-center justify-center mr-6">
                <Settings className="w-8 h-8 text-business-black" />
              </div>
              <Badge className="bg-light-green/40 text-business-black border-light-green text-lg px-4 py-2 font-bold">
                🚀 <span className="font-bold">72% more likely</span> to innovate
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-business-black mb-4">
              Rapid Prototyping & Innovation Enablement
            </h3>
            <p className="text-lg text-business-black font-semibold mb-6">
              Fuel creativity from the ground up.
            </p>
            <p className="text-business-black/80 mb-6">
              LXERA turns employees into innovators through citizen development.
            </p>
            <ul className="space-y-3 text-business-black/80 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                Tools for co-creation, experimentation, and rapid prototyping
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-light-green mr-3 mt-0.5 flex-shrink-0" />
                Community learning spaces for bottom-up idea generation
              </li>
            </ul>
            <div className="bg-light-green/20 p-4 rounded-lg border-l-4 border-light-green">
              <p className="text-sm text-business-black font-medium">
                Teams using LXERA are 72% more likely to create innovative solutions within their first 90 days.
              </p>
            </div>
          </div>

          {/* Pillar 5 - Organizational Capability Building */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-emerald rounded-2xl flex items-center justify-center mr-6">
                <Network className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-emerald/20 text-business-black border-emerald text-lg px-4 py-2">
                🚀 <span className="font-bold">40% cost reduction</span>
              </Badge>
            </div>
            <h3 className="text-3xl font-bold text-business-black mb-4">
              Organizational Capability Building
            </h3>
            <p className="text-lg text-emerald font-semibold mb-6">
              Upskill at scale, aligned with strategy.
            </p>
            <p className="text-business-black/80 mb-6">
              LXERA serves as your digital learning backbone, tailored to your business transformation.
            </p>
            <ul className="space-y-3 text-business-black/80 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                Centralized platform for strategic upskilling and reskilling
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-emerald mr-3 mt-0.5 flex-shrink-0" />
                Focus on digital, innovation, and leadership capabilities
              </li>
            </ul>
            <div className="bg-emerald/10 p-4 rounded-lg border-l-4 border-emerald">
              <p className="text-sm text-business-black font-medium">
                Organizations cut L&D costs by up to 40%, while doubling ROI on training investments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
