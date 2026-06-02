import { cn } from "./utils";
import { useState, useRef, useEffect } from "react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  variant?: "default" | "glow" | "outline";
}

export function MagneticButton({ 
  children, 
  strength = 20,
  className,
  variant = "default",
  ...props 
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / strength;
      const deltaY = (e.clientY - centerY) / strength;
      
      setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  const getVariantStyles = () => {
    switch (variant) {
      case "glow":
        return "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-pink-500/25 transition-all duration-300";
      case "outline":
        return "border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white transition-all duration-300";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2",
        getVariantStyles(),
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      {...props}
    >
      {children}
    </button>
  );
}

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  intensity?: number;
}

export function GlowingCard({ 
  children, 
  glowColor = "rgba(236, 72, 153, 0.5)",
  intensity = 0.5,
  className 
}: GlowingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card p-6 transition-all duration-300",
        isHovered && "shadow-2xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor.replace(intensity.toString(), (intensity * 0.5).toString())}`
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ 
  children, 
  speed = 0.5,
  className 
}: ParallaxSectionProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      className={className}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  );
}
