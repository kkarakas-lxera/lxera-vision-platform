
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
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
  const tabListRef = useRef<HTMLDivElement>(null);

  // Optional: Detect and scroll selected tab into view on tab change (for better UX)
  useEffect(() => {
    if (!tabListRef.current) return;
    const activeTab = tabListRef.current.querySelector('[data-state="active"]');
    if (activeTab && "scrollIntoView" in activeTab) {
      (activeTab as HTMLElement).scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [tabValue]);

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      <div
        className="
          sticky top-0 z-30
          bg-white/95 backdrop-blur
          rounded-xl
          shadow-lg
          transition-all
          border border-future-green/15
          px-2
          mb-10
          mx-auto
          flex
          items-center
        "
        style={{
          // Make sure the tab bar appears above all content/cards but below global nav (nav likely has z-40 or higher)
          zIndex: 30,
        }}
      >
        <TabsList
          ref={tabListRef}
          className="
            flex flex-nowrap gap-4
            w-full
            justify-start
            overflow-x-auto
            scrollbar-thin scrollbar-thumb-future-green/50 scrollbar-track-transparent
            whitespace-nowrap
            bg-transparent
            rounded-xl
            py-1
            px-0
            min-h-[60px]
            transition-all
            [scrollbar-width:thin]
            "
          style={{
            // Remove default TabsList background
            background: "transparent",
            // Remove accidental double shadow/colors
            boxShadow: "none",
          }}
        >
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
                shadow
                transition
              `}
              style={{
                boxShadow: tabValue === cat ? '0 4px 24px 0 #B6FCF0cc' : '0 2px 8px 0 #DEFAF7cc',
                borderBottom: tabValue === cat ? "4px solid #4fd1c5" : undefined,
                minWidth: 110,
                marginRight: 4,
                whiteSpace: "nowrap",
              }}
              data-state={tabValue === cat ? "active" : undefined}
            >
              {CATEGORY_ICON_MAP[cat] || null}
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {/* Add at least 40px vertical spacing between the tab group and the features/cards */}
      <div className="mt-12" />
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

