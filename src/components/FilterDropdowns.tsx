import { Filter, Clock, Maximize, DollarSign, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VideoCategory } from '@/types/video';
import { aspectRatioFilters, durationFilters, priceRangeFilters } from '@/hooks/useVideoFilters';

const AspectRatioIcon = ({ ratio }: { ratio: string }) => {
  const ratioStyles: Record<string, { width: string; height: string }> = {
    '16:9': { width: '32px', height: '18px' },
    '21:9': { width: '32px', height: '13px' },
    '4:3': { width: '28px', height: '21px' },
    '3:2': { width: '30px', height: '20px' },
    '9:16': { width: '18px', height: '32px' },
    '9:21': { width: '13px', height: '32px' },
    '3:4': { width: '21px', height: '28px' },
    '2:3': { width: '20px', height: '30px' },
    '1:1': { width: '24px', height: '24px' },
  };

  const style = ratioStyles[ratio] || { width: '24px', height: '24px' };

  return (
    <div 
      className="border-2 border-primary rounded-sm bg-primary/10 flex-shrink-0"
      style={style}
    />
  );
};

interface FilterDropdownsProps {
  sortBy: string;
  sortOptions: { value: string; label: string }[];
  selectedCategories: VideoCategory[];
  selectedDurations: string[];
  selectedAspectRatios: string[];
  selectedPriceRanges: string[];
  categories: { value: VideoCategory; label: string; icon: React.ReactNode }[];
  onSortChange: (value: string) => void;
  onCategoryToggle: (category: VideoCategory) => void;
  onDurationToggle: (duration: string) => void;
  onAspectRatioToggle: (ratio: string) => void;
  onPriceRangeToggle: (price: string) => void;
  onSelectAllCategories: () => void;
  onClearCategories: () => void;
  onSelectAllDurations: () => void;
  onClearDurations: () => void;
  onSelectAllAspectRatios: () => void;
  onClearAspectRatios: () => void;
  onSelectAllPriceRanges: () => void;
  onClearPriceRanges: () => void;
}

export const FilterDropdowns = ({
  sortBy,
  sortOptions,
  selectedCategories,
  selectedDurations,
  selectedAspectRatios,
  selectedPriceRanges,
  categories,
  onSortChange,
  onCategoryToggle,
  onDurationToggle,
  onAspectRatioToggle,
  onPriceRangeToggle,
  onSelectAllCategories,
  onClearCategories,
  onSelectAllDurations,
  onClearDurations,
  onSelectAllAspectRatios,
  onClearAspectRatios,
  onSelectAllPriceRanges,
  onClearPriceRanges,
}: FilterDropdownsProps) => {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
          <DropdownMenuLabel className="font-semibold">Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`cursor-pointer transition-colors ${sortBy === option.value ? 'bg-accent' : ''}`}
            >
              <span>{option.label}</span>
              {sortBy === option.value && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200">
            <Filter className="w-4 h-4 mr-2" />
            Categories
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {selectedCategories.length}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
          <DropdownMenuLabel className="font-semibold">Filter by Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="flex gap-1 px-2 py-1.5">
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onSelectAllCategories}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onClearCategories}>
              Clear
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {categories.filter(cat => cat.value !== 'All').map((category) => (
            <DropdownMenuCheckboxItem
              key={category.value}
              checked={selectedCategories.includes(category.value)}
              onCheckedChange={() => onCategoryToggle(category.value)}
              className="flex items-center gap-2 cursor-pointer transition-colors"
            >
              {category.icon}
              <span>{category.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duration Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200">
            <Clock className="w-4 h-4 mr-2" />
            Duration
            {selectedDurations.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {selectedDurations.length}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
          <DropdownMenuLabel className="font-semibold">Filter by Duration</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="flex gap-1 px-2 py-1.5">
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onSelectAllDurations}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onClearDurations}>
              Clear
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {durationFilters.map((filter) => (
            <DropdownMenuCheckboxItem
              key={filter.value}
              checked={selectedDurations.includes(filter.value)}
              onCheckedChange={() => onDurationToggle(filter.value)}
              className="flex items-center justify-between cursor-pointer transition-colors"
            >
              <span>{filter.label}</span>
              <span className="text-xs text-muted-foreground">{filter.range}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Aspect Ratio Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200">
            <Maximize className="w-4 h-4 mr-2" />
            Aspect Ratio
            {selectedAspectRatios.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {selectedAspectRatios.length}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 bg-background/95 backdrop-blur-sm border-2">
          <DropdownMenuLabel className="font-semibold">Filter by Aspect Ratio</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="flex gap-1 px-2 py-1.5">
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onSelectAllAspectRatios}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onClearAspectRatios}>
              Clear
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {['Landscape', 'Portrait', 'Square'].map((orientation) => {
            const ratiosInGroup = aspectRatioFilters.filter(f => f.category === orientation);
            return (
              <Collapsible key={orientation} defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-2 hover:bg-accent rounded text-sm font-medium transition-all duration-200 ease-in-out">
                  <span>{orientation}</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-300 ease-in-out data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-2 pb-2 overflow-hidden transition-all duration-300 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  {ratiosInGroup.map((filter) => (
                    <DropdownMenuCheckboxItem
                      key={filter.value}
                      checked={selectedAspectRatios.includes(filter.value)}
                      onCheckedChange={() => onAspectRatioToggle(filter.value)}
                      className="flex items-center gap-3 cursor-pointer py-2 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <AspectRatioIcon ratio={filter.value} />
                      <span className="flex-1">{filter.label}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Price Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200">
            <DollarSign className="w-4 h-4 mr-2" />
            Price
            {selectedPriceRanges.length > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {selectedPriceRanges.length}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
          <DropdownMenuLabel className="font-semibold">Filter by Price Range</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="flex gap-1 px-2 py-1.5">
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onSelectAllPriceRanges}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs" onClick={onClearPriceRanges}>
              Clear
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {priceRangeFilters.map((filter) => (
            <DropdownMenuCheckboxItem
              key={filter.value}
              checked={selectedPriceRanges.includes(filter.value)}
              onCheckedChange={() => onPriceRangeToggle(filter.value)}
              className="flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>{filter.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
