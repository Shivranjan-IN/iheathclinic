import { cn } from "./utils";
import { useEffect, useRef, useState } from "react";

interface TextRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function TextReveal({ 
  children, 
  className,
  delay = 0,
  duration = 800,
  direction = "up"
}: TextRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case "up": return "translateY(100%)";
      case "down": return "translateY(-100%)";
      case "left": return "translateX(100%)";
      case "right": return "translateX(-100%)";
      default: return "translateY(100%)";
    }
  };

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "transition-transform ease-out",
          isVisible ? "translate-x-0 translate-y-0" : getInitialTransform()
        )}
        style={{
          transitionDuration: `${duration}ms`
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function Typewriter({ 
  text, 
  className,
  speed = 100,
  delay = 0,
  cursor = true
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay]);

  return (
    <span className={cn("font-mono", className)}>
      {displayedText}
      {cursor && isTyping && (
        <span className="inline-block w-0.5 h-5 bg-pink-600 animate-pulse ml-1"></span>
      )}
    </span>
  );
}

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animated?: boolean;
}

export function GradientText({ 
  children, 
  className,
  colors = ["#ec4899", "#a855f7", "#3b82f6"],
  animated = true
}: GradientTextProps) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        className
      )}
      style={{
        backgroundImage: animated 
          ? `linear-gradient(90deg, ${colors.join(", ")})`
          : `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: animated ? "200% 100%" : "100% 100%",
        animation: animated ? "gradient-shift 3s ease-in-out infinite" : "none"
      }}
    >
      {children}
    </span>
  );
}
