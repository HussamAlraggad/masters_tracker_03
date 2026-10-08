"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Typography } from "@/components/ui/Typography";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface GlassHeaderProps {
  onMenuClick: () => void;
  onSignOut: () => void;
}

export function GlassHeader({ onMenuClick, onSignOut }: GlassHeaderProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 lg:ml-64"
    >
      <GlassCard variant="strong" padding="none" className="border-b border-border-glass">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Left Side - Menu Button & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl glass-card border-border-glass text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="hidden sm:block">
              <Typography variant="heading-md" weight="bold" color="primary">
                Master's Tracker
              </Typography>
            </div>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle (placeholder for future) */}
            <GlassButton variant="ghost" size="icon" className="hidden md:flex">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </GlassButton>

            {/* Notifications (placeholder) */}
            <GlassButton variant="ghost" size="icon" className="hidden md:flex relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-coral flex items-center justify-center text-[10px] font-bold text-white">3</span>
            </GlassButton>

            {/* User Menu */}
            <UserMenu onSignOut={onSignOut} />
          </div>
        </div>
      </GlassCard>
    </motion.header>
  );
}

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl glass-card border-border-glass hover:bg-white/5 transition-all duration-200 group"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-bold text-text-inverse" style={{ background: "linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))" }}>
          HU
        </div>
        <div className="hidden md:block text-left">
          <Typography variant="body-sm" weight="semibold" color="primary">SWE Student</Typography>
          <Typography variant="caption" color="muted">Master's Program</Typography>
        </div>
        <svg className={cn("w-4 h-4 text-text-muted transition-transform", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-56 z-50"
            role="menu"
          >
            <GlassCard variant="strong" padding="md">
              <div className="px-3 py-2 border-b border-border-subtle">
                <Typography variant="body-sm" weight="semibold" color="primary">SWE Student</Typography>
                <Typography variant="caption" color="muted">hashemite.edu.jo</Typography>
              </div>
              
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <Typography variant="body-sm" weight="medium">Settings</Typography>
              </Link>
              
              <Link
                href="/plan"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <Typography variant="body-sm" weight="medium">My Plan</Typography>
              </Link>
              
              <div className="border-t border-border-subtle my-2" />
              
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-accent-coral hover:bg-accent-coral/10 transition-colors"
                role="menuitem"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <Typography variant="body-sm" weight="medium">Sign Out</Typography>
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}