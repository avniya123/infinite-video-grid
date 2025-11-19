export type VideoCategory = 'All' | 'Nature' | 'Business' | 'Urban' | 'Lifestyle';
export type VideoResolution = 'HD' | '4K' | '8K';

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
}
