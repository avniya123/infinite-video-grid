import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, List, Columns3, Search, X } from "lucide-react";

type ViewMode = 'masonry' | 'list';

interface VideoControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  columnCount: number;
  onColumnCountChange: (count: number) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
}

export const VideoControls = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  columnCount,
  onColumnCountChange,
  sortBy,
  onSortChange,
  sortOptions,
}: VideoControlsProps) => {
  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "masonry" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("masonry")}
            title="Masonry View"
          >
            <Columns3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[180px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={sortBy === option.value ? "bg-accent" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Column Count Slider (Masonry View Only) */}
      {viewMode === "masonry" && (
        <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-lg min-w-[180px]">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Columns: {columnCount}</span>
          <Slider
            value={[columnCount]}
            onValueChange={(value) => onColumnCountChange(value[0])}
            min={2}
            max={6}
            step={1}
            className="w-24"
          />
        </div>
      )}
    </div>
  );
};
