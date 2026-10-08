"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showBackground?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  gradient?: boolean;
  className?: string;
  animate?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showBackground = true,
  backgroundColor = "rgba(255,255,255,0.05)",
  foregroundColor = "var(--accent-primary)",
  gradient = true,
  className,
  animate = true,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={`Progress: ${Math.round(progress)}%`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="50%" stopColor="var(--accent-cyan)" />
              <stop offset="100%" stopColor="var(--accent-purple)" />
            </linearGradient>
          )}
        </defs>
        
        {showBackground && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
        )}
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : foregroundColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : offset}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
          style={{ filter: "drop-shadow(0 0 8px rgba(124, 255, 178, 0.4))" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {children || (
          <motion.span
            className="font-display font-bold text-text-primary"
            style={{ fontSize: size * 0.18 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          >
            {Math.round(progress)}%
          </motion.span>
        )}
      </div>
    </div>
  );
}

interface CreditArcProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  startAngle?: number;
  endAngle?: number;
  showBackground?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  gradient?: boolean;
  className?: string;
  animate?: boolean;
  children?: React.ReactNode;
}

export function CreditArc({
  progress,
  size = 100,
  strokeWidth = 10,
  startAngle = -90,
  endAngle = 270,
  showBackground = true,
  backgroundColor = "rgba(255,255,255,0.05)",
  foregroundColor = "var(--accent-primary)",
  gradient = true,
  className,
  animate = true,
  children,
}: CreditArcProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const sweepAngle = endAngle - startAngle;
  const progressAngle = (progress / 100) * sweepAngle;
  
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = ((startAngle + progressAngle) * Math.PI) / 180;
  
  const startX = size / 2 + radius * Math.cos(startRad);
  const startY = size / 2 + radius * Math.sin(startRad);
  const endX = size / 2 + radius * Math.cos(endRad);
  const endY = size / 2 + radius * Math.sin(endRad);
  
  const largeArcFlag = progressAngle > 180 ? 1 : 0;
  
  const pathD = `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
  `;
  
  const bgEndRad = ((startAngle + sweepAngle) * Math.PI) / 180;
  const bgEndX = size / 2 + radius * Math.cos(bgEndRad);
  const bgEndY = size / 2 + radius * Math.sin(bgEndRad);
  
  const bgPathD = `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}
  `;

  const gradientId = `arc-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={`Credit progress: ${Math.round(progress)}%`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-cyan)" />
            </linearGradient>
          )}
        </defs>
        
        {showBackground && (
          <path
            d={bgPathD}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        
        <motion.path
          d={pathD}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : foregroundColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: animate ? 1 : 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(124, 255, 178, 0.5))" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {children}
      </div>
    </div>
  );
}