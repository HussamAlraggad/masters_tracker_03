"use client";

import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlassCard } from "@/components/ui/GlassCard";

interface PlanLegendProps {
  className?: string;
}

export function PlanLegend({ className }: PlanLegendProps) {
  const legendItems = [
    { status: "planned" as const, label: "Planned", description: "Course registered for future semester" },
    { status: "in_progress" as const, label: "In Progress", description: "Currently taking this semester" },
    { status: "completed" as const, label: "Completed", description: "Finished with grade earned" },
    { status: "dropped" as const, label: "Dropped", description: "Withdrawn before completion" },
    { status: "failed" as const, label: "Failed", description: "Did not pass, may retake" },
    { status: "exempted" as const, label: "Exempted", description: "Credits granted via transfer/equivalency" },
  ];

  return (
    <GlassCard variant="default" padding="md" className={cn("w-full", className)}>
      <Typography variant="heading-md" weight="semibold" color="primary" className="mb-4">
        Course Status Legend
      </Typography>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {legendItems.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/5 group"
          >
            <StatusBadge status={item.status} size="md" variant="pill" showLabel={false} />
            <div className="flex-1 min-w-0">
              <Typography variant="body-sm" weight="medium" color="primary">
                {item.label}
              </Typography>
              <Typography variant="caption" color="muted" className="truncate">
                {item.description}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}