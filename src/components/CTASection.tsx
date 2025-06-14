
import HeroVideoPreview from "./HeroVideoPreview";

const CTASection = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-xl">
          <HeroVideoPreview />
        </div>
      </div>
      <div className="text-center animate-fade-in-up animate-delay-600">
        <p className="text-base text-business-black/75 font-medium">
          🚀 <strong className="text-business-black">Early access open</strong> for innovative teams
        </p>
      </div>
    </div>
  );
};

export default CTASection;
