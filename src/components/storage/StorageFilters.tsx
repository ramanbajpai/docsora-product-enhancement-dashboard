import { motion } from "framer-motion";
import { Grid3X3, List, FileText, FileImage, Video, File } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "pdf" | "docx" | "image" | "video";
type ViewMode = "grid" | "list";

interface StorageFiltersProps {
  filterType: FilterType;
  onFilterChange: (type: FilterType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const filters: { type: FilterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: "all", label: "All Files", icon: File },
  { type: "pdf", label: "PDF", icon: FileText },
  { type: "docx", label: "Documents", icon: FileText },
  { type: "image", label: "Images", icon: FileImage },
  { type: "video", label: "Videos", icon: Video },
];

const StorageFilters = ({
  filterType,
  onFilterChange,
  viewMode,
  onViewModeChange
}: StorageFiltersProps) => {
  return (
    <div className="flex items-center justify-between">
      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        {filters.map((filter) => {
          const isActive = filterType === filter.type;
          return (
            <motion.button
              key={filter.type}
              onClick={() => onFilterChange(filter.type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface-3"
              )}
            >
              <filter.icon className="w-3.5 h-3.5" />
              <span>{filter.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-lg">
        <button
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "p-2 rounded-md transition-all duration-200",
            viewMode === "grid"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-2 rounded-md transition-all duration-200",
            viewMode === "list"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default StorageFilters;
