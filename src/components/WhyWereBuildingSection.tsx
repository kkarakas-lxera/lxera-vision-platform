
import { Card, CardContent } from "@/components/ui/card";

const WhyWereBuildingSection = () => {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-12">
          Why We're Building LXERA
        </h2>
        
        <div className="space-y-8 mb-12">
          <p className="text-2xl text-business-black/80 font-medium">Most platforms stop at knowledge.</p>
          <p className="text-2xl text-business-black/80 font-medium">Innovation tools ignore how people learn.</p>
          <p className="text-2xl text-future-green font-semibold">LXERA connects both — creating a system where learning leads to doing, and doing leads to growth.</p>
        </div>
        
        <Card className="bg-future-green/20 border-future-green border-2 max-w-3xl mx-auto">
          <CardContent className="p-8">
            <p className="text-xl text-business-black mb-6 italic">
              "We're building LXERA to empower people to think, build, and transform — not just check boxes."
            </p>
            <div className="font-semibold text-business-black">— Shadi Ashi, Co-Founder & CEO</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WhyWereBuildingSection;
