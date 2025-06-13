
interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="text-center mb-20 animate-fade-in-up relative">
      {/* Enhanced background decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-32 h-32 bg-gradient-to-br from-future-green/10 to-emerald/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <h2 className="text-5xl lg:text-6xl font-bold text-business-black mb-6 animate-slide-in-left leading-tight" style={{animationDelay: '0.2s'}}>
          {title}
        </h2>
        <p className="text-xl lg:text-2xl text-business-black/80 max-w-4xl mx-auto animate-slide-in-right leading-relaxed font-medium" style={{animationDelay: '0.4s'}}>
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
