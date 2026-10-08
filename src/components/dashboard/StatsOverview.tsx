"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { GlassCard } from "@/components/ui/GlassCard";
import { UserStats } from "@/types/database";

interface StatsOverviewProps {
  stats: UserStats;
  className?: string;
}

const statCards = [
  {
    key: "totalCredits",
    label: "Total Credits",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "from-accent-primary to-accent-cyan",
    gradient: "bg-gradient-to-br from-accent-primary/20 to-accent-cyan/20",
  },
  {
    key: "completedCredits",
    label: "Completed",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "from-status-completed to-accent-cyan",
    gradient: "bg-gradient-to-br from-status-completed/20 to-accent-cyan/20",
  },
  {
    key: "inProgressCredits",
    label: "In Progress",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "from-status-in-progress to-accent-primary",
    gradient: "bg-gradient-to-br from-status-in-progress/20 to-accent-primary/20",
  },
  {
    key: "gpa",
    label: "Current GPA",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "from-accent-purple to-accent-amber",
    gradient: "bg-gradient-to-br from-accent-purple/20 to-accent-amber/20",
  },
];

export function StatsOverview({ stats, className }: StatsOverviewProps) {
  return (
    <motion.div
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      {statCards.map((card, index) => {
        const value = card.key === "gpa" 
          ? stats.gpa.toFixed(2) 
          : stats[card.key as keyof UserStats];
        
        return (
          <motion.div
            key={card.key}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard 
              variant="border-glow" 
              padding="lg" 
              className={cn(
                "relative overflow-hidden",
                card.gradient
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-xl" style={{ background: `linear-gradient(135deg, ${card.color})` }}>
                  {card.icon}
                </div>
                <Typography variant="caption" color="muted" className="mt-1">
                  {card.label}
                </Typography>
              </div>
              
              <div className="relative">
                {card.key === "gpa" ? (
                  <div className="text-center">
                    <Typography variant="display-md" weight="bold" className="text-gradient font-mono">
                      {value}
                    </Typography>
                    <Typography variant="caption" color="muted" className="mt-1">/ 4.00</Typography>
                  </div>
                ) : (
                  <div className="flex items-end justify-between">
                    <div>
                      <Typography variant="display-lg" weight="bold" color="primary" className="font-mono">
                        {value}
                      </Typography>
                      <Typography variant="caption" color="muted">
                        / {stats.totalCredits} total
                      </Typography>
                    </div>
                    <ProgressRing
                      progress={stats.totalCredits > 0 ? (stats.completedCredits / stats.totalCredits) * 100 : 0}
                      size={50}
                      strokeWidth={4}
                      gradient
                      showBackground={false}
                    />
                  </div>
                )}
              </div>

              {/* Progress indicator for non-GPA cards */}
              {card.key !== "gpa" && stats.totalCredits > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completionPercentage}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full"
                      style={{ background: `linear-gradient(90deg, ${card.color})` }}
                    />
                  </div>
                  <Typography variant="caption" color="muted" className="mt-1 text-right">
                    {stats.completionPercentage.toFixed(1)}% complete
                  </Typography>
                </div>
              )}
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}