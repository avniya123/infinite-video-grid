import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

interface VideoLayerEditorProps {
  layer: any;
}

export const VideoLayerEditor = ({ layer }: VideoLayerEditorProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [lockHandles, setLockHandles] = useState(false);
  const [outputFormat, setOutputFormat] = useState("webm");
  const [quality, setQuality] = useState("360p");

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
      toast.success("Video uploaded");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <VideoIcon className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Video Information</h3>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">My Upload</TabsTrigger>
          <TabsTrigger value="assets">My Assets</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6 mt-6">
          {/* Video Upload */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Video</Label>
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-file"
              />
              <label htmlFor="video-file" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload Video</p>
                {videoFile && (
                  <p className="text-xs text-primary mt-2">{videoFile.name}</p>
                )}
              </label>
            </div>
          </div>

          {/* Video Trimmer */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="font-semibold">Video Trimmer</h4>
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>00:00</span>
                <span>00:00</span>
              </div>
              <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-xs">Start</Label>
                  <Input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="00:00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">End</Label>
                  <Input
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="00:00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="00:00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Trim Duration (s)</Label>
                <Input type="number" placeholder="0" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lock-handles">Lock Handles</Label>
                <Switch
                  id="lock-handles"
                  checked={lockHandles}
                  onCheckedChange={setLockHandles}
                />
              </div>
            </div>
          </div>

          {/* Output Settings */}
          <div className="space-y-4 border-t pt-6">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="avi">AVI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Video Size Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="360p">Low (360p)</SelectItem>
                  <SelectItem value="720p">Medium (720p)</SelectItem>
                  <SelectItem value="1080p">High (1080p)</SelectItem>
                  <SelectItem value="4k">Ultra (4K)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">Preview</Button>
            <Button>Save Video</Button>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your asset library is empty</p>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gallery coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
