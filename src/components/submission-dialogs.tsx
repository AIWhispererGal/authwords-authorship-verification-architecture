"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, FileText, Fingerprint, ShieldCheck, Upload, Check, LoaderCircle, LockKeyhole, BadgeCheck, MessageSquare, ExternalLink } from "lucide-react";
import { Modal, StatusBadge, DemoNotice } from "@/components/primitives";
import { api, deriveMetrics, formatDate } from "@/lib/client";
import { sampleText, type Submission, type WorkspaceData } from "@/lib/demo-data";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const flagCopy: Record<string, string> = {
  SHORT_SAMPLE: "This sample is short. A longer piece would provide more useful evidence.",
  PROMPT_BASELINE_REQUIRED: "Prompt engineering needs its own baseline. Generated essays are not compared with your writing profile.",
  STYLE_VARIATION: "This sample differs from the synthetic style baseline. A new genre or context may explain the change.",
  GENRE_SHIFT: "A discussion post can sound different from an essay. Additional context helps explain the difference.",
};

export function NewWorkDialog({ onClose, onComplete }: { onClose: () => void; onComplete: (submission: Submission) => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("Independent writing");
  const [mode, setMode] = useState("essay");
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(-1);
  const busy = step >= 0;
  const words = text.trim() ? (text.match(/[\p{L}\p{N}'’\-]+/gu) || []).length : 0;
  function useSample() { setText(sampleText); setTitle("A conversation about our shared spaces"); setCourse("SOC 210 · Urban Sociology"); setMode("essay"); setError(""); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (words < 50) { setError("Add at least 50 words, or use the sample to explore the demo."); return; }
    if (!consent) { setError("Please acknowledge the demo boundary before continuing."); return; }
    setError(""); setStep(0);
    try {
      const features = deriveMetrics(text);
      await sleep(300); setStep(1);
      setText("");
      await sleep(350); setStep(2);
      const result = await api<{ submission: Submission }>("/api/submissions", "POST", { title, course, mode, features });
      await sleep(300); setStep(3);
      await sleep(250); await onComplete(result.submission);
    } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); setStep(-1); }
  }
  return <Modal title={busy ? "A little proof in progress." : "Let your work speak for itself."} subtitle={busy ? "Your text never leaves this browser." : "Explore authorship verification with a synthetic writing sample."} onClose={() => { if (!busy) onClose(); }}>
    {busy ? <div className="verification-progress"><div className="progress-fingerprint"><Fingerprint size={55} strokeWidth={1.2}/></div><div className="progress-steps">{["Checking your opt-in preferences", "Calculating local writing metrics", "Comparing with a synthetic baseline", "Saving derived metrics only"].map((label, i) => <div className={`progress-step ${step >= i ? "reached" : ""}`} key={label}><span>{step > i ? <Check size={16}/> : step === i ? <LoaderCircle size={16} className="spin"/> : i + 1}</span>{label}</div>)}</div><p>No external model. No raw-text storage. Just a transparent demo.</p></div> : <form className="new-work-form" onSubmit={submit}>
      <DemoNotice>Use synthetic writing only. This reference app is not an institutional deployment or a trained authorship model.</DemoNotice>
      <label className="field-label">Title<input required minLength={3} maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your work a title"/></label>
      <div className="form-grid"><label className="field-label">Course<select value={course} onChange={e => setCourse(e.target.value)}><option>Independent writing</option><option>SOC 210 · Urban Sociology</option><option>PHIL 204 · Ethics & Technology</option><option>ENG 302 · Modern Literature</option><option>ENV 201 · Environmental Studies</option></select></label><label className="field-label">Assignment type<select value={mode} onChange={e => setMode(e.target.value)}><option value="essay">Essay / long-form</option><option value="discussion">Discussion post</option><option value="prompt">Prompt engineering</option><option value="review">Peer review</option></select></label></div>
      <div className="writing-field"><div className="field-top"><label className="field-label" htmlFor="writing-sample">Your writing sample</label><button type="button" className="text-button" onClick={useSample}>Use a sample <ArrowRight size={13}/></button></div><textarea id="writing-sample" maxLength={80000} value={text} onChange={e => setText(e.target.value)} placeholder="Paste a synthetic sample here. At least 50 words gives the demo something to work with…"/><div className="writing-footer"><label className="upload-link"><Upload size={13}/> Upload .txt<input type="file" accept=".txt,text/plain" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 80000 || !file.name.toLowerCase().endsWith(".txt")) { setError("Choose a plain-text (.txt) file smaller than 80 KB."); return; } setText(await file.text()); if (!title) setTitle(file.name.replace(/\.txt$/i, "").slice(0, 160)); setError(""); }}/></label><span>{words.toLocaleString()} words <span className="muted">· 50 minimum</span></span></div></div>
      <div className="privacy-inline"><LockKeyhole size={16}/><p>Text is processed locally in your browser. Only coarse metrics and the title you enter are saved. Browser memory erasure is not guaranteed.</p></div>
      <label className="checkbox-label"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/><span>I understand this is a synthetic demo, not an academic assessment.</span></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit"><Fingerprint size={16}/> Run demo verification <ArrowRight size={15}/></button></div>
    </form>}
  </Modal>;
}

