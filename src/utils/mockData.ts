import { VideoItem } from '@/types/video';

// Import real thumbnail images
import video1 from '@/assets/thumbnails/video-1.jpg';
import video2 from '@/assets/thumbnails/video-2.jpg';
import video3 from '@/assets/thumbnails/video-3.jpg';
import video4 from '@/assets/thumbnails/video-4.jpg';
import video5 from '@/assets/thumbnails/video-5.jpg';
import video6 from '@/assets/thumbnails/video-6.jpg';
import video7 from '@/assets/thumbnails/video-7.jpg';
import video8 from '@/assets/thumbnails/video-8.jpg';

const TOTAL_MOCK_ITEMS = 32;

// Array of real thumbnail images
const thumbnails = [
  video1, video2, video3, video4, video5, video6, video7, video8
];

console.log('MockData loaded, thumbnails:', thumbnails.length, thumbnails[0]);

// Sample video titles matching the thumbnails
const videoTitles = [
  'Aerial City Skyline at Golden Hour',
  'Professional Business Woman Working in Office',
  'Ocean Waves on Tropical Beach at Sunrise',
  'Colorful Hot Air Balloons Floating at Dawn',
  'Majestic Mountain Landscape with Snow Peaks',
  'Hands Typing on Laptop in Cozy Workspace',
  'Urban Traffic Light Trails at Night',
  'Fresh Organic Vegetables and Fruits Display',
  'Modern Architecture and Glass Buildings',
  'Nature Wildlife in Natural Habitat',
  'Fitness Training and Exercise Routine',
  'Food Preparation in Professional Kitchen',
  'Technology and Digital Innovation',
  'Travel Adventure and Exploration',
  'Family Lifestyle and Activities',
  'Creative Art and Design Process',
];

export function generateMockVideos(page: number, pageSize: number): { items: VideoItem[]; total: number } {
  const start = (page - 1) * pageSize;
  console.log('generateMockVideos called:', { page, pageSize, start, thumbnailCount: thumbnails.length });
  
  if (start >= TOTAL_MOCK_ITEMS) {
    return { items: [], total: TOTAL_MOCK_ITEMS };
  }
  
  const itemsToGenerate = Math.min(pageSize, TOTAL_MOCK_ITEMS - start);
  const items: VideoItem[] = [];
  
  for (let i = 0; i < itemsToGenerate; i++) {
    const id = start + i + 1;
    const basePrice = 99 + (id * 3);
    const baseMrp = 149 + (id * 3);
    const discountPercent = Math.floor((1 - (basePrice / baseMrp)) * 100);
    const thumbnailIndex = (id - 1) % thumbnails.length;
    
    items.push({
      id,
      title: videoTitles[(id - 1) % videoTitles.length] + ` - Stock Video #${id}`,
      duration: `${String(Math.floor((id % 5) + 1)).padStart(2, '0')}:${String((id * 7) % 60).padStart(2, '0')}`,
      price: basePrice.toFixed(2),
      mrp: baseMrp.toFixed(2),
      discount: `${discountPercent}% OFF`,
      orientation: (['Landscape', 'Portrait', 'Square'] as const)[id % 3],
      trending: id % 7 === 0,
      image: thumbnails[thumbnailIndex],
      videoUrl: `/videos/sample-video-${id}.mp4`,
    });
  }
  
  console.log('Generated items:', items.length, 'First item image:', items[0]?.image?.substring(0, 50));
  return { items, total: TOTAL_MOCK_ITEMS };
}

export async function fetchVideos(page: number, pageSize: number = 8): Promise<{ items: VideoItem[]; total: number }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 650));
  
  // In production, replace this with actual API call:
  // const response = await fetch(`/api/videos?page=${page}&size=${pageSize}`);
  // return await response.json();
  
  return generateMockVideos(page, pageSize);
}
