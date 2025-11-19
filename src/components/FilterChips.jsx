import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { durationFilters, aspectRatioFilters, priceRangeFilters } from '@/hooks/useVideoFilters';

export const FilterChips = ({
  selectedCategories,
  selectedDurations,
  selectedAspectRatios,
  selectedPriceRanges,
  searchQuery,
  categories,
  onCategoryToggle,
  onDurationToggle,
  onAspectRatioToggle,
  onPriceRangeToggle,
  onClearSearch,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center animate-fade-in">
      <span className="text-sm text-muted-foreground font-medium">Filters:</span>
      
      {/* Category Chips */}
      {selectedCategories.map((category) => (
        <Badge 
          key={category} 
          variant="secondary" 
          className="pl-3 pr-2 py-1.5 gap-1.5 hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        >
          <span className="text-xs font-medium">{categories.find(c => c.value === category)?.label}</span>
          <button
            onClick={() => onCategoryToggle(category)}
            className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-all duration-200"
            aria-label={`Remove ${category} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}

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
          key="search" 
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
