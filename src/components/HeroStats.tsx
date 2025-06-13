
import { TrendingUp, Zap, MessageCircle, Lightbulb } from "lucide-react";

const HeroStats = () => {
  const stats = [
    { icon: TrendingUp, value: "85%", label: "Retention Boost", description: "Average employee retention improvement" },
    { icon: Zap, value: "60%", label: "Faster Learning", description: "Reduction in time to competency" },
    { icon: MessageCircle, value: "3×", label: "Engagement", description: "Increase in learning engagement" },
    { icon: Lightbulb, value: "72%", label: "Innovation Lift", description: "Boost in innovative thinking" }
  ];

  return (
    <div className="mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="flex flex-col items-center p-6 md:p-8 bg-white/85 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-105 transition-all duration-300 animate-fade-in-up group relative overflow-hidden focus-within:ring-2 focus-within:ring-future-green/50 border border-future-green/30"
            style={{
              animationDelay: `${0.8 + index * 0.1}s`
            }}
            role="article"
            aria-labelledby={`stat-${index}-label`}
            aria-describedby={`stat-${index}-description`}
            tabIndex={0}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-future-green/8 to-future-green/4"></div>
            <stat.icon 
              className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10 text-future-green"
              aria-hidden="true"
            />
            <div className="text-2xl md:text-3xl font-bold text-business-black mb-1 relative z-10" aria-label={`${stat.value} ${stat.label}`}>
              {stat.value}
            </div>
            <div id={`stat-${index}-label`} className="text-sm text-business-black/80 text-center font-semibold relative z-10">
              {stat.label}
            </div>
            <div id={`stat-${index}-description`} className="sr-only">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-business-black/65 mt-8 text-center max-w-2xl mx-auto font-medium">
        *Based on industry research & projected benchmarks
      </p>
    </div>
  );
};

export default HeroStats;
