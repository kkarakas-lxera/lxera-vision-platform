
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 lxera-shadow text-center group hover:from-smart-beige/90 hover:via-future-green/15 hover:to-smart-beige/70 hover:shadow-xl transition-all duration-500 lxera-hover animate-fade-in-up rounded-2xl"
            style={{
              animationDelay: `${800 + index * 100}ms`,
            }}
            role="article"
            aria-labelledby={`stat-${index}-label`}
            aria-describedby={`stat-${index}-description`}
            tabIndex={0}
          >
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-future-green/25 to-smart-beige/30 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-business-black group-hover:animate-bounce transition-all duration-300" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-business-black mb-2" aria-label={`${stat.value} ${stat.label}`}>
                {stat.value}
              </div>
              <div id={`stat-${index}-label`} className="text-sm text-business-black/80 font-medium text-center mb-2">
                {stat.label}
              </div>
              <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-16 opacity-0 group-hover:opacity-100">
                <p className="text-xs text-business-black/60 italic border-t border-future-green/20 pt-3">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroStats;
