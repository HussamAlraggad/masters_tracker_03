"use client";

import { ReactNode, HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: "display-xl" | "display-lg" | "display-md" | "heading-lg" | "heading-md" | "body-lg" | "body" | "body-sm" | "caption" | "mono";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted" | "accent" | "gradient" | "gradient-warm" | "inverse";
  align?: "left" | "center" | "right";
  className?: string;
  as?: React.ElementType;
}

const variantClasses = {
  "display-xl": "text-display-xl font-display",
  "display-lg": "text-display-lg font-display",
  "display-md": "text-display-md font-display",
  "heading-lg": "text-heading-lg font-display",
  "heading-md": "text-heading-md font-display",
  "body-lg": "text-body-lg font-ui",
  "body": "text-body font-ui",
  "body-sm": "text-body-sm font-ui",
  "caption": "text-caption font-ui tracking-wider uppercase",
  "mono": "text-body font-mono",
};

const weightClasses = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorClasses = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  accent: "text-accent-primary",
  gradient: "text-gradient",
  "gradient-warm": "text-gradient-warm",
  inverse: "text-text-inverse",
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      children,
      variant = "body",
      weight,
      color = "primary",
      align = "left",
      className,
      as: Component = "p",
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          variantClasses[variant],
          weight && weightClasses[weight],
          colorClasses[color],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

export const Display = ({ children, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="display-lg" {...props}>{children}</Typography>
);

export const Heading = ({ children, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="heading-lg" {...props}>{children}</Typography>
);

export const Body = ({ children, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="body" {...props}>{children}</Typography>
);

export const Caption = ({ children, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="caption" {...props}>{children}</Typography>
);

export const Mono = ({ children, ...props }: Omit<TypographyProps, "variant">) => (
  <Typography variant="mono" {...props}>{children}</Typography>
);