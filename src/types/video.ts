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
  aspectRatio?: number;
}
