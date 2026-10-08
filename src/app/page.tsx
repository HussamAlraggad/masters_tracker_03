"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { GridBackground, GlowOrbs, MeshGradient } from "@/components/ui/GridBackground";
import { Typography } from "@/components/ui/Typography";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/plan");
      } else {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router, supabase]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <GridBackground animate speed={15} />
      <GlowOrbs count={6} speed={0.8} />
      <MeshGradient speed={0.3} intensity={0.8} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-border-glass mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          <Typography variant="caption" color="accent" weight="medium">
            Loading your dashboard...
          </Typography>
        </motion.div>

        <Typography variant="display-xl" weight="bold" className="text-gradient mb-4">
          Master's Tracker
        </Typography>
        
        <Typography variant="heading-md" color="secondary" className="max-w-xl mx-auto mb-10">
          Hashemite University · Faculty of IT · Software Engineering Master's
        </Typography>

        <GlassCard variant="strong" padding="xl" className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))" }}
            >
              <svg className="w-6 h-6 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
            <Typography variant="body" color="secondary">
              Checking your session...
            </Typography>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}