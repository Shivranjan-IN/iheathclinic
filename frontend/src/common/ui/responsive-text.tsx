import { cn } from "./utils";

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
  weight?: {
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
  color?: string;
}

export function ResponsiveText({ 
  children, 
  className, 
  size = { default: "base", sm: "base", md: "base", lg: "base", xl: "base", "2xl": "base" },
  weight = { default: "normal", sm: "normal", md: "normal", lg: "normal", xl: "normal", "2xl": "normal" },
  align = { default: "left", sm: "left", md: "left", lg: "left", xl: "left", "2xl": "left" },
  color = "text-foreground"
}: ResponsiveTextProps) {
  const textSize = cn(
    `text-${size.default}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
    size.xl && `xl:text-${size.xl}`,
    size["2xl"] && `2xl:text-${size["2xl"]}`
  );

  const fontWeight = cn(
    `font-${weight.default}`,
    weight.sm && `sm:font-${weight.sm}`,
    weight.md && `md:font-${weight.md}`,
    weight.lg && `lg:font-${weight.lg}`,
    weight.xl && `xl:font-${weight.xl}`,
    weight["2xl"] && `2xl:font-${weight["2xl"]}`
  );

  const textAlign = cn(
    `text-${align.default}`,
    align.sm && `sm:text-${align.sm}`,
    align.md && `md:text-${align.md}`,
    align.lg && `lg:text-${align.lg}`,
    align.xl && `xl:text-${align.xl}`,
    align["2xl"] && `2xl:text-${align["2xl"]}`
  );

  return (
    <p className={cn(textSize, fontWeight, textAlign, color, className)}>
      {children}
    </p>
  );
}

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  className?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: {
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
}

export function ResponsiveHeading({ 
  children, 
  className, 
  level,
  size = {
    default: level === 1 ? "3xl" : level === 2 ? "2xl" : level === 3 ? "xl" : level === 4 ? "lg" : level === 5 ? "md" : "sm",
    sm: level === 1 ? "4xl" : level === 2 ? "3xl" : level === 3 ? "2xl" : level === 4 ? "xl" : level === 5 ? "lg" : "md",
    md: level === 1 ? "5xl" : level === 2 ? "4xl" : level === 3 ? "3xl" : level === 4 ? "2xl" : level === 5 ? "xl" : "lg",
    lg: level === 1 ? "6xl" : level === 2 ? "5xl" : level === 3 ? "4xl" : level === 4 ? "3xl" : level === 5 ? "2xl" : "xl",
    xl: level === 1 ? "6xl" : level === 2 ? "5xl" : level === 3 ? "4xl" : level === 4 ? "3xl" : level === 5 ? "2xl" : "xl",
    "2xl": level === 1 ? "7xl" : level === 2 ? "6xl" : level === 3 ? "5xl" : level === 4 ? "4xl" : level === 5 ? "3xl" : "2xl"
  },
  align = { default: "left", sm: "left", md: "left", lg: "left", xl: "left", "2xl": "left" }
}: ResponsiveHeadingProps) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const textSize = cn(
    `text-${size.default}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
    size.xl && `xl:text-${size.xl}`,
    size["2xl"] && `2xl:text-${size["2xl"]}`
  );

  const textAlign = cn(
    `text-${align.default}`,
    align.sm && `sm:text-${align.sm}`,
    align.md && `md:text-${align.md}`,
    align.lg && `lg:text-${align.lg}`,
    align.xl && `xl:text-${align.xl}`,
    align["2xl"] && `2xl:text-${align["2xl"]}`
  );

  const classes = cn(
    "font-bold text-foreground",
    textSize,
    textAlign,
    className
  );

  return <HeadingTag className={classes}>{children}</HeadingTag>;
}
