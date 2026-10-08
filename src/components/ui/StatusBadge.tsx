"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { getStatusColor, getStatusLabel } from "@/lib/utils/format";

interface StatusBadgeProps {
  status: "planned" | "in_progress" | "completed" | "dropped" | "failed" | "exempted";
  size?: "sm" | "md" | "lg";
  variant?: "dot" | "pill" | "ring" | "text";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    dot: "w-1.5 h-1.5",
    pill: "px-2 py-0.5 text-xs",
    ring: "w-6 h-6",
    text: "text-xs",
  },
  md: {
    dot: "w-2 h-2",
    pill: "px-3 py-1 text-sm",
    ring: "w-8 h-8",
    text: "text-sm",
  },
  lg: {
    dot: "w-3 h-3",
    pill: "px-4 py-1.5 text-base",
    ring: "w-10 h-10",
    text: "text-base",
  },
};

const pulseVariants = {
  boxShadow: [
    "0 0 0 0 currentColor",
    "0 0 0 12px transparent",
  ],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
};

export function StatusBadge({
  status,
  size = "md",
  variant = "pill",
  showLabel = true,
  animate = true,
  className,
}: StatusBadgeProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  if (variant === "dot") {
    return (
      <motion.div
        className={cn(
          "rounded-full",
          sizeStyles[size].dot,
          className
        )}
        style={{ backgroundColor: color }}
        animate={animate && (status === "completed" || status === "in_progress") ? pulseVariants : undefined}
        aria-label={label}
      />
    );
  }

  if (variant === "ring") {
    const percentage = status === "completed" ? 100 : status === "in_progress" ? 50 : 0;
    
    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: sizeStyles[size].ring, height: sizeStyles[size].ring }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <motion.circle
            cx="16"
            cy="16"
            r="14"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 88} 88`}
            style={{ strokeDashoffset: 88 - (percentage / 100) * 88 }}
            initial={{ strokeDashoffset: 88 }}
            animate={{ strokeDashoffset: 88 - (percentage / 100) * 88 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        {showLabel && (
          <span className="absolute text-center" style={{ fontSize: size === "sm" ? "0.5rem" : size === "md" ? "0.625rem" : "0.75rem" }}>
            {percentage}%
          </span>
        )}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <span
        className={cn(
          "font-medium",
          sizeStyles[size].text,
          className
        )}
        style={{ color }}
      >
        {label}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        "border border-border-glass",
        "glass-card",
        sizeStyles[size].pill,
        className
      )}
      style={{ 
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="rounded-full"
        style={{ 
          width: size === "sm" ? 6 : size === "md" ? 8 : 10,
          height: size === "sm" ? 6 : size === "md" ? 8 : 10,
          backgroundColor: color,
        }}
        animate={animate && (status === "completed" || status === "in_progress") ? pulseVariants : undefined}
      />
      {showLabel && <span style={{ color }}>{label}</span>}
    </motion.span>
  );
}