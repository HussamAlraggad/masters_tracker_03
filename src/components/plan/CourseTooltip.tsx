"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils/format";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Typography } from "@/components/ui/Typography";
import { CourseWithStatus } from "@/types/database";

interface CourseTooltipProps {
  course: CourseWithStatus;
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onStatusChange: (courseId: string, status: string, grade?: string) => void;
}

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned", color: "var(--status-planned)" },
  { value: "in_progress", label: "In Progress", color: "var(--status-in-progress)" },
  { value: "completed", label: "Completed", color: "var(--status-completed)" },
  { value: "dropped", label: "Dropped", color: "var(--status-dropped)" },
  { value: "failed", label: "Failed", color: "var(--status-failed)" },
  { value: "exempted", label: "Exempted", color: "var(--status-exempted)" },
];

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "NP"];

export function CourseTooltip({
  course,
  isOpen,
  position,
  onClose,
  onStatusChange,
}: CourseTooltipProps) {
  const [showGradePicker, setShowGradePicker] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const status = course.user_status || "planned";
  const grade = course.user_grade;
  const statusColor = getStatusColor(status);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(course.id, newStatus);
    if (newStatus === "completed") {
      setShowGradePicker(true);
    } else {
      onClose();
    }
  };

  const handleGradeSelect = (newGrade: string) => {
    onStatusChange(course.id, "completed", newGrade);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="fixed z-50 pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
          transformOrigin: "top left",
        }}
        role="dialog"
        aria-label={`Course details: ${course.course_name}`}
      >
        <GlassCard variant="strong" padding="lg" className="w-96 max-w-[380px] shadow-elevated border-glow-subtle">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <Typography variant="body" weight="bold" color="primary" className="truncate">
                  {course.course_code}
                </Typography>
                <StatusBadge status={status as any} size="sm" variant="pill" animate />
              </div>
              <Typography variant="body-lg" color="primary" className="truncate-2-lines">
                {course.course_name}
              </Typography>
              {course.course_name_ar && (
                <Typography variant="body" color="secondary" className="truncate-2-lines mt-1" dir="rtl">
                  {course.course_name_ar}
                </Typography>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-text-primary"
              aria-label="Close tooltip"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
              <div>
                <Typography variant="caption" color="muted">Credits</Typography>
                <Typography variant="heading-md" weight="bold" color="accent" className="font-mono">
                  {course.credits}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" color="muted">Semester</Typography>
                <Typography variant="heading-md" weight="bold" color="primary" className="font-mono">
                  {course.semester ? `Sem ${course.semester}` : "—"}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" color="muted">Classification</Typography>
                <Typography variant="body-sm" color="primary">
                  {course.classification || "—"}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" color="muted">Taken</Typography>
                <Typography variant="body-sm" color="primary" className="font-mono">
                  {course.user_semester_taken && course.user_year_taken
                    ? `Sem ${course.user_semester_taken} ${course.user_year_taken}`
                    : "—"}
                </Typography>
              </div>
            </div>

            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <Typography variant="caption" color="muted" className="mb-2">Prerequisites</Typography>
                <div className="flex flex-wrap gap-1.5">
                  {course.prerequisites.map((prereq, i) => (
                    <span
                      key={prereq}
                      className="px-2 py-1 rounded-lg text-xs font-mono border border-border-glass"
                      style={{ backgroundColor: "rgba(124, 255, 178, 0.05)", color: "var(--accent-primary)" }}
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {course.description && (
              <div>
                <Typography variant="caption" color="muted" className="mb-2">Description</Typography>
                <Typography variant="body-sm" color="secondary" className="prose max-h-32 overflow-y-auto">
                  {course.description}
                </Typography>
              </div>
            )}

            <div className="pt-2 border-t border-border-subtle">
              <Typography variant="caption" color="muted" className="mb-2">Quick Actions</Typography>
              
              {!showGradePicker ? (
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-sm font-medium transition-all duration-150",
                        "border border-border-glass",
                        status === option.value && "bg-accent-primary-dim"
                      )}
                      style={{ 
                        color: option.color,
                        borderColor: `${option.color}40`,
                        backgroundColor: status === option.value ? `${option.color}15` : "transparent",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Typography variant="caption" color="muted" className="mb-2">Select Grade</Typography>
                  <div className="grid grid-cols-5 gap-1.5 max-h-40 overflow-y-auto">
                    {GRADE_OPTIONS.map((gradeOption) => (
                      <button
                        key={gradeOption}
                        onClick={() => handleGradeSelect(gradeOption)}
                        className={cn(
                          "py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-150",
                          grade === gradeOption ? "bg-accent-primary-dim text-accent-primary" : "hover:bg-white/5"
                        )}
                      >
                        {gradeOption}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowGradePicker(false)}
                    className="w-full py-2 px-3 rounded-xl text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                  >
                    Back to Status
                  </button>
                </div>
              )}
            </div>

            {grade && (
              <div className="pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <Typography variant="caption" color="muted">Current Grade</Typography>
                  <Typography variant="heading-md" weight="bold" className="text-gradient font-mono">
                    {grade}
                  </Typography>
                </div>
              </div>
            )}

            {course.user_notes && (
              <div className="pt-2 border-t border-border-subtle">
                <Typography variant="caption" color="muted" className="mb-2">Notes</Typography>
                <Typography variant="body-sm" color="secondary" className="p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                  {course.user_notes}
                </Typography>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}