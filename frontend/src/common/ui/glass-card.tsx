import { Card } from "./card";
import { cn } from "./utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "subtle" | "strong";
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
  const variants = {
    default: "bg-white/10 backdrop-blur-md border-white/20",
    subtle: "bg-white/5 backdrop-blur-sm border-white/10",
    strong: "bg-white/20 backdrop-blur-lg border-white/30"
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-2xl hover:shadow-black/10",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}
