import { VideoItem } from '@/types/video';

const TOTAL_MOCK_ITEMS = 32;

function generatePlaceholderImage(id: number): string {
  const heights = [300, 400, 350, 450, 380, 420, 340, 460];
  const h = heights[id % heights.length];
  const colors = ['#fef3c7', '#ddd6fe', '#fecaca', '#bfdbfe', '#d1fae5', '#fed7aa'];
  const color = colors[id % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${h}">
    <defs>
      <linearGradient id="grad${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad${id})"/>
    <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="#374151" font-weight="600">Video ${id}</text>
  </svg>`;
  
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

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
    
    items.push({
      id,
      title: `Professional Video Clip #${id} - High Quality Stock Footage`,
      duration: `${String(Math.floor(id % 5) + 1).padStart(2, '0')}:${String((id * 7) % 60).padStart(2, '0')}`,
      price: basePrice.toFixed(2),
      mrp: baseMrp.toFixed(2),
      discount: `${discountPercent}% OFF`,
      orientation: (['Landscape', 'Portrait', 'Square'] as const)[id % 3],
      trending: id % 7 === 0,
      image: generatePlaceholderImage(id),
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
