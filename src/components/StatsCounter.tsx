
import { useState, useEffect } from "react";

const stats = [
  { value: 85, suffix: "% retention boost", label: "retention boost" },
  { value: 60, suffix: "% faster learning", label: "faster learning" },
  { value: 3, suffix: "x engagement increase", label: "engagement increase" }
];

const StatsCounter = () => {
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;
      
      return setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timers[index]);
        }
        
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, duration / steps);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-8 mt-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 text-business-black/70 bg-white/60 rounded-full px-4 py-2 backdrop-blur-sm border border-white/40 hover:scale-105 transition-transform duration-300"
        >
          <div className="w-2 h-2 bg-future-green rounded-full animate-pulse" style={{animationDelay: `${index * 300}ms`}}></div>
          <span className="text-sm font-medium">
            <span className="text-future-green font-bold text-lg">{counters[index]}</span>
            {stat.suffix.replace(stat.value.toString(), "")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsCounter;
