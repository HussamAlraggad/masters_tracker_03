"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SemesterCourses } from "@/types/database";

interface ProgressTimelineProps {
  semesters: SemesterCourses[];
  currentSemester: number;
  className?: string;
}

export function ProgressTimeline({ semesters, currentSemester, className }: ProgressTimelineProps) {
  const sortedSemesters = [...semesters].sort((a, b) => a.semester - b.semester);

  return (
    <motion.div
      className={cn("relative", className)}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: { staggerChildren: 0.1 },
        },
      }}
    >
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(180deg, var(--accent-primary), var(--accent-cyan), var(--accent-purple))" }} />
      
      <div className="space-y-6 pl-16">
        {sortedSemesters.map((semester, index) => {
          const isCurrent = semester.semester === currentSemester;
          const isCompleted = semester.completedCredits === semester.totalCredits && semester.totalCredits > 0;
          const completionPercentage = semester.totalCredits > 0 
            ? Math.round((semester.completedCredits / semester.totalCredits) * 100) 
            : 0;

          return (
            <motion.div
              key={semester.semester}
              variants={{
                initial: { opacity: 0, x: -30 },
                animate: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Timeline Dot */}
              <motion.div
                className="absolute -left-6 w-12 h-12 rounded-full flex items-center justify-center z-10"
                style={{ 
                  background: isCurrent 
                    ? "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))"
                    : isCompleted
                    ? "linear-gradient(135deg, var(--status-completed), var(--accent-cyan))"
                    : "rgba(255,255,255,0.05)",
                  border: isCurrent ? "2px solid var(--accent-primary)" : "none",
                  boxShadow: isCurrent ? "0 0 20px rgba(124, 255, 178, 0.5)" : "none",
                }}
                whileHover={{ scale: 1.15 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Typography variant="heading-md" weight="bold" style={{ color: isCurrent ? "var(--text-inverse)" : "var(--text-muted)" }}>
                    {semester.semester}
                  </Typography>
                )}
              </motion.div>

              {/* Pulse ring for current semester */}
              {isCurrent && (
                <motion.div
                  className="absolute -left-6 w-12 h-12 rounded-full border-2"
                  style={{ borderColor: "var(--accent-primary)", top: 0 }}
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              {/* Semester Card */}
              <GlassCard 
                variant={isCurrent ? "border-glow" : "default"} 
                padding="lg"
                className={cn(
                  "relative",
                  isCurrent && "ring-1 ring-accent-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="heading-lg" weight="bold" color="primary">
                        Semester {semester.semester}
                      </Typography>
                      {isCurrent && (
                        <StatusBadge status="in_progress" size="sm" variant="text" animate />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status="completed" size="sm" variant="dot" />
                        <Typography variant="body-sm" color="secondary">{semester.completedCredits}cr completed</Typography>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status="in_progress" size="sm" variant="dot" />
                        <Typography variant="body-sm" color="secondary">{semester.inProgressCredits}cr in progress</Typography>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status="planned" size="sm" variant="dot" />
                        <Typography variant="body-sm" color="secondary">{semester.plannedCredits}cr planned</Typography>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ 
                          background: isCompleted
                            ? "linear-gradient(90deg, var(--status-completed), var(--accent-cyan))"
                            : "linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))",
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Typography variant="display-md" weight="bold" className="text-gradient font-mono">
                      {completionPercentage}%
                    </Typography>
                    <Typography variant="caption" color="muted">Complete</Typography>
                  </div>
                </div>

                {/* Course Preview */}
                {semester.courses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <Typography variant="caption" color="muted" className="mb-2">Courses</Typography>
                    <div className="flex flex-wrap gap-2">
                      {semester.courses.slice(0, 6).map((course) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            "group-hover:bg-white/5",
                            course.user_status === "completed" && "bg-status-completed/20 text-status-completed border border-status-completed/30",
                            course.user_status === "in_progress" && "bg-status-in-progress/20 text-status-in-progress border border-status-in-progress/30",
                            course.user_status === "planned" && "bg-white/5 text-text-secondary border border-border-subtle",
                            course.user_status === "failed" && "bg-status-failed/20 text-status-failed border border-status-failed/30",
                            course.user_status === "dropped" && "bg-status-dropped/20 text-status-dropped border border-status-dropped/30",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <Typography variant="caption" weight="medium" className="font-mono truncate max-w-[120px]">
                              {course.course_code}
                            </Typography>
                            <StatusBadge status={course.user_status || "planned"} size="sm" variant="dot" />
                          </div>
                        </motion.div>
                      ))}
                      {semester.courses.length > 6 && (
                        <div className="px-3 py-1.5 rounded-lg text-xs text-text-muted bg-white/5">
                          +{semester.courses.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}