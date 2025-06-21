
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Code, BarChart3, Users, Zap, CheckCircle } from "lucide-react";

const PlatformShowcaseSection = () => {
  const codeExample = `// AI Learning Engine Example
const personalizedPath = await lxera.ai.createPath({
  learner: user.profile,
  skills: ['javascript', 'react'],
  goals: ['full-stack-development'],
  timeline: '3-months'
});

// Auto-generate adaptive content
const content = await lxera.content.generate({
  type: 'interactive-module',
  difficulty: personalizedPath.level,
  style: user.preferences.learning_style
});

// Track engagement in real-time
lxera.analytics.track({
  session: content.id,
  engagement: 'high',
  completion: 0.85
});`;

  const technologies = [
    { name: "React", color: "bg-blue-500" },
    { name: "TypeScript", color: "bg-blue-600" },
    { name: "Python", color: "bg-yellow-500" },
    { name: "Node.js", color: "bg-green-600" },
    { name: "TensorFlow", color: "bg-orange-500" },
    { name: "OpenAI", color: "bg-purple-500" }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Personalization",
      description: "Adaptive learning paths that evolve with each learner"
    },
    {
      icon: Code,
      title: "Developer-Friendly APIs",
      description: "Easy integration with existing tools and workflows"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Deep insights into learning progress and outcomes"
    },
    {
      icon: Users,
      title: "Scalable Architecture",
      description: "Built to support thousands of concurrent learners"
    }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black via-business-black/95 to-business-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-future-green/5 via-transparent to-future-green/10"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-future-green font-medium text-sm mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Platform Showcase
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Built for Developers,
            <br />
            <span className="text-future-green">Designed for Learners</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Experience the power of LXERA through code. See how our platform integrates 
            seamlessly with your existing tech stack.
          </p>
        </div>

        {/* Main Showcase - Split Screen */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Code Editor Mockup */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-future-green/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white/60 text-sm ml-4">lxera-integration.js</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-white/80 leading-relaxed">
                  {codeExample}
                </code>
              </pre>
            </div>

            {/* Technology Badges */}
            <div className="flex flex-wrap gap-3">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className={`${tech.color} text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg`}
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-future-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-future-green" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-white/70">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-future-green text-business-black hover:bg-future-green/90 font-semibold px-8 py-4 text-base rounded-xl transition-all duration-300 hover:scale-105"
            >
              Explore Platform Features
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-4 text-base rounded-xl transition-all duration-300 hover:scale-105"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformShowcaseSection;
