
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import PlatformHighlightsCarousel from "./PlatformHighlightsCarousel";
import PlatformHighlightsMobileStack from "./PlatformHighlightsMobileStack";
import {
  Shield,
  BarChart3,
  Settings,
  Bot,
  Target,
  FileText,
  Code,
  Gamepad,
  UserCheck,
  Users,
  Bell,
} from "lucide-react";

interface PlatformHighlightsTabsProps {
  categories: string[];
  groupedByCategory: Record<string, any[]>;
}

// Map category names to relevant Lucide icons for use in the tab UI
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  "Security & Compliance": <Shield className="w-5 h-5 text-future-green mr-1" />,
  "Analytics": <BarChart3 className="w-5 h-5 text-lxera-blue mr-1" />,
  "HR Integration": <Settings className="w-5 h-5 text-emerald mr-1" />,
  "AI & Personalization": <Bot className="w-5 h-5 text-future-green mr-1" />,
  "Skill Analysis": <Target className="w-5 h-5 text-business-black mr-1" />,
  "Content Transformation": <FileText className="w-5 h-5 text-lxera-red mr-1" />,
  "Innovation": <Code className="w-5 h-5 text-lxera-red mr-1" />,
  "Gamification": <Gamepad className="w-5 h-5 text-emerald mr-1" />,
  "Content Generation": <Users className="w-5 h-5 text-future-green mr-1" />,
  "Collaboration": <Users className="w-5 h-5 text-lxera-blue mr-1" />,
  "Engagement": <Bell className="w-5 h-5 text-lxera-blue mr-1" />,
};

const PlatformHighlightsTabs = ({ categories, groupedByCategory }: PlatformHighlightsTabsProps) => {
  const [tabValue, setTabValue] = useState(categories[0]);

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <TabsList className="flex flex-wrap justify-center gap-4 bg-transparent mb-8">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat}
            value={cat}
            className={`
              px-5 py-2 rounded-full
              flex items-center gap-2
              font-semibold border-2
              transition-all
              bg-white
              border-future-green/30
              data-[state=active]:bg-[#F0F7F8]
              data-[state=active]:border-future-green
              data-[state=active]:text-future-green
              data-[state=active]:shadow-lg
              data-[state=active]:ring-2
              data-[state=active]:ring-future-green/60
              data-[state=active]:underline
              data-[state=active]:decoration-future-green
              data-[state=active]:decoration-4
              hover:scale-105
            `}
            style={{
              boxShadow: tabValue === cat ? '0 4px 24px 0 #B6FCF0cc' : undefined,
              borderBottom: tabValue === cat ? "4px solid #4fd1c5" : undefined,
            }}
          >
            {CATEGORY_ICON_MAP[cat] || null}
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

