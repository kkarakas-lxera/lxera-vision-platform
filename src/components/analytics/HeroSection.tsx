
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

const HeroSection = () => (
  <section className="pt-32 pb-20 px-6 lg:px-12">
    <div className="max-w-6xl mx-auto text-center">
      <Badge className="mb-6 bg-future-green/20 text-business-black border-future-green/30 px-4 py-2 text-sm font-medium rounded-full">
        <BarChart3 className="w-4 h-4 mr-2" />
        Data-Driven Learning
      </Badge>
      <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight">
        Learning Analytics &
        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block"> Insights</span>
      </h1>
      
      <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed">
        Understand engagement and performance in real time to improve outcomes with intelligent learning data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <Button
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
          aria-label="Request a demo of learning analytics features"
        >
          Request a Demo
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
          aria-label="See how learning analytics works"
        >
          See How It Works
        </Button>
      </div>
    </div>
  </section>
);

export default HeroSection;
