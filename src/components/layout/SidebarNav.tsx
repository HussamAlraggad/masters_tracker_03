"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

interface SidebarNavProps {
  navigation: NavItem[];
  pathname: string;
  isOpen: boolean;
  onClose: () => void;
}

const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  plan: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  thesis: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  progress: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export function SidebarNav({ navigation, pathname, isOpen, onClose }: SidebarNavProps) {
  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden bg-bg-card border-r border-border-subtle flex flex-col"
            role="dialog"
            aria-label="Navigation"
          >
            <div className="flex flex-col h-full">
              <SidebarContent navigation={navigation} pathname={pathname} onClose={onClose} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:bg-bg-card lg:border-r lg:border-border-subtle lg:flex lg:flex-col">
        <div className="flex flex-col h-full">
          <SidebarContent navigation={navigation} pathname={pathname} onClose={onClose} />
        </div>
      </aside>
    </>
  );
}

function SidebarContent({ navigation, pathname, onClose }: { navigation: NavItem[]; pathname: string; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <Link href="/plan" className="flex items-center gap-3 px-2 py-4 mb-6" onClick={onClose}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))" }}>
          <svg className="w-6 h-6 text-bg-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <Typography variant="heading-md" weight="bold" color="primary" className="truncate">
            Master's Tracker
          </Typography>
          <Typography variant="caption" color="muted" className="truncate">
            HU SWE Master's
          </Typography>
        </div>
      </Link>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1" role="navigation" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/plan" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                "group",
                isActive
                  ? "bg-gradient-to-r from-accent-primary/20 to-accent-cyan/20 text-accent-primary border border-accent-primary/30"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={cn("flex-shrink-0 w-5 h-5", isActive && "text-accent-primary")}>
                {icons[item.icon]}
              </span>
              <Typography variant="body-sm" weight={isActive ? "semibold" : "medium"} className="truncate">
                {item.name}
              </Typography>
              {isActive && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 4 }}
                  exit={{ width: 0 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  style={{ background: "linear-gradient(180deg, var(--accent-primary), var(--accent-cyan))" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border-subtle pt-4 space-y-3">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
        >
          <span className="flex-shrink-0 w-5 h-5 text-text-muted">
            {icons.settings}
          </span>
          <Typography variant="body-sm" weight="medium">Settings</Typography>
        </Link>

        <GlassButton
          variant="ghost"
          size="md"
          fullWidth
          onClick={async () => {
            const supabase = (await import("@supabase/ssr")).createBrowserClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="justify-start"
        >
          <span className="flex items-center gap-3 w-full">
            <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <Typography variant="body-sm" weight="medium" color="secondary">Sign Out</Typography>
          </span>
        </GlassButton>
      </div>
    </div>
  );
}