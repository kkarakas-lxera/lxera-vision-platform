import React, { useState, type FC } from "react";
import type { ElementType } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Target,
  Sparkles,
  CreditCard,
  BookOpen,
  LogIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ProgressiveDemoCapture from "./forms/ProgressiveDemoCapture";
import { useAuth } from "@/contexts/AuthContext";

// -------------------------------------------------------------------
// Types identical to previous implementation so Navigation.tsx props stay.
// -------------------------------------------------------------------

interface DropdownCategory {
  category: string;
  items: Array<{ name: string; href: string }>;
}

interface MobileMenuItem {
  name: string;
  href: string;
  id: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownCategory[];
}

interface MobileMenuProps {
  menuItems: MobileMenuItem[];
  activeSection: string;
  isMobileMenuOpen: boolean;
  handleMobileMenuToggle: () => void;
  scrollToSection: (href: string) => void;
}

// Icon mapping for top-level items – tweak to match LXERA brand icons
const iconFor = (name: string): ElementType => {
  switch (name) {
    case "Platform":
      return Target;
    case "Solutions":
      return Sparkles;
    case "Pricing":
      return CreditCard;
    case "Resources":
      return BookOpen;
    default:
      return Target;
  }
};

const MobileMenu: FC<MobileMenuProps> = ({
  menuItems,
  activeSection,
  isMobileMenuOpen,
  handleMobileMenuToggle,
  scrollToSection,
}) => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const { user, userProfile } = useAuth();
  const location = useLocation();

  const isHomepage = location.pathname === "/";

  const toggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isActive = (href: string, id: string) => {
    if (href.startsWith("#")) return activeSection === id;
    return location.pathname.startsWith(href);
  };

  const handleNavigate = (href: string) => {
    scrollToSection(href);
    // scrollToSection already closes the menu via handleMobileMenuToggle()
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Request Demo button - minimized for mobile */}
      {!isHomepage && (
        <ProgressiveDemoCapture
          source="mobile_menu"
          buttonText="Demo"
          variant="minimal"
          className="text-future-green"
        />
      )}

      {/* Hamburger & Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={handleMobileMenuToggle}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="text-business-black hover:text-business-black/70 hover:bg-smart-beige/50 transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-full sm:w-80 p-0 bg-smart-beige border-r border-gray-200 text-business-black"
        >
          {/* Header */}
          <SheetHeader className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-medium">Navigation</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMobileMenuToggle}
                className="h-8 w-8 text-business-black hover:bg-smart-beige/70"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* Nav Items */}
          <ScrollArea className="h-[calc(100vh-64px)] px-4 py-6">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = iconFor(item.name);
                const active = isActive(item.href, item.id);
                const isExpanded = expanded.includes(item.id);

                if (item.hasDropdown && item.dropdownItems) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className={cn(
                          "w-full flex items-center py-3 px-3 rounded-lg transition-all duration-200",
                          active
                            ? "bg-future-green/40 text-business-black shadow-sm"
                            : "hover:bg-future-green/20"
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="flex-1 text-left font-medium">
                          {item.name}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="ml-8 space-y-1">
                          {item.dropdownItems.map((cat) => (
                            <React.Fragment key={cat.category}>
                              {cat.items.map((sub) => (
                                <button
                                  key={sub.href}
                                  onClick={() => handleNavigate(sub.href)}
                                  className={cn(
                                    "flex items-center py-2 px-3 rounded-lg text-sm transition-all duration-200",
                                    location.pathname === sub.href
                                      ? "bg-future-green/40 text-business-black"
                                      : "hover:bg-future-green/20"
                                  )}
                                >
                                  •<span className="ml-2 text-left">{sub.name}</span>
                                </button>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.href)}
                    className={cn(
                      "flex items-center py-3 px-3 rounded-lg transition-all duration-200 w-full",
                      active
                        ? "bg-future-green/40 text-business-black shadow-sm"
                        : "hover:bg-future-green/20"
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom Action */}
            <div className="pt-6 border-t border-gray-200 mt-6">
              {user && userProfile ? (
                <Link
                  to={
                    userProfile.role === "super_admin"
                      ? "/admin"
                      : userProfile.role === "company_admin"
                      ? "/dashboard"
                      : "/learner"
                  }
                >
                  <Button className="w-full bg-business-black text-white hover:bg-business-black/90 rounded-xl font-medium">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-business-black bg-white text-business-black hover:bg-business-black hover:text-white hover:border-business-black rounded-xl font-medium"
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Sign In
                  </Button>
                </Link>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;
