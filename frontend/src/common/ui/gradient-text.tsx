import { cn } from "./utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
  via?: string;
}

export function GradientText({ 
  children, 
  className, 
  from = "from-pink-600", 
  to = "to-purple-600", 
  via = "via-purple-500" 
}: GradientTextProps) {
  return (
    <span 
      className={cn(
        `bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent`,
        className
      )}
    >
      {children}
    </span>
  );
}
