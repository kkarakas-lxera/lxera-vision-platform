
import { TrendingUp, Zap, MessageCircle, Lightbulb } from "lucide-react";

const HeroStats = () => {
  const stats = [
    { icon: TrendingUp, value: "85%", label: "Retention Boost" },
    { icon: Zap, value: "60%", label: "Faster Learning" },
    { icon: MessageCircle, value: "3×", label: "Engagement" },
    { icon: Lightbulb, value: "72%", label: "Innovation Lift" }
  ];

  return (
    <div className="mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="flex flex-col items-center p-8 bg-white/85 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:bg-white/95 hover:scale-105 transition-all duration-300 animate-fade-in-up group relative overflow-hidden"
            style={{
              animationDelay: `${0.8 + index * 0.1}s`,
              border: '1px solid rgba(191, 203, 128, 0.3)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'linear-gradient(to bottom right, rgba(191, 203, 128, 0.08), rgba(191, 203, 128, 0.04))'}}></div>
            <stat.icon className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10" style={{color: '#BFCB80'}} />
            <div className="text-3xl font-bold text-business-black mb-1 relative z-10">{stat.value}</div>
            <div className="text-sm text-business-black/80 text-center font-semibold relative z-10">{stat.label}</div>
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
