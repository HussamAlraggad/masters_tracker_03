"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { Typography } from "@/components/ui/Typography";
import { GlassCard } from "@/components/ui/GlassCard";
import { GridBackground, GlowOrbs } from "@/components/ui/GridBackground";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { ProgressTimeline } from "@/components/dashboard/ProgressTimeline";
import { GPATrendChart } from "@/components/dashboard/GPATrendChart";
import { SemesterCourses, UserStats } from "@/types/database";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProgressPage() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: coursesData } = await supabase
          .from("courses")
          .select(`
            *,
            course_status!left (
              status,
              grade,
              semester_taken,
              year_taken,
              credits_earned
            )
          `)
          .eq("course_status.user_id", user.id)
          .order("semester", { ascending: true, nullsFirst: false });

        const coursesWithStatus = (coursesData || []).map(course => ({
          ...course,
          user_status: course.course_status?.[0]?.status || "planned",
          user_grade: course.course_status?.[0]?.grade || null,
          user_semester_taken: course.course_status?.[0]?.semester_taken || null,
          user_year_taken: course.course_status?.[0]?.year_taken || null,
        }));

        const semesterMap = new Map<number, typeof coursesWithStatus>();
        coursesWithStatus.forEach(course => {
          const sem = course.semester || 99;
          if (!semesterMap.has(sem)) semesterMap.set(sem, []);
          semesterMap.get(sem)!.push(course);
        });

        const semesterArray = Array.from(semesterMap.entries())
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
      } catch (err) {
        console.error("Failed to fetch progress data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.div>
          <Typography variant="heading-lg" color="primary">Loading analytics...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <GridBackground animate speed={12} opacity={0.5} />
      <GlowOrbs count={3} speed={0.5} opacity={0.3} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <Typography variant="display-lg" weight="bold" className="text-gradient mb-1">
            Progress Analytics
          </Typography>
          <Typography variant="body" color="secondary">
            Track your academic journey with detailed insights
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <StatsOverview stats={stats} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <GPATrendChart semesters={semesters} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <ProgressTimeline
              semesters={semesters}
              currentSemester={stats.currentSemester}
            />
          </motion.div>
        </div>

        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <GlassCard variant="border-glow" padding="lg">
            <Typography variant="heading-lg" weight="bold" color="primary" className="mb-6">
              Grade Distribution
            </Typography>
            <GradeDistributionChart semesters={semesters} />
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

function GradeDistributionChart({ semesters }: { semesters: SemesterCourses[] }) {
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        if (course.user_grade && course.user_status === "completed") {
          counts[course.user_grade] = (counts[course.user_grade] || 0) + 1;
        }
      });
    });
    return counts;
  }, [semesters]);

  const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
  const maxCount = Math.max(...Object.values(gradeCounts), 1);

  return (
    <div className="space-y-3">
      {grades.map(grade => {
        const count = gradeCounts[grade] || 0;
        const percentage = (count / maxCount) * 100;
        return (
          <motion.div
            key={grade}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <Typography variant="caption" weight="bold" color="primary" className="w-12 font-mono">
              {grade}
            </Typography>
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ 
                  background: count > 0 
                    ? "linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))"
                    : "transparent",
                }}
              />
            </div>
            <Typography variant="caption" color="muted" className="w-10 text-right font-mono">
              {count}
            </Typography>
          </motion.div>
        );
      })}
    </div>
  );
}

import { useMemo } from "react";
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