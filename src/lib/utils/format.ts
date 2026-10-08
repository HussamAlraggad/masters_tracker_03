import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    planned: "var(--status-planned)",
    in_progress: "var(--status-in-progress)",
    completed: "var(--status-completed)",
    dropped: "var(--status-dropped)",
    failed: "var(--status-failed)",
    exempted: "var(--status-exempted)",
  };
  return colors[status] || colors.planned;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
    dropped: "Dropped",
    failed: "Failed",
    exempted: "Exempted",
  };
  return labels[status] || status;
}

export function getGradePoints(grade: string | null): number {
  if (!grade) return 0;
  const gradeMap: Record<string, number> = {
    "A+": 4.0,
    "A": 3.75,
    "A-": 3.5,
    "B+": 3.25,
    "B": 3.0,
    "B-": 2.75,
    "C+": 2.5,
    "C": 2.25,
    "C-": 2.0,
    "D+": 1.75,
    "D": 1.5,
    "D-": 1.25,
    "F": 0.0,
    "P": 0, // Pass - no grade points
    "NP": 0, // No Pass
  };
  return gradeMap[grade.toUpperCase()] || 0;
}

export function calculateGPA(courses: Array<{ grade: string | null; credits: number }>): number {
  let totalPoints = 0;
  let totalCredits = 0;
  
  for (const course of courses) {
    if (course.grade && course.grade !== "P" && course.grade !== "NP") {
      const points = getGradePoints(course.grade);
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    }
  }
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function calculateSemesterGPA(courses: Array<{ grade: string | null; credits: number }>): number {
  return calculateGPA(courses);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}