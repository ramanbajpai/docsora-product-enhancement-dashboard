import { useTheme } from "@/hooks/useTheme";
import aiCheckIconLight from "@/assets/ai-check-icon-light.svg";
import aiCheckIconDark from "@/assets/ai-check-icon-dark.svg";
import aiCheckIconBlue from "@/assets/ai-check-icon-blue.svg";

interface AICheckIconProps {
  className?: string;
  variant?: "default" | "primary";
}

export const AICheckIcon = ({ className = "w-5 h-5", variant = "default" }: AICheckIconProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getIcon = () => {
    if (variant === "primary") return aiCheckIconBlue;
    return isDark ? aiCheckIconLight : aiCheckIconDark;
  };

  return (
    <img 
      src={getIcon()} 
      alt="AI Check" 
      className={`${className} opacity-[0.5] group-hover:opacity-100 transition-opacity duration-200`}
    />
  );
};

export default AICheckIcon;
