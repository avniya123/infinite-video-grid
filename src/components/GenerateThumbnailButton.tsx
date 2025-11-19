import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GenerateThumbnailButtonProps {
  variationId: string;
  videoTitle: string;
  variationTitle: string;
  aspectRatio: string;
  onGenerated: (thumbnailUrl: string) => void;
}

export const GenerateThumbnailButton = ({
  variationId,
  videoTitle,
  variationTitle,
  aspectRatio,
  onGenerated,
}: GenerateThumbnailButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const toastId = toast.loading("Generating thumbnail with AI...");

    try {
      const { data, error } = await supabase.functions.invoke('generate-variation-thumbnail', {
        body: {
          variationId,
          videoTitle,
          variationTitle,
          aspectRatio,
        },
      });

      if (error) {
        if (error.message?.includes('credits')) {
          toast.error(error.message, { id: toastId, duration: 6000 });
          return;
        }
        throw error;
      }

      if (data?.thumbnailUrl) {
        toast.success("Thumbnail generated successfully!", { id: toastId });
        onGenerated(data.thumbnailUrl);
      } else {
        throw new Error('No thumbnail URL received');
      }
    } catch (error: any) {
      console.error('Error generating thumbnail:', error);
      const message = error?.message?.includes('credits') 
        ? error.message 
        : "Failed to generate thumbnail. Please try again.";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="gap-1.5"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {isGenerating ? "Generating..." : "Generate"}
    </Button>
  );
};
