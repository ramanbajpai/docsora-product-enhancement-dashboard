import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, ChevronDown, Check, Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Language {
  code: string;
  name: string;
  nativeName?: string;
  rtl?: boolean;
}

const allLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية", rtl: true },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "he", name: "Hebrew", nativeName: "עברית", rtl: true },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
];

interface LanguageSelectorProps {
  value: string | null;
  onChange: (code: string) => void;
  placeholder?: string;
  showAutoDetect?: boolean;
  detectedLanguage?: string | null;
  showHighlight?: boolean;
}

export const LanguageSelector = ({
  value,
  onChange,
  placeholder = "Select language",
  showAutoDetect = false,
  detectedLanguage,
  showHighlight = false,
}: LanguageSelectorProps) => {
  const [animateGlow, setAnimateGlow] = useState(true);

  // Stop animation after 8 seconds
  useState(() => {
    if (showHighlight) {
      const timer = setTimeout(() => setAnimateGlow(false), 8000);
      return () => clearTimeout(timer);
    }
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>(["en", "ar", "fr", "de", "es"]);
  const [recent, setRecent] = useState<string[]>(["en", "fr"]);

  const selectedLanguage = allLanguages.find((l) => l.code === value);

  const filteredLanguages = useMemo(() => {
    if (!search) return allLanguages;
    const lower = search.toLowerCase();
    return allLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(lower) ||
        l.nativeName?.toLowerCase().includes(lower) ||
        l.code.toLowerCase().includes(lower)
    );
  }, [search]);

  const favoriteLanguages = allLanguages.filter((l) => favorites.includes(l.code));
  const recentLanguages = allLanguages.filter((l) => recent.includes(l.code) && !favorites.includes(l.code));

  const toggleFavorite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setRecent((prev) => [code, ...prev.filter((c) => c !== code)].slice(0, 5));
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.button
          animate={showHighlight && animateGlow ? {
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0)",
              "0 0 12px 3px hsl(var(--primary) / 0.3)",
              "0 0 0 0 hsl(var(--primary) / 0)",
            ],
          } : {}}
          transition={showHighlight && animateGlow ? {
            duration: 2,
            repeat: 4,
            ease: "easeInOut",
          } : {}}
          className={`
            flex items-center justify-between gap-2 px-3 py-2 min-w-[180px]
            bg-background border rounded-lg
            text-sm transition-all duration-200
            hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/40
            ${open ? "border-primary/50 ring-2 ring-primary/20" : ""}
            ${showHighlight ? "border-primary/50 shadow-[0_0_8px_2px_hsl(var(--primary)/0.2)]" : "border-border"}
          `}
        >
          <span className="flex items-center gap-2">
            {showAutoDetect && !value ? (
              <>
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {detectedLanguage 
                    ? `Detected: ${allLanguages.find(l => l.code === detectedLanguage)?.name || detectedLanguage}`
                    : "Auto-detect"
                  }
                </span>
              </>
            ) : selectedLanguage ? (
              <span className="text-foreground">{selectedLanguage.name}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-muted/50 border-0"
            />
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {showAutoDetect && !search && (
              <button
                onClick={() => handleSelect("")}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>Auto-detect</span>
              </button>
            )}

            {!search && favoriteLanguages.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Favorites
                </div>
                {favoriteLanguages.map((lang) => (
                  <LanguageItem
                    key={lang.code}
                    language={lang}
                    selected={value === lang.code}
                    isFavorite={true}
                    onSelect={() => handleSelect(lang.code)}
                    onToggleFavorite={(e) => toggleFavorite(lang.code, e)}
                  />
                ))}
              </>
            )}

            {!search && recentLanguages.length > 0 && (
              <>
                <div className="px-2 py-1.5 mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
                {recentLanguages.map((lang) => (
                  <LanguageItem
                    key={lang.code}
                    language={lang}
                    selected={value === lang.code}
                    isFavorite={favorites.includes(lang.code)}
                    onSelect={() => handleSelect(lang.code)}
                    onToggleFavorite={(e) => toggleFavorite(lang.code, e)}
                  />
                ))}
              </>
            )}

            <div className="px-2 py-1.5 mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {search ? "Results" : "All Languages"}
            </div>
            {filteredLanguages.map((lang) => (
              <LanguageItem
                key={lang.code}
                language={lang}
                selected={value === lang.code}
                isFavorite={favorites.includes(lang.code)}
                onSelect={() => handleSelect(lang.code)}
                onToggleFavorite={(e) => toggleFavorite(lang.code, e)}
              />
            ))}

            {filteredLanguages.length === 0 && (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No languages found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

interface LanguageItemProps {
  language: Language;
  selected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

const LanguageItem = ({
  language,
  selected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: LanguageItemProps) => {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full flex items-center justify-between px-2 py-2 text-sm rounded-lg transition-colors
        ${selected ? "bg-primary/10 text-primary" : "hover:bg-muted"}
      `}
    >
      <span className="flex items-center gap-2">
        {selected && <Check className="w-4 h-4" />}
        <span className={selected ? "" : "ml-6"}>{language.name}</span>
        {language.nativeName && language.nativeName !== language.name && (
          <span className="text-muted-foreground text-xs">({language.nativeName})</span>
        )}
      </span>
      <button
        onClick={onToggleFavorite}
        className="p-1 hover:bg-background rounded transition-colors"
      >
        <Star
          className={`w-3.5 h-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      </button>
    </button>
  );
};
