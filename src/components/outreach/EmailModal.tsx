"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Send, Loader2, Sparkles, ChevronDown,
  Clock, Bold, Italic, Link, AlignLeft, FileText,
  Pen, Calendar, User, AtSign, MessageSquare,
} from "lucide-react";
import type { ShortlistedCandidate } from "@/stores/shortlistStore";
import type { EmailPayload } from "@/types/email";
import { emailService } from "@/services/email.service";
import { candidateService } from "@/services/candidate.service";

interface Props {
  candidates: ShortlistedCandidate[];
  onClose:    () => void;
  onSent:     (ids: string[]) => void;
}

const TEMPLATES = [
  {
    label:   "Initial Outreach",
    subject: "Exciting Opportunity at Our Company",
    body:    "Hi {name},\n\nI came across your profile and was genuinely impressed by your expertise in {skills}. Your background aligns perfectly with an exciting opportunity we currently have available.\n\nWe are looking for talented professionals who can bring both technical depth and practical experience to our team. Based on your profile, I believe you could be a great fit.\n\nWould you be open to a brief 15-minute conversation this week to explore this further?\n\nLooking forward to hearing from you.",
  },
  {
    label:   "Application Confirmation",
    subject: "We Have Received Your Application — Thank You",
    body:    "Hi {name},\n\nThank you for submitting your application. We are writing to confirm that we have successfully received your resume and supporting materials.\n\nOur team is currently reviewing all applications and will be in touch if your profile matches our requirements. We appreciate your interest in joining our team.\n\nNo further action is required from your side at this stage.",
  },
  {
    label:   "Application Received — No Action",
    subject: "Thank You for Your Application",
    body:    "Hi {name},\n\nThank you for your interest in opportunities with our team. We have received your application and will carefully review all submissions.\n\nPlease note that due to the high volume of applications we receive, we will only be contacting candidates who have been shortlisted for further consideration. If you do not hear from us within the next few weeks, please consider your application unsuccessful on this occasion.\n\nWe appreciate the time you took to apply and wish you the best in your job search.",
  },
  {
    label:   "Interview Invitation",
    subject: "Interview Invitation — We Would Love to Meet You",
    body:    "Hi {name},\n\nThank you for your application. After carefully reviewing your profile and your impressive background in {skills}, we are pleased to invite you to the next stage of our selection process.\n\nWe would like to schedule a conversation to learn more about your experience and discuss how your skills align with the role. Please reply with your availability over the next few days and we will arrange a suitable time.\n\nWe look forward to speaking with you.",
  },
  {
    label:   "Request for Information",
    subject: "Next Steps — A Few Questions Before We Proceed",
    body:    "Hi {name},\n\nThank you for your application. We have reviewed your profile and are impressed by your background in {skills}.\n\nBefore we proceed to the next stage, we would appreciate if you could provide the following:\n\n• Your current salary expectations\n• Links to any relevant portfolio or work samples\n• Your earliest available start date\n\nPlease reply at your earliest convenience and we will be in touch shortly.",
  },
  {
    label:   "Holding — Process Delayed",
    subject: "Update on Your Application — We Are Still Reviewing",
    body:    "Hi {name},\n\nThank you for your patience throughout our hiring process. We wanted to reach out to let you know that we are still in the process of reviewing all applications and have not yet made a final decision.\n\nWe genuinely appreciate your continued interest and want to assure you that your application is still very much under consideration. We expect to have an update for you within the next week or two.\n\nThank you again for your understanding.",
  },
  {
    label:   "Follow Up",
    subject: "Following Up — Opportunity at Our Company",
    body:    "Hi {name},\n\nI wanted to follow up on my previous message regarding an opportunity that closely matches your {skills} expertise.\n\nI understand you may be busy, but I genuinely believe this role could be a great next step in your career. We offer a collaborative environment, competitive compensation, and exciting challenges.\n\nAre you available for a quick call this week or next?",
  },
  {
    label:   "Rejection (Generic)",
    subject: "Update on Your Application",
    body:    "Hi {name},\n\nThank you for your time and interest in opportunities with our team. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe had a strong pool of candidates and this was a difficult decision. We encourage you to keep an eye on our future openings as we are always looking for talented professionals.\n\nWe wish you all the best in your career journey.",
  },
  {
    label:   "Rejection (Personalised)",
    subject: "A Personal Update on Your Application",
    body:    "Hi {name},\n\nThank you so much for taking the time to interview with us. It was a genuine pleasure learning about your experience in {skills} and your career journey.\n\nAfter much deliberation, we have made the difficult decision to move forward with another candidate whose profile more closely matches our immediate requirements. This was not an easy decision — your background and enthusiasm were truly impressive.\n\nWe would love to stay in touch and will certainly keep your profile on file for future opportunities that may be a stronger fit.\n\nThank you again and we wish you every success.",
  },
  {
    label:   "Offer Letter Intro",
    subject: "Exciting News — We Would Like to Make You an Offer",
    body:    "Hi {name},\n\nI am delighted to inform you that following our recent conversations, we would like to extend a formal offer to you to join our team.\n\nYour expertise in {skills} and the enthusiasm you demonstrated throughout our discussions have convinced us that you are the right person for this role.\n\nPlease expect a detailed offer letter shortly. In the meantime, feel free to reach out with any questions. Congratulations and welcome aboard!",
  },
];
const DEFAULT_SIGNATURE = "\n\nBest regards,\nThe Recruitment Team\nCV AI Platform";

