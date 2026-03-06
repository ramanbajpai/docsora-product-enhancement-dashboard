import { useTheme } from "@/hooks/useTheme";
import compressIconLight from "@/assets/compress-icon-light.svg";
import compressIconDark from "@/assets/compress-icon-dark.svg";
import compressIconBlue from "@/assets/compress-icon-blue.svg";

interface CompressIconProps {
  className?: string;
  variant?: "default" | "primary";
}

const CompressIcon = ({ className = "w-5 h-5", variant = "default" }: CompressIconProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getIcon = () => {
    if (variant === "primary") return compressIconBlue;
    return isDark ? compressIconLight : compressIconDark;
  };

  return (
    <img 
      src={getIcon()} 
      alt="Compress" 
      className={`${className} opacity-[0.5] group-hover:opacity-100 transition-opacity duration-200`}
    />
  );
};

export default CompressIcon;
