
import FeatureCard from "./FeatureCard";

interface Feature {
  title: string;
  description?: string;
  icon?: string;
  [key: string]: unknown;
}

interface PlatformHighlightsMobileStackProps {
  features: Feature[];
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
