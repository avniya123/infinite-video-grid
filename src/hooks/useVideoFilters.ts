import { useState, useMemo, useCallback, useEffect } from 'react';
import { VideoItem, VideoCategory } from '@/types/video';
import { toast } from 'sonner';

type DurationFilter = 'Teaser' | 'Trailer' | 'Gimbel' | 'Document';
type AspectRatioFilter = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9' | '9:21' | '2:3' | '3:2';
type PriceRangeFilter = 'Under $50' | '$50-$100' | '$100-$200' | 'Over $200';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

// Mapping from header categories to video categories
const headerCategoryMapping: Record<string, VideoCategory[]> = {
  'Personal Celebrations': ['Lifestyle', 'Nature'],
  'Festival Celebrations': ['Lifestyle', 'Urban'],
  'National & Public Holidays': ['Urban', 'Lifestyle'],
  'Corporate & Office': ['Business'],
  'Entertainment & Showbiz': ['Lifestyle', 'Urban'],
  'Sports & Competition': ['Lifestyle'],
  'Environmental & Nature': ['Nature'],
  'Corporate Events': ['Business', 'Urban'],
  'Marketing & Advertising': ['Business'],
  'Professional Services': ['Business'],
  'E-commerce': ['Business', 'Urban'],
};

export const aspectRatioFilters: { value: AspectRatioFilter; label: string; category: 'Landscape' | 'Portrait' | 'Square' }[] = [
  { value: '16:9', label: 'Landscape 16:9', category: 'Landscape' },
  { value: '21:9', label: 'Ultrawide 21:9', category: 'Landscape' },
  { value: '4:3', label: 'Standard 4:3', category: 'Landscape' },
  { value: '3:2', label: 'Classic 3:2', category: 'Landscape' },
  { value: '9:16', label: 'Portrait 9:16', category: 'Portrait' },
  { value: '9:21', label: 'Tall 9:21', category: 'Portrait' },
  { value: '3:4', label: 'Portrait 3:4', category: 'Portrait' },
  { value: '2:3', label: 'Portrait 2:3', category: 'Portrait' },
  { value: '1:1', label: 'Square 1:1', category: 'Square' },
];

export const durationFilters: { value: DurationFilter; label: string; range: string }[] = [
  { value: 'Teaser', label: 'Teaser', range: '0-1 min' },
  { value: 'Trailer', label: 'Trailer', range: '1-3 min' },
  { value: 'Gimbel', label: 'Gimbel', range: '3-5 min' },
  { value: 'Document', label: 'Document', range: '5+ min' },
];

export const priceRangeFilters: { value: PriceRangeFilter; label: string; range: [number, number] }[] = [
  { value: 'Under $50', label: 'Under $50', range: [0, 50] },
  { value: '$50-$100', label: '$50 - $100', range: [50, 100] },
  { value: '$100-$200', label: '$100 - $200', range: [100, 200] },
  { value: 'Over $200', label: 'Over $200', range: [200, Infinity] },
];

