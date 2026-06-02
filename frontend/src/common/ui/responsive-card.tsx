import { Card } from "./card";
import { cn } from "./utils";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "compact" | "spacious";
  padding?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
}

export function ResponsiveCard({ 
  children, 
  className, 
  variant = "default",
  padding = { default: "p-4", sm: "p-6", md: "p-8", lg: "p-8", xl: "p-8", "2xl": "p-8" }
}: ResponsiveCardProps) {
  const variants = {
    default: "hover:shadow-lg transition-all duration-300",
    compact: "hover:shadow-md transition-all duration-300",
    spacious: "hover:shadow-xl transition-all duration-300"
  };

  const responsivePadding = cn(
    padding.default,
    padding.sm && `sm:${padding.sm}`,
    padding.md && `md:${padding.md}`,
    padding.lg && `lg:${padding.lg}`,
    padding.xl && `xl:${padding.xl}`,
    padding["2xl"] && `2xl:${padding["2xl"]}`
  );

  return (
    <Card 
      className={cn(
        variants[variant],
        responsivePadding,
        className
      )}
    >
      {children}
    </Card>
  );
}

interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
  background?: string;
}

export function ResponsiveSection({ 
  children, 
  className, 
  padding = { default: "py-12", sm: "py-16", md: "py-20", lg: "py-20", xl: "py-20", "2xl": "py-24" },
  background = ""
}: ResponsiveSectionProps) {
  const responsivePadding = cn(
    padding.default,
    padding.sm && `sm:${padding.sm}`,
    padding.md && `md:${padding.md}`,
    padding.lg && `lg:${padding.lg}`,
    padding.xl && `xl:${padding.xl}`,
    padding["2xl"] && `2xl:${padding["2xl"]}`
  );

  return (
    <section className={cn(responsivePadding, background, className)}>
      {children}
    </section>
  );
}

interface ResponsiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: {
    default?: "sm" | "md" | "lg" | "xl";
    sm?: "sm" | "md" | "lg" | "xl";
    md?: "sm" | "md" | "lg" | "xl";
    lg?: "sm" | "md" | "lg" | "xl";
    xl?: "sm" | "md" | "lg" | "xl";
    "2xl"?: "sm" | "md" | "lg" | "xl";
  };
  fullWidth?: {
    default?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
    "2xl"?: boolean;
  };
}

export function ResponsiveButton({ 
  children, 
  className,
  size = { default: "md", sm: "md", md: "md", lg: "md", xl: "md", "2xl": "md" },
  fullWidth = { default: false, sm: false, md: false, lg: false, xl: false, "2xl": false },
  ...props 
}: ResponsiveButtonProps) {
  const responsiveSize = cn(
    size.default && `btn-${size.default}`,
    size.sm && `sm:btn-${size.sm}`,
    size.md && `md:btn-${size.md}`,
    size.lg && `lg:btn-${size.lg}`,
    size.xl && `xl:btn-${size.xl}`,
    size["2xl"] && `2xl:btn-${size["2xl"]}`
  );

  const responsiveWidth = cn(
    fullWidth.default && "w-full",
    fullWidth.sm && "sm:w-full",
    fullWidth.md && "md:w-full",
    fullWidth.lg && "lg:w-full",
    fullWidth.xl && "xl:w-full",
    fullWidth["2xl"] && "2xl:w-full"
  );

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90",
        responsiveSize,
        responsiveWidth,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
