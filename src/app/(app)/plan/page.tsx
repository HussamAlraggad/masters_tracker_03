"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { GridBackground, GlowOrbs } from "@/components/ui/GridBackground";
import { SemesterBento } from "@/components/plan/SemesterBento";
import { SemesterNavigator } from "@/components/plan/SemesterNavigator";
import { PlanLegend } from "@/components/plan/PlanLegend";
import { CourseTooltip } from "@/components/plan/CourseTooltip";
import { CourseCard } from "@/components/plan/CourseCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ProgressTimeline } from "@/components/dashboard/ProgressTimeline";
import { GPATrendChart } from "@/components/dashboard/GPATrendChart";
import { CourseWithStatus, SemesterCourses, UserStats } from "@/types/database";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PlanPage() {
  const [courses, setCourses] = useState<CourseWithStatus[]>([]);
  const [semesters, setSemesters] = useState<SemesterCourses[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalCredits: 0,
    completedCredits: 0,
    inProgressCredits: 0,
    plannedCredits: 0,
    gpa: 0,
    currentSemester: 1,
    completionPercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithStatus | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = useState<"bento" | "timeline">("bento");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch courses with user status
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select(`
          *,
          course_status!left (
            status,
            grade,
            semester_taken,
            year_taken,
            credits_earned,
            notes,
            started_at,
            completed_at
          )
        `)
        .eq("course_status.user_id", user.id)
        .order("semester", { ascending: true, nullsFirst: false })
        .order("course_code", { ascending: true });

      if (coursesError) throw coursesError;

      const coursesWithStatus: CourseWithStatus[] = (coursesData || []).map(course => ({
        ...course,
        user_status: course.course_status?.[0]?.status || "planned",
        user_grade: course.course_status?.[0]?.grade || null,
        user_semester_taken: course.course_status?.[0]?.semester_taken || null,
        user_year_taken: course.course_status?.[0]?.year_taken || null,
        user_notes: course.course_status?.[0]?.notes || null,
      }));

      setCourses(coursesWithStatus);

      // Group by semester
      const semesterMap = new Map<number, CourseWithStatus[]>();
      coursesWithStatus.forEach(course => {
        const sem = course.semester || 99;
        if (!semesterMap.has(sem)) semesterMap.set(sem, []);
        semesterMap.get(sem)!.push(course);
      });

      const semesterArray: SemesterCourses[] = Array.from(semesterMap.entries())
        .map(([semester, courses]) => {
          const completedCredits = courses
            .filter(c => c.user_status === "completed")
            .reduce((sum, c) => sum + c.credits, 0);
          const inProgressCredits = courses
            .filter(c => c.user_status === "in_progress")
            .reduce((sum, c) => sum + c.credits, 0);
          const plannedCredits = courses
            .filter(c => c.user_status === "planned")
            .reduce((sum, c) => sum + c.credits, 0);
          const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

          return {
            semester,
            courses: courses.sort((a, b) => a.course_code.localeCompare(b.course_code)),
            totalCredits,
            completedCredits,
            inProgressCredits,
            plannedCredits,
          };
        })
        .sort((a, b) => a.semester - b.semester);

      setSemesters(semesterArray);

      // Calculate stats
      const totalCredits = coursesWithStatus.reduce((sum, c) => sum + c.credits, 0);
      const completedCredits = coursesWithStatus
        .filter(c => c.user_status === "completed")
        .reduce((sum, c) => sum + c.credits, 0);
      const inProgressCredits = coursesWithStatus
        .filter(c => c.user_status === "in_progress")
        .reduce((sum, c) => sum + c.credits, 0);
      const plannedCredits = coursesWithStatus
        .filter(c => c.user_status === "planned")
        .reduce((sum, c) => sum + c.credits, 0);

      // Calculate GPA
      let totalPoints = 0;
      let gpaCredits = 0;
      coursesWithStatus.forEach(course => {
        if (course.user_grade && course.user_status === "completed") {
          const gradePoints = getGradePoints(course.user_grade);
          totalPoints += gradePoints * course.credits;
          gpaCredits += course.credits;
        }
      });
      const gpa = gpaCredits > 0 ? totalPoints / gpaCredits : 0;

      // Determine current semester (first with in_progress or planned)
      let currentSem = 1;
      for (const sem of semesterArray) {
        if (sem.inProgressCredits > 0 || sem.plannedCredits > 0) {
          currentSem = sem.semester;
          break;
        }
        if (sem.completedCredits === sem.totalCredits && sem.totalCredits > 0) {
          currentSem = sem.semester + 1;
        }
      }

      setStats({
        totalCredits,
        completedCredits,
        inProgressCredits,
        plannedCredits,
        gpa,
        currentSemester: currentSem,
        completionPercentage: totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0,
      });

      setCurrentSemester(currentSem);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("course_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_status",
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleStatusChange = async (courseId: string, status: string, grade?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updates: any = {
      user_id: user.id,
      course_id: courseId,
      status,
      updated_at: new Date().toISOString(),
    };

    if (grade) {
      updates.grade = grade;
      updates.credits_earned = course.credits;
      updates.completed_at = new Date().toISOString().split("T")[0];
    }

    if (status === "in_progress") {
      updates.started_at = new Date().toISOString().split("T")[0];
    }

    const { error } = await supabase
      .from("course_status")
      .upsert(updates, { onConflict: "user_id,course_id" });

    if (error) {
      console.error("Failed to update status:", error);
      // Revert optimistic update
      fetchData();
    }
  };

  const handleCourseClick = (course: CourseWithStatus, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedCourse(course);
    setTooltipPosition({ x: event.clientX + 16, y: event.clientY + 16 });
  };

  const handleCourseHover = (course: CourseWithStatus | null, position: { x: number; y: number } | null) => {
    if (course && position) {
      setSelectedCourse(course);
      setTooltipPosition(position);
    } else {
      setSelectedCourse(null);
      setTooltipPosition(null);
    }
  };

  const handleSemesterChange = (semester: number) => {
    setCurrentSemester(semester);
  };

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/courses/scrape", { method: "POST" });
      if (!response.ok) throw new Error("Scraping failed");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <GridBackground animate speed={15} />
        <GlowOrbs count={4} speed={0.8} />
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))" }}
          >
            <svg className="w-8 h-8 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.div>
          <Typography variant="heading-lg" color="primary">Loading your plan...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <GridBackground animate speed={12} opacity={0.5} />
      <GlowOrbs count={3} speed={0.5} opacity={0.3} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Typography variant="display-lg" weight="bold" className="text-gradient mb-1">
                Course Plan
              </Typography>
              <Typography variant="body" color="secondary">
                Hashemite University · SWE Master's · {semesters.length} Semesters
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <GlassButton
                variant="outline"
                size="md"
                onClick={handleScrape}
                disabled={loading}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </GlassButton>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                <button
                  onClick={() => setViewMode("bento")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    viewMode === "bento"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  Bento
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    viewMode === "timeline"
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  Timeline
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview stats={stats} />
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {viewMode === "bento" && (
            <motion.div
              key="bento"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4"
              style={{
                gridTemplateAreas: semesters.map((_, i) => `"semester-${i + 1}"`).join(" "),
              }}
            >
              {semesters.map((semester, index) => (
                <SemesterBento
                  key={semester.semester}
                  semester={semester}
                  semesterNumber={semester.semester}
                  onCourseClick={handleCourseClick}
                  onCourseHover={handleCourseHover}
                  selectedCourse={selectedCourse}
                />
              ))}
            </motion.div>
          )}

          {viewMode === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProgressTimeline
                semesters={semesters}
                currentSemester={currentSemester}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Semester Navigator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <SemesterNavigator
            semesters={semesters}
            currentSemester={currentSemester}
            onSemesterChange={handleSemesterChange}
          />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <PlanLegend />
        </motion.div>
      </div>

      {/* Course Tooltip */}
      <AnimatePresence>
        {selectedCourse && tooltipPosition && (
          <CourseTooltip
            course={selectedCourse}
            isOpen={true}
            position={tooltipPosition}
            onClose={() => {
              setSelectedCourse(null);
              setTooltipPosition(null);
            }}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <GlassCard variant="strong" padding="md" className="border-border-glow">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-coral" />
              <Typography variant="body-sm" style={{ color: "var(--accent-coral)" }}>{error}</Typography>
              <button onClick={() => setError(null)} className="ml-auto text-text-muted hover:text-text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

function getGradePoints(grade: string): number {
  const gradeMap: Record<string, number> = {
    "A+": 4.0, "A": 3.75, "A-": 3.5,
    "B+": 3.25, "B": 3.0, "B-": 2.75,
    "C+": 2.5, "C": 2.25, "C-": 2.0,
    "D+": 1.75, "D": 1.5, "D-": 1.25,
    "F": 0.0, "P": 0, "NP": 0,
  };
  return gradeMap[grade.toUpperCase()] || 0;
}