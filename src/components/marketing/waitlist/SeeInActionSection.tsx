import React from 'react';
import { Badge } from '@/components/ui/badge';

// Features data for the new design
const FEATURES_DATA = [
  {
    id: 1,
    headline: "Get a skills snapshot of your workforce",
    text: "Map existing skills across teams and see where strengths and weaknesses lie. Get a clear picture of organizational capability to support data-driven talent decisions.",
    tags: ["Lorem ipsum for now"],
    image: "https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Features%20Landing%20page/Group%20206.png",
    ctaText: "Maybe CTA"
  },
  {
    id: 2,
    headline: "Spot critical skill gaps",
    text: "Find missing skills before they impact performance. Use insights to prioritize the most urgent areas for development and future-proof your talent base.",
    tags: ["Lorem ipsum for now"],
    image: "https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Features%20Landing%20page/Group%20207.png",
    ctaText: "Maybe CTA"
  },
  {
    id: 3,
    headline: "Generate role-based training content",
    text: "Automatically create personalized learning programs aligned with specific roles. Deliver high-quality training at scale without the manual workload.",
    tags: ["Multimedia support", "Fully customized", "Knowledge hub integration"],
    image: "https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Features%20Landing%20page/Group%20209.png",
    ctaText: "Maybe CTA"
  },
  {
    id: 4,
    headline: "Align learning with market demands",
    text: "Ensure your workforce keeps up with changing industry needs. Adapt training content dynamically so employees build the right skills at the right time.",
    tags: ["Real-time data", "Geo-specific", "Target by role/department"],
    image: "https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Features%20Landing%20page/Group%20210.png",
    ctaText: "Maybe CTA"
  }
];

export const SeeInActionSection: React.FC = () => {
  return (
    <section className="relative py-16 text-white overflow-hidden" style={{
      background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(0 0 0))'
    }}>
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 w-full h-full" style={{
          background: 'linear-gradient(to bottom right, rgb(0 0 0), rgb(15 23 42), rgba(8 145 178 / 0.6))'
        }}>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0 0 0 / 0.7), transparent, rgba(122 229 198 / 0.05))'
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at top right, rgba(122,229,198,0.15), transparent 50%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(20,184,166,0.1), transparent 40%)'
          }} />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 lg:text-4xl text-white">
            See in Action
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Experience how LXERA transforms your workforce with AI-powered insights and personalized learning solutions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-24">
          {FEATURES_DATA.map((feature, index) => (
            <div key={feature.id} className={`flex items-center gap-16 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              {/* Image Side */}
                                    <div className="flex-1">
                                        <div className="relative">
                  <img 
                    src={feature.image} 
                    alt={feature.headline}
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />
                              </div>
                        </div>

              {/* Content Side */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                    {feature.headline}
                      </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {feature.text}
                  </p>
                                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {feature.tags.map((tag, tagIndex) => (
                              <Badge 
                      key={tagIndex}
                      variant="secondary"
                      className="bg-[#7AE5C6]/10 text-[#7AE5C6] border-[#7AE5C6]/20 hover:bg-[#7AE5C6]/20 hover:text-white transition-colors px-3 py-1 text-sm"
                              >
                      {tag}
                              </Badge>
                  ))}
                </div>


                  </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};