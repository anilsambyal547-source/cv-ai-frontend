"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase,
  GraduationCap, Award, Zap, Loader2, Sparkles,
  CheckCircle, AlertCircle, MessageSquare, Users,
  Eye, Download, X,
} from "lucide-react";
import { useCandidate, useInsights } from "@/hooks/useCandidate";
import { useSimilarCandidates } from "@/hooks/useAnalytics";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import type { WorkExperience } from "@/types/candidates";
import { useChartTheme } from "@/hooks/useChartTheme";
import { useState } from "react";
import { getResourceUrl } from "@/lib/api-config";

interface GlassCardProps {
  children:   React.ReactNode;
  className?: string;
  delay?:     number;
  glow?:      boolean;
}

function GlassCard({ children, className = "", delay = 0, glow = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={"glass-panel " + (glow ? "glass-panel-teal" : "") + " " + className + " p-5 overflow-hidden"}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
      {children}
    </motion.div>
  );
}

function SkillTag({ skill, onClick }: { skill: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-300 transition-all font-medium"
    >
      {skill}
    </button>
  );
}

function FitRadar({ skills, years }: { skills: string[]; years: number }) {
  const t = useChartTheme();
  const data = [
    { cat: "Technical",  val: Math.min(100, 30 + skills.length * 4) },
    { cat: "Experience", val: Math.min(100, years * 10)              },
    { cat: "Skills",     val: Math.min(100, 20 + skills.length * 5)  },
    { cat: "Seniority",  val: Math.min(100, 20 + years * 8)          },
    { cat: "Breadth",    val: Math.min(100, 10 + skills.length * 3)  },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
        <defs>
          <radialGradient id="fitRad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={t.colors.primary} stopOpacity={0.5}  />
            <stop offset="100%" stopColor={t.colors.primary} stopOpacity={0.05} />
          </radialGradient>
        </defs>
        <PolarGrid stroke={t.grid} gridType="polygon" />
        <PolarAngleAxis dataKey="cat" tick={{ fill: t.text, fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background:   t.tooltip.bg,
            border:       `1px solid ${t.tooltip.border}`,
            borderRadius: "10px",
            fontSize:     "12px",
            color:        t.tooltip.text,
            boxShadow:    "0 8px 32px rgba(0,0,0,0.15)",
            backdropFilter: "blur(12px)",
          }}
          itemStyle={{ color: t.tooltip.text }}
        />
        <Radar
          dataKey="val"
          stroke={t.colors.primary}
          strokeWidth={2}
          fill="url(#fitRad)"
          dot={{ fill: t.colors.primary, r: 3, strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-24 rounded-lg bg-muted/40" />
      <div className="h-32 rounded-2xl bg-muted/40 border border-muted/20" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-muted/40 border border-muted/20" />
        ))}
      </div>
    </div>
  );
}

