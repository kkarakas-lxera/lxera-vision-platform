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
  Users,
  Bell,
} from "lucide-react";

interface PlatformHighlightsTabsProps {
  categories: string[];
  groupedByCategory: Record<string, any[]>;
}

// Map category names to Lucide icons with brand color accents and consistent radius/animation
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  "Security & Compliance": (
    <Shield className="w-5 h-5 lxera-icon-animate text-business-black mr-1 lxera-rounded-md" />
  ),
  "Analytics": (
    <BarChart3 className="w-5 h-5 lxera-icon-animate text-lxera-blue mr-1 lxera-rounded-md" />
  ),
  "Analytics & Insights": (
    <BarChart3 className="w-5 h-5 lxera-icon-animate text-lxera-blue mr-1 lxera-rounded-md" />
  ),
  "HR Integration": (
    <Settings className="w-5 h-5 lxera-icon-animate text-emerald mr-1 lxera-rounded-md" />
  ),
  "AI & Personalization": (
    <Bot className="w-5 h-5 lxera-icon-animate text-lxera-red mr-1 lxera-rounded-md" />
  ),
  "Skill Analysis": (
    <Target className="w-5 h-5 lxera-icon-animate text-business-black mr-1 lxera-rounded-md" />
  ),
  "Content Transformation": (
    <FileText className="w-5 h-5 lxera-icon-animate text-lxera-blue mr-1 lxera-rounded-md" />
  ),
  "Innovation": (
    <Code className="w-5 h-5 lxera-icon-animate text-lxera-red mr-1 lxera-rounded-md" />
  ),
  "Innovation & Automation": (
    <Code className="w-5 h-5 lxera-icon-animate text-emerald mr-1 lxera-rounded-md" />
  ),
  "Gamification": (
    <Gamepad className="w-5 h-5 lxera-icon-animate text-emerald mr-1 lxera-rounded-md" />
  ),
  "Content Generation": (
    <Users className="w-5 h-5 lxera-icon-animate text-business-black mr-1 lxera-rounded-md" />
  ),
  "Collaboration": (
    <Users className="w-5 h-5 lxera-icon-animate text-lxera-blue mr-1 lxera-rounded-md" />
  ),
  "Community & Delivery": (
    <Users className="w-5 h-5 lxera-icon-animate text-lxera-blue mr-1 lxera-rounded-md" />
  ),
  "Engagement": (
    <Bell className="w-5 h-5 lxera-icon-animate text-lxera-blue mr-1 lxera-rounded-md" />
  ),
};

const PlatformHighlightsTabs = ({ categories, groupedByCategory }: PlatformHighlightsTabsProps) => {
  const [tabValue, setTabValue] = useState(categories[0]);
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tabListRef.current) return;
    const activeTab = tabListRef.current.querySelector('[data-state="active"]');
    if (activeTab && "scrollIntoView" in activeTab) {
      (activeTab as HTMLElement).scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [tabValue]);

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
      {/* Sticky, pill-style tab bar, horizontally scrollable on mobile */}
      <div
        className={`
          sticky top-0 z-30
          bg-smart-beige/95 backdrop-blur
          rounded-xl
          transition-all
          px-2
          mb-0
          mx-auto
          flex
          items-center
          drop-shadow-[0_2px_8px_rgba(40,64,90,0.06)]
          border border-business-black/10
        `}
        style={{
          zIndex: 30,
        }}
      >
        <TabsList
          ref={tabListRef}
          className={`
            flex flex-nowrap gap-3
            w-full
            justify-start
            overflow-x-auto
            scrollbar-thin scrollbar-thumb-business-black/30 scrollbar-track-transparent
            whitespace-nowrap
            bg-transparent
            rounded-xl
            py-2
            px-0
            min-h-[52px]
            transition-all
            [scrollbar-width:thin]
          `}
          style={{
            background: "transparent",
            boxShadow: "none",
          }}
        >
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className={`
                px-5 py-2 rounded-full group
                flex items-center gap-2
                font-semibold border
                transition-all
                bg-white
                border-business-black/15
                data-[state=active]:bg-lxera-blue/90
                data-[state=active]:border-lxera-blue
                data-[state=active]:text-white
                data-[state=active]:shadow-lg
                data-[state=active]:ring-2
                data-[state=active]:ring-lxera-blue/40
                hover:scale-105
                shadow
                ${tabValue === cat ? "focus:outline-none focus:ring-2 focus:ring-lxera-blue/60" : ""}
              `}
              style={{
                boxShadow: tabValue === cat ? '0 4px 24px 0 #D9D9D9aa' : '0 2px 8px 0 #F3F3F3aa',
                minWidth: 110,
                marginRight: 4,
                whiteSpace: "nowrap",
              }}
              data-state={tabValue === cat ? "active" : undefined}
              aria-current={tabValue === cat ? "page" : undefined}
            >
              {/* Animated Icon + accessible label */}
              <span aria-hidden="true">{CATEGORY_ICON_MAP[cat] || null}</span>
              <span className="sr-only">{cat} features</span>
              <span>{cat}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {/* 40px vertical gap below sticky tabs */}
      <div className="mt-10" style={{ minHeight: "40px" }} />
      {categories.map((cat) => (
        <TabsContent key={cat} value={cat} className="w-full">
          {/* Desktop: show 2-3 cards per row, horizontal scroll on overflow */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8 overflow-x-auto">
              {groupedByCategory[cat].map((feature, idx) => (
                <div className="min-w-[340px] flex" key={feature.title}>
                  {/* The card itself is made responsive and fills container */}
                  <PlatformHighlightsCarousel features={[feature]} cat={cat} />
                </div>
              ))}
            </div>
          </div>
          {/* Mobile: stack cards vertically with horizontal scroll on overflow */}
          <div className="lg:hidden">
            <div className="flex flex-row gap-4 overflow-x-auto pb-2 px-1 snap-x snap-mandatory">
              {groupedByCategory[cat].map((feature, idx) => (
                <div
                  className="min-w-[85vw] max-w-[420px] flex-shrink-0 snap-start"
                  key={feature.title}
                  style={{ scrollSnapAlign: "start" }}
                >
                  <PlatformHighlightsMobileStack features={[feature]} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PlatformHighlightsTabs;
