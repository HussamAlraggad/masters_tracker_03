import type { TargetAndTransition, Transition } from "framer-motion";

type Variant = TargetAndTransition | ((...args: unknown[]) => TargetAndTransition);

const baseTransition: Transition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };
const springTransition: Transition = { type: "spring", stiffness: 300, damping: 20 };

export const fadeUp: Variant = { opacity: 1, y: 0 };
export const fadeUpInitial: Variant = { opacity: 0, y: 20 };
export const fadeUpExit: Variant = { opacity: 0, y: -20 };

export const fadeDown: Variant = { opacity: 1, y: 0 };
export const fadeDownInitial: Variant = { opacity: 0, y: -20 };
export const fadeDownExit: Variant = { opacity: 0, y: 20 };

export const fadeIn: Variant = { opacity: 1 };
export const fadeInInitial: Variant = { opacity: 0 };
export const fadeInExit: Variant = { opacity: 0 };

export const scaleIn: Variant = { opacity: 1, scale: 1 };
export const scaleInInitial: Variant = { opacity: 0, scale: 0.95 };
export const scaleInExit: Variant = { opacity: 0, scale: 0.95 };

export const slideRight: Variant = { opacity: 1, x: 0 };
export const slideRightInitial: Variant = { opacity: 0, x: -30 };
export const slideRightExit: Variant = { opacity: 0, x: 30 };

export const slideLeft: Variant = { opacity: 1, x: 0 };
export const slideLeftInitial: Variant = { opacity: 0, x: 30 };
export const slideLeftExit: Variant = { opacity: 0, x: -30 };

export const staggerContainer: Variant = {
  transition: {
    staggerChildren: 0.06,
    delayChildren: 0.1,
  },
};

export const staggerItem: Variant = { opacity: 1, y: 0 };
export const staggerItemInitial: Variant = { opacity: 0, y: 20 };
export const staggerItemExit: Variant = { opacity: 0, y: -20 };

export const cardHover: Variant = { 
  y: -4, 
  scale: 1.01,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(124, 255, 178, 0.1)",
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

export const magneticHover: Variant = { 
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

export const statusPulse: Variant = {
  boxShadow: [
    "0 0 0 0 rgba(124, 255, 178, 0.4)",
    "0 0 0 20px rgba(124, 255, 178, 0)",
  ],
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
};

export const glowPulse: Variant = {
  opacity: [0.4, 0.8, 0.4],
  scale: [1, 1.05, 1],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
};

export const float: Variant = {
  y: [0, -20, 0],
  x: [0, 15, 0],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
};

export const shimmer: Variant = {
  backgroundPosition: ["-200% 0", "200% 0"],
  transition: { duration: 2, repeat: Infinity, ease: "linear" },
};

export const pageTransition: Variant = { opacity: 1, y: 0 };
export const pageTransitionInitial: Variant = { opacity: 0, y: 30 };
export const pageTransitionExit: Variant = { opacity: 0, y: -30 };

export const modalTransition: Variant = { opacity: 1, scale: 1, y: 0 };
export const modalTransitionInitial: Variant = { opacity: 0, scale: 0.95, y: 20 };
export const modalTransitionExit: Variant = { opacity: 0, scale: 0.95, y: 20 };

export const tooltipTransition: Variant = { opacity: 1, scale: 1, y: 0 };
export const tooltipTransitionInitial: Variant = { opacity: 0, scale: 0.9, y: 10 };
export const tooltipTransitionExit: Variant = { opacity: 0, scale: 0.9, y: 10 };

export const radialMenu: Variant = { opacity: 1, scale: 1 };
export const radialMenuInitial: Variant = { opacity: 0, scale: 0.8 };
export const radialMenuExit: Variant = { opacity: 0, scale: 0.8 };

export const radialItem: Variant = { opacity: 1, scale: 1, rotate: 0 };
export const radialItemInitial: Variant = { opacity: 0, scale: 0.5, rotate: -90 };
export const radialItemExit: Variant = { opacity: 0, scale: 0.5, rotate: 90 };

export const particleBurst: Variant = (i: number): TargetAndTransition => ({
  opacity: 0,
  scale: 0,
  x: Math.cos((i * 360) / 12) * 100,
  y: Math.sin((i * 360) / 12) * 100,
  transition: { duration: 0.8, ease: "easeOut" },
});

export const lineDraw: Variant = { pathLength: 1, opacity: 1 };
export const lineDrawInitial: Variant = { pathLength: 0, opacity: 0 };

export const counter: Variant = { opacity: 1, y: 0 };
export const counterInitial: Variant = { opacity: 0, y: 20 };

export const navItem: Variant = { opacity: 1, x: 0 };
export const navItemInitial: Variant = { opacity: 0, x: -20 };
export const navItemExit: Variant = { opacity: 0, x: 20 };

export const sidebarTransition: Variant = { width: "280px", opacity: 1 };
export const sidebarTransitionInitial: Variant = { width: 0, opacity: 0 };
export const sidebarTransitionExit: Variant = { width: 0, opacity: 0 };

export const progressRing: Variant = { pathLength: 1, opacity: 1 };
export const progressRingInitial: Variant = { pathLength: 0, opacity: 0 };

export const creditArc: Variant = { pathLength: 1, opacity: 1, rotate: 0 };
export const creditArcInitial: Variant = { pathLength: 0, opacity: 0, rotate: -90 };