export const useVideoFilters = (videos: VideoItem[], headerCategories: string[] = []) => {
  const [selectedCategories, setSelectedCategories] = useState<VideoCategory[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<DurationFilter[]>([]);
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<AspectRatioFilter[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRangeFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Convert header categories to video categories
  const mappedHeaderCategories = useMemo(() => {
    if (headerCategories.length === 0) return [];
    
    const mapped = new Set<VideoCategory>();
    headerCategories.forEach(headerCat => {
      const videoCats = headerCategoryMapping[headerCat];
      if (videoCats) {
        videoCats.forEach(cat => mapped.add(cat));
      }
    });
    return Array.from(mapped);
  }, [headerCategories]);

  // Parse video duration from "MM:SS" to seconds
  const parseDuration = useCallback((durationStr: string): number => {
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return minutes * 60 + seconds;
  }, []);

  // Filter by duration
  const filterByDuration = useCallback((video: VideoItem): boolean => {
    if (selectedDurations.length === 0) return true;
    
    const durationInSeconds = parseDuration(video.duration);
    
    return selectedDurations.some(duration => {
      switch (duration) {
        case 'Teaser': return durationInSeconds <= 60;
        case 'Trailer': return durationInSeconds > 60 && durationInSeconds <= 180;
        case 'Gimbel': return durationInSeconds > 180 && durationInSeconds <= 300;
        case 'Document': return durationInSeconds > 300;
        default: return true;
      }
    });
  }, [selectedDurations, parseDuration]);

  // Memoized filtered and sorted videos
  const filteredVideos = useMemo(() => {
    return videos
      .filter(video => {
        // Combine sidebar categories and header categories
        const hasNoFilters = selectedCategories.length === 0 && mappedHeaderCategories.length === 0;
        if (hasNoFilters) return true;
        
        const matchesSidebarCategory = selectedCategories.length === 0 || selectedCategories.includes(video.category);
        const matchesHeaderCategory = mappedHeaderCategories.length === 0 || mappedHeaderCategories.includes(video.category);
        
        return matchesSidebarCategory && matchesHeaderCategory;
      })
      .filter(filterByDuration)
      .filter(video => {
        if (selectedAspectRatios.length === 0) return true;
        const selectedOrientations = selectedAspectRatios.map(ratio => 
          aspectRatioFilters.find(f => f.value === ratio)?.category
        );
        return selectedOrientations.includes(video.orientation);
      })
      .filter(video => {
        if (selectedPriceRanges.length === 0) return true;
        const price = parseFloat(video.price.replace('$', ''));
        return selectedPriceRanges.some(range => {
          const [min, max] = priceRangeFilters.find(f => f.value === range)!.range;
          return price >= min && price < max;
        });
      })
      .filter(video => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        return video.title.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
          case 'price-high':
            return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
          case 'popular':
            return b.trending ? 1 : -1;
          case 'newest':
          default:
            return b.id - a.id;
        }
      });
  }, [videos, selectedCategories, mappedHeaderCategories, selectedDurations, selectedAspectRatios, selectedPriceRanges, searchQuery, sortBy, filterByDuration]);

  // Toggle handlers
  const handleCategoryToggle = useCallback((category: VideoCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  }, []);

  const handleDurationToggle = useCallback((duration: DurationFilter) => {
    setSelectedDurations(prev => 
      prev.includes(duration) ? prev.filter(d => d !== duration) : [...prev, duration]
    );
  }, []);

  const handleAspectRatioToggle = useCallback((ratio: AspectRatioFilter) => {
    setSelectedAspectRatios(prev => 
      prev.includes(ratio) ? prev.filter(r => r !== ratio) : [...prev, ratio]
    );
  }, []);

  const handlePriceRangeToggle = useCallback((priceRange: PriceRangeFilter) => {
    setSelectedPriceRanges(prev => 
      prev.includes(priceRange) ? prev.filter(p => p !== priceRange) : [...prev, priceRange]
    );
  }, []);

  // Select/Clear all handlers
  const handleSelectAllCategories = useCallback((categories: { value: VideoCategory }[]) => {
    setSelectedCategories(categories.filter(cat => cat.value !== 'All').map(cat => cat.value));
  }, []);

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const handleSelectAllDurations = useCallback(() => {
    setSelectedDurations(durationFilters.map(filter => filter.value));
  }, []);

  const handleClearDurations = useCallback(() => {
    setSelectedDurations([]);
  }, []);

  const handleSelectAllAspectRatios = useCallback(() => {
    setSelectedAspectRatios(aspectRatioFilters.map(r => r.value));
  }, []);

  const handleClearAspectRatios = useCallback(() => {
    setSelectedAspectRatios([]);
  }, []);

  const handleSelectAllPriceRanges = useCallback(() => {
    setSelectedPriceRanges(priceRangeFilters.map(p => p.value));
  }, []);

  const handleClearPriceRanges = useCallback(() => {
    setSelectedPriceRanges([]);
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedDurations([]);
    setSelectedAspectRatios([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
    toast.success('All filters cleared');
  }, []);

  const hasActiveFilters = selectedCategories.length > 0 || 
    selectedDurations.length > 0 || 
    selectedAspectRatios.length > 0 || 
    selectedPriceRanges.length > 0 || 
    searchQuery !== '';

  return {
    // State
    selectedCategories,
    selectedDurations,
    selectedAspectRatios,
    selectedPriceRanges,
    searchQuery,
    sortBy,
    filteredVideos,
    hasActiveFilters,
    // Setters
    setSearchQuery,
    setSortBy,
    // Toggle handlers
    handleCategoryToggle,
    handleDurationToggle,
    handleAspectRatioToggle,
    handlePriceRangeToggle,
    // Bulk handlers
    handleSelectAllCategories,
    handleClearCategories,
    handleSelectAllDurations,
    handleClearDurations,
    handleSelectAllAspectRatios,
    handleClearAspectRatios,
    handleSelectAllPriceRanges,
    handleClearPriceRanges,
    handleResetFilters,
  };
};
