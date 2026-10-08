"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { GlassHeader } from "@/components/layout/GlassHeader";

const navigation = [
  { name: "Dashboard", href: "/plan", icon: "dashboard" },
  { name: "Course Plan", href: "/plan", icon: "plan" },
  { name: "Thesis", href: "/thesis", icon: "thesis" },
  { name: "Progress", href: "/progress", icon: "progress" },
  { name: "Settings", href: "/settings", icon: "settings" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="relative min-h-screen bg-bg-base">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 animate-float" style={{ background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15 animate-float-delayed" style={{ background: "radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 animate-float-slow" style={{ background: "radial-gradient(circle, var(--accent-purple) 0%, transparent 70%)" }} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <SidebarNav
        navigation={navigation}
        pathname={pathname}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Header */}
        <GlassHeader
          onMenuClick={() => setSidebarOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Page Content */}
        <main className="p-6 lg:p-8 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}