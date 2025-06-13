
interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <div className="text-center mb-16 animate-fade-in-up">
      <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
        {title}
      </h2>
      <p className="text-xl lg:text-2xl text-business-black/80 max-w-3xl mx-auto animate-slide-in-right" style={{animationDelay: '0.4s'}}>
        {subtitle}
      </p>
      
      <div className="mt-6 flex justify-center animate-fade-in-scale" style={{animationDelay: '0.6s'}}>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow"></div>
      </div>
    </div>
  );
};

export default SectionHeader;
