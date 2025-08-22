import React from 'react';
import BeamsBackground from './BeamsBackground';
import { Target, Zap, TrendingUp, Users, BarChart3, Brain } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Spot skill gaps',
    description: 'See exactly which skills your employees need most.',
    tags: ['Market data comparison', 'Internal workforce analysis', 'Skills inventory', 'Multi-layered view', 'Customized skills verification']
  },
  {
    icon: Zap,
    title: 'Create training fast',
    description: 'Use AI to build training from blueprints in minutes or ask your own content.',
    tags: ['Knowledge hub integration', 'Industry agnostic', 'Multimedia support', 'Gamified journeys', 'End-to-end generation']
  },
  {
    icon: TrendingUp,
    title: 'Track progress',
    description: 'Monitor and evaluate training activity, and see growth in real time.',
    tags: ['Smart notifications', 'AI insights']
  },
  {
    icon: Users,
    title: 'Role-based training',
    description: 'Give each role the learning it actually needs.',
    tags: ['Multiple verticals', 'Fully personalized', 'Focus on your skills', 'AI-assisted position management']
  },
  {
    icon: BarChart3,
    title: 'Report impact',
    description: 'Share clear reports that show the value of training.',
    tags: ['Objective ROI', 'Measure your training KPIs', 'One-click export', 'Observe business impact']
  },
  {
    icon: Brain,
    title: 'Market intelligence',
    description: "Know what's growing in popularity to keep team's relevant.",
    tags: ['Real-time data', 'Geo-specific', 'Target-specific data']
  }
];

export const WaitingListFeatures: React.FC = () => {
  return (
    <section className="relative py-24 text-white">
      {/* Background beams effect */}
      <BeamsBackground className="pointer-events-none" intensity="strong" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 lg:text-5xl text-white">
            What You Can Do
          </h2>
          <p className="text-white max-w-3xl mx-auto text-lg">
            Stop juggling tools. LXERA gives you one platform to bridge skill gaps, build training, and prove business impact.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 hover:border-[#7AE5C6]/40 transition-all duration-300 shadow-lg"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 bg-[#7AE5C6]/20 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-[#7AE5C6]" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