function personalise(text: string, candidate: ShortlistedCandidate): string {
  const firstName = candidate.name.split(" ")[0];
  const topSkills = candidate.skills
    ? candidate.skills.split(",").slice(0, 3).map((s) => s.trim()).join(", ")
    : "your skills";
  return text
    .replace(/\{name\}/g,   firstName)
    .replace(/\{skills\}/g, topSkills);
}

export function EmailModal({ candidates, onClose, onSent }: Props) {
  const [subject,       setSubject]       = useState(TEMPLATES[0].subject);
  const [body,          setBody]          = useState(TEMPLATES[0].body + DEFAULT_SIGNATURE);
  const [cc,            setCc]            = useState("");
  const [bcc,           setBcc]           = useState("");
  const [signature,     setSignature]     = useState(DEFAULT_SIGNATURE);
  const [scheduleDate,  setScheduleDate]  = useState("");
  const [scheduleTime,  setScheduleTime]  = useState("");
  const [sending,       setSending]       = useState(false);
  const [sent,          setSent]          = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [showTemplate,  setShowTemplate]  = useState(false);
  const [showSchedule,  setShowSchedule]  = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showCcBcc,     setShowCcBcc]     = useState(false);
  const [activeTab,     setActiveTab]     = useState<"compose" | "preview">("compose");
  const [preview,       setPreview]       = useState<ShortlistedCandidate>(candidates[0]);
  const [appliedTemplate, setAppliedTemplate] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<string | null>(null);

  const templateRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showTemplate || showSchedule || showSignature) {
          setShowTemplate(false);
          setShowSchedule(false);
          setShowSignature(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, showTemplate, showSchedule, showSignature]);

  useEffect(() => {
    if (!showTemplate) return;
    const handler = (e: MouseEvent) => {
      if (templateRef.current && !templateRef.current.contains(e.target as Node)) {
        setShowTemplate(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTemplate]);

  // Load draft if exists
  useEffect(() => {
    try {
      const draft = localStorage.getItem("cv_ai_email_draft");
      if (draft) {
        const d = JSON.parse(draft);
        if (d.subject) setSubject(d.subject);
        if (d.body)    setBody(d.body);
        if (d.cc)      setCc(d.cc);
        if (d.bcc)     setBcc(d.bcc);
      }
    } catch {}
  }, []);

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setSubject(t.subject);
    setBody(t.body + signature);
    setAppliedTemplate(t.label);
    setShowTemplate(false);
  }

  function insertFormat(before: string, after: string = before) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start    = textarea.selectionStart;
    const end      = textarea.selectionEnd;
    const selected = body.substring(start, end);
    const newBody  = body.substring(0, start) + before + selected + after + body.substring(end);
    setBody(newBody);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }

  function insertLink() {
    const url  = prompt("Enter URL:");
    const text = prompt("Enter link text:");
    if (url && text) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start   = textarea.selectionStart;
      const newBody = body.substring(0, start) + text + " (" + url + ")" + body.substring(start);
      setBody(newBody);
    }
  }

  function saveDraft() {
    localStorage.setItem("cv_ai_email_draft", JSON.stringify({ subject, body, cc, bcc }));
    const btn = document.getElementById("save-draft-btn");
    if (btn) { btn.textContent = "Saved!"; setTimeout(() => { if (btn) btn.textContent = "Save Draft"; }, 2000); }
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setError(null);

    // Map template to pipeline stage
    const TEMPLATE_STAGE_MAP: Record<string, string> = {
      "Initial Outreach":              "Outreach",
      "Application Confirmation":      "Applied",
      "Application Received — No Action": "Rejected",
      "Interview Invitation":          "Interview",
      "Request for Information":       "Screening",
      "Holding — Process Delayed":     "On Hold",
      "Follow Up":                     "Outreach",
      "Rejection (Generic)":           "Rejected",
      "Rejection (Personalised)":       "Rejected",
      "Offer Letter Intro":            "Offer"
    };

    const scheduledTime = scheduleDate && scheduleTime
      ? new Date(scheduleDate + "T" + scheduleTime).toISOString()
      : undefined;

    try {
      // Send emails
      const emailResults = await Promise.allSettled(
        candidates.map((c) =>
          emailService.send({
            candidate_id:    c.id,
            candidate_email: c.email,
            candidate_name:  c.name,
            subject:         personalise(subject, c),
            body:            personalise(body, c),
            scheduled_time:  scheduledTime,
          } as EmailPayload)
        )
      );

      // Successfully sent candidates
      const successIds = emailResults
        .map((r, i) => r.status === "fulfilled" ? candidates[i].id : null)
        .filter(Boolean) as string[];

      // If template was used, update pipeline stage for successful sends
      if (appliedTemplate && TEMPLATE_STAGE_MAP[appliedTemplate] && successIds.length > 0) {
        const stage = TEMPLATE_STAGE_MAP[appliedTemplate];
        await Promise.allSettled(
          successIds.map(id => candidateService.updateStage(id, stage))
        );
      }

      const failed = emailResults.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        setError(failed + " email(s) failed to send.");
      } else {
        setSent(true);
        localStorage.removeItem("cv_ai_email_draft");
        setStatusInfo("Done!");
        setTimeout(() => {
          onSent(candidates.map((c) => c.id));
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Email send error:", err);
      setError(err.message || "Failed to send emails. Please try again.");
    } finally {
      setSending(false);
      setStatusInfo(null);
    }
  }

  const isScheduled = scheduleDate && scheduleTime;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{ opacity: 0,   scale: 0.95, y: 16  }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-background/97 backdrop-blur-xl overflow-hidden flex flex-col"
          style={{
            maxHeight: "92vh",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 24px 64px rgba(0,0,0,0.7)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <Mail strokeWidth={1.5} className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Compose Email</h2>
                <p className="text-xs text-muted-foreground">
                  Sending to {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
                  {isScheduled && (
                    <span className="text-emerald-400 ml-1">
                      · Scheduled
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Compose / Preview tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/8">
              {(["compose", "preview"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={"text-xs px-3 py-1 rounded-md transition-colors capitalize flex items-center gap-1 " + (
                    activeTab === tab
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "compose"
                    ? <Pen       strokeWidth={1.5} className="w-3 h-3" />
                    : <FileText  strokeWidth={1.5} className="w-3 h-3" />
                  }
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
            >
              <X strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            {activeTab === "compose" ? (
              <>
                {/* To */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <User strokeWidth={1.5} className="w-3.5 h-3.5" />
                    To
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 min-h-[44px]">
                    {candidates.map((c) => (
                      <span
                        key={c.id}
                        onClick={() => setPreview(c)}
                        title={c.email}
                        className={"flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-colors " + (
                          preview?.id === c.id
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/25"
                        )}
                      >
                        {c.name}
                        <span className="text-[9px] opacity-50">{c.email ? "✓" : "no email"}</span>
                      </span>
                    ))}
                  </div>
                  {candidates.length > 1 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Click a name to preview their personalised email
                    </p>
                  )}
                </div>

                {/* CC/BCC */}
                <div>
                  <button
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AtSign strokeWidth={1.5} className="w-3.5 h-3.5" />
                    {showCcBcc ? "Hide CC / BCC" : "Add CC / BCC"}
                  </button>
                  <AnimatePresence>
                    {showCcBcc && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2 space-y-2"
                      >
                        {[["CC", cc, setCc], ["BCC", bcc, setBcc]].map(([label, val, setter]) => (
                          <div key={label as string} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-8 shrink-0">{label as string}</span>
                            <input
                              value={val as string}
                              onChange={(e) => (setter as any)(e.target.value)}
                              placeholder={(label as string).toLowerCase() + "@example.com"}
                              className="flex-1 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/40 transition-colors"
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Template picker */}
                  <div className="relative" ref={templateRef}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowTemplate(!showTemplate); }}
                      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                    >
                      <Sparkles strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-400" />
                      Templates
                      <ChevronDown strokeWidth={1.5} className={"w-3 h-3 transition-transform " + (showTemplate ? "rotate-180" : "")} />
                    </button>
                    <AnimatePresence>
                      {showTemplate && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0  }}
                          exit={{ opacity: 0,   y: -4  }}
                          className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-white/15 overflow-hidden"
                          style={{ zIndex: 9999, background: "#0f1117", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
                        >
                          {TEMPLATES.map((t, i) => (
                            <button
                              key={t.label}
                              onClick={() => applyTemplate(t)}
                              className={"w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors " + (i < TEMPLATES.length - 1 ? "border-b border-white/5" : "")}
                            >
                              {t.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-px h-4 bg-white/10" />

                  {/* Formatting */}
                  {[
                    { icon: Bold,     title: "Bold",         action: () => insertFormat("**") },
                    { icon: Italic,   title: "Italic",       action: () => insertFormat("_") },
                    { icon: Link,     title: "Insert link",  action: insertLink },
                    { icon: AlignLeft,title: "Bullet point", action: () => setBody((b) => b + "\n• ") },
                  ].map(({ icon: Icon, title, action }) => (
                    <button
                      key={title}
                      onClick={action}
                      title={title}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                    >
                      <Icon strokeWidth={1.5} className="w-3.5 h-3.5" />
                    </button>
                  ))}

                  <div className="w-px h-4 bg-white/10" />

                  {/* Signature */}
                  <button
                    onClick={() => setShowSignature(!showSignature)}
                    className={"flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors " + (
                      showSignature
                        ? "border-blue-500/25 bg-blue-500/10 text-blue-300"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Pen strokeWidth={1.5} className="w-3 h-3" />
                    Signature
                  </button>

                  {/* Schedule */}
                  <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className={"flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors " + (
                      isScheduled
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                        : showSchedule
                          ? "border-blue-500/25 bg-blue-500/10 text-blue-300"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock strokeWidth={1.5} className="w-3 h-3" />
                    {isScheduled ? "Scheduled ✓" : "Schedule"}
                  </button>
                </div>

                {/* Signature editor */}
                <AnimatePresence>
                  {showSignature && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Email Signature</p>
                        <textarea
                          value={signature}
                          onChange={(e) => {
                            setSignature(e.target.value);
                            setBody((b) => {
                              const sigStart = b.lastIndexOf("\n\nBest regards,");
                              if (sigStart !== -1) return b.substring(0, sigStart) + e.target.value;
                              return b + e.target.value;
                            });
                          }}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground outline-none focus:border-blue-500/40 resize-none transition-colors"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Schedule picker */}
                <AnimatePresence>
                  {showSchedule && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Calendar strokeWidth={1.5} className="w-3.5 h-3.5 text-blue-400" />
                          Schedule Send
                        </p>
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] text-muted-foreground mb-1 block">Date</label>
                            <input
                              type="date"
                              value={scheduleDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground outline-none focus:border-blue-500/40 transition-colors"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-muted-foreground mb-1 block">Time</label>
                            <input
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground outline-none focus:border-blue-500/40 transition-colors"
                            />
                          </div>
                          {(scheduleDate || scheduleTime) && (
                            <button
                              onClick={() => { setScheduleDate(""); setScheduleTime(""); }}
                              className="text-xs text-red-400 hover:text-red-300 h-9 transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {isScheduled && (
                          <p className="text-xs text-emerald-400">
                            Will send: {new Date(scheduleDate + "T" + scheduleTime).toLocaleString([], {
                              weekday: "long", month: "long", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subject */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/40 transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare strokeWidth={1.5} className="w-3.5 h-3.5" />
                      Message
                    </label>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{wordCount} words · {charCount} chars</span>
                      {candidates.length > 1 && preview && (
                        <span className="text-blue-400">Preview: {preview.name}</span>
                      )}
                    </div>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={"Write your message...\n\nUse {name} and {skills} for personalisation"}
                    rows={10}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-blue-500/40 resize-none transition-colors leading-relaxed font-mono"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-muted-foreground">
                      Click to insert:{" "}
                      <button onClick={() => setBody((b) => b + "{name}")}   className="text-blue-400 hover:text-blue-300">{"{name}"}</button>
                      {" · "}
                      <button onClick={() => setBody((b) => b + "{skills}")} className="text-blue-400 hover:text-blue-300">{"{skills}"}</button>
                    </p>
                    <button
                      onClick={() => setBody(TEMPLATES[0].body + signature)}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Reset body
                    </button>
                  </div>
                </div>

              </>
            ) : (
              /* Preview Tab */
              <div className="space-y-4">
                {candidates.length > 1 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Preview for:</span>
                    {candidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPreview(c)}
                        className={"text-xs px-2.5 py-1 rounded-full border transition-colors " + (
                          preview?.id === c.id
                            ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {preview && (
                  <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/8 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-8 shrink-0 mt-0.5">To</span>
                        <span className="text-sm text-foreground">
                          {preview.name}
                          {preview.email && <span className="text-muted-foreground ml-2 text-xs">&lt;{preview.email}&gt;</span>}
                        </span>
                      </div>
                      {cc && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">CC</span>
                          <span className="text-sm text-muted-foreground">{cc}</span>
                        </div>
                      )}
                      {bcc && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">BCC</span>
                          <span className="text-sm text-muted-foreground">{bcc}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-8">Sub</span>
                        <span className="text-sm font-medium text-foreground">{personalise(subject, preview)}</span>
                      </div>
                      {isScheduled && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">Send</span>
                          <span className="text-xs text-emerald-400">
                            {new Date(scheduleDate + "T" + scheduleTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                        {personalise(body, preview)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400">
                <X strokeWidth={1.5} className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-white/8 shrink-0">
            <button
              onClick={onClose}
              className="h-10 px-5 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-draft-btn"
              onClick={saveDraft}
              className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 text-sm text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleSend}
              disabled={sending || sent || !subject.trim() || !body.trim()}
              className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            >
              {statusInfo && (
                <span className="text-[10px] text-blue-400 font-mono italic mr-2 animate-pulse">
                  {statusInfo}
                </span>
              )}
              {sent ? (
                <>{isScheduled ? "✓ Scheduled!" : "✓ Sent!"}</>
              ) : sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{isScheduled ? "Scheduling..." : "Sending..."}</>
              ) : isScheduled ? (
                <><Calendar strokeWidth={1.5} className="w-4 h-4" />Schedule for {candidates.length}</>
              ) : (
                <><Send strokeWidth={1.5} className="w-4 h-4" />Send to {candidates.length}</>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
