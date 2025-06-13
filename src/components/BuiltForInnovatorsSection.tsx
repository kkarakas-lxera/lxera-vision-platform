
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const BuiltForInnovatorsSection = () => {
  const features = [
    { icon: "🚀", text: "Designed for innovation-driven enterprises and startup ecosystems" },
    { icon: "🧠", text: "Built to empower frontline employees, not just top-down trainers" },
    { icon: "🔁", text: "Co-created with early partners solving real transformation challenges" },
    { icon: "🌐", text: "Scalable for Enterprise & Government implementations" }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
          Built for Innovators. Designed for Impact.
        </h2>
        <p className="text-xl text-business-black/80 mb-12 max-w-3xl mx-auto">
          LXERA is made for the teams shaping the future — not maintaining the past.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((item, index) => (
            <Card key={index} className="bg-smart-beige border-0 lxera-shadow text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <p className="text-business-black/80">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white text-lg px-8 py-4 rounded-full font-semibold lxera-hover">
          Become an Innovation Partner
        </Button>
      </div>
    </section>
  );
};

export default BuiltForInnovatorsSection;
