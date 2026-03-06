import { useTheme } from "@/hooks/useTheme";
import trackIconLight from "@/assets/track-icon-light.svg";
import trackIconDark from "@/assets/track-icon-dark.svg";
import trackIconBlue from "@/assets/track-icon-blue.svg";

interface TrackIconProps {
  className?: string;
  variant?: "default" | "primary";
}

const TrackIcon = ({ className = "w-5 h-5", variant = "default" }: TrackIconProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getIcon = () => {
    if (variant === "primary") return trackIconBlue;
    return isDark ? trackIconLight : trackIconDark;
  };

  return (
    <img 
      src={getIcon()} 
      alt="Track" 
      className={`${className} opacity-[0.5] group-hover:opacity-100 transition-opacity duration-200`}
    />
  );
};

export default TrackIcon;
