import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type } from "lucide-react";
import { toast } from "sonner";

interface TextLayerEditorProps {
  layer: any;
}

export const TextLayerEditor = ({ layer }: TextLayerEditorProps) => {
  const [inputLanguage, setInputLanguage] = useState("english");
  const [outputLanguage, setOutputLanguage] = useState("spanish");
  const [inputText, setInputText] = useState("");
  const [fontFamily, setFontFamily] = useState("Open Sans");
  const [fontSize, setFontSize] = useState("16");
  const [textColor, setTextColor] = useState("#000000");

  const handleSave = () => {
    toast.success("Text layer saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Type className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Text Information</h3>
      </div>

      <div className="space-y-6">
        {/* Language Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Input Language</Label>
            <Select value={inputLanguage} onValueChange={setInputLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="portuguese">Portuguese</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Output Language</Label>
            <Select value={outputLanguage} onValueChange={setOutputLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="portuguese">Portuguese</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="min-h-[120px]"
          />
        </div>

        {/* Font Settings */}
        <div className="grid md:grid-cols-3 gap-4 border-t pt-6">
          <div className="space-y-2">
            <Label>Select Font</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <div className="flex gap-2">
              <Input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                min="8"
                max="72"
              />
              <span className="flex items-center text-sm text-muted-foreground">px</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-10 w-full"
              />
              <Input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t pt-6">
          <Label className="mb-3 block">Text Preview</Label>
          <div 
            className="border rounded-lg p-6 bg-muted/30 min-h-[100px]"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              color: textColor,
            }}
          >
            {inputText || "Your text will appear here..."}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline">Reset</Button>
          <Button onClick={handleSave}>Save Text</Button>
        </div>
      </div>
    </div>
  );
};
