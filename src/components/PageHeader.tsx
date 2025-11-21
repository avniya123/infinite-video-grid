import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  count?: number;
  description: string;
  backLabel: string;
  backPath: string;
}

export const PageHeader = ({
  icon: Icon,
  title,
  count,
  description,
  backLabel,
  backPath,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-wide leading-tight">
            {title} {count !== undefined && count > 0 && `(${count})`}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 tracking-wide">
            {description}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        onClick={() => navigate(backPath)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Button>
    </div>
  );
};
