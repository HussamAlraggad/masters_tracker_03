"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/Typography";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GridBackground, GlowOrbs } from "@/components/ui/GridBackground";

const thesisMilestones = [
  { id: 1, title: "Topic Selection", description: "Choose and approve thesis topic with supervisor", status: "completed" as const, dueDate: "2024-10-15" },
  { id: 2, title: "Literature Review", description: "Complete comprehensive literature review", status: "in_progress" as const, dueDate: "2024-12-01" },
  { id: 3, title: "Methodology Design", description: "Design research methodology and approach", status: "planned" as const, dueDate: "2025-01-15" },
  { id: 4, title: "Data Collection", description: "Collect and prepare research data", status: "planned" as const, dueDate: "2025-03-01" },
  { id: 5, title: "Analysis & Results", description: "Analyze data and document findings", status: "planned" as const, dueDate: "2025-05-01" },
  { id: 6, title: "Thesis Writing", description: "Write complete thesis document", status: "planned" as const, dueDate: "2025-07-01" },
  { id: 7, title: "Review & Revisions", description: "Supervisor review and revisions", status: "planned" as const, dueDate: "2025-08-15" },
  { id: 8, title: "Final Defense", description: "Thesis defense presentation", status: "planned" as const, dueDate: "2025-09-15" },
];

export default function ThesisPage() {
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
            Thesis Tracker
          </Typography>
          <Typography variant="body" color="secondary">
            Track your thesis progress from topic selection to defense
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          {thesisMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard 
                variant="border-glow" 
                padding="lg"
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: milestone.status === "completed" 
                        ? "linear-gradient(135deg, var(--status-completed), var(--accent-cyan))"
                        : milestone.status === "in_progress"
                        ? "linear-gradient(135deg, var(--status-in-progress), var(--accent-primary))"
                        : "rgba(255,255,255,0.05)",
                    }}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + index * 0.08, type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {milestone.status === "completed" ? (
                      <svg className="w-6 h-6 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Typography variant="heading-md" weight="bold" style={{ color: milestone.status === "in_progress" ? "var(--text-inverse)" : "var(--text-muted)" }}>
                        {index + 1}
                      </Typography>
                    )}
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Typography variant="heading-md" weight="bold" color="primary">
                        {milestone.title}
                      </Typography>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: milestone.status === "completed" ? "rgba(0, 245, 255, 0.2)" :
                            milestone.status === "in_progress" ? "rgba(124, 255, 178, 0.2)" :
                            "rgba(255,255,255,0.05)",
                          color: milestone.status === "completed" ? "var(--status-completed)" :
                            milestone.status === "in_progress" ? "var(--status-in-progress)" :
                            "var(--text-muted)",
                        }}
                      >
                        {milestone.status === "completed" ? "Done" : 
                          milestone.status === "in_progress" ? "In Progress" : "Planned"}
                      </span>
                    </div>
                    <Typography variant="body-sm" color="secondary" className="mb-2">
                      {milestone.description}
                    </Typography>
                    <div className="flex items-center gap-4 text-sm">
                      <Typography variant="caption" color="muted">
                        Due: {new Date(milestone.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:ml-4">
                  <GlassButton variant="ghost" size="sm">
                    Details
                  </GlassButton>
                  {milestone.status === "planned" && (
                    <GlassButton variant="primary" size="sm" onClick={() => alert("Start milestone!")}>
                      Start
                    </GlassButton>
                  )}
                  {milestone.status === "in_progress" && (
                    <GlassButton variant="secondary" size="sm" onClick={() => alert("Mark complete!")}>
                      Complete
                    </GlassButton>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard variant="strong" padding="lg">
            <Typography variant="heading-lg" weight="bold" color="primary" className="mb-4">
              Overall Progress
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ background: "rgba(124, 255, 178, 0.1)" }}>
                <Typography variant="display-md" weight="bold" className="text-gradient font-mono">25%</Typography>
                <Typography variant="caption" color="muted">Complete</Typography>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: "rgba(0, 245, 255, 0.1)" }}>
                <Typography variant="display-md" weight="bold" className="text-gradient-primary font-mono">2/8</Typography>
                <Typography variant="caption" color="muted">Milestones</Typography>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: "rgba(192, 132, 252, 0.1)" }}>
                <Typography variant="display-md" weight="bold" className="text-gradient-warm font-mono">~8</Typography>
                <Typography variant="caption" color="muted">Months Left</Typography>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ background: "rgba(255, 214, 0, 0.1)" }}>
                <Typography variant="display-md" weight="bold" className="text-gradient-warm font-mono">Sep 2025</Typography>
                <Typography variant="caption" color="muted">Target Defense</Typography>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}