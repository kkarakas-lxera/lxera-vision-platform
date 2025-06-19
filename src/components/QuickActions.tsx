
import { Button } from "@/components/ui/button";
import { Bell, Bookmark, Globe } from "lucide-react";
import { useState } from "react";

const QuickActions = () => {
  const [notifications, setNotifications] = useState(3);
  const [language, setLanguage] = useState("EN");

  const handleNotificationClick = () => {
    setNotifications(0);
    // Here you would typically open a notifications panel
    console.log("Opening notifications...");
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "ES" : "EN");
  };

  return (
    <div className="hidden md:flex items-center space-x-2">
      {/* Language Selector */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className="text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300 px-3 py-2 rounded-lg"
        aria-label={`Switch to ${language === "EN" ? "Spanish" : "English"}`}
      >
        <Globe className="h-4 w-4 mr-1" />
        {language}
      </Button>

      {/* Bookmarks */}
      <Button
        variant="ghost"
        size="icon"
        className="text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300"
        aria-label="Bookmarks"
      >
        <Bookmark className="h-4 w-4" />
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNotificationClick}
        className="text-business-black hover:text-future-green hover:bg-future-green/10 transition-all duration-300 relative"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {notifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-future-green text-business-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {notifications}
          </span>
        )}
      </Button>
    </div>
  );
};

export default QuickActions;
