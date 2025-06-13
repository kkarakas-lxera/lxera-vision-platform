
import { Button } from "@/components/ui/button";
import { Wrench, MessageCircle, Network } from "lucide-react";

const JoinTheMovementSection = () => {
  const benefits = [
    { icon: <Wrench className="w-8 h-8" />, title: "Get early access to exclusive features" },
    { icon: <MessageCircle className="w-8 h-8" />, title: "Shape our roadmap through feedback" },
    { icon: <Network className="w-8 h-8" />, title: "Join a private community of innovation leaders" }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
          Join the Movement
        </h2>
        <p className="text-xl text-business-black/80 mb-12 max-w-4xl mx-auto">
          LXERA is more than software — it's a new foundation for how organizations grow through learning and action.
        </p>
        
        <div className="bg-future-green/20 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-business-black mb-8">As an early partner, you'll:</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="text-business-black mb-4">{benefit.icon}</div>
                <p className="text-business-black font-semibold">{benefit.title}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Button className="bg-business-black text-white hover:bg-business-black/90 text-lg px-8 py-4 rounded-full font-semibold lxera-hover">
          Join the Early Access Program
        </Button>
      </div>
    </section>
  );
};

export default JoinTheMovementSection;
