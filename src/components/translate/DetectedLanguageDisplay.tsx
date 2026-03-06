import { Globe } from "lucide-react";

interface Language {
  code: string;
  name: string;
}

const allLanguages: Language[] = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "nl", name: "Dutch" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "es", name: "Spanish" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "cs", name: "Czech" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "no", name: "Norwegian" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "ro", name: "Romanian" },
  { code: "hu", name: "Hungarian" },
];

interface DetectedLanguageDisplayProps {
  detectedLanguage: string | null;
  isDetecting?: boolean;
}

export const DetectedLanguageDisplay = ({
  detectedLanguage,
  isDetecting = false,
}: DetectedLanguageDisplayProps) => {
  const languageName = detectedLanguage 
    ? allLanguages.find(l => l.code === detectedLanguage)?.name || detectedLanguage
    : null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 min-w-[180px] bg-muted/50 border border-border rounded-lg">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {isDetecting ? (
          "Detecting..."
        ) : languageName ? (
          <>Detected: <span className="text-foreground">{languageName}</span></>
        ) : (
          "Auto-detect"
        )}
      </span>
    </div>
  );
};
