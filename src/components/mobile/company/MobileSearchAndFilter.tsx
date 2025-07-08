import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  SlidersHorizontal, 
  Users, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveModal } from '@/components/mobile/modals/ResponsiveModal';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ElementType;
}

interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'single' | 'multi';
}

interface MobileSearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  filters: Record<string, any>;
  filterCategories: FilterCategory[];
  totalResults: number;
  showResultCount?: boolean;
  placeholder?: string;
}

export function MobileSearchAndFilter({
  searchValue,
  onSearchChange,
  onFilterChange,
  filters,
  filterCategories,
  totalResults,
  showResultCount = true,
  placeholder = "Search employees..."
}: MobileSearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value
    ).length;
  };

  const clearAllFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = Array.isArray(filters[key]) ? [] : '';
      return acc;
    }, {} as Record<string, any>);
    onFilterChange(clearedFilters);
  };

  const handleSingleFilterChange = (categoryId: string, value: string) => {
    onFilterChange({
      ...filters,
      [categoryId]: value
    });
  };

  const handleMultiFilterChange = (categoryId: string, optionId: string, checked: boolean) => {
    const currentValues = filters[categoryId] || [];
    const newValues = checked
      ? [...currentValues, optionId]
      : currentValues.filter((id: string) => id !== optionId);
    
    onFilterChange({
      ...filters,
      [categoryId]: newValues
    });
  };

  const renderFilterCategory = (category: FilterCategory) => {
    if (category.type === 'single') {
      return (
        <div key={category.id} className="space-y-3">
          <h3 className="font-medium text-sm">{category.label}</h3>
          <Select
            value={filters[category.id] || ''}
            onValueChange={(value) => handleSingleFilterChange(category.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${category.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {category.options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    {option.icon && <option.icon className="h-4 w-4" />}
                    <span>{option.label}</span>
                    {option.count && (
                      <Badge variant="outline" className="text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div key={category.id} className="space-y-3">
        <h3 className="font-medium text-sm">{category.label}</h3>
        <div className="space-y-2">
          {category.options.map((option) => {
            const isChecked = (filters[category.id] || []).includes(option.id);
            return (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={isChecked}
                  onCheckedChange={(checked) => 
                    handleMultiFilterChange(category.id, option.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={option.id}
                  className="flex items-center gap-2 flex-1 text-sm cursor-pointer"
                >
                  {option.icon && <option.icon className="h-4 w-4" />}
                  <span>{option.label}</span>
                  {option.count && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {option.count}
                    </Badge>
                  )}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getActiveFiltersDisplay = () => {
    const activeFilters: string[] = [];
    
    filterCategories.forEach(category => {
      if (category.type === 'single' && filters[category.id]) {
        const option = category.options.find(opt => opt.id === filters[category.id]);
        if (option) activeFilters.push(option.label);
      } else if (category.type === 'multi' && filters[category.id]?.length > 0) {
        filters[category.id].forEach((optionId: string) => {
          const option = category.options.find(opt => opt.id === optionId);
          if (option) activeFilters.push(option.label);
        });
      }
    });

    return activeFilters;
  };

  const activeFilters = getActiveFiltersDisplay();

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <Card className={cn(
        "transition-all duration-200",
        isSearchFocused && "ring-2 ring-blue-500 ring-offset-2"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {showResultCount && (
          <p className="text-sm text-gray-600">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Active Filters</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-auto h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Modal */}
      <ResponsiveModal
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        title="Filter Results"
        mobileMode="sheet"
        sheetSide="bottom"
      >
        <div className="space-y-6">
          {filterCategories.map(renderFilterCategory)}
          
          <Separator />
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </ResponsiveModal>
    </div>
  );
}

// Predefined filter categories for employee management
export const createEmployeeFilterCategories = (
  departments: string[],
  positions: string[],
  skills: string[]
): FilterCategory[] => {
  return [
    {
      id: 'status',
      label: 'Status',
      type: 'multi',
      options: [
        { id: 'cv_uploaded', label: 'CV Uploaded', icon: CheckCircle },
        { id: 'skills_analyzed', label: 'Skills Analyzed', icon: CheckCircle },
        { id: 'pending', label: 'Pending', icon: Clock },
        { id: 'incomplete', label: 'Incomplete', icon: XCircle }
      ]
    },
    {
      id: 'department',
      label: 'Department',
      type: 'single',
      options: departments.map(dept => ({
        id: dept,
        label: dept,
        icon: Building
      }))
    },
    {
      id: 'position',
      label: 'Position',
      type: 'single',
      options: positions.map(pos => ({
        id: pos,
        label: pos,
        icon: Users
      }))
    },
    {
      id: 'skills',
      label: 'Skills',
      type: 'multi',
      options: skills.map(skill => ({
        id: skill,
        label: skill
      }))
    },
    {
      id: 'join_date',
      label: 'Join Date',
      type: 'single',
      options: [
        { id: 'last_week', label: 'Last Week', icon: Calendar },
        { id: 'last_month', label: 'Last Month', icon: Calendar },
        { id: 'last_quarter', label: 'Last Quarter', icon: Calendar },
        { id: 'last_year', label: 'Last Year', icon: Calendar }
      ]
    }
  ];
};