"use client";

import { ReactNode, forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "strong" | "border-glow" | "elevated";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = "default",
      hover = false,
      padding = "md",
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = "rounded-2xl transition-all duration-300 ease-spring";
    
    const variantStyles = {
      default: "glass-card",
      strong: "glass-strong",
      "border-glow": "glass-card border-glow-subtle",
      elevated: "glass-card shadow-elevated",
    };
    
    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
      xl: "p-10",
    };
    
    const hoverStyles = hover 
      ? "hover:border-accent/30 hover:shadow-glow-strong hover:-translate-y-1" 
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";