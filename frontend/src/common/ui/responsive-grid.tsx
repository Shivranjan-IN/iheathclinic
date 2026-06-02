import { cn } from "./utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 4, "2xl": 4 },
  gap = { default: "gap-4", sm: "gap-4", md: "gap-6", lg: "gap-6", xl: "gap-8", "2xl": "gap-8" }
}: ResponsiveGridProps) {
  const gridCols = cn(
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols["2xl"] && `2xl:grid-cols-${cols["2xl"]}`
  );

  const gridGap = cn(
    gap.default,
    gap.sm && `sm:${gap.sm}`,
    gap.md && `md:${gap.md}`,
    gap.lg && `lg:${gap.lg}`,
    gap.xl && `xl:${gap.xl}`,
    gap["2xl"] && `2xl:${gap["2xl"]}`
  );

  return (
    <div className={cn("grid", gridCols, gridGap, className)}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = "2xl",
  padding = { default: "px-4", sm: "px-6", md: "px-8", lg: "px-8", xl: "px-8", "2xl": "px-8" }
}: ResponsiveContainerProps) {
  const containerMaxWidth = cn(
    maxWidth === "sm" && "max-w-sm",
    maxWidth === "md" && "max-w-md",
    maxWidth === "lg" && "max-w-lg",
    maxWidth === "xl" && "max-w-xl",
    maxWidth === "2xl" && "max-w-2xl",
    maxWidth === "full" && "max-w-full"
  );

  const containerPadding = cn(
    padding.default,
    padding.sm && `sm:${padding.sm}`,
    padding.md && `md:${padding.md}`,
    padding.lg && `lg:${padding.lg}`,
    padding.xl && `xl:${padding.xl}`,
    padding["2xl"] && `2xl:${padding["2xl"]}`
  );

  return (
    <div className={cn("mx-auto", containerMaxWidth, containerPadding, className)}>
      {children}
    </div>
  );
}

interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    default?: "row" | "col";
    sm?: "row" | "col";
    md?: "row" | "col";
    lg?: "row" | "col";
    xl?: "row" | "col";
    "2xl"?: "row" | "col";
  };
  justify?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
  align?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
  wrap?: boolean;
  gap?: string;
}

export function ResponsiveFlex({ 
  children, 
  className, 
  direction = { default: "row", sm: "row", md: "row", lg: "row", xl: "row", "2xl": "row" },
  justify = { default: "start", sm: "start", md: "start", lg: "start", xl: "start", "2xl": "start" },
  align = { default: "start", sm: "start", md: "start", lg: "start", xl: "start", "2xl": "start" },
  wrap = false,
  gap = "gap-0"
}: ResponsiveFlexProps) {
  const flexDir = cn(
    `flex-${direction.default}`,
    direction.sm && `sm:flex-${direction.sm}`,
    direction.md && `md:flex-${direction.md}`,
    direction.lg && `lg:flex-${direction.lg}`,
    direction.xl && `xl:flex-${direction.xl}`,
    direction["2xl"] && `2xl:flex-${direction["2xl"]}`
  );

  const flexJustify = cn(
    `justify-${justify.default}`,
    justify.sm && `sm:justify-${justify.sm}`,
    justify.md && `md:justify-${justify.md}`,
    justify.lg && `lg:justify-${justify.lg}`,
    justify.xl && `xl:justify-${justify.xl}`,
    justify["2xl"] && `2xl:justify-${justify["2xl"]}`
  );

  const flexAlign = cn(
    `items-${align.default}`,
    align.sm && `sm:items-${align.sm}`,
    align.md && `md:items-${align.md}`,
    align.lg && `lg:items-${align.lg}`,
    align.xl && `xl:items-${align.xl}`,
    align["2xl"] && `2xl:items-${align["2xl"]}`
  );

  return (
    <div className={cn(
      "flex",
      flexDir,
      flexJustify,
      flexAlign,
      wrap && "flex-wrap",
      gap,
      className
    )}>
      {children}
    </div>
  );
}