export default function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [showCV, setShowCV] = useState(false);

  const { profile, loading, error }                                              = useCandidate(id);
  const { insights, loading: insightsLoading, error: insightsError, generate }  = useInsights(id);
  const { data: similar }                                                        = useSimilarCandidates(id);

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle strokeWidth={1.5} className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{error ?? "Candidate not found"}</p>
          <p className="text-xs text-muted-foreground mt-1">The candidate may have been removed.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
          Go back
        </button>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const emailHref = "mailto:" + profile.email;

  return (
    <div className="space-y-5 max-w-7xl pb-10">

      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
        Back to results
      </motion.button>

      {/* PDF View Modal */}
      <AnimatePresence>
        {showCV && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCV(false)}
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full h-full max-w-5xl bg-background rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col"
              style={{ boxShadow: "0 24px 64px -12px rgba(0,0,0,0.5)" }}
            >
              {/* Tool bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Eye className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Original CV</h2>
                    <p className="text-[10px] text-muted-foreground">{profile?.name}.pdf</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a 
                    href={getResourceUrl(`/api/candidate/${id}/cv`)}
                    download
                    className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  <button 
                    onClick={() => setShowCV(false)}
                    className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              
              {/* Viewer */}
              <div className="flex-1 bg-neutral-900 overflow-hidden flex items-center justify-center">
                <iframe 
                  src={getResourceUrl(`/api/candidate/${id}/cv#toolbar=1&navpanes=0&scrollbar=1`)}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <GlassCard delay={0}>
        <div className="flex items-start gap-5">

          <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center text-xl font-bold text-white/90">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">

              {profile.email && (
                <a href={emailHref} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-300 transition-colors">
                  <Mail strokeWidth={1.5} className="w-3.5 h-3.5" />
                  {profile.email}
                </a>
              )}

              {profile.phone && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone strokeWidth={1.5} className="w-3.5 h-3.5" />
                  {profile.phone}
                </span>
              )}

              {profile.location && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin strokeWidth={1.5} className="w-3.5 h-3.5" />
                  {profile.location}
                </span>
              )}

              {profile.seniority && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Briefcase strokeWidth={1.5} className="w-3.5 h-3.5" />
                  {profile.seniority} · {profile.years_experience}y exp
                </span>
              )}

              {profile.education_level && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GraduationCap strokeWidth={1.5} className="w-3.5 h-3.5" />
                  {profile.education_level}
                </span>
              )}

            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {profile.industry && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 capitalize font-medium">
                {profile.industry}
              </span>
            )}
            <div className="flex items-center gap-2">
              {profile.has_file && (
                <button
                  onClick={() => setShowCV(true)}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-foreground font-medium transition-all"
                >
                  <Eye strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  View Original CV
                </button>
              )}
              <button
                onClick={() => generate()}
                disabled={insightsLoading}
                className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.97] disabled:opacity-50 text-white font-medium transition-all"
              >
                {insightsLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
                    Generate AI Insights
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </GlassCard>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT */}
        <div className="space-y-4">

          <GlassCard delay={0.05}>
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Zap strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
              Skills
              <span className="text-xs text-muted-foreground ml-auto">{profile.skills.length}</span>
            </h3>
            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill: string) => (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    onClick={() => router.push("/search?q=" + encodeURIComponent(skill))}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No skills listed</p>
            )}
          </GlassCard>

          {profile.education.length > 0 && (
            <GlassCard delay={0.1}>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <GraduationCap strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
                Education
              </h3>
              <div className="space-y-2">
                {profile.education.map((edu: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-1.5 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{edu}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {profile.certifications.length > 0 && (
            <GlassCard delay={0.15}>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Award strokeWidth={1.5} className="w-4 h-4 text-amber-400" />
                Certifications
              </h3>
              <div className="space-y-1.5">
                {profile.certifications.map((cert: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-1.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{cert}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <GlassCard delay={0.2}>
            <h3 className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
              <Zap strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
              Capability Radar
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Estimated fit across dimensions</p>
            <FitRadar skills={profile.skills} years={profile.years_experience} />
          </GlassCard>

        </div>

        {/* MIDDLE */}
        <div className="space-y-4">

          {profile.summary && (
            <GlassCard delay={0.05}>
              <h3 className="text-sm font-medium text-foreground mb-2">Profile Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.summary}</p>
            </GlassCard>
          )}

          <GlassCard delay={0.1}>
            <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Briefcase strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
              Experience
              {profile.years_experience > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {profile.years_experience}y total
                </span>
              )}
            </h3>

            {profile.work_experience.length > 0 ? (
              <div className="relative space-y-4">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/40 via-white/10 to-transparent" />
                {profile.work_experience.map((exp: WorkExperience, i: number) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mt-0.5 z-10">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                    <div className="flex-1 pb-2 min-w-0">
                      {exp.job_title && (
                        <p className="text-sm font-medium text-foreground">{exp.job_title}</p>
                      )}
                      {exp.company && (
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5 font-medium">{exp.company}</p>
                      )}
                      {(exp.start_date || exp.end_date) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exp.start_date}
                          {exp.end_date ? " — " + exp.end_date : " — Present"}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No experience listed</p>
            )}
          </GlassCard>

        </div>

        {/* RIGHT — AI Insights */}
        <div className="space-y-4">

          <AnimatePresence>
            {insightsError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
              >
                {insightsError}
              </motion.div>
            )}
          </AnimatePresence>

          {!insights && !insightsLoading && (
            <GlassCard delay={0.05}>
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Sparkles strokeWidth={1.5} className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">AI Insights</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                    Generate AI-powered summary, strengths, weaknesses and interview questions
                  </p>
                </div>
                <button
                  onClick={() => generate()}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white font-medium transition-all"
                >
                  <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5" />
                  Generate Now
                </button>
              </div>
            </GlassCard>
          )}

          {insightsLoading && (
            <GlassCard delay={0} glow>
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="text-sm text-muted-foreground">Analyzing with Gemini...</p>
              </div>
            </GlassCard>
          )}

          <AnimatePresence>
            {insights && !insightsLoading && (
              <div className="space-y-4">

                <GlassCard delay={0} glow>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-medium text-foreground">AI Summary</h3>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-300 font-medium">
                      Gemini
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
                </GlassCard>

                {insights.strengths.length > 0 && (
                  <GlassCard delay={0.05}>
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle strokeWidth={1.5} className="w-4 h-4 text-emerald-400" />
                      Strengths
                    </h3>
                    <div className="space-y-2">
                      {insights.strengths.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {insights.weaknesses.length > 0 && (
                  <GlassCard delay={0.1}>
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-amber-400" />
                      Areas to Explore
                    </h3>
                    <div className="space-y-2">
                      {insights.weaknesses.map((w: string, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {insights.interview_questions.length > 0 && (
                  <GlassCard delay={0.15}>
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <MessageSquare strokeWidth={1.5} className="w-4 h-4 text-purple-400" />
                      Interview Questions
                    </h3>
                    <div className="space-y-3">
                      {insights.interview_questions.map((q: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-xs font-bold text-purple-400 shrink-0 mt-0.5 w-4">
                            {i + 1}.
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <button
                  onClick={() => generate()}
                  className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors border border-black/5 dark:border-white/5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Regenerate insights
                </button>

              </div>
            )}
          </AnimatePresence>

          {similar.length > 0 && (
            <GlassCard delay={0.2}>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Users strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
                Similar Candidates
              </h3>
              <div className="space-y-1.5">
                {similar.slice(0, 5).map((s: any) => (
                    <button
                    key={s.id}
                    onClick={() => router.push("/candidates/" + s.id)}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group border border-transparent hover:border-black/5 dark:hover:border-white/5"
                  >
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-white/70">
                      {s.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate group-hover:text-blue-300 transition-colors">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(s.similarity * 100)}% skill match
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
}
