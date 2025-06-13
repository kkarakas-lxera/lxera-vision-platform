
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Brain, RotateCcw, Globe } from "lucide-react";

const BuiltForInnovatorsSection = () => {
  const features = [
    { 
      icon: Rocket, 
      text: "Designed for innovation-driven enterprises and startup ecosystems",
      microcopy: "From scaling startups to agile corporate teams"
    },
    { 
      icon: Brain, 
      text: "Built to unlock bottom-up innovation—starting with the frontline.",
      microcopy: "Enable creators, not just content consumers"
    },
    { 
      icon: RotateCcw, 
      text: "Co-created with early partners solving real transformation challenges",
      microcopy: "Every feature shaped by real-world feedback"
    },
    { 
      icon: Globe, 
      text: "Scalable for Enterprise & Government implementations",
      microcopy: "Security, scale, and configurability built-in"
    }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8 animate-fade-in-up">
          Built for Innovators. Designed for Impact.
        </h2>
        <p className="text-xl text-business-black/80 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          LXERA is made for the teams shaping the future — not maintaining the past.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((item, index) => (
            <Card 
              key={index} 
              className="bg-smart-beige/80 border-0 lxera-shadow text-center group hover:bg-white hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in-up"
              style={{
                animationDelay: `${0.3 + index * 0.1}s`,
                borderColor: 'rgba(191, 203, 128, 0.2)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{background: 'rgba(191, 203, 128, 0.2)'}}>
                    <item.icon className="w-8 h-8 group-hover:animate-bounce transition-all duration-300" style={{color: '#BFCB80'}} />
                  </div>
                </div>
                <p className="text-business-black/80 mb-3 font-medium">{item.text}</p>
                <div className="overflow-hidden transition-all duration-500 ease-out max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100">
                  <p className="text-sm text-business-black/60 italic border-t pt-3" style={{borderColor: 'rgba(191, 203, 128, 0.2)'}}>
                    {item.microcopy}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <p className="text-business-black/70 mb-6 text-lg animate-fade-in-up" style={{animationDelay: '0.7s'}}>
          We're partnering with a select group of organizations to shape what's next.
        </p>
        
        <Button 
          className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover animate-fade-in-up focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2"
          style={{animationDelay: '0.8s'}}
          aria-label="Join as an innovation partner with LXERA"
        >
          Join as an Innovation Partner →
        </Button>
      </div>
    </section>
  );
};

export default BuiltForInnovatorsSection;
