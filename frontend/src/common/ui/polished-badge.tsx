import { Badge } from "./badge";
import { cn } from "./utils";
import { Sparkles } from "lucide-react";

interface PolishedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "shimmer" | "glow" | "gradient";
  animated?: boolean;
}

export function PolishedBadge({ 
  children, 
  className, 
  variant = "default", 
  animated = false,
  ...props 
}: PolishedBadgeProps) {
  const variants = {
    default: "",
    shimmer: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-gradient-shift text-white border-0",
    glow: "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 animate-pulse-glow",
    gradient: "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0"
  };

  return (
    <Badge 
      className={cn(
        "px-4 py-2 font-medium transition-all duration-300",
        variants[variant],
        animated && "animate-scale-in",
        className
      )} 
      {...props}
    >
      {variant === "shimmer" && <Sparkles className="w-3 h-3 mr-1" />}
      {children}
    </Badge>
  );
}
