"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { GlassCard } from "@/components/ui/GlassCard";
import { SemesterCourses } from "@/types/database";

interface GPATrendChartProps {
  semesters: SemesterCourses[];
  className?: string;
}

interface GPADataPoint {
  semester: string;
  gpa: number;
  cumulativeGPA: number;
  credits: number;
}

export function GPATrendChart({ semesters, className }: GPATrendChartProps) {
  const chartData = useMemo(() => {
    const sorted = [...semesters].sort((a, b) => a.semester - b.semester);
    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    
    return sorted
      .filter(s => s.courses.some(c => c.user_grade && c.user_status === "completed"))
      .map((semester) => {
        let semPoints = 0;
        let semCredits = 0;
        
        semester.courses.forEach(course => {
          if (course.user_grade && course.user_status === "completed") {
            const gradePoints = getGradePoints(course.user_grade);
            semPoints += gradePoints * course.credits;
            semCredits += course.credits;
          }
        });
        
        const semGPA = semCredits > 0 ? semPoints / semCredits : 0;
        cumulativePoints += semPoints;
        cumulativeCredits += semCredits;
        const cumGPA = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
        
        return {
          semester: `Sem ${semester.semester}`,
          gpa: Number(semGPA.toFixed(2)),
          cumulativeGPA: Number(cumGPA.toFixed(2)),
          credits: semCredits,
        };
      });
  }, [semesters]);

  if (chartData.length === 0) {
    return (
      <GlassCard variant="default" padding="xl" className={cn("min-h-[300px] flex items-center justify-center", className)}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <Typography variant="heading-md" color="primary" className="mb-2">No GPA Data Yet</Typography>
          <Typography variant="body" color="secondary">
            Complete courses with grades to see your GPA trend
          </Typography>
        </div>
      </GlassCard>
    );
  }

  const latestGPA = chartData[chartData.length - 1]?.cumulativeGPA || 0;
  const firstGPA = chartData[0]?.cumulativeGPA || 0;
  const gpaChange = latestGPA - firstGPA;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-strong p-3 rounded-xl border-border-glass shadow-elevated min-w-[180px]"
        >
          <Typography variant="caption" color="muted" className="mb-1">{label}</Typography>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-2">
              <Typography variant="body-sm" color={entry.color}>{entry.name}</Typography>
              <Typography variant="body-sm" weight="bold" color="primary" className="font-mono">
                {entry.value.toFixed(2)}
              </Typography>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard variant="border-glow" padding="lg" className="h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Typography variant="heading-lg" weight="bold" color="primary">GPA Trend</Typography>
            <Typography variant="caption" color="muted">Semester & Cumulative GPA</Typography>
          </div>
          <div className="text-right">
            <Typography variant="display-md" weight="bold" className="text-gradient font-mono">
              {latestGPA.toFixed(2)}
            </Typography>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                gpaChange >= 0 ? "text-status-completed bg-status-completed/20" : "text-status-failed bg-status-failed/20"
              )}>
                {gpaChange >= 0 ? "+" : ""}{gpaChange.toFixed(2)}
              </span>
              <Typography variant="caption" color="muted">vs first sem</Typography>
            </div>
          </div>
        </div>

        <div className="h-[280px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
                horizontal={true}
              />
              <XAxis
                dataKey="semester"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-ui)" }}
                dy={10}
              />
              <YAxis
                domain={[0, 4]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-ui)" }}
                tickCount={5}
                tickFormatter={(value) => value.toFixed(1)}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Cumulative GPA Area */}
              <Area
                type="monotone"
                dataKey="cumulativeGPA"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="var(--accent-primary)"
                fillOpacity={0.15}
                connectNulls
              />
              
              {/* Cumulative GPA Line */}
              <Line
                type="monotone"
                dataKey="cumulativeGPA"
                stroke="var(--accent-primary)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "var(--accent-primary)", stroke: "var(--bg-base)", strokeWidth: 2 }}
                connectNulls
              />
              
              {/* Semester GPA Line */}
              <Line
                type="monotone"
                dataKey="gpa"
                stroke="var(--accent-cyan)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 5, fill: "var(--accent-cyan)", stroke: "var(--bg-base)", strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 rounded" style={{ background: "linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))" }} />
            <Typography variant="caption" color="secondary">Cumulative GPA</Typography>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 rounded" style={{ background: "linear-gradient(90deg, var(--accent-cyan), var(--accent-cyan))", borderTop: "2px dashed var(--accent-cyan)" }} />
            <Typography variant="caption" color="secondary">Semester GPA</Typography>
          </div>
        </div>
      </GlassCard>
    </motion.div>
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