
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import PlatformHighlightsCarousel from "./PlatformHighlightsCarousel";
import PlatformHighlightsMobileStack from "./PlatformHighlightsMobileStack";

interface PlatformHighlightsTabsProps {
  categories: string[];
  groupedByCategory: Record<string, any[]>;
}

const PlatformHighlightsTabs = ({ categories, groupedByCategory }: PlatformHighlightsTabsProps) => {
  const [tabValue, setTabValue] = useState(categories[0]);

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <TabsList className="flex flex-wrap justify-center gap-4 bg-transparent mb-8">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat}
            value={cat}
            className="px-5 py-2 rounded-full bg-white text-business-black font-semibold border-2 border-future-green/30 data-[state=active]:bg-future-green/10 data-[state=active]:text-future-green transition-all"
          >
            {cat}
          </TabsTrigger>
        ))}
      </TabsList>
      {categories.map((cat) => (
        <TabsContent key={cat} value={cat} className="w-full">
          {/* Desktop: Horizontal Carousel, 3 at a time */}
          <div className="hidden lg:block">
            <PlatformHighlightsCarousel features={groupedByCategory[cat]} cat={cat} />
          </div>
          {/* Mobile: Stack vertically */}
          <PlatformHighlightsMobileStack features={groupedByCategory[cat]} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PlatformHighlightsTabs;
