
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CoreFeature {
  icon: any;
  title: string;
  description: string;
  metric: string;
  details: string;
}

interface CoreFeaturesGridProps {
  features: CoreFeature[];
}

const CoreFeaturesGrid = ({ features }: CoreFeaturesGridProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        const isExpanded = expandedSection === `feature-${index}`;
        
        return (
          <Card key={index} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group rounded-3xl hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <IconComponent className="w-8 h-8 text-business-black" />
              </div>
              <CardTitle className="text-xl font-semibold text-business-black group-hover:text-business-black/80 transition-colors font-inter">
                {feature.title}
              </CardTitle>
              <Badge className="bg-future-green/20 text-business-black text-xs px-2 py-1 rounded-full font-inter">
                {feature.metric}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-business-black/70 leading-relaxed text-center mb-4 font-inter">
                {feature.description}
              </CardDescription>
              
              <button
                onClick={() => toggleSection(`feature-${index}`)}
                className="w-full flex items-center justify-center text-business-black/70 hover:text-business-black text-sm font-medium transition-colors font-inter"
                aria-expanded={isExpanded}
                aria-controls={`feature-details-${index}`}
              >
                {isExpanded ? 'Less details' : 'More details'}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
              
              {isExpanded && (
                <div id={`feature-details-${index}`} className="mt-4 p-4 bg-smart-beige/20 rounded-3xl">
                  <p className="text-sm text-business-black/70 leading-relaxed font-inter">
                    {feature.details}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CoreFeaturesGrid;
