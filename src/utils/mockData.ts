import { VideoItem, VideoResolution, MainCategory } from '@/types/video';

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

// Sample video URLs from public CDN (using Big Buck Bunny samples)
const sampleVideoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];

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

// Video categories mapping
const videoCategories = [
  'Urban',      // Aerial City
  'Business',   // Professional Business Woman
  'Nature',     // Ocean Waves
  'Lifestyle',  // Hot Air Balloons
  'Nature',     // Mountain Landscape
  'Business',   // Typing on Laptop
  'Urban',      // Traffic Light Trails
  'Lifestyle',  // Vegetables and Fruits
  'Urban',      // Modern Architecture
  'Nature',     // Wildlife
  'Lifestyle',  // Fitness Training
  'Lifestyle',  // Food Preparation
  'Business',   // Technology
  'Nature',     // Travel Adventure
  'Lifestyle',  // Family Lifestyle
  'Business',   // Creative Art
] as const;

// Video resolutions mapping
const videoResolutions: VideoResolution[] = [
  '4K', 'HD', '8K', '4K', 'HD', '4K', '8K', 'HD',
  '4K', 'HD', '4K', '8K', 'HD', '4K', 'HD', '8K'
];

// Main categories and subcategories mapping
const mainCategoriesData: { mainCategory: MainCategory; subcategory: string }[] = [
  { mainCategory: 'Personal Celebrations', subcategory: 'Birthday' },
  { mainCategory: 'Personal Celebrations', subcategory: 'Engagement' },
  { mainCategory: 'Personal Celebrations', subcategory: 'Anniversary' },
  { mainCategory: 'Personal Celebrations', subcategory: 'Wedding' },
  { mainCategory: 'Festival Celebrations', subcategory: 'Diwali' },
  { mainCategory: 'Festival Celebrations', subcategory: 'Christmas' },
  { mainCategory: 'Festival Celebrations', subcategory: 'Eid' },
  { mainCategory: 'Festival Celebrations', subcategory: 'New Year' },
  { mainCategory: 'National & Public Holidays', subcategory: 'Independence Day' },
  { mainCategory: 'Corporate & Office', subcategory: 'Team Building' },
  { mainCategory: 'Corporate & Office', subcategory: 'Office Party' },
  { mainCategory: 'Entertainment & Showbiz', subcategory: 'Concert' },
  { mainCategory: 'Sports & Competition', subcategory: 'Cricket' },
  { mainCategory: 'Environmental & Nature', subcategory: 'Earth Day' },
  { mainCategory: 'Corporate Events', subcategory: 'AGM' },
  { mainCategory: 'Marketing & Advertising', subcategory: 'Campaign Launch' },
];

export function generateMockVideos(page: number, pageSize: number): { items: VideoItem[]; total: number } {
  const start = (page - 1) * pageSize;
  
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
    const categoryData = mainCategoriesData[(id - 1) % mainCategoriesData.length];
    
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
      videoUrl: sampleVideoUrls[thumbnailIndex],
      aspectRatio: (['Landscape', 'Portrait', 'Square'] as const)[id % 3] === 'Landscape' ? 16/9 : 
                   (['Landscape', 'Portrait', 'Square'] as const)[id % 3] === 'Portrait' ? 9/16 : 1,
      category: videoCategories[(id - 1) % videoCategories.length],
      resolution: videoResolutions[(id - 1) % videoResolutions.length],
      mainCategory: categoryData.mainCategory,
      subcategory: categoryData.subcategory,
    });
  }
  
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
