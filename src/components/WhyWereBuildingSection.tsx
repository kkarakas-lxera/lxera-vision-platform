
import { Card, CardContent } from "@/components/ui/card";

const WhyWereBuildingSection = () => {
  return (
    <section className="w-full py-24 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/10 to-future-green/5 relative">
      {/* Smooth transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent"></div>
      
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-fade-in">
          <div className="inline-block mb-6">
            <span className="text-sm font-semibold text-business-black bg-business-black/10 px-4 py-2 rounded-full">
              OUR MISSION
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-16">
            Why We're Building LXERA
          </h2>
        </div>
        
        <div className="space-y-8 mb-16 animate-fade-in">
          <div className="relative">
            <p className="text-2xl text-business-black/80 font-medium transition-all duration-300 hover:text-business-black">
              Most platforms stop at knowledge.
            </p>
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-business-black/20 rounded-full"></div>
          </div>
          
          <div className="relative">
            <p className="text-2xl text-business-black/80 font-medium transition-all duration-300 hover:text-business-black">
              Innovation tools ignore how people learn.
            </p>
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-business-black/40 rounded-full"></div>
          </div>
          
          <div className="relative">
            <p className="text-2xl text-future-green font-semibold transition-all duration-300 hover:scale-105">
              LXERA connects both — creating a system where learning leads to doing, and doing leads to growth.
            </p>
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-future-green rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <Card className="bg-gradient-to-br from-future-green/20 to-future-green/10 border-future-green border-2 max-w-3xl mx-auto lxera-shadow transition-all duration-500 hover:shadow-xl animate-fade-in">
          <CardContent className="p-8 relative">
            {/* Decorative element */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-future-green/20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-future-green/40 rounded-full"></div>
            </div>
            
            <p className="text-xl text-business-black mb-6 italic leading-relaxed">
              "We're building LXERA to empower people to think, build, and transform — not just check boxes."
            </p>
            <div className="font-semibold text-business-black flex items-center justify-center gap-2">
              <div className="w-8 h-0.5 bg-future-green"></div>
              <span>Shadi Ashi, Co-Founder & CEO</span>
              <div className="w-8 h-0.5 bg-future-green"></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-smart-beige/20 to-transparent"></div>
    </section>
  );
};

export default WhyWereBuildingSection;
