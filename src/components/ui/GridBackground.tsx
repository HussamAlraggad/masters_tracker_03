"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface GridBackgroundProps {
  className?: string;
  color?: string;
  opacity?: number;
  gridSize?: number;
  animate?: boolean;
  speed?: number;
}

export function GridBackground({
  className,
  color = "rgba(124, 255, 178, 0.03)",
  opacity = 1,
  gridSize = 60,
  animate = true,
  speed = 20,
}: GridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = (timestamp: number) => {
      if (!animate) return;

      timeRef.current = timestamp * 0.001 * (speed / 20);

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 0.5;

      const offsetX = (timeRef.current * 10) % gridSize;
      const offsetY = (timeRef.current * 5) % gridSize;

      // Vertical lines
      for (let x = -offsetX; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = -offsetY; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame((ts) => draw(ts));
    };

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);
    resize();
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, opacity, gridSize, animate, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      aria-hidden="true"
    />
  );
}

interface GlowOrbProps {
  className?: string;
  count?: number;
  colors?: string[];
  size?: { min: number; max: number };
  blur?: number;
  opacity?: number;
  speed?: number;
}

export function GlowOrbs({
  className,
  count = 5,
  colors = [
    "rgba(124, 255, 178, 0.4)",
    "rgba(0, 245, 255, 0.3)",
    "rgba(192, 132, 252, 0.3)",
    "rgba(255, 214, 0, 0.2)",
  ],
  size = { min: 150, max: 400 },
  blur = 80,
  opacity = 0.4,
  speed = 1,
}: GlowOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const orbsRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    phase: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Reinitialize orbs on resize
      orbsRef.current = Array.from({ length: count }, () => {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5 * speed,
          vy: (Math.random() - 0.5) * 0.5 * speed,
          size: size.min + Math.random() * (size.max - size.min),
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      orbsRef.current.forEach((orb) => {
        // Update position with organic movement
        orb.phase += 0.005 * speed;
        orb.x += orb.vx + Math.sin(orb.phase) * 0.3;
        orb.y += orb.vy + Math.cos(orb.phase * 0.7) * 0.2;

        // Bounce off edges with margin
        const margin = orb.size;
        if (orb.x < margin || orb.x > width - margin) {
          orb.vx *= -1;
          orb.x = Math.max(margin, Math.min(width - margin, orb.x));
        }
        if (orb.y < margin || orb.y > height - margin) {
          orb.vy *= -1;
          orb.y = Math.max(margin, Math.min(height - margin, orb.y));
        }

        // Draw glow orb
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.size
        );
        gradient.addColorStop(0, orb.color.replace(/[\d.]+\)$/, `${opacity})`));
        gradient.addColorStop(1, orb.color.replace(/[\d.]+\)$/, `0)`));

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.filter = `blur(${blur}px)`;
        ctx.fill();
        ctx.filter = "none";
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);
    resize();
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, colors, size, blur, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      aria-hidden="true"
    />
  );
}

interface MeshGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
  intensity?: number;
}

export function MeshGradient({
  className,
  colors = [
    "rgba(124, 255, 178, 0.15)",
    "rgba(0, 245, 255, 0.1)",
    "rgba(192, 132, 252, 0.15)",
  ],
  speed = 0.5,
  intensity = 1,
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = (timestamp: number) => {
      timeRef.current = timestamp * 0.001 * speed;

      ctx.clearRect(0, 0, width, height);

      colors.forEach((color, i) => {
        const phase = timeRef.current + i * 2;
        const x = width * 0.5 + Math.sin(phase * 0.3) * width * 0.3 * intensity;
        const y = height * 0.5 + Math.cos(phase * 0.2) * height * 0.3 * intensity;
        const radius = Math.max(width, height) * 0.6;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame((ts) => draw(ts));
    };

    const handleResize = () => {
      resize();
    };

    window.addEventListener("resize", handleResize);
    resize();
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 pointer-events-none z-0", className)}
      aria-hidden="true"
    />
  );
}
