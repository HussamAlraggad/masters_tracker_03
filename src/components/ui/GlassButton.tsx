"use client";

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive" | "magnetic";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-accent-primary to-accent-cyan
    text-bg-deep font-semibold
    shadow-[0_4px_20px_rgba(124,255,178,0.3)]
    hover:shadow-[0_8px_30px_rgba(124,255,178,0.4)]
    active:scale-[0.98]
  `,
  secondary: `
    glass-card border-border-glass
    text-text-primary
    hover:bg-accent-primary-dim hover:border-accent/30
    active:scale-[0.98]
  `,
  ghost: `
    text-text-secondary
    hover:text-text-primary hover:bg-white/5
    active:scale-[0.98]
  `,
  outline: `
    border-2 border-border-glass text-text-primary
    hover:border-accent-primary hover:bg-accent-primary-dim
    active:scale-[0.98]
  `,
  destructive: `
    bg-gradient-to-r from-accent-coral to-red-600
    text-white font-semibold
    shadow-[0_4px_20px_rgba(255,107,107,0.3)]
    hover:shadow-[0_8px_30px_rgba(255,107,107,0.4)]
    active:scale-[0.98]
  `,
  magnetic: `
    glass-card border-border-glass text-text-primary
    relative overflow-hidden
  `,
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm gap-2",
  md: "px-6 py-3 text-base gap-2.5",
  lg: "px-8 py-4 text-lg gap-3",
  xl: "px-10 py-5 text-xl gap-3",
  icon: "p-3",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const isMagnetic = variant === "magnetic";
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
    
    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isMagnetic) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    };
    
    const handleMouseLeave = () => {
      if (!isMagnetic) return;
      setMousePos({ x: 0, y: 0 });
    };

    const content = (
      <span className="flex items-center justify-center gap-2.5 relative z-10">
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </span>
    );

    // Extract animation and drag-related props to avoid type conflict with ButtonHTMLAttributes
    const { 
      onDrag: _onDrag, 
      onDragEnd: _onDragEnd, 
      onDragStart: _onDragStart,
      onAnimationStart: _onAnimationStart,
      onAnimationEnd: _onAnimationEnd,
      onAnimationIteration: _onAnimationIteration,
      ...restProps 
    } = props;

    const buttonProps = {
      ref,
      className: cn(
        "relative inline-flex items-center justify-center font-ui font-medium rounded-xl",
        "transition-all duration-200 ease-spring",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
        "select-none",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      ),
      onClick,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      disabled: disabled || loading,
      style: isMagnetic
        ? {
            transform: `translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
            transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }
        : undefined,
      ...restProps,
    };

    if (isMagnetic) {
      return (
        <motion.button
          {...buttonProps}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-cyan/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"
            aria-hidden="true"
          />
          {content}
        </motion.button>
      );
    }

    return (
      <motion.button
        {...buttonProps}
        whileHover={{ scale: variant === "ghost" ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {content}
      </motion.button>
    );
  }
);

GlassButton.displayName = "GlassButton";

import React from "react";
