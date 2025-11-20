import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { DRAWER_PRESETS, getDrawerHeaderClassName } from '@/config/drawer';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MainCategory } from '@/types/video';
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

// Main categories with subcategories
const mainCategories: { category: MainCategory; subcategories: string[] }[] = [
  {
    category: 'Personal Celebrations',
    subcategories: ['Birthday', 'Engagement', 'Anniversary', 'Wedding', 'Baby Shower', 'Graduation', 'Retirement', 'House Warming'],
  },
  {
    category: 'Festival Celebrations',
    subcategories: ['Diwali', 'Christmas', 'Eid', 'Holi', 'New Year', 'Easter', 'Thanksgiving', 'Halloween'],
  },
  {
    category: 'National & Public Holidays',
    subcategories: ['Independence Day', 'Republic Day', 'Gandhi Jayanti', 'Labor Day', 'Memorial Day'],
  },
  {
    category: 'Corporate & Office',
    subcategories: ['Team Building', 'Office Party', 'Product Launch', 'Conference', 'Seminar'],
  },
  {
    category: 'Entertainment & Showbiz',
    subcategories: ['Movie Premiere', 'Concert', 'Award Show', 'Fashion Show', 'Theater'],
  },
  {
    category: 'Sports & Competition',
    subcategories: ['Cricket', 'Football', 'Olympics', 'Marathon', 'Tournament'],
  },
  {
    category: 'Environmental & Nature',
    subcategories: ['Earth Day', 'World Environment Day', 'Tree Plantation', 'Beach Cleanup'],
  },
  {
    category: 'Corporate Events',
    subcategories: ['AGM', 'Board Meeting', 'Investor Meet', 'Town Hall'],
  },
  {
    category: 'Marketing & Advertising',
    subcategories: ['Campaign Launch', 'Brand Activation', 'Trade Show', 'Promotional Event'],
  },
  {
    category: 'Professional Services',
    subcategories: ['Workshop', 'Training', 'Consultation', 'Networking'],
  },
  {
    category: 'E-commerce',
    subcategories: ['Sale Event', 'Product Demo', 'Flash Sale', 'Customer Appreciation'],
  },
];

interface FilterDrawerProps {
  selectedMainCategory: string | null;
  selectedSubcategory: string | null;
  selectedDurations: string[];
  selectedAspectRatios: string[];
  selectedPriceRanges: string[];
  onMainCategorySelect: (category: string | null) => void;
  onSubcategorySelect: (subcategory: string | null) => void;
  onDurationToggle: (duration: string) => void;
  onAspectRatioToggle: (ratio: string) => void;
  onPriceRangeToggle: (price: string) => void;
  onSelectAllDurations: () => void;
  onClearDurations: () => void;
  onSelectAllAspectRatios: () => void;
  onClearAspectRatios: () => void;
  onSelectAllPriceRanges: () => void;
  onClearPriceRanges: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterDrawer = ({
  selectedMainCategory,
  selectedSubcategory,
  selectedDurations,
  selectedAspectRatios,
  selectedPriceRanges,
  onMainCategorySelect,
  onSubcategorySelect,
  onDurationToggle,
  onAspectRatioToggle,
  onPriceRangeToggle,
  onSelectAllDurations,
  onClearDurations,
  onSelectAllAspectRatios,
  onClearAspectRatios,
  onSelectAllPriceRanges,
  onClearPriceRanges,
  onResetFilters,
  hasActiveFilters,
}: FilterDrawerProps) => {
  const activeFiltersCount = 
    (selectedMainCategory ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    selectedDurations.length +
    selectedAspectRatios.length +
    selectedPriceRanges.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200 relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={DRAWER_PRESETS.form}>
        <SheetHeader className={`${getDrawerHeaderClassName('standard')} space-y-4`}>
          <SheetDescription className="sr-only">
            Filter videos by categories, subcategories, duration, aspect ratio, and price range
          </SheetDescription>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl">Filters</SheetTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Categories</h3>
              </div>
              <div className="space-y-4">
                {mainCategories.map(({ category, subcategories }) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedMainCategory === category}
                        onCheckedChange={(checked) => {
                          onMainCategorySelect(checked ? category : null);
                        }}
                        className="rounded-md"
                      />
                      <Label 
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
                      >
                        {category}
                      </Label>
                    </div>
                    
                    {/* Subcategories */}
                    {selectedMainCategory === category && (
                      <div className="ml-8 space-y-2 animate-fade-in">
                        {subcategories.map((subcategory) => (
                          <div key={subcategory} className="flex items-center gap-3">
                            <Checkbox
                              id={`subcategory-${subcategory}`}
                              checked={selectedSubcategory === subcategory}
                              onCheckedChange={(checked) => {
                                onSubcategorySelect(checked ? subcategory : null);
                              }}
                              className="rounded-md"
                            />
                            <Label 
                              htmlFor={`subcategory-${subcategory}`}
                              className="text-sm cursor-pointer hover:text-primary transition-colors"
                            >
                              {subcategory}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Duration Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Duration</h3>
                <div className="flex gap-2">
                  {selectedDurations.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearDurations}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllDurations}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {durationFilters.map((duration) => (
                  <div key={duration.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`duration-${duration.value}`}
                        checked={selectedDurations.includes(duration.value)}
                        onCheckedChange={() => onDurationToggle(duration.value)}
                        className="rounded-md"
                      />
                      <Label 
                        htmlFor={`duration-${duration.value}`}
                        className="text-sm cursor-pointer hover:text-primary transition-colors"
                      >
                        {duration.label}
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">{duration.range}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Aspect Ratio Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Aspect Ratio</h3>
                <div className="flex gap-2">
                  {selectedAspectRatios.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAspectRatios}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllAspectRatios}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </div>
              
              {/* Group by category */}
              {['Landscape', 'Portrait', 'Square'].map(category => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                  <div className="space-y-3 pl-2">
                    {aspectRatioFilters
                      .filter(ratio => ratio.category === category)
                      .map((ratio) => (
                        <div key={ratio.value} className="flex items-center gap-3">
                          <Checkbox
                            id={`ratio-${ratio.value}`}
                            checked={selectedAspectRatios.includes(ratio.value)}
                            onCheckedChange={() => onAspectRatioToggle(ratio.value)}
                            className="rounded-md"
                          />
                          <Label 
                            htmlFor={`ratio-${ratio.value}`}
                            className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors"
                          >
                            <AspectRatioIcon ratio={ratio.value} />
                            {ratio.label}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Price Range Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Price Range</h3>
                <div className="flex gap-2">
                  {selectedPriceRanges.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearPriceRanges}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllPriceRanges}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {priceRangeFilters.map((price) => (
                  <div key={price.value} className="flex items-center gap-3">
                    <Checkbox
                      id={`price-${price.value}`}
                      checked={selectedPriceRanges.includes(price.value)}
                      onCheckedChange={() => onPriceRangeToggle(price.value)}
                      className="rounded-md"
                    />
                    <Label 
                      htmlFor={`price-${price.value}`}
                      className="text-sm cursor-pointer hover:text-primary transition-colors"
                    >
                      {price.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
