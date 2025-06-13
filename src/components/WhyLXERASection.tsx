
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Heart, BarChart3, Settings, Network } from "lucide-react";

const WhyLXERASection = () => {
  const capabilities = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Personalized Learning Journeys",
      valueStatement: "Smarter paths. Faster mastery. Deeper learning.",
      features: [
        "AI adapts to individual cognitive styles and preferences",
        "Smart content sequencing based on learner progress",
        "Micro-learning paths that fit busy professional schedules"
      ],
      impactStat: "📈 60% faster completion rates",
      iconBg: "bg-future-green",
      badgeBg: "bg-future-green/20",
      badgeBorder: "border-future-green"
    },
    {
      icon: <Heart className="w-8 h-8 text-white" />,
      title: "Enhanced Engagement & Motivation",
      valueStatement: "Where emotion meets education.",
      features: [
        "Real-time sentiment tracking for personalized responses",
        "Gamified elements and storytelling to boost motivation",
        "Social learning features that foster continuous peer-to-peer learning"
      ],
      impactStat: "🚀 3x higher engagement",
      iconBg: "bg-lxera-red",
      badgeBg: "bg-lxera-red/20",
      badgeBorder: "border-lxera-red"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Data-Driven Decision-Making",
      valueStatement: "Every interaction becomes an insight.",
      features: [
        "Actionable analytics for learners, instructors, and managers",
        "Predictive insights to identify skill gaps before they impact performance",
        "**ROI tracking** that connects learning to business outcomes"
      ],
      impactStat: "⚡ 50% faster L&D decisions",
      iconBg: "bg-lxera-blue",
      badgeBg: "bg-lxera-blue/20",
      badgeBorder: "border-lxera-blue"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Rapid Prototyping & Innovation",
      valueStatement: "Turn learners into innovators.",
      features: [
        "Low-code tools for citizen development and experimentation",
        "Collaborative sandboxes for testing ideas safely",
        "Innovation sprints that drive bottom-up solutions"
      ],
      impactStat: "💡 72% more likely to innovate",
      iconBg: "bg-light-green",
      badgeBg: "bg-light-green/40",
      badgeBorder: "border-light-green"
    },
    {
      icon: <Network className="w-8 h-8 text-white" />,
      title: "Organizational Capability Building",
      valueStatement: "Scale learning that scales business impact.",
      features: [
        "Strategic upskilling aligned with business transformation goals",
        "Centralized platform for enterprise-wide capability development",
        "Leadership development programs that create change agents"
      ],
      impactStat: "💰 40% reduction in L&D costs",
      iconBg: "bg-emerald",
      badgeBg: "bg-emerald/20",
      badgeBorder: "border-emerald"
    }
  ];

  return (
    <section id="platform" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/30 to-future-green/10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-4">
            Why LXERA
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/80 max-w-3xl mx-auto">
            Strategic Outcomes with Tangible Impact
          </p>
        </div>

        {/* Capability Cards */}
        <div className="space-y-12">
          {capabilities.map((capability, index) => (
            <Card 
              key={index} 
              className={`bg-white/80 backdrop-blur-sm border-0 lxera-shadow overflow-hidden ${
                index % 2 === 0 ? '' : 'lg:flex-row-reverse'
              }`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row items-center">
                  {/* Icon Section */}
                  <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col items-center lg:items-start">
                    <div className={`w-20 h-20 ${capability.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                      {capability.icon}
                    </div>
                    <Badge className={`${capability.badgeBg} text-business-black ${capability.badgeBorder} text-sm px-4 py-2 font-bold`}>
                      {capability.impactStat}
                    </Badge>
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-2/3 p-8 lg:p-12 lg:pl-0">
                    <h3 className="text-2xl lg:text-3xl font-bold text-business-black mb-3">
                      {capability.title}
                    </h3>
                    <p className="text-lg font-semibold text-business-black/70 mb-6">
                      {capability.valueStatement}
                    </p>
                    <ul className="space-y-3">
                      {capability.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-business-black/80">
                          <div className="w-2 h-2 bg-future-green rounded-full mr-4 mt-2 flex-shrink-0"></div>
                          <span dangerouslySetInnerHTML={{ __html: feature }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connecting Banner */}
        <div className="mt-20">
          <Card className="bg-future-green/10 border-future-green border-2">
            <CardContent className="p-8 text-center">
              <p className="text-lg font-semibold text-business-black mb-4">
                📊 These five capabilities are how LXERA delivers:
              </p>
              <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-sm lg:text-base font-bold text-business-black">
                <span>📈 85% Retention Boost</span>
                <span>⚡ 60% Faster Learning</span>
                <span>💬 3× Engagement</span>
                <span>💡 72% Innovation Lift</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-business-black/70 mb-4">
            Ready to transform your team's learning and innovation capabilities?
          </p>
          <p className="text-sm text-business-black/60">
            Join forward-thinking organizations already seeing these results with LXERA.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyLXERASection;
