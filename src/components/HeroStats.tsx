
import { TrendingUp, Users, Lightbulb, Target } from "lucide-react";

const HeroStats = () => {
  const stats = [
    { icon: TrendingUp, value: "85%", label: "Retention", description: "employee engagement boost" },
    { icon: Users, value: "3×", label: "Collaboration", description: "increase in team innovation" },
    { icon: Lightbulb, value: "60%", label: "Learning Speed", description: "faster skill development" },
    { icon: Target, value: "92%", label: "Satisfaction", description: "would recommend to others" }
  ];

  return (
    <div className="mt-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/60 backdrop-blur-sm border border-white/40 text-center group hover:bg-white/80 hover:border-future-green/30 transition-all duration-500 animate-fade-in-up rounded-xl"
            style={{
              animationDelay: `${800 + index * 100}ms`,
            }}
            role="article"
            aria-labelledby={`stat-${index}-label`}
            tabIndex={0}
          >
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-future-green/10 flex items-center justify-center group-hover:bg-future-green/20 transition-all duration-300">
                  <stat.icon className="w-6 h-6 text-business-black/70 group-hover:text-future-green transition-all duration-300" />
                </div>
              </div>
              <div className="text-3xl font-light text-business-black mb-2" aria-label={`${stat.value} ${stat.label}`}>
                {stat.value}
              </div>
              <div id={`stat-${index}-label`} className="text-sm text-business-black/80 font-medium mb-2">
                {stat.label}
              </div>
              <div className="h-px w-8 bg-future-green/30 mx-auto mb-3 group-hover:bg-future-green transition-colors"></div>
              <p className="text-xs text-business-black/60 font-light">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroStats;
