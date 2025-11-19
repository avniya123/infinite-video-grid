import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadThumbnailButtonProps {
  variationId: string;
  onUploaded: (thumbnailUrl: string) => void;
}

export const UploadThumbnailButton = ({
  variationId,
  onUploaded,
}: UploadThumbnailButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading thumbnail...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${variationId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('video-thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('video-thumbnails')
        .getPublicUrl(filePath);

      // Update variation record
      const { error: updateError } = await supabase
        .from('video_variations')
        .update({ thumbnail_url: publicUrl })
        .eq('id', variationId);

      if (updateError) throw updateError;

      toast.success("Thumbnail uploaded successfully!", { id: toastId });
      onUploaded(publicUrl);
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast.error(error?.message || "Failed to upload thumbnail", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
        disabled={isUploading}
        className="gap-1.5"
      >
        <Upload className="h-3.5 w-3.5" />
        {isUploading ? "Uploading..." : "Upload"}
      </Button>
    </>
  );
};
