// Aspect Ratio Management System
// Supports all major video platform formats

export interface AspectRatioDefinition {
  ratio: number;
  width: number;
  height: number;
  label: string;
  category: 'Landscape' | 'Portrait' | 'Square';
}

// Comprehensive aspect ratio definitions
export const ASPECT_RATIOS: Record<string, AspectRatioDefinition> = {
  // Landscape formats
  '16:9': { ratio: 16/9, width: 16, height: 9, label: 'Landscape 16:9', category: 'Landscape' },
  '21:9': { ratio: 21/9, width: 21, height: 9, label: 'Ultrawide 21:9', category: 'Landscape' },
  '4:3': { ratio: 4/3, width: 4, height: 3, label: 'Standard 4:3', category: 'Landscape' },
  '3:2': { ratio: 3/2, width: 3, height: 2, label: 'Classic 3:2', category: 'Landscape' },
  
  // Portrait formats
  '9:16': { ratio: 9/16, width: 9, height: 16, label: 'Portrait 9:16', category: 'Portrait' },
  '9:21': { ratio: 9/21, width: 9, height: 21, label: 'Tall 9:21', category: 'Portrait' },
  '3:4': { ratio: 3/4, width: 3, height: 4, label: 'Portrait 3:4', category: 'Portrait' },
  '2:3': { ratio: 2/3, width: 2, height: 3, label: 'Portrait 2:3', category: 'Portrait' },
  
  // Square format
  '1:1': { ratio: 1, width: 1, height: 1, label: 'Square 1:1', category: 'Square' },
};

/**
 * Parse aspect ratio from various string formats
 * Supports formats like "16:9", "Landscape 16:9", "Portrait 9:16", etc.
 */
export function parseAspectRatio(input: string): AspectRatioDefinition | null {
  // Direct match in ASPECT_RATIOS
  const directMatch = Object.keys(ASPECT_RATIOS).find(key => 
    input.includes(key)
  );
  
  if (directMatch) {
    return ASPECT_RATIOS[directMatch];
  }
  
  // Try to extract ratio pattern (e.g., "9:16" from title)
  const ratioMatch = input.match(/(\d+):(\d+)/);
  if (ratioMatch) {
    const width = parseInt(ratioMatch[1]);
    const height = parseInt(ratioMatch[2]);
    const key = `${width}:${height}`;
    
    if (ASPECT_RATIOS[key]) {
      return ASPECT_RATIOS[key];
    }
    
    // If not in predefined list, create a custom one
    const ratio = width / height;
    let category: 'Landscape' | 'Portrait' | 'Square';
    
    if (ratio > 1) category = 'Landscape';
    else if (ratio < 1) category = 'Portrait';
    else category = 'Square';
    
    return {
      ratio,
      width,
      height,
      label: `${category} ${width}:${height}`,
      category
    };
  }
  
  return null;
}

/**
 * Get aspect ratio from video metadata
 * Priority: explicit aspectRatio > title parsing > orientation fallback
 */
export function getVideoAspectRatio(
  video: {
    aspectRatio?: number | string;
    title?: string;
    orientation?: string;
  }
): AspectRatioDefinition {
  // Priority 1: Explicit aspect ratio number
  if (typeof video.aspectRatio === 'number') {
    // Find closest match
    const targetRatio = video.aspectRatio;
    const closest = Object.values(ASPECT_RATIOS).reduce((prev, curr) => {
      return Math.abs(curr.ratio - targetRatio) < Math.abs(prev.ratio - targetRatio) 
        ? curr 
        : prev;
    });
    return closest;
  }
  
  // Priority 2: Explicit aspect ratio string
  if (typeof video.aspectRatio === 'string') {
    const parsed = parseAspectRatio(video.aspectRatio);
    if (parsed) return parsed;
  }
  
  // Priority 3: Parse from title
  if (video.title) {
    const parsed = parseAspectRatio(video.title);
    if (parsed) return parsed;
  }
  
  // Priority 4: Fallback to orientation
  switch (video.orientation) {
    case 'Landscape':
      return ASPECT_RATIOS['16:9'];
    case 'Portrait':
      return ASPECT_RATIOS['9:16'];
    case 'Square':
      return ASPECT_RATIOS['1:1'];
    default:
      return ASPECT_RATIOS['16:9'];
  }
}

/**
 * Format aspect ratio for display
 */
export function formatAspectRatio(aspectRatio: AspectRatioDefinition): string {
  return `${aspectRatio.width}:${aspectRatio.height}`;
}

/**
 * Get all aspect ratios by category
 */
export function getAspectRatiosByCategory() {
  const categories = {
    Landscape: [] as AspectRatioDefinition[],
    Portrait: [] as AspectRatioDefinition[],
    Square: [] as AspectRatioDefinition[],
  };
  
  Object.values(ASPECT_RATIOS).forEach(ar => {
    categories[ar.category].push(ar);
  });
  
  return categories;
}
