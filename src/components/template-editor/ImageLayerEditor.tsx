import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageLayerEditorProps {
  layer: any;
}

export const ImageLayerEditor = ({ layer }: ImageLayerEditorProps) => {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [replacementImage, setReplacementImage] = useState<File | null>(null);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);
  const [rotation, setRotation] = useState(0);

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSourceImage(e.target.files[0]);
      toast.success("Source image uploaded");
    }
  };

  const handleReplacementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setReplacementImage(e.target.files[0]);
      toast.success("Replacement image uploaded");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Image Information</h3>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">My Upload</TabsTrigger>
          <TabsTrigger value="assets">My Assets</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Source Image */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Source Image</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSourceUpload}
                  className="hidden"
                  id="source-image"
                />
                <label htmlFor="source-image" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload Source Image</p>
                  {sourceImage && (
                    <p className="text-xs text-primary mt-2">{sourceImage.name}</p>
                  )}
                </label>
              </div>
            </div>

            {/* Replacement Image */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Replacement Image</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReplacementUpload}
                  className="hidden"
                  id="replacement-image"
                />
                <label htmlFor="replacement-image" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload Replacement Image</p>
                  {replacementImage && (
                    <p className="text-xs text-primary mt-2">{replacementImage.name}</p>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Transformations */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="font-semibold">Transformations</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="x-position">X Position (px)</Label>
                <Input
                  id="x-position"
                  type="number"
                  value={xPosition}
                  onChange={(e) => setXPosition(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="y-position">Y Position (px)</Label>
                <Input
                  id="y-position"
                  type="number"
                  value={yPosition}
                  onChange={(e) => setYPosition(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rotation">Rotation (degrees)</Label>
                <Input
                  id="rotation"
                  type="number"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">Preview</Button>
            <Button>Save Replacement</Button>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your asset library is empty</p>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gallery coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
