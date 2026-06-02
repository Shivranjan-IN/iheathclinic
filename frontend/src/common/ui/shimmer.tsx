import { cn } from "./utils";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className, children, ...props }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ShimmerButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 p-0.5 transition-all duration-300 hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      <span className="relative block rounded-md bg-background px-4 py-2 text-sm font-medium transition-all duration-300 group-hover:bg-transparent group-hover:text-foreground">
        {children}
      </span>
    </button>
  );
}
