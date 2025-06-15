
import FeatureCard from "./FeatureCard";

interface PlatformHighlightsMobileStackProps {
  features: any[];
}

const PlatformHighlightsMobileStack = ({ features }: PlatformHighlightsMobileStackProps) => (
  <div className="block lg:hidden space-y-4">
    {features.map((feature, idx) => (
      <FeatureCard
        key={feature.title}
        feature={feature}
        index={idx}
        expanded
      />
    ))}
  </div>
);

export default PlatformHighlightsMobileStack;
