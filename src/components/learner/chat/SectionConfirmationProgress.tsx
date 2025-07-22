import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SectionConfirmationProgressProps {
  confirmedSections: string[];
  onAllConfirmed?: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  work: '💼 Work experience',
  education: '🎓 Education',
  certifications: '📜 Certifications',
  languages: '🌐 Languages'
};

export default function SectionConfirmationProgress({ 
  confirmedSections, 
  onAllConfirmed 
}: SectionConfirmationProgressProps) {
  const [displayedSections, setDisplayedSections] = useState<string[]>([]);
  const allSections = Object.keys(SECTION_LABELS);
  const allConfirmed = confirmedSections.length === allSections.length;

  // Gradually display sections as they're confirmed
  useEffect(() => {
    confirmedSections.forEach((section, index) => {
      setTimeout(() => {
        setDisplayedSections(prev => {
          if (!prev.includes(section)) {
            return [...prev, section];
          }
          return prev;
        });
      }, index * 500);
    });
  }, [confirmedSections]);

  // Call onAllConfirmed when all sections are confirmed
  useEffect(() => {
    if (allConfirmed && onAllConfirmed) {
      setTimeout(() => {
        onAllConfirmed();
      }, 1000);
    }
  }, [allConfirmed, onAllConfirmed]);

  if (confirmedSections.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-green-50 rounded-lg border border-green-200"
    >
      <div className="text-sm font-medium text-green-900 mb-3">
        Confirming your information...
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {displayedSections.map((section) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                {SECTION_LABELS[section]} confirmed ✅
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {allConfirmed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-sm font-medium text-green-800"
        >
          All sections verified! 🎉
        </motion.div>
      )}
    </motion.div>
  );
}