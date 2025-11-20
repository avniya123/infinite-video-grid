export type VideoCategory = 'All' | 'Nature' | 'Business' | 'Urban' | 'Lifestyle';
export type VideoResolution = 'HD' | '4K' | '8K';
export type MainCategory = 'Personal Celebrations' | 'Festival Celebrations' | 'National & Public Holidays' | 'Corporate & Office' | 'Entertainment & Showbiz' | 'Sports & Competition' | 'Environmental & Nature' | 'Corporate Events' | 'Marketing & Advertising' | 'Professional Services' | 'E-commerce';

export interface VideoItem {
  id: number;
  title: string;
  duration: string;
  price: string;
  mrp: string;
  discount: string;
  orientation: 'Landscape' | 'Portrait' | 'Square';
  trending: boolean;
  image: string;
  videoUrl?: string;
  aspectRatio?: number;
  category: VideoCategory;
  resolution: VideoResolution;
  mainCategory: MainCategory;
  subcategory: string;
  templateId?: string;
  variationId?: string;
}
