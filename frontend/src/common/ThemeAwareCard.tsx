import { Card } from "./ui/card";
import { cn } from "./ui/utils";

interface ThemeAwareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ThemeAwareCard({ children, className, ...props }: ThemeAwareCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        "dark:shadow-xl dark:shadow-black/20",
        "hover:shadow-lg dark:hover:shadow-2xl",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  );
}
