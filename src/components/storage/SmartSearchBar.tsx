import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, User, Clock, Sparkles, X, Command, Tag, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  allTags?: string[];
  tagCounts?: Record<string, number>;
  activeTagFilters?: string[];
  onAddTagFilter?: (tag: string) => void;
  onRemoveTagFilter?: (tag: string) => void;
  onClearAllFilters?: () => void;
}

interface SearchSuggestion {
  type: "file" | "content" | "person" | "status" | "recent";
  label: string;
  icon: React.ReactNode;
}

const recentSearches = [
  "Signed contracts",
  "Estelle Darcy",
  "pending approval",
];

const SmartSearchBar = ({ 
  value, 
  onChange, 
  onFocus,
  allTags = [],
  tagCounts = {},
  activeTagFilters = [],
  onAddTagFilter,
  onRemoveTagFilter,
  onClearAllFilters
}: SmartSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tags based on search query in dropdown
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return allTags;
    return allTags.filter(tag => 
      tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
    );
  }, [allTags, tagSearchQuery]);

  // Sort tags: selected first, then alphabetically
  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => {
      const aSelected = activeTagFilters.includes(a);
      const bSelected = activeTagFilters.includes(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.localeCompare(b);
    });
  }, [filteredTags, activeTagFilters]);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleTagToggle = (tag: string) => {
    if (activeTagFilters.includes(tag)) {
      onRemoveTagFilter?.(tag);
    } else {
      onAddTagFilter?.(tag);
    }
  };

  const suggestions: SearchSuggestion[] = [
    { type: "content", label: "show all resumes", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { type: "content", label: "documents related to hiring", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { type: "status", label: "contracts pending", icon: <Clock className="w-3.5 h-3.5" /> },
    { type: "person", label: "edited by Sarah", icon: <User className="w-3.5 h-3.5" /> },
    { type: "content", label: "marketing materials", icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full max-w-3xl space-y-2">
      {/* Search row with Tag filter button */}
      <div className="flex items-center gap-2">
        {/* Main search bar */}
        <div ref={containerRef} className="relative flex-1">
          <motion.div
            animate={{ 
              scale: isFocused ? 1.01 : 1,
              boxShadow: isFocused 
                ? "0 8px 32px -8px hsl(var(--primary) / 0.15)" 
                : "0 2px 8px -2px hsl(var(--foreground) / 0.05)"
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-2xl",
              "bg-surface-2/80 backdrop-blur-sm border transition-all duration-200",
              isFocused 
                ? "border-primary/30 bg-background" 
                : "border-border/50 hover:border-border"
            )}
          >
            <Search className={cn(
              "w-5 h-5 shrink-0 transition-colors duration-200",
              isFocused ? "text-primary" : "text-muted-foreground"
            )} />
            
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search files or try: 'show all resumes', 'hiring documents'…"
              className={cn(
                "flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60",
                "focus:outline-none"
              )}
            />

            {value && (
              <button
                onClick={handleClear}
                className="p-1 rounded-md hover:bg-surface-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground/60">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 font-mono text-[10px]">
                <Command className="w-2.5 h-2.5 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 font-mono text-[10px]">K</kbd>
            </div>
          </motion.div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && !value && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-lg shadow-black/10 overflow-hidden z-50"
              >
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="p-3">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Recent
                    </p>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left hover:bg-surface-2 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-foreground">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 border-t border-border/30">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.label)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {suggestion.icon}
                        <span>{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tags filter button */}
        <Popover open={tagDropdownOpen} onOpenChange={setTagDropdownOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200",
                "bg-surface-2/80 backdrop-blur-sm hover:bg-surface-2",
                activeTagFilters.length > 0
                  ? "border-primary/30 text-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">Tags</span>
              {activeTagFilters.length > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {activeTagFilters.length}
                </span>
              )}
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                tagDropdownOpen && "rotate-180"
              )} />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-72 p-0 bg-card border border-border shadow-xl z-50" 
            align="end"
            sideOffset={8}
          >
            {/* Tag search input */}
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  placeholder="Search tags…"
                  className="h-9 pl-9 text-sm bg-surface-2/50"
                />
              </div>
            </div>

            {/* Tags list */}
            <ScrollArea className="max-h-64">
              {sortedTags.length > 0 ? (
                <div className="p-2">
                  {sortedTags.map((tag) => {
                    const isSelected = activeTagFilters.includes(tag);
                    const count = tagCounts[tag] || 0;
                    
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          isSelected 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-surface-2 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            isSelected 
                              ? "bg-primary border-primary" 
                              : "border-border bg-background"
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className="truncate">{tag}</span>
                        </div>
                        {count > 0 && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {tagSearchQuery ? "No matching tags" : "No tags yet"}
                </div>
              )}
            </ScrollArea>

            {/* Clear selection footer */}
            {activeTagFilters.length > 0 && (
              <div className="p-2 border-t border-border/50">
                <button
                  onClick={() => {
                    onClearAllFilters?.();
                    setTagDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors text-center"
                >
                  Clear selection
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Active tag filter chips */}
      <AnimatePresence>
        {activeTagFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap overflow-hidden"
          >
            {activeTagFilters.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {tag}
                <button
                  onClick={() => onRemoveTagFilter?.(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            <button
              onClick={onClearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;