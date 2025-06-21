
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Code, Zap, BarChart3, Users, ArrowRight } from "lucide-react";

const PlatformShowcaseSection = () => {
  const showcaseFeatures = [
    {
      title: "AI-Powered Learning",
      description: "Personalized learning paths powered by advanced AI algorithms",
      icon: Brain,
      tech: ["Python", "TensorFlow", "React"],
      color: "from-future-green/20 to-light-green/20"
    },
    {
      title: "Innovation Labs",
      description: "Collaborative spaces for rapid prototyping and experimentation",
      icon: Zap,
      tech: ["TypeScript", "Next.js", "WebGL"],
      color: "from-emerald/20 to-future-green/20"
    },
    {
      title: "Real-time Analytics",
      description: "Deep insights into learning patterns and innovation metrics",
      icon: BarChart3,
      tech: ["D3.js", "WebSockets", "GraphQL"],
      color: "from-light-green/20 to-future-green/20"
    },
    {
      title: "Team Collaboration",
      description: "Seamless integration with existing workflow and communication tools",
      icon: Users,
      tech: ["REST API", "OAuth", "Webhooks"],
      color: "from-future-green/20 to-emerald/20"
    }
  ];

  const codeExample = `// AI Learning Recommendation Engine
const personalizedPath = await lxera.ai.generatePath({
  user: currentUser,
  skills: userSkills,
  goals: learningObjectives,
  context: organizationalNeeds
});

return {
  modules: personalizedPath.modules,
  timeline: personalizedPath.estimatedDuration,
  collaborators: personalizedPath.suggestedPeers
};`;

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-business-black/95 via-business-black to-business-black/90 relative overflow-hidden">
      {/* Writer-inspired background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(122,229,198,0.1),transparent)] opacity-40"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-future-green/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-light-green/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-white font-medium text-sm mb-6">
            <Code className="w-4 h-4 mr-2" />
            Platform Architecture
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Built for{" "}
            <span className="bg-gradient-to-r from-future-green to-light-green bg-clip-text text-transparent">
              Innovation
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            See how LXERA's intelligent architecture transforms learning into measurable business impact
          </p>
        </div>

        {/* Writer-inspired split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Code showcase */}
          <div className="space-y-6">
            <div className="bg-business-black/80 backdrop-blur-sm rounded-2xl p-6 border border-future-green/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex space-x-2">
                  {["JavaScript", "AI/ML", "API"].map((tech) => (
                    <span key={tech} className="text-xs bg-future-green/20 text-future-green px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <pre className="text-sm text-white/90 overflow-x-auto">
                <code className="language-javascript">{codeExample}</code>
              </pre>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {showcaseFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3`}>
                      <IconComponent className="w-6 h-6 text-future-green" />
                    </div>
                    <CardTitle className="text-white text-lg group-hover:text-future-green transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-white/70 text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {feature.tech.map((tech) => (
                        <span key={tech} className="text-xs bg-future-green/20 text-future-green px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-future-green to-light-green text-business-black hover:from-light-green hover:to-future-green font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Explore Platform Architecture
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlatformShowcaseSection;
