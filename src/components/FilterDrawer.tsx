import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface FilterDrawerProps {
  selectedCategories: VideoCategory[];
  selectedDurations: string[];
  selectedAspectRatios: string[];
  selectedPriceRanges: string[];
  categories: { value: VideoCategory; label: string; icon: React.ReactNode }[];
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
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterDrawer = ({
  selectedCategories,
  selectedDurations,
  selectedAspectRatios,
  selectedPriceRanges,
  categories,
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
  onResetFilters,
  hasActiveFilters,
}: FilterDrawerProps) => {
  const activeFiltersCount = 
    selectedCategories.filter(c => c !== 'All').length +
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
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="space-y-4">
          <SheetDescription className="sr-only">
            Filter videos by categories, duration, aspect ratio, and price range
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
                Reset All
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          <div className="space-y-8">
            {/* Categories Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Categories</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllCategories}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearCategories}
                    className="h-8 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={selectedCategories.includes(category.value)}
                      onCheckedChange={() => onCategoryToggle(category.value)}
                    />
                    <Label
                      htmlFor={`category-${category.value}`}
                      className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.icon}
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Duration Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Duration</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllDurations}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearDurations}
                    className="h-8 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {durationFilters.map((duration) => (
                  <div key={duration.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`duration-${duration.value}`}
                      checked={selectedDurations.includes(duration.value)}
                      onCheckedChange={() => onDurationToggle(duration.value)}
                    />
                    <Label
                      htmlFor={`duration-${duration.value}`}
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {duration.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Aspect Ratio Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Aspect Ratio</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllAspectRatios}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAspectRatios}
                    className="h-8 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Landscape */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Landscape</p>
                {aspectRatioFilters
                  .filter(r => r.category === 'Landscape')
                  .map((ratio) => (
                    <div key={ratio.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`ratio-${ratio.value}`}
                        checked={selectedAspectRatios.includes(ratio.value)}
                        onCheckedChange={() => onAspectRatioToggle(ratio.value)}
                      />
                      <Label
                        htmlFor={`ratio-${ratio.value}`}
                        className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <AspectRatioIcon ratio={ratio.value} />
                        {ratio.value}
                      </Label>
                    </div>
                  ))}
              </div>

              {/* Portrait */}
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Portrait</p>
                {aspectRatioFilters
                  .filter(r => r.category === 'Portrait')
                  .map((ratio) => (
                    <div key={ratio.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`ratio-${ratio.value}`}
                        checked={selectedAspectRatios.includes(ratio.value)}
                        onCheckedChange={() => onAspectRatioToggle(ratio.value)}
                      />
                      <Label
                        htmlFor={`ratio-${ratio.value}`}
                        className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <AspectRatioIcon ratio={ratio.value} />
                        {ratio.value}
                      </Label>
                    </div>
                  ))}
              </div>

              {/* Square */}
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-muted-foreground">Square</p>
                {aspectRatioFilters
                  .filter(r => r.category === 'Square')
                  .map((ratio) => (
                    <div key={ratio.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`ratio-${ratio.value}`}
                        checked={selectedAspectRatios.includes(ratio.value)}
                        onCheckedChange={() => onAspectRatioToggle(ratio.value)}
                      />
                      <Label
                        htmlFor={`ratio-${ratio.value}`}
                        className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <AspectRatioIcon ratio={ratio.value} />
                        {ratio.value}
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            <Separator />

            {/* Price Range Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Price Range</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAllPriceRanges}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearPriceRanges}
                    className="h-8 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {priceRangeFilters.map((price) => (
                  <div key={price.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={`price-${price.value}`}
                      checked={selectedPriceRanges.includes(price.value)}
                      onCheckedChange={() => onPriceRangeToggle(price.value)}
                    />
                    <Label
                      htmlFor={`price-${price.value}`}
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
