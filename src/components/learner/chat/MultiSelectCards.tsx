import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MultiSelectCardsProps {
  items: string[];
  selectedItems: string[];
  onSelectionChange: (selected: string[]) => void;
  onComplete: () => void;
  title: string;
  subtitle: string;
  minSelection?: number;
  maxSelection?: number;
  itemsPerPage?: number;
}

export default function MultiSelectCards({
  items,
  selectedItems,
  onSelectionChange,
  onComplete,
  title,
  subtitle,
  minSelection = 1,
  maxSelection,
  itemsPerPage = 3
}: MultiSelectCardsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [localSelected, setLocalSelected] = useState<string[]>(selectedItems || []);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Sync local state with props when selectedItems changes
  React.useEffect(() => {
    setLocalSelected(selectedItems || []);
  }, [selectedItems]);
  
  const handleToggleItem = (item: string) => {
    const isSelected = localSelected.includes(item);
    let newSelection: string[];
    
    if (isSelected) {
      newSelection = localSelected.filter(i => i !== item);
    } else {
      if (!maxSelection || localSelected.length < maxSelection) {
        newSelection = [...localSelected, item];
      } else {
        return; // Don't add if at max
      }
    }
    
    setLocalSelected(newSelection);
    onSelectionChange(newSelection);
  };
  
  const currentItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  
  const canProceed = localSelected.length >= minSelection;
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
        {maxSelection && (
          <p className="text-xs text-gray-500 mt-1">
            Select up to {maxSelection} items ({localSelected.length}/{maxSelection})
          </p>
        )}
      </div>
      
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            {currentItems.map((item, index) => {
              const isSelected = localSelected.includes(item);
              const isDisabled = !isSelected && maxSelection && localSelected.length >= maxSelection;
              
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`
                      relative p-6 cursor-pointer transition-all duration-200 min-h-[120px] flex items-center
                      ${isSelected 
                        ? 'border-2 border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                        : 'border border-gray-200 hover:border-gray-400 hover:shadow-md hover:bg-gray-50'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !isDisabled && handleToggleItem(item)}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5
                        transition-all duration-200 flex items-center justify-center
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-400 bg-white'
                        }
                      `}>
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <p className={`
                        text-sm leading-relaxed flex-1
                        ${isSelected ? 'text-gray-800 font-medium' : 'text-gray-700'}
                      `}>
                        {item}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`
                    w-2 h-2 rounded-full transition-all duration-200
                    ${currentPage === i 
                      ? 'bg-blue-500 w-6' 
                      : 'bg-gray-300 hover:bg-gray-400'
                    }
                  `}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {localSelected.length} selected
          {minSelection > 0 && ` (minimum ${minSelection})`}
        </p>
        
        <Button
          onClick={onComplete}
          disabled={!canProceed}
          className="min-w-[140px]"
          variant={canProceed ? "default" : "outline"}
        >
          {canProceed ? 'Continue →' : `Select ${minSelection - localSelected.length} more`}
        </Button>
      </div>
    </div>
  );
}