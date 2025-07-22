import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuickReplyOption {
  label: string;
  value: string;
  points?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success';
}

interface QuickReplyButtonsProps {
  options: QuickReplyOption[];
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
}

export default function QuickReplyButtons({ 
  options, 
  onSelect, 
  disabled = false 
}: QuickReplyButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-2 mb-4 px-4"
    >
      {options.map((option, index) => (
        <motion.button
          key={option.value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(option.value, option.label)}
          disabled={disabled}
          className={cn(
            "relative px-4 py-2 rounded-full border-2 transition-all duration-200",
            "hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
            "text-sm font-medium",
            option.variant === 'primary' && "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100",
            option.variant === 'success' && "border-green-500 bg-green-50 text-green-700 hover:bg-green-100",
            (!option.variant || option.variant === 'default') && "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
          )}
        >
          <span className="flex items-center gap-2">
            {option.icon && <span className="text-lg">{option.icon}</span>}
            {option.label}
            {option.points && (
              <span className="text-xs font-bold text-green-600">
                +{option.points}
              </span>
            )}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}