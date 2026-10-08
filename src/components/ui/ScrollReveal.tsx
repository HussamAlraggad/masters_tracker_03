"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  variant?: "fadeUp" | "fadeDown" | "fadeIn" | "scaleIn" | "slideRight" | "slideLeft";
  className?: string;
}

const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
  },
};

const transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function ScrollReveal({
  children,
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
  triggerOnce = true,
  delay = 0,
  variant = "fadeUp",
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={variants[variant].initial}
      animate={isVisible ? variants[variant].animate : variants[variant].initial}
      transition={{ ...transition, delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.06,
  delayChildren = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  variant?: "fadeUp" | "fadeIn" | "scaleIn" | "slideRight";
  delay?: number;
  className?: string;
}

const staggerItemVariants = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
};

export function StaggerItem({
  children,
  variant = "fadeUp",
  delay = 0,
  className,
}: StaggerItemProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={staggerItemVariants[variant]}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}