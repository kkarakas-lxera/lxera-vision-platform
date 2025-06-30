
import { Button } from "@/components/ui/button";
import DemoModal from "@/components/DemoModal";
import { useState } from "react";

const CTASection = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleRequestDemo = () => {
    setIsDemoModalOpen(true);
  };

  const handleExplorePlatform = () => {
    // Could navigate to platform page
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-future-green to-emerald rounded-3xl p-12 shadow-2xl border border-future-green/20">
            <h2 className="text-3xl lg:text-4xl font-semibold text-business-black mb-6 font-inter">
              Ready to understand your learners better?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleRequestDemo}
                className="bg-business-black text-white hover:bg-business-black/90 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl font-inter hover:scale-105"
              >
                Request a Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleExplorePlatform}
                className="border-2 border-business-black/30 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl font-inter hover:scale-105"
              >
                Explore Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)}
        source="Analytics CTA Section"
      />
    </>
  );
};

export default CTASection;
