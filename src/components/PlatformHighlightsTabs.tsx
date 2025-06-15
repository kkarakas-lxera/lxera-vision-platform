
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
      <div
        className={`
          sticky top-0 z-30
          bg-smart-beige/95 backdrop-blur
          rounded-xl
          shadow-lg
          transition-all
          border border-business-black/10
          px-2
          mb-4
          mx-auto
          flex
          items-center
          ${tabValue ? "drop-shadow-[0_4px_12px_rgba(25,25,25,0.07)]" : ""}
        `}
        style={{
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
            scrollbar-thin scrollbar-thumb-business-black/30 scrollbar-track-transparent
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
            background: "transparent",
            boxShadow: "none",
          }}
        >
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className={`
                px-5 py-2 rounded-full lxera-tab-underline group
                flex items-center gap-2
                font-semibold border-2
                transition-all
                bg-white
                border-business-black/15
                data-[state=active]:bg-business-black/90
                data-[state=active]:border-business-black
                data-[state=active]:text-white
                data-[state=active]:shadow-lg
                data-[state=active]:ring-2
                data-[state=active]:ring-lxera-blue/60
                hover:scale-105
                shadow
                ${tabValue === cat ? "focus:outline-none focus:ring-2 focus:ring-lxera-blue/60" : ""}
              `}
              style={{
                boxShadow: tabValue === cat ? '0 4px 24px 0 #D9D9D9aa' : '0 2px 8px 0 #F3F3F3aa',
                borderBottom: tabValue === cat ? "4px solid #191919" : undefined,
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
      <div className="mt-16 lg:mt-12" />
      {categories.map((cat) => (
        <TabsContent key={cat} value={cat} className="w-full">
          <div className="hidden lg:block">
            <PlatformHighlightsCarousel features={groupedByCategory[cat]} cat={cat} />
          </div>
          <PlatformHighlightsMobileStack features={groupedByCategory[cat]} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PlatformHighlightsTabs;
