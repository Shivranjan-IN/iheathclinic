import { Button } from "./button";
import { cn } from "./utils";
import { Phone, MessageCircle, Video } from "lucide-react";

interface FloatingActionButtonProps {
  className?: string;
  position?: "bottom-right" | "bottom-left";
  variant?: "default" | "primary" | "secondary";
  onClick?: () => void;
}

export function FloatingActionButton({ 
  className, 
  position = "bottom-right", 
  variant = "primary",
  onClick 
}: FloatingActionButtonProps) {
  const positions = {
    "bottom-right": "fixed bottom-8 right-8",
    "bottom-left": "fixed bottom-8 left-8"
  };

  const variants = {
    default: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl",
    primary: "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white text-pink-600 shadow-lg hover:shadow-xl border border-pink-200"
  };

  return (
    <Button
      size="lg"
      className={cn(
        "rounded-full w-16 h-16 p-0 transition-all duration-300 transform hover:scale-110 active:scale-95 animate-pulse-glow",
        positions[position],
        variants[variant],
        className
      )}
      onClick={onClick}
    >
      <Phone className="w-6 h-6" />
    </Button>
  );
}

export function QuickActions({ className }: { className?: string }) {
  return (
    <div className={cn("fixed bottom-8 right-8 flex flex-col gap-3", className)}>
      <Button
        size="lg"
        className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <Video className="w-5 h-5" />
      </Button>
      <Button
        size="lg"
        className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
      <Button
        size="lg"
        className="rounded-full w-14 h-14 p-0 bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <Phone className="w-5 h-5" />
      </Button>
    </div>
  );
}
