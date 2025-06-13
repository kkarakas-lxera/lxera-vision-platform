
import { CheckCircle, Shield, Award, Users } from "lucide-react";

const TrustIndicators = () => {
  const indicators = [
    { icon: Shield, text: "Enterprise Security", color: "text-blue-600" },
    { icon: Award, text: "Industry Recognition", color: "text-amber-600" },
    { icon: Users, text: "Global Community", color: "text-purple-600" },
    { icon: CheckCircle, text: "Proven Results", color: "text-green-600" }
  ];

  return (
    <div className="animate-fade-in-up animate-delay-700">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-future-green/20 shadow-lg">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((indicator, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center space-y-2 group"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              <div className="p-3 rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <indicator.icon className={`w-6 h-6 ${indicator.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <span className="text-sm font-medium text-business-black/80 group-hover:text-business-black transition-colors duration-300">
                {indicator.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
