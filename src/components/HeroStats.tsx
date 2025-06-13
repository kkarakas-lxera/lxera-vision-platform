
import { TrendingUp, Zap, MessageCircle, Lightbulb } from "lucide-react";

const HeroStats = () => {
  const stats = [
    { icon: TrendingUp, value: "85%", label: "Retention Boost" },
    { icon: Zap, value: "60%", label: "Faster Learning" },
    { icon: MessageCircle, value: "3×", label: "Engagement" },
    { icon: Lightbulb, value: "72%", label: "Innovation Lift" }
  ];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-future-green/20 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 animate-fade-in-up"
            style={{animationDelay: `${0.8 + index * 0.1}s`}}
          >
            <stat.icon className="w-6 h-6 text-future-green mb-3" />
            <div className="text-2xl font-bold text-business-black">{stat.value}</div>
            <div className="text-sm text-business-black/80 text-center font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-business-black/60 mt-6 text-center max-w-2xl mx-auto">
        *Based on industry research & projected benchmarks
      </p>
    </div>
  );
};

export default HeroStats;
