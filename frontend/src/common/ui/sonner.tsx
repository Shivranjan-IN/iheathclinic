import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ theme, ...props }: ToasterProps) => {
  const resolvedTheme = theme ?? "system";

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
