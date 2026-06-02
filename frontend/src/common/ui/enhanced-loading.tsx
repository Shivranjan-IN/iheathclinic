import { cn } from "./utils";

interface EnhancedLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function EnhancedLoading({ className, size = "md", text }: EnhancedLoadingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <div className={cn(
        "relative",
        sizes[size]
      )}>
        <div className="absolute inset-0 rounded-full border-2 border-pink-200"></div>
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-pink-600 border-t-transparent animate-spin",
          size === "sm" && "border-t-2",
          size === "md" && "border-t-4", 
          size === "lg" && "border-t-6"
        )}></div>
      </div>
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">{text}</span>
      )}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-6 space-y-4",
      className
    )}>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse delay-100"></div>
      </div>
      <div className="h-20 bg-muted rounded animate-pulse delay-200"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse delay-300"></div>
        <div className="h-8 bg-muted rounded animate-pulse delay-400"></div>
      </div>
    </div>
  );
}
