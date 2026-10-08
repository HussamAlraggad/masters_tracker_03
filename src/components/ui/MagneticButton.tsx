"use client";

import { useRef, useState, ReactNode, ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  strength?: number;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-accent-primary to-accent-cyan
    text-bg-deep font-semibold
    shadow-[0_4px_20px_rgba(124,255,178,0.3)]
  `,
  secondary: `
    glass-card border-border-glass
    text-text-primary
  `,
  ghost: `
    text-text-secondary
    hover:text-text-primary hover:bg-white/5
  `,
  outline: `
    border-2 border-border-glass text-text-primary
    hover:border-accent-primary hover:bg-accent-primary-dim
  `,
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm gap-2",
  md: "px-6 py-3 text-base gap-2.5",
  lg: "px-8 py-4 text-lg gap-3",
};

export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      children,
      strength = 0.3,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      className,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left - rect.width / 2) * strength,
        y: (e.clientY - rect.top - rect.height / 2) * strength,
      });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: 0, y: 0 });
    };

    const content = (
      <span className="relative z-10 flex items-center justify-center gap-2">
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
          children
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
      ref: (el: HTMLButtonElement | null) => {
        buttonRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      },
      className: cn(
        "relative inline-flex items-center justify-center font-ui font-medium rounded-xl",
        "transition-colors duration-200 ease-spring",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "select-none overflow-hidden",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      ),
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      onClick,
      disabled: disabled || loading,
      style: {
        transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      ...restProps,
    };

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
);

MagneticButton.displayName = "MagneticButton";

function handleMouseMove(this: HTMLButtonElement, e: React.MouseEvent<HTMLButtonElement>) {
  const rect = this.getBoundingClientRect();
  // This will be set by the component's setMousePos
}

function handleMouseLeave() {
  // This will be set by the component's setMousePos
}
