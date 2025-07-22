import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';

interface ProfileStepMessageProps {
  step: number;
  navigatingTo?: number;
  onNavigationComplete?: () => void;
  forceUpdate?: boolean;
}

const STEP_MESSAGES = {
  1: {
    icon: "📝",
    title: "Let's review your CV information",
    subtitle: "You can edit individual entries or accept entire sections"
  },
  2: {
    icon: "💼", 
    title: "Tell me about your work experience",
    subtitle: "We'll go through each position to build your profile"
  },
  3: {
    icon: "🎓",
    title: "Let's review your education",
    subtitle: "You can edit individual entries or accept this section"
  },
  4: {
    icon: "⚡",
    title: "Time for a quick skills review!",
    subtitle: "I'll show you the skills I found in your profile"
  },
  5: {
    icon: "🏢",
    title: "Tell me about your current work",
    subtitle: "What size team do you work with?"
  },
  6: {
    icon: "🎯",
    title: "What challenges are you facing?",
    subtitle: "Let me understand your current situation"
  },
  7: {
    icon: "🚀",
    title: "What are your growth opportunities?", 
    subtitle: "Help me identify areas for development"
  }
};

const NAVIGATION_MESSAGES = {
  1: "Taking you back to CV Review... 🔄",
  2: "Taking you back to Work Experience... 🔄", 
  3: "Taking you back to Education... 🔄",
  4: "Taking you back to Skills Review... 🔄",
  5: "Taking you back to Current Work... 🔄",
  6: "Taking you back to Challenges... 🔄",
  7: "Taking you back to Growth Opportunities... 🔄"
};

export default function ProfileStepMessage({ 
  step, 
  navigatingTo, 
  onNavigationComplete,
  forceUpdate 
}: ProfileStepMessageProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(STEP_MESSAGES[step as keyof typeof STEP_MESSAGES]);

  useEffect(() => {
    if (navigatingTo && navigatingTo !== step) {
      setIsNavigating(true);
      setCurrentMessage({
        icon: "🔄",
        title: NAVIGATION_MESSAGES[navigatingTo as keyof typeof NAVIGATION_MESSAGES] || "Navigating...",
        subtitle: ""
      });

      // Complete navigation after animation
      setTimeout(() => {
        setIsNavigating(false);
        setCurrentMessage(STEP_MESSAGES[navigatingTo as keyof typeof STEP_MESSAGES]);
        onNavigationComplete?.();
      }, 1500);
    } else {
      setCurrentMessage(STEP_MESSAGES[step as keyof typeof STEP_MESSAGES]);
    }
  }, [step, navigatingTo, onNavigationComplete]);

  useEffect(() => {
    if (forceUpdate) {
      setCurrentMessage(STEP_MESSAGES[step as keyof typeof STEP_MESSAGES]);
    }
  }, [forceUpdate, step]);

  if (!currentMessage) return null;

  return (
    <motion.div
      key={`${step}-${navigatingTo}-${isNavigating}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-blue-50 rounded-lg p-4 border border-blue-200"
    >
      <div className="flex items-start gap-3">
        {isNavigating ? (
          <div className="flex-shrink-0 mt-0.5">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          </div>
        ) : (
          <span className="text-lg flex-shrink-0">{currentMessage.icon}</span>
        )}
        
        <div className="flex-1 min-w-0">
          <motion.p 
            className="text-sm font-medium text-blue-900 mb-1"
            key={currentMessage.title}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
          >
            {currentMessage.title}
          </motion.p>
          
          {currentMessage.subtitle && (
            <motion.p 
              className="text-xs text-blue-700"
              key={currentMessage.subtitle}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
            >
              {currentMessage.subtitle}
            </motion.p>
          )}
        </div>

        {navigatingTo && (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 text-blue-600" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}