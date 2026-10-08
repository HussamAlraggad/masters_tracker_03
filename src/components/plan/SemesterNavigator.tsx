"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { SemesterCourses } from "@/types/database";

interface SemesterNavigatorProps {
  semesters: SemesterCourses[];
  currentSemester: number;
  onSemesterChange: (semester: number) => void;
  className?: string;
}

export function SemesterNavigator({
  semesters,
  currentSemester,
  onSemesterChange,
  className,
}: SemesterNavigatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollButtons, setShowScrollButtons] = useState({ left: false, right: false });

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScrollButtons = () => {
      setShowScrollButtons({
        left: container.scrollLeft > 10,
        right: container.scrollLeft + container.clientWidth < container.scrollWidth - 10,
      });
    };

    container.addEventListener("scroll", updateScrollButtons);
    updateScrollButtons();

    return () => container.removeEventListener("scroll", updateScrollButtons);
  }, []);

  const scrollToSemester = (semesterNumber: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const targetIndex = semesters.findIndex(s => s.semester === semesterNumber);
    if (targetIndex === -1) return;

    const itemWidth = 340; // approximate card width + gap
    const targetScroll = targetIndex * itemWidth;
    
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Scroll Left Button */}
      <AnimatePresence>
        {showScrollButtons.left && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollRef.current?.scrollBy({ left: -340, behavior: "smooth" })}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 p-2 rounded-full glass-strong border-border-glass text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll Right Button */}
      <AnimatePresence>
        {showScrollButtons.right && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollRef.current?.scrollBy({ left: 340, behavior: "smooth" })}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 p-2 rounded-full glass-strong border-border-glass text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Semester Tabs */}
      <div
        ref={scrollRef}
        className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        onWheel={handleWheel}
        role="tablist"
        aria-label="Semesters"
      >
        {semesters.map((semester, index) => {
          const isActive = semester.semester === currentSemester;
          const completionPercentage = semester.totalCredits > 0
            ? Math.round((semester.completedCredits / semester.totalCredits) * 100)
            : 0;

          return (
            <motion.button
              key={semester.semester}
              onClick={() => onSemesterChange(semester.semester)}
              className={cn(
                "relative flex-shrink-0 snap-start min-w-[320px] max-w-[360px]",
                "group",
                isActive && "ring-2 ring-accent-primary/50"
              )}
              style={{ 
                transformOrigin: "center",
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              role="tab"
              aria-selected={isActive}
              aria-label={`Semester ${semester.semester}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <GlassCard 
                variant={isActive ? "border-glow" : "default"} 
                padding="lg"
                className="h-full flex flex-col"
              >
                {/* Semester Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-text-inverse",
                      isActive ? "shadow-[0_0_20px_rgba(124,255,178,0.5)]" : ""
                    )}>
                      {semester.semester}
                    </div>
                    <div>
                      <Typography variant="heading-md" weight="bold" color="primary">
                        Semester {semester.semester}
                      </Typography>
                      <Typography variant="caption" color="muted">
                        {semester.totalCredits} credits
                      </Typography>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Typography variant="heading-md" weight="bold" className="text-gradient font-mono">
                      {completionPercentage}%
                    </Typography>
                    <Typography variant="caption" color="muted">Complete</Typography>
                  </div>
                </div>

                {/* Mini Progress */}
                <div className="mb-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ 
                      background: "linear-gradient(90deg, var(--status-completed), var(--accent-cyan))",
                    }}
                  />
                </div>

                {/* Course Count */}
                <div className="flex items-center gap-4 text-xs mb-4">
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status="completed" size="sm" variant="dot" />
                    <Typography variant="caption" color="secondary">{semester.completedCredits}cr</Typography>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status="in_progress" size="sm" variant="dot" />
                    <Typography variant="caption" color="secondary">{semester.inProgressCredits}cr</Typography>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status="planned" size="sm" variant="dot" />
                    <Typography variant="caption" color="secondary">{semester.plannedCredits}cr</Typography>
                  </div>
                </div>

                {/* Course Preview */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {semester.courses.slice(0, 4).map((course) => (
                    <div
                      key={course.id}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm transition-colors",
                        "group-hover:bg-white/5",
                        course.user_status === "completed" && "bg-accent-primary-dim/30",
                        course.user_status === "in_progress" && "bg-accent-primary-dim/20",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Typography variant="body-sm" weight="medium" color="primary" className="truncate font-mono">
                          {course.course_code}
                        </Typography>
                        <StatusBadge status={course.user_status || "planned"} size="sm" variant="dot" />
                      </div>
                      <Typography variant="caption" color="secondary" className="truncate mt-0.5">
                        {course.course_name}
                      </Typography>
                    </div>
                  ))}
                  {semester.courses.length > 4 && (
                    <div className="px-3 py-2 text-center text-text-muted text-sm">
                      +{semester.courses.length - 4} more courses
                    </div>
                  )}
                </div>

                {/* Active Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      exit={{ width: 0 }}
                      className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
                      style={{ background: "linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))" }}
                    />
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg-base to-transparent pointer-events-none" />
    </div>
  );
}