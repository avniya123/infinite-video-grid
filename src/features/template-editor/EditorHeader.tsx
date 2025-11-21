import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { toast } from "sonner";

interface EditorHeaderProps {
  title?: string;
}

export const EditorHeader = ({ title = "Template Editor" }: EditorHeaderProps) => {
  const navigate = useNavigate();

  const handlePreview = () => {
    toast.success("Opening preview...");
  };

  const handleSave = () => {
    toast.success("Template saved successfully!");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/videos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold tracking-wide leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>
    </header>
  );
};
