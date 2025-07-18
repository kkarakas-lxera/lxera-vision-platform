
interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="text-center mb-20 animate-fade-in-up relative">
      <div className="relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-business-black mb-6 animate-slide-in-left leading-tight" style={{animationDelay: '0.2s'}}>
          {title}
        </h2>
        <p className="text-lg sm:text-xl lg:text-xl text-business-black/80 max-w-4xl mx-auto animate-slide-in-right leading-relaxed font-medium" style={{animationDelay: '0.4s'}}>
          {subtitle}
        </p>
        
        {/* Enhanced decorative line */}
        <div className="mt-8 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
          <div className="relative">
            <div className="w-40 h-1.5 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
            <div className="absolute inset-0 w-40 h-1.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent animate-shimmer rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
