
import { Button } from "@/components/ui/button";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";

const stepMap = [
  { number: 1, label: "Get Personalized Plan" },
  { number: 2, label: "Explore My Journey" },
  { number: 3, label: "Reveal Insights" },
  { number: 4, label: "Launch Innovation" },
];

const HowItWorksStepsCTA = () => {

  return (
    <>
      <div className="mt-16 max-w-3xl mx-auto px-3">
        <div className="bg-gradient-to-r from-future-green/10 via-white/70 to-smart-beige/20 rounded-2xl p-6 shadow-md mb-4 flex flex-col items-center">
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {stepMap.map((step) => (
              <span
                key={step.number}
                className="inline-flex items-center gap-2 border border-future-green/30 bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full text-sm font-semibold text-future-green shadow-sm hover:bg-future-green/10 transition"
              >
                <span className="bg-gradient-to-r from-future-green to-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold mr-2 text-xs">
                  {step.number}
                </span>
                {step.label}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            <span className="text-lg text-business-black/70 font-medium mb-2 sm:mb-0">
              Ready to start your journey?
            </span>
            <ProgressiveDemoCapture
              source="how_it_works_steps_cta"
              buttonText="Request a Demo"
              variant="default"
              className="bg-future-green text-business-black hover:bg-future-green/90 font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 min-h-[48px]"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorksStepsCTA;
