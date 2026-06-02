import { Button } from "./button";
import { cn } from "./utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "gradient" | "glow" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export function AnimatedButton({ 
  loading, 
  variant = "default", 
  size = "default",
  children, 
  className, 
  disabled,
  ...props 
}: AnimatedButtonProps) {
  const variants = {
    default: "",
    gradient: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0",
    glow: "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all duration-300",
    outline: "border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white transition-all duration-300"
  };

  return (
    <Button
      size={size}
      className={cn(
        "relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95",
        variants[variant],
        (loading || disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>
        {children}
      </span>
    </Button>
  );
}
