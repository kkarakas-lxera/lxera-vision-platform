
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-4 bg-white/95 border border-future-green/20 rounded-xl shadow hover:shadow-md transition-shadow duration-200 min-h-[112px] group"
            role="article"
            aria-labelledby={`stat-${index}-label`}
            aria-describedby={`stat-${index}-description`}
            tabIndex={0}
          >
            <stat.icon
              className="w-6 h-6 mb-2 text-future-green/70"
              aria-hidden="true"
            />
            <div className="text-2xl font-extrabold text-business-black mb-0.5" aria-label={`${stat.value} ${stat.label}`}>
              {stat.value}
            </div>
            <div id={`stat-${index}-label`} className="text-xs text-business-black/70 font-medium text-center">
              {stat.label}
            </div>
            <div id={`stat-${index}-description`} className="sr-only">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-business-black/60 mt-7 text-center max-w-2xl mx-auto font-medium">
        *Based on industry research & projected benchmarks
      </p>
    </div>
  );
};

export default HeroStats;
