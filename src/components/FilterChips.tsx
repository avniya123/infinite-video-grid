import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { durationFilters, aspectRatioFilters, priceRangeFilters } from '@/hooks/useVideoFilters';

interface FilterChipsProps {
  selectedMainCategory: string | null;
  selectedSubcategory: string | null;
  selectedDurations: string[];
  selectedAspectRatios: string[];
  selectedPriceRanges: string[];
  searchQuery: string;
  onMainCategorySelect: (category: string | null) => void;
  onSubcategorySelect: (subcategory: string | null) => void;
  onDurationToggle: (duration: string) => void;
  onAspectRatioToggle: (ratio: string) => void;
  onPriceRangeToggle: (price: string) => void;
  onClearSearch: () => void;
}

export const FilterChips = ({
  selectedMainCategory,
  selectedSubcategory,
  selectedDurations,
  selectedAspectRatios,
  selectedPriceRanges,
  searchQuery,
  onMainCategorySelect,
  onSubcategorySelect,
  onDurationToggle,
  onAspectRatioToggle,
  onPriceRangeToggle,
  onClearSearch,
}: FilterChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2 items-center animate-fade-in">
      <span className="text-sm text-muted-foreground font-medium">Filters:</span>
      
      {/* Main Category Chip */}
      {selectedMainCategory && (
        <Badge 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">{selectedMainCategory}</span>
          <button
            onClick={() => onMainCategorySelect(null)}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label={`Remove ${selectedMainCategory} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {/* Subcategory Chip */}
      {selectedSubcategory && (
        <Badge 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">{selectedSubcategory}</span>
          <button
            onClick={() => onSubcategorySelect(null)}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label={`Remove ${selectedSubcategory} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {/* Duration Chips */}
      {selectedDurations.map((duration) => (
        <Badge 
          key={duration} 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">{durationFilters.find(d => d.value === duration)?.label}</span>
          <button
            onClick={() => onDurationToggle(duration)}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label={`Remove ${duration} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Aspect Ratio Chips */}
      {selectedAspectRatios.map((ratio) => (
        <Badge 
          key={ratio} 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">{aspectRatioFilters.find(r => r.value === ratio)?.label}</span>
          <button
            onClick={() => onAspectRatioToggle(ratio)}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label={`Remove ${ratio} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Price Range Chips */}
      {selectedPriceRanges.map((price) => (
        <Badge 
          key={price} 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">{price}</span>
          <button
            onClick={() => onPriceRangeToggle(price)}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label={`Remove ${price} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

      {/* Search Query Chip */}
      {searchQuery && (
        <Badge 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">Search: "{searchQuery}"</span>
          <button
            onClick={onClearSearch}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}
    </div>
  );
};
