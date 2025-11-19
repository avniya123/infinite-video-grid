import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubcategorySliderProps {
  category: string;
}

const subcategoryData: Record<string, string[]> = {
  'Personal Celebrations': [
    'Birthday',
    'Engagement',
    'Anniversary',
    'Wedding',
    'Baby Shower',
    'Graduation',
    'Retirement',
    'House Warming',
  ],
  'Festival Celebrations': [
    'Diwali',
    'Christmas',
    'Eid',
    'Holi',
    'New Year',
    'Easter',
    'Thanksgiving',
    'Halloween',
  ],
  'National & Public Holidays': [
    'Independence Day',
    'Republic Day',
    'Gandhi Jayanti',
    'Labor Day',
    'Memorial Day',
  ],
  'Corporate & Office': [
    'Team Building',
    'Office Party',
    'Product Launch',
    'Conference',
    'Seminar',
  ],
  'Entertainment & Showbiz': [
    'Movie Premiere',
    'Concert',
    'Award Show',
    'Fashion Show',
    'Theater',
  ],
  'Sports & Competition': [
    'Cricket',
    'Football',
    'Olympics',
    'Marathon',
    'Tournament',
  ],
  'Environmental & Nature': [
    'Earth Day',
    'World Environment Day',
    'Tree Plantation',
    'Beach Cleanup',
  ],
  'Corporate Events': [
    'AGM',
    'Board Meeting',
    'Investor Meet',
    'Town Hall',
  ],
  'Marketing & Advertising': [
    'Campaign Launch',
    'Brand Activation',
    'Trade Show',
    'Promotional Event',
  ],
  'Professional Services': [
    'Workshop',
    'Training',
    'Consultation',
    'Networking',
  ],
  'E-commerce': [
    'Sale Event',
    'Product Demo',
    'Flash Sale',
    'Customer Appreciation',
  ],
};

export const SubcategorySlider = ({ category }: SubcategorySliderProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const subcategories = subcategoryData[category] || [];
  
  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('subcategory-slider');
    if (!container) return;
    
    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  if (subcategories.length === 0) return null;

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleScroll('left')}
            className="h-8 w-8 shrink-0 rounded-full hover:bg-accent/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div
            id="subcategory-slider"
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {subcategories.map((subcategory) => (
              <Badge
                key={subcategory}
                variant="outline"
                className="px-4 py-2 cursor-pointer whitespace-nowrap border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                {subcategory}
              </Badge>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleScroll('right')}
            className="h-8 w-8 shrink-0 rounded-full hover:bg-accent/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
