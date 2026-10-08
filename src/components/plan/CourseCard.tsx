"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { getStatusColor, getStatusLabel } from "@/lib/utils/format";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Typography } from "@/components/ui/Typography";
import { GlassButton } from "@/components/ui/GlassButton";
import { CourseWithStatus, CourseStatus } from "@/types/database";

interface CourseCardProps {
  course: CourseWithStatus;
  onStatusChange: (courseId: string, status: CourseStatus, grade?: string) => void;
  onToggleNotes?: (courseId: string) => void;
  showPrerequisites?: boolean;
  compact?: boolean;
  className?: string;
}

const STATUS_OPTIONS: Array<{ value: CourseStatus; label: string; color: string }> = [
  { value: "planned", label: "Planned", color: "var(--status-planned)" },
  { value: "in_progress", label: "In Progress", color: "var(--status-in-progress)" },
  { value: "completed", label: "Completed", color: "var(--status-completed)" },
  { value: "dropped", label: "Dropped", color: "var(--status-dropped)" },
  { value: "failed", label: "Failed", color: "var(--status-failed)" },
  { value: "exempted", label: "Exempted", color: "var(--status-exempted)" },
];

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "NP"];

export function CourseCard({
  course,
  onStatusChange,
  onToggleNotes,
  showPrerequisites = true,
  compact = false,
  className,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showGradeMenu, setShowGradeMenu] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const status = course.user_status || "planned";
  const grade = course.user_grade;
  const statusColor = getStatusColor(status);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
        setShowGradeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusClick = (newStatus: CourseStatus) => {
    onStatusChange(course.id, newStatus);
    setShowStatusMenu(false);
    if (newStatus === "completed") {
      setShowGradeMenu(true);
    }
  };

  const handleGradeClick = (newGrade: string) => {
    onStatusChange(course.id, "completed", newGrade);
    setShowGradeMenu(false);
  };

  if (compact) {
    return (
      <motion.div
        ref={cardRef}
        className={cn("group relative", className)}
        whileHover={{ y: -2, scale: 1.01 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <GlassCard variant="default" padding="sm" className="min-w-[200px]">
          <div className="flex items-start gap-3">
            <StatusBadge status={status} size="sm" variant="dot" animate={status === "completed"} />
            <div className="flex-1 min-w-0">
              <Typography variant="body-sm" weight="medium" className="truncate">
                {course.course_code}
              </Typography>
              <Typography variant="caption" color="secondary" className="truncate mt-0.5">
                {course.course_name}
              </Typography>
            </div>
            <Typography variant="mono" color="muted" className="whitespace-nowrap">
              {course.credits}cr
            </Typography>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn("group relative", className)}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GlassCard 
        variant="border-glow" 
        padding="md" 
        hover
        className="min-w-[280px] max-w-[360px]"
      >
        <div className="flex items-start gap-3">
          <StatusBadge 
            status={status} 
            size="md" 
            variant="pill" 
            animate={status === "completed" || status === "in_progress"}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <Typography variant="body-sm" weight="semibold" color="primary" className="truncate">
                {course.course_code}
              </Typography>
              <Typography variant="caption" color="accent" className="whitespace-nowrap">
                {course.credits} credits
              </Typography>
            </div>
            
            <Typography variant="body" color="primary" className="truncate-2-lines mb-2">
              {course.course_name}
            </Typography>
            
            {course.course_name_ar && (
              <Typography variant="body-sm" color="secondary" className="truncate-2-lines mb-2" dir="rtl">
                {course.course_name_ar}
              </Typography>
            )}
            
            {showPrerequisites && course.prerequisites && course.prerequisites.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-text-muted mb-2">
                <span className="font-mono">Prereqs:</span>
                {course.prerequisites.map((prereq, i) => (
                  <span key={prereq} className="font-mono text-accent-primary/70">
                    {prereq}{i < course.prerequisites!.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            )}
            
            {course.classification && (
              <Typography variant="caption" color="muted" className="uppercase tracking-wider">
                {course.classification}
              </Typography>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-2"
            >
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex-1 justify-start"
              >
                Status: {getStatusLabel(status)}
              </GlassButton>
              
              {grade && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGradeMenu(!showGradeMenu)}
                  className="flex-1 justify-start"
                >
                  Grade: {grade}
                </GlassButton>
              )}
              
              {onToggleNotes && (
                <GlassButton
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleNotes(course.id)}
                  className="p-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </GlassButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Status Menu */}
      <AnimatePresence>
        {showStatusMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 glass-strong rounded-xl p-2 shadow-elevated border border-border-glass min-w-[160px]"
            style={{
              top: cardRef.current?.getBoundingClientRect().bottom! + window.scrollY + 8,
              left: cardRef.current?.getBoundingClientRect().left! + window.scrollX,
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusClick(option.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                  "text-left transition-colors duration-150",
                  "hover:bg-white/5",
                  status === option.value && "bg-accent-primary-dim"
                )}
                style={{ color: option.color }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: option.color }}
                />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grade Menu */}
      <AnimatePresence>
        {showGradeMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 glass-strong rounded-xl p-2 shadow-elevated border border-border-glass"
            style={{
              top: cardRef.current?.getBoundingClientRect().bottom! + window.scrollY + 8,
              left: cardRef.current?.getBoundingClientRect().right! + window.scrollX - 200,
            }}
          >
            <div className="grid grid-cols-5 gap-1 max-h-60 overflow-y-auto">
              {GRADE_OPTIONS.map((gradeOption) => (
                <button
                  key={gradeOption}
                  onClick={() => handleGradeClick(gradeOption)}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-sm font-medium",
                    "transition-all duration-150",
                    "hover:bg-white/5",
                    grade === gradeOption && "bg-accent-primary-dim text-accent-primary"
                  )}
                >
                  {gradeOption}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}