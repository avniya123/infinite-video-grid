/**
 * Generate thumbnails from a video at specified intervals
 */
export async function generateVideoThumbnails(
  videoUrl: string,
  count: number = 5
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    const thumbnails: string[] = [];
    let currentThumbnail = 0;
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const interval = duration / (count + 1); // +1 to avoid the very end
      
      const captureFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160; // Thumbnail width
        canvas.height = 90; // Thumbnail height (16:9 ratio)
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        thumbnails.push(dataUrl);
        
        currentThumbnail++;
        
        if (currentThumbnail < count) {
          // Seek to next position
          video.currentTime = interval * (currentThumbnail + 1);
        } else {
          // All thumbnails captured
          resolve(thumbnails);
        }
      };
      
      video.onseeked = captureFrame;
      
      // Start capturing from the first interval
      video.currentTime = interval;
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    video.src = videoUrl;
  });
}

/**
 * Get thumbnail index based on hover position
 */
export function getThumbnailIndexFromPosition(
  position: number,
  totalThumbnails: number
): number {
  return Math.floor(position * totalThumbnails);
}
