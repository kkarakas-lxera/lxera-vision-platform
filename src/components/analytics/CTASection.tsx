
import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section className="py-20 px-6 lg:px-12">
    <div className="max-w-4xl mx-auto text-center">
      <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-12 shadow-2xl border border-green-200/50">
        <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
          Unlock deeper learning with smarter insights.
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Get a Demo
          </Button>
          <Button
            size="lg"
            className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-green-600 hover:border-white transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Explore Platform
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
