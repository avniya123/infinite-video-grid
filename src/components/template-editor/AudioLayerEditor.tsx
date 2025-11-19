import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Upload, Music } from "lucide-react";
import { toast } from "sonner";

interface AudioLayerEditorProps {
  layer: any;
}

export const AudioLayerEditor = ({ layer }: AudioLayerEditorProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [lockHandles, setLockHandles] = useState(false);
  const [outputFormat, setOutputFormat] = useState("mp3");

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAudioFile(e.target.files[0]);
      toast.success("Audio uploaded");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Music className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Audio Information</h3>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">My Upload</TabsTrigger>
          <TabsTrigger value="assets">My Assets</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6 mt-6">
          {/* Audio Upload */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Audio</Label>
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-file"
              />
              <label htmlFor="audio-file" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Upload Audio</p>
                {audioFile && (
                  <p className="text-xs text-primary mt-2">{audioFile.name}</p>
                )}
              </label>
            </div>
          </div>

          {/* Audio Trimmer */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="font-semibold">Audio Trimmer</h4>
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>00:00</span>
                <span>00:00</span>
              </div>
              
              {!audioFile && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No audio loaded
                </div>
              )}
              
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
                <Label htmlFor="lock-audio-handles">Lock Handles</Label>
                <Switch
                  id="lock-audio-handles"
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
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                  <SelectItem value="aac">AAC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline">Preview</Button>
            <Button>Save Replacement</Button>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Your asset library is empty</p>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gallery coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
