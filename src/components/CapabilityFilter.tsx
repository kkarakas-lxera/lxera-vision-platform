
import { Users, Target, BarChart3, Lightbulb } from "lucide-react";

interface CapabilityFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "all", label: "All Capabilities", icon: Target },
  { id: "learning", label: "Learning", icon: Lightbulb },
  { id: "engagement", label: "Engagement", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 }
];

const CapabilityFilter = ({ activeFilter, onFilterChange }: CapabilityFilterProps) => {
  return (
    <div className="mb-12 animate-fade-in-up animate-delay-900">
      <div className="flex flex-wrap justify-center gap-4">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                activeFilter === filter.id
                  ? 'bg-future-green text-business-black shadow-lg'
                  : 'bg-white/60 text-business-black/70 hover:bg-white/80 border border-white/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CapabilityFilter;
