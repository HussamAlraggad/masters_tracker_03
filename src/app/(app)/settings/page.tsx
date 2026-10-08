"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { Typography } from "@/components/ui/Typography";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GridBackground, GlowOrbs } from "@/components/ui/GridBackground";
import { StatusBadge } from "@/components/ui/StatusBadge";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    university: "Hashemite University",
    faculty: "Prince Al-Hussein Bin Abdullah II Faculty of IT",
    department: "Software Engineering",
    major: "SWE Master",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || "",
            university: data.university || "Hashemite University",
            faculty: data.faculty || "Prince Al-Hussein Bin Abdullah II Faculty of IT",
            department: data.department || "Software Engineering",
            major: data.major || "SWE Master",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert("Profile saved successfully!");
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const response = await fetch("/api/courses/scrape", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scraping failed");
      setScrapeResult(`Success! Scraped ${data.count} courses.`);
    } catch (err: any) {
      setScrapeResult(`Error: ${err.message}`);
    } finally {
      setScraping(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: courses } = await supabase
        .from("courses")
        .select(`
          *,
          course_status!left (
            status,
            grade,
            semester_taken,
            year_taken,
            credits_earned,
            notes
          )
        `)
        .eq("course_status.user_id", user.id);

      const exportData = {
        profile,
        courses: courses?.map(c => ({
          ...c,
          user_status: c.course_status?.[0]?.status,
          user_grade: c.course_status?.[0]?.grade,
          user_semester_taken: c.course_status?.[0]?.semester_taken,
          user_year_taken: c.course_status?.[0]?.year_taken,
          user_credits_earned: c.course_status?.[0]?.credits_earned,
          user_notes: c.course_status?.[0]?.notes,
        })),
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `masters-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Import logic would go here
        alert(`Import ready for ${data.courses?.length || 0} courses. Feature coming soon!`);
      } catch {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <GridBackground animate speed={15} />
        <GlowOrbs count={4} speed={0.8} />
        <Typography variant="heading-lg" color="primary">Loading settings...</Typography>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <GridBackground animate speed={12} opacity={0.5} />
      <GlowOrbs count={3} speed={0.5} opacity={0.3} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <Typography variant="display-lg" weight="bold" className="text-gradient mb-1">
            Settings
          </Typography>
          <Typography variant="body" color="secondary">
            Manage your account, data, and preferences
          </Typography>
        </motion.div>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <GlassCard variant="border-glow" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <Typography variant="heading-lg" weight="bold" color="primary">Profile</Typography>
              <StatusBadge status="completed" size="sm" variant="pill" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border-border-glass text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">University</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border-border-glass text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Faculty</label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border-border-glass text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border-border-glass text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Major</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card border-border-glass text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
              </div>
            </div>

            <GlassButton variant="primary" size="md" onClick={handleSaveProfile} loading={saving}>
              Save Profile
            </GlassButton>
          </GlassCard>
        </motion.section>

        {/* Data Management */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <GlassCard variant="border-glow" padding="lg">
            <Typography variant="heading-lg" weight="bold" color="primary" className="mb-6">
              Data Management
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <GlassCard variant="default" padding="md" className="h-full">
                <Typography variant="heading-md" weight="semibold" color="primary" className="mb-2">Export Data</Typography>
                <Typography variant="body-sm" color="secondary" className="mb-4">
                  Download a complete backup of your course plan, grades, and progress.
                </Typography>
                <GlassButton variant="outline" size="md" fullWidth onClick={handleExport}>
                  Export JSON
                </GlassButton>
              </GlassCard>

              <GlassCard variant="default" padding="md" className="h-full">
                <Typography variant="heading-md" weight="semibold" color="primary" className="mb-2">Import Data</Typography>
                <Typography variant="body-sm" color="secondary" className="mb-4">
                  Restore from a previously exported backup file.
                </Typography>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="w-full px-4 py-3 rounded-xl glass-card border-border-glass text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-primary/20 file:text-accent-primary hover:file:bg-accent-primary/30"
                />
              </GlassCard>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <Typography variant="heading-md" weight="semibold" color="primary" className="mb-4">Course Catalog Sync</Typography>
              <Typography variant="body-sm" color="secondary" className="mb-4">
                Fetch the latest course catalog from Hashemite University's official website.
              </Typography>
              <div className="flex items-center gap-4">
                <GlassButton variant="primary" size="md" onClick={handleScrape} loading={scraping} leftIcon={
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }>
                  Scrape Course Catalog
                </GlassButton>
                {scrapeResult && (
                  <Typography variant="body-sm" className={scrapeResult.startsWith("Error") ? "text-accent-coral" : "text-status-completed"}>
                    {scrapeResult}
                  </Typography>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard variant="border-glow" padding="lg" className="border-accent-coral/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255, 107, 107, 0.2)" }}>
                <svg className="w-5 h-5 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <Typography variant="heading-lg" weight="bold" style={{ color: "var(--accent-coral)" }}>Danger Zone</Typography>
                <Typography variant="body-sm" color="secondary">Irreversible actions</Typography>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255, 107, 107, 0.05)", border: "1px solid rgba(255, 107, 107, 0.2)" }}>
              <div>
                <Typography variant="body" weight="medium" color="primary">Sign Out Everywhere</Typography>
                <Typography variant="body-sm" color="secondary">Log out of all devices and sessions</Typography>
              </div>
              <GlassButton variant="destructive" size="md" onClick={async () => {
                await supabase.auth.signOut({ scope: "global" });
                window.location.href = "/login";
              }}>
                Sign Out Everywhere
              </GlassButton>
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}