export function SubmissionDialog({ submission, data, onClose, onRefresh, onShare, onToast }: { submission: Submission; data: WorkspaceData; onClose: () => void; onRefresh: () => Promise<void>; onShare: (id: string) => void; onToast: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const credential = data.credentials.find(c => c.submissionId === submission.id);
  async function mint() {
    if (credential) { onShare(credential.id); return; }
    setBusy(true); setError("");
    try { const c = await api<{ id: string }>("/api/credentials", "POST", { submissionId: submission.id }); await onRefresh(); onShare(c.id); }
    catch (err) { setError(err instanceof Error ? err.message : "Please try again."); } finally { setBusy(false); }
  }
  async function review() {
    setBusy(true); setError("");
    try { await api(`/api/submissions/${submission.id}`, "PATCH"); await onRefresh(); onToast("Demo review request saved. No instructor was contacted."); }
    catch (err) { setError(err instanceof Error ? err.message : "Please try again."); } finally { setBusy(false); }
  }
  return <Modal title="The story behind your submission" onClose={onClose}>
    <div className="submission-detail"><div className="detail-title"><div className="file-icon"><FileText size={22}/></div><div><h3>{submission.title}</h3><p>{submission.course}</p></div></div>
      <div className="result-banner"><div><span className="eyebrow">ILLUSTRATIVE AUTHORSHIP CONFIDENCE</span><div className="result-number">{submission.score === null ? "Not enough evidence" : <>{submission.score}<span>%</span></>}</div><StatusBadge status={submission.status}/></div><div className={`result-ring ${submission.score === null ? "neutral-ring" : ""}`}><Fingerprint size={47} strokeWidth={1.2}/></div></div>
      <div className="detail-meta"><div><span>Submitted</span><strong>{formatDate(submission.submittedAt)}</strong></div><div><span>Source</span><strong>{submission.source}</strong></div><div><span>Word count</span><strong>{submission.wordCount.toLocaleString()}</strong></div><div><span>Artifact</span><strong className="capitalize">{submission.mode}</strong></div></div>
      {submission.flags.length > 0 ? <div className="context-box"><h4><MessageSquare size={16}/> A little context goes a long way</h4>{submission.flags.map(flag => <p key={flag}>{flagCopy[flag] || flag.replaceAll("_", " ").toLowerCase()}</p>)}<p className="context-note">A different pattern is not evidence of misconduct. Your regular grade is unaffected.</p></div> : <div className="positive-box"><ShieldCheck size={20}/><div><strong>Your sample fits this demo profile.</strong><p>In production, calibrated evidence and institutional review—not a simple similarity score—would determine eligibility.</p></div></div>}
      <div className="detail-features"><h4>A closer look at the available metrics</h4><div><span>Average sentence length</span><strong>{submission.features.avgSentenceLength?.toFixed(1) || "—"} words</strong></div><div><span>Lexical diversity</span><strong>{Math.round((submission.features.lexicalDiversity || 0) * 100)}%</strong></div><div><span>Raw text stored</span><strong className="green-text">None <Check size={13}/></strong></div></div>
      <DemoNotice>This is a synthetic consistency result, not a calibrated probability or an AI-detection verdict. Semantic and temporal models are specified in the blueprint, not executed here.</DemoNotice>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Close</button>{submission.status === "Verified" ? <button className="button button-primary" disabled={busy || (credential?.revoked ?? false)} onClick={mint}>{busy ? <LoaderCircle className="spin" size={16}/> : <BadgeCheck size={16}/>} {credential?.revoked ? "Credential revoked" : credential ? "View credential" : "Mint demo credential"}<ExternalLink size={14}/></button> : <button className="button button-primary" disabled={busy || submission.reviewRequested} onClick={review}>{busy ? <LoaderCircle className="spin" size={16}/> : <MessageSquare size={16}/>} {submission.reviewRequested ? "Demo review requested" : "Request context review"}</button>}</div>
    </div>
  </Modal>;
}
