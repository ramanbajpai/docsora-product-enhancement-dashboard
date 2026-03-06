import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { DetectedLanguageDisplay } from "./DetectedLanguageDisplay";
import { TranslationResult } from "@/pages/Translate";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TranslateTextModeProps {
  onTranslate: (result: TranslationResult) => void;
  onStartTranslating: () => void;
}

export const TranslateTextMode = ({
  onTranslate,
  onStartTranslating,
}: TranslateTextModeProps) => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGlow, setShowGlow] = useState(true);

  // Stop animated glow after 8 seconds, keep static glow until target selected
  useEffect(() => {
    if (targetLanguage) {
      setShowGlow(false);
      return;
    }
    setShowGlow(true);
    const timer = setTimeout(() => {
      // After 8s, glow remains but without animation
    }, 8000);
    return () => clearTimeout(timer);
  }, [targetLanguage]);

  // Simple language detection simulation
  const detectLanguage = useCallback((text: string) => {
    if (!text.trim()) {
      setDetectedLanguage(null);
      return;
    }
    // Simulate detection - in production this would call an API
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
    const hasKorean = /[\uac00-\ud7af]/.test(text);
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    const hasHebrew = /[\u0590-\u05FF]/.test(text);
    const hasThai = /[\u0E00-\u0E7F]/.test(text);
    const hasHindi = /[\u0900-\u097F]/.test(text);
    
    if (hasArabic) setDetectedLanguage("ar");
    else if (hasChinese) setDetectedLanguage("zh-CN");
    else if (hasJapanese) setDetectedLanguage("ja");
    else if (hasKorean) setDetectedLanguage("ko");
    else if (hasCyrillic) setDetectedLanguage("ru");
    else if (hasHebrew) setDetectedLanguage("he");
    else if (hasThai) setDetectedLanguage("th");
    else if (hasHindi) setDetectedLanguage("hi");
    else setDetectedLanguage("en");
  }, []);

  const handleSourceTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setSourceText(text);
    detectLanguage(text);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim() || !targetLanguage) {
      toast.error("Please enter text and select a target language");
      return;
    }

    setIsTranslating(true);
    
    // Simulate translation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock translated text
    const mockTranslations: Record<string, string> = {
      ar: "هذا نص مترجم تجريبي. الترجمة الفعلية ستظهر هنا.",
      fr: "Ceci est un exemple de texte traduit. La traduction réelle apparaîtra ici.",
      de: "Dies ist ein Beispiel für übersetzten Text. Die eigentliche Übersetzung wird hier angezeigt.",
      es: "Este es un ejemplo de texto traducido. La traducción real aparecerá aquí.",
      ja: "これは翻訳されたテキストの例です。実際の翻訳はここに表示されます。",
      zh: "这是翻译文本的示例。实际翻译将显示在这里。",
    };

    const translated = mockTranslations[targetLanguage] || 
      `[Translated to ${targetLanguage}] ${sourceText}`;
    
    setTranslatedText(translated);
    setIsTranslating(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAndComplete = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success("Translation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Language Selection Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
          <DetectedLanguageDisplay detectedLanguage={detectedLanguage} />
        </div>
        
        <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">To:</span>
          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
            placeholder="Select target language"
            showHighlight={!targetLanguage && showGlow}
          />
        </div>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={!sourceText.trim() || !targetLanguage ? 0 : -1}>
              <Button
                onClick={handleTranslate}
                disabled={!sourceText.trim() || !targetLanguage || isTranslating}
              >
                {isTranslating ? "Translating..." : "Translate"}
              </Button>
            </span>
          </TooltipTrigger>
          {(!targetLanguage || !sourceText.trim()) && (
            <TooltipContent>
              <p>{!targetLanguage ? "Select a target language first" : "Enter text to translate"}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Side by Side Panels */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Source Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute top-3 left-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Source Text
          </div>
          <textarea
            value={sourceText}
            onChange={handleSourceTextChange}
            placeholder="Type or paste your text here..."
            className="w-full h-[400px] p-4 pt-10 bg-card border border-border rounded-xl 
                     text-foreground placeholder:text-muted-foreground resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
                     transition-all duration-200"
          />
          <div className="absolute bottom-3 left-4 text-xs text-muted-foreground">
            {sourceText.length} characters
          </div>
        </motion.div>

        {/* Target Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute top-3 left-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Translated Text
          </div>
          {translatedText && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          <div
            className={`w-full h-[400px] p-4 pt-10 bg-muted/30 border border-border rounded-xl overflow-auto
                      ${targetLanguage && ["ar", "he"].includes(targetLanguage) ? "text-right" : "text-left"}
                      ${!translatedText ? "flex items-center justify-center" : ""}`}
            dir={targetLanguage && ["ar", "he"].includes(targetLanguage) ? "rtl" : "ltr"}
          >
            {translatedText ? (
              <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
            ) : (
              <p className={`text-sm text-center px-4 ${!targetLanguage ? "text-muted-foreground/80" : "text-muted-foreground"}`}>
                {!targetLanguage 
                  ? "Select a target language above to see your translation."
                  : "Translation will appear here"
                }
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      {translatedText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button onClick={handleCopyAndComplete} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Translation"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
