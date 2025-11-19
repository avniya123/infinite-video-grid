import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  isLoading: boolean;
}

interface CurrentVideo {
  url: string;
  title: string;
  thumbnail: string;
  id?: string;
}

export const useVideoPlayer = (initialVideo?: CurrentVideo) => {
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(initialVideo || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };

    const handleLoadStart = () => setIsVideoLoading(true);
    const handleCanPlay = () => setIsVideoLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [currentVideo]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const playVideo = (video: CurrentVideo) => {
    setCurrentVideo(video);
    setProgress(0);
    toast.success(`Now playing: ${video.title}`);
    
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  return {
    videoRef,
    currentVideo,
    isPlaying,
    isMuted,
    progress,
    isVideoLoading,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
    playVideo,
    setCurrentVideo,
  };
};
