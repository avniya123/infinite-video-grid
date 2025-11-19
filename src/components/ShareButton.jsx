import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';

export function ShareButton({ video, variant = 'ghost', size = 'icon' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate shareable URL (using current domain + video ID)
  const shareUrl = `${window.location.origin}/?video=${video.id}`;
  const shareText = `Check out this amazing video: ${video.title}`;

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
    toast.success('Opening Twitter...');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
    toast.success('Opening Facebook...');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
    setIsOpen(false);
    toast.success('Opening LinkedIn...');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="transition-all duration-200 hover:scale-110"
          aria-label="Share video"
        >
          <Share2 className="h-4 w-4" />
          {size === 'sm' && <span className="ml-2">Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start gap-3 h-10"
            onClick={handleShareTwitter}
          >
            <Twitter className="h-4 w-4" />
            <span>Share on Twitter</span>
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start gap-3 h-10"
            onClick={handleShareFacebook}
          >
            <Facebook className="h-4 w-4" />
            <span>Share on Facebook</span>
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start gap-3 h-10"
            onClick={handleShareLinkedIn}
          >
            <Linkedin className="h-4 w-4" />
            <span>Share on LinkedIn</span>
          </Button>
          
          <div className="h-px bg-border my-1" />
          
          <Button
            variant="ghost"
            className="justify-start gap-3 h-10"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Link Copied!</span>
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
