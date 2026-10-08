"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { GlassCard } from "@/components/ui/GlassCard";
import { CourseWithStatus, SemesterCourses } from "@/types/database";

interface SemesterBentoProps {
  semester: SemesterCourses;
  semesterNumber: number;
  onCourseClick: (course: CourseWithStatus, event: React.MouseEvent) => void;
  onCourseHover: (course: CourseWithStatus | null, position: { x: number; y: number } | null) => void;
  selectedCourse?: CourseWithStatus | null;
  className?: string;
}

const semesterColors = [
  "from-accent-primary/20 to-accent-cyan/20",
  "from-accent-cyan/20 to-accent-purple/20",
  "from-accent-purple/20 to-accent-amber/20",
  "from-accent-amber/20 to-accent-coral/20",
];

const semesterAccents = [
  "border-accent-primary/30",
  "border-accent-cyan/30",
  "border-accent-purple/30",
  "border-accent-amber/30",
];

export function SemesterBento({
  semester,
  semesterNumber,
  onCourseClick,
  onCourseHover,
  selectedCourse,
  className,
}: SemesterBentoProps) {
  const colorIndex = (semesterNumber - 1) % semesterColors.length;
  const bgGradient = semesterColors[colorIndex];
  const accentBorder = semesterAccents[colorIndex];

  const completionPercentage = semester.totalCredits > 0 
    ? (semester.completedCredits / semester.totalCredits) * 100 
    : 0;

  const inProgressPercentage = semester.totalCredits > 0
    ? (semester.inProgressCredits / semester.totalCredits) * 100
    : 0;

  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: semesterNumber * 0.08 }}
      style={{ 
        gridArea: `semester-${semesterNumber}`,
        minWidth: 320,
      }}
    >
      <GlassCard 
        variant="border-glow" 
        padding="lg" 
        className={cn(
          "h-full flex flex-col",
          accentBorder,
          "bg-gradient-to-br",
          bgGradient
        )}
      >
        {/* Semester Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-text-inverse"
              style={{ background: `linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))` }}
            >
              {semesterNumber}
            </div>
            <div>
              <Typography variant="heading-lg" weight="bold" color="primary">
                Semester {semesterNumber}
              </Typography>
              <Typography variant="caption" color="muted">
                {semester.totalCredits} credits total
              </Typography>
            </div>
          </div>
          
          <ProgressRing
            progress={completionPercentage}
            size={60}
            strokeWidth={5}
            gradient
            className="shrink-0"
          >
            <div className="text-center">
              <Typography variant="caption" color="muted">Complete</Typography>
            </div>
          </ProgressRing>
        </div>

        {/* Progress Bars */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "var(--status-completed)" }} />
            <Typography variant="caption" color="secondary">
              {semester.completedCredits}/{semester.totalCredits} credits
            </Typography>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 + semesterNumber * 0.08 }}
              className="h-full"
              style={{ 
                background: "linear-gradient(90deg, var(--status-completed), var(--accent-cyan))",
                borderRadius: "inherit",
              }}
            />
          </div>
          
          {semester.inProgressCredits > 0 && (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded animate-pulse" style={{ backgroundColor: "var(--status-in-progress)" }} />
                <Typography variant="caption" color="secondary">
                  {semester.inProgressCredits} credits in progress
                </Typography>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${inProgressPercentage}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 + semesterNumber * 0.08 }}
                  className="h-full"
                  style={{ 
                    background: "linear-gradient(90deg, var(--status-in-progress), var(--accent-primary))",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Courses Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {semester.courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <Typography variant="body-sm" color="muted">No courses yet</Typography>
              <Typography variant="caption" color="muted" className="mt-1">Add courses from the catalog</Typography>
            </div>
          ) : (
            semester.courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.04 + semesterNumber * 0.08 }}
                className={cn(
                  "relative",
                  selectedCourse?.id === course.id && "ring-2 ring-accent-primary/50"
                )}
                onMouseEnter={(e) => onCourseHover(course, { x: e.clientX, y: e.clientY })}
                onMouseLeave={() => onCourseHover(null, null)}
                onClick={(e) => onCourseClick(course, e)}
              >
                <CourseCardCompact 
                  course={course} 
                  isSelected={selectedCourse?.id === course.id}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <StatusBadge status="completed" size="sm" variant="dot" />
              <Typography variant="caption" color="secondary">{semester.completedCredits}cr done</Typography>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status="in_progress" size="sm" variant="dot" />
              <Typography variant="caption" color="secondary">{semester.inProgressCredits}cr active</Typography>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status="planned" size="sm" variant="dot" />
              <Typography variant="caption" color="secondary">{semester.plannedCredits}cr planned</Typography>
            </div>
          </div>
          <Typography variant="caption" color="muted" className="font-mono">
            {Math.round(completionPercentage)}%
          </Typography>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface CourseCardCompactProps {
  course: CourseWithStatus;
  isSelected: boolean;
}

function CourseCardCompact({ course, isSelected }: CourseCardCompactProps) {
  const status = course.user_status || "planned";
  const statusColor = getStatusColor(status);

  return (
    <div 
      className={cn(
        "group relative p-3 rounded-xl transition-all duration-200",
        "hover:bg-white/5",
        isSelected && "bg-accent-primary-dim border border-accent-primary/30"
      )}
      style={{ borderLeft: `3px solid ${statusColor}` }}
    >
      <div className="flex items-start gap-2.5">
        <StatusBadge status={status as any} size="sm" variant="dot" animate={status === "completed" || status === "in_progress"} className="mt-0.5 shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <Typography variant="body-sm" weight="semibold" color="primary" className="truncate font-mono">
              {course.course_code}
            </Typography>
            <Typography variant="caption" color="accent" className="whitespace-nowrap font-mono">
              {course.credits}cr
            </Typography>
          </div>
          
          <Typography variant="body-sm" color="primary" className="truncate mb-1">
            {course.course_name}
          </Typography>
          
          {course.course_name_ar && (
            <Typography variant="caption" color="muted" className="truncate" dir="rtl">
              {course.course_name_ar}
            </Typography>
          )}
          
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-text-muted">
              <span className="font-mono">←</span>
              <span className="font-mono truncate">{course.prerequisites.join(", ")}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover actions */}
      <div className="absolute inset-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 pointer-events-none">
        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary pointer-events-auto" aria-label="View details">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary pointer-events-auto" aria-label="Change status">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import { getStatusColor } from "@/lib/utils/format";