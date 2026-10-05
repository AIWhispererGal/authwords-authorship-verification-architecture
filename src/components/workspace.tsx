"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ScanSearch, Repeat2, LayoutDashboard, Files, Fingerprint, BadgeCheck, Workflow, Layers3, Settings2, CircleHelp, ChevronRight, ChevronsUpDown, Search, Bell, Plus, Menu, X, ArrowUpRight, ArrowRight, ShieldCheck, Check, Info, LockKeyhole, Copy, ExternalLink, ArrowDownToLine, LoaderCircle, Link2, FileText, Command } from "lucide-react";
import { Brand, CredentialMedallion } from "@/components/visuals";
import { Overview, SubmissionsView } from "@/components/overview";
import { ProfileView, CredentialsView, HowItWorksView, SettingsView } from "@/components/workspace-views";
import { BlueprintView } from "@/components/blueprint-view";
import { WhyNotDetectionView } from "@/components/why-not-detection";
import { FlipAssignmentView } from "@/components/flip-assignment";
import { NewWorkDialog, SubmissionDialog } from "@/components/submission-dialogs";
import { Modal, DemoNotice } from "@/components/primitives";
import { api, downloadFile, viewHref, viewNames, type View } from "@/lib/client";
import { previewWorkspace, type WorkspaceData, type Submission, type Credential } from "@/lib/demo-data";

const mainNavigation = [
  { id: "overview" as View, label: "Overview", icon: LayoutDashboard },
  { id: "submissions" as View, label: "My submissions", icon: Files },
  { id: "profile" as View, label: "Writing profile", icon: Fingerprint },
  { id: "credentials" as View, label: "Credentials", icon: BadgeCheck },
];
const resourceNavigation = [
  { id: "how-it-works" as View, label: "How it works", icon: Workflow },
  { id: "why-not-detection" as View, label: "Why not detection?", icon: ScanSearch },
  { id: "flip" as View, label: "Flip the assignment", icon: Repeat2 },
  { id: "blueprint" as View, label: "System blueprint", icon: Layers3 },
];

export default function Workspace() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("view");
  const view: View = requested && requested in viewNames ? requested as View : "overview";
  const [data, setData] = useState<WorkspaceData>(previewWorkspace);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [newWork, setNewWork] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [notificationRead, setNotificationRead] = useState(false);
  const [toast, setToast] = useState("");
  const started = useRef(false);
  const notifyRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const next = await api<WorkspaceData>("/api/workspace");
    setData(next); setReady(true); setLoadError("");
    setSelected(previous => previous ? next.submissions.find(s => s.id === previous.id) || null : null);
    setShareId(previous => previous && next.credentials.some(c => c.id === previous) ? previous : null);
  }, []);
  useEffect(() => { if (!started.current) { started.current = true; refresh().catch(error => setLoadError(error instanceof Error ? error.message : "Workspace unavailable.")); } }, [refresh]);
  useEffect(() => {
    function key(event: KeyboardEvent) { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } if (event.key === "Escape") { setNotifications(false); setSidebarOpen(false); } }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 4800); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { function outside(event: globalThis.MouseEvent) { if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) setNotifications(false); } document.addEventListener("mousedown", outside); return () => document.removeEventListener("mousedown", outside); }, []);

  function navigate(next: View) { setSidebarOpen(false); setNotifications(false); router.push(viewHref(next)); }
  function closeMenus() { setSidebarOpen(false); setNotifications(false); }
  function ensureReady() { if (ready) return true; setToast(loadError ? "Reconnect your demo workspace using Retry above." : "Your private demo workspace is getting ready. Please try again in a moment."); return false; }
  function startNew() { if (!ensureReady()) return; if (!data.consent) { navigate("settings"); setToast("Verification is paused. Opt in to try a new demo verification."); return; } setNewWork(true); }
  function selectSubmission(submission: Submission) { if (ensureReady()) { setSelected(submission); setSearchOpen(false); } }
  function share(id: string) { if (ensureReady()) { setSelected(null); setShareId(id); } }
  async function updateSettings(changes: { consent?: boolean; sources?: string[] }) { if (!ready) throw new Error("Your demo workspace is not connected yet."); setData(await api<WorkspaceData>("/api/workspace", "PATCH", changes)); }
  const sharedCredential = data.credentials.find(c => c.id === shareId);
  const searchItems = data.submissions.filter(s => `${s.title} ${s.course}`.toLowerCase().includes(search.toLowerCase())).slice(0, 6);
  const searchNavigation = Object.entries(viewNames).filter(([, name]) => name.toLowerCase().includes(search.toLowerCase()));

  return <div className="app-shell">
    {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}/>}
    <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`} aria-label="Main navigation"><Link className="logo-link" href="/" onClick={closeMenus} aria-label="AuthWords home"><Brand/></Link><button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={20}/></button>
      <div className="sidebar-nav"><p className="nav-group-label">YOUR WORKSPACE</p><nav>{mainNavigation.map(item => { const Icon = item.icon; return <Link className={`nav-item ${view === item.id ? "active" : ""}`} key={item.id} href={viewHref(item.id)} onClick={closeMenus} aria-current={view === item.id ? "page" : undefined}><Icon size={18} strokeWidth={1.65}/><span>{item.label}</span>{item.id === "credentials" && <span className="nav-count">{data.credentials.filter(c => !c.revoked).length}</span>}</Link>; })}</nav><p className="nav-group-label resource-label">DISCOVER</p><nav><Link href="/demo" className="nav-item" title="Explore real public-domain samples. No account or upload required."><Fingerprint size={18} strokeWidth={1.65}/><span>Public demo</span><span className="new-label">TRY IT</span></Link>{resourceNavigation.map(item => { const Icon = item.icon; return <Link className={`nav-item ${view === item.id ? "active" : ""}`} key={item.id} href={viewHref(item.id)} onClick={closeMenus} aria-current={view === item.id ? "page" : undefined}><Icon size={18} strokeWidth={1.65}/><span>{item.label}</span>{item.id === "flip" && <span className="new-label">NEW</span>}</Link>; })}</nav></div>
      <div className="sidebar-bottom"><div className="sidebar-promise"><span className="promise-icon"><ShieldCheck size={22} strokeWidth={1.4}/></span><h3>Your words stay yours.</h3><p>Private by design.<br/>Full of possibility.</p><button onClick={() => navigate("settings")}>Our privacy promise <ArrowUpRight size={14}/></button><div className="promise-decoration"/></div><Link className={`nav-item settings-nav ${view === "settings" ? "active" : ""}`} href={viewHref("settings")} onClick={closeMenus}><Settings2 size={18} strokeWidth={1.6}/><span>Privacy & settings</span></Link><button className="nav-item help-nav" onClick={() => navigate("how-it-works")}><CircleHelp size={18} strokeWidth={1.6}/><span>Help & guidance</span><ArrowUpRight size={13}/></button><button className="institution-switcher" onClick={() => { navigate("settings"); setToast("Westbridge is a fictional institution. This workspace uses synthetic data only."); }}><span className="institution-mark">w<span>✳</span></span><span><strong>Westbridge University</strong><small>Student workspace</small></span><ChevronsUpDown size={13}/></button></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={13}/><strong>{viewNames[view]}</strong></div><span className="demo-chip">DEMO</span></div><div className="topbar-actions"><button className={`verification-pill ${!data.consent ? "paused" : ""}`} onClick={() => navigate("settings")}><span className="green-dot"/>{data.consent ? "Verification active" : "Verification paused"}</button><span className="topbar-divider"/><button className="icon-button search-trigger" aria-label="Search workspace (Ctrl or Command K)" title="Search · ⌘K" onClick={() => { setSearch(""); setSearchOpen(true); }}><Search size={18}/></button><div className="notification-container" ref={notifyRef}><button className="icon-button notification-trigger" aria-label="Notifications" aria-expanded={notifications} onClick={() => { setNotifications(!notifications); setNotificationRead(true); }}><Bell size={18}/>{!notificationRead && <span className="notification-dot"/>}</button>{notifications && <div className="notification-popover"><div className="popover-heading"><h3>A little update</h3><span>2 notifications</span></div><button onClick={() => { setNotifications(false); selectSubmission(data.submissions[0]); }}><span className="notification-icon"><BadgeCheck size={19}/></span><span><strong>Your story is taking shape</strong><small>Explore a verified synthetic submission and its authorship record.</small><em>Demo activity</em></span></button><button onClick={() => navigate("settings")}><span className="notification-icon"><ShieldCheck size={19}/></span><span><strong>You’re always in control</strong><small>Choose your sources and review your opt-in preferences.</small><em>Privacy reminder</em></span></button></div>}</div><button className="avatar-button" aria-label="Open Alex Morgan's synthetic writing profile" onClick={() => navigate("profile")}>AM</button></div></header>
      <main className="workspace-content" id="main-content">{loadError && <div className="connection-error" role="alert"><Info size={17}/><span>{loadError} You can still explore the blueprint.</span><button onClick={() => { setLoadError(""); refresh().catch(error => setLoadError(error.message)); }}>Retry <ArrowRight size={13}/></button></div>}
        {view === "overview" && <Overview data={data} onNavigate={navigate} onNew={startNew} onSelect={selectSubmission}/>}
        {view === "submissions" && <SubmissionsView data={data} onNew={startNew} onSelect={selectSubmission}/>}
        {view === "profile" && <ProfileView data={data} onNavigate={navigate}/>}
        {view === "credentials" && <CredentialsView data={data} onShare={share} onSelect={selectSubmission}/>}
        {view === "blueprint" && <BlueprintView/>}
        {view === "how-it-works" && <HowItWorksView onNavigate={navigate} onNew={startNew}/>}
        {view === "why-not-detection" && <WhyNotDetectionView onNavigate={navigate}/>}
        {view === "flip" && <FlipAssignmentView onNavigate={navigate} onNew={startNew}/>}
        {view === "settings" && <SettingsView data={data} onNavigate={navigate} onUpdate={updateSettings} onRefresh={refresh} onToast={setToast}/>}
        <footer className="workspace-footer"><span><ShieldCheck size={13}/> Your voice matters. Your privacy does, too.</span><span>Synthetic demo <span>·</span> No live LMS connection <span>·</span> AuthWords © 2026</span></footer>
      </main>
    </div>
    {toast && <div className="toast" role="status"><span><Check size={15}/></span><p>{toast}</p><button className="icon-button" onClick={() => setToast("")} aria-label="Dismiss notification"><X size={15}/></button></div>}
    {newWork && <NewWorkDialog onClose={() => setNewWork(false)} onComplete={async submission => { await refresh(); setNewWork(false); setSelected(submission); setToast("Your demo verification is ready. No raw text was transmitted."); }}/>} 
    {selected && <SubmissionDialog submission={selected} data={data} onClose={() => setSelected(null)} onRefresh={refresh} onShare={share} onToast={setToast}/>}
    {sharedCredential && <ShareDialog credential={sharedCredential} onClose={() => setShareId(null)} onRefresh={refresh} onToast={setToast}/>}
    {searchOpen && <Modal title="Find your next thought." subtitle="Search your work or jump to a part of your workspace." onClose={() => setSearchOpen(false)}><div className="workspace-search-input"><Search size={19}/><input autoFocus placeholder="Search submissions, pages, and more…" aria-label="Search workspace" value={search} onChange={event => setSearch(event.target.value)}/><kbd>⌘ K</kbd></div><div className="search-results">{searchNavigation.length > 0 && <><p className="eyebrow">IN YOUR WORKSPACE</p>{searchNavigation.map(([id, name]) => <button key={id} onClick={() => { setSearchOpen(false); navigate(id as View); }}><Layers3 size={17}/><span>{name}</span><ArrowRight size={15}/></button>)}</>}{searchItems.length > 0 && <><p className="eyebrow">YOUR SUBMISSIONS</p>{searchItems.map(submission => <button key={submission.id} onClick={() => selectSubmission(submission)}><FileText size={17}/><span>{submission.title}<small>{submission.course}</small></span><ArrowUpRight size={15}/></button>)}</>}{searchNavigation.length === 0 && searchItems.length === 0 && <p className="search-empty">No matches yet. Try a course, a title, or “blueprint”.</p>}</div></Modal>}
  </div>;
}

function ShareDialog({ credential, onClose, onRefresh, onToast }: { credential: Credential; onClose: () => void; onRefresh: () => Promise<void>; onToast: (message: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const linkRef = useRef<HTMLInputElement>(null);
  const url = typeof window === "undefined" ? `/verify/${credential.id}` : `${window.location.origin}/verify/${credential.id}`;
  async function copy() { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { linkRef.current?.select(); setError("Select and copy the link above. Clipboard access is not available in this browser."); } }
  async function revoke() { setBusy(true); setError(""); try { await api("/api/credentials", "PATCH", { id: credential.id, revoked: true }); await onRefresh(); setConfirmRevoke(false); onToast("Credential revoked. Its public verification page now marks it invalid."); } catch (err) { setError(err instanceof Error ? err.message : "Could not revoke."); } finally { setBusy(false); } }
  async function download() { setBusy(true); setError(""); try { const result = await api(`/api/verify/${credential.id}`); downloadFile(JSON.stringify(result, null, 2), "authwords-signed-demo-credential.json", "application/json"); } catch { setError("The signed proof could not be downloaded. Please try again."); } finally { setBusy(false); } }
  return <Modal title={credential.revoked ? "This credential has been revoked." : "Proof worth sharing."} subtitle="A little more trust, without sharing a little too much." onClose={onClose}><div className="share-preview"><CredentialMedallion compact/><div><span className="eyebrow">AUTHWORDS · SYNTHETIC DEMO</span><h3>{credential.revoked ? "Revoked credential" : "Verified authorship"}</h3><span className={`status-badge ${credential.revoked ? "context" : "verified"}`}>{credential.revoked ? <Info size={12}/> : <BadgeCheck size={12}/>} {credential.revoked ? "No longer valid" : "Ed25519 signature"}</span></div></div><div className="share-detail-list"><div><Check size={14}/><span>Independently checks the signature and current status</span></div><div><Check size={14}/><span>No student name, school, course, grade, or writing sample</span></div><div><Info size={14}/><span>A link proves a signed claim—not the holder’s identity</span></div></div><label className="field-label">Your public verification link<div className="share-link-input"><Link2 size={16}/><input ref={linkRef} readOnly value={url} aria-label="Public credential URL"/><button onClick={copy} className="copy-button">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied" : "Copy"}</button></div></label><div className="share-buttons"><a className="button button-primary" href={`/verify/${credential.id}`} target="_blank" rel="noopener noreferrer">Open public verification <ExternalLink size={14}/></a><button className="button button-secondary" onClick={download} disabled={busy}><ArrowDownToLine size={15}/> Signed proof</button></div><DemoNotice>This genuine digital signature covers a demo-only authorship claim. No grade, academic qualification, or student identity is certified.</DemoNotice>{!credential.revoked && <div className="revoke-section">{confirmRevoke ? <><p>Revoking is permanent. The public proof will show that this credential is no longer valid.</p><div><button className="button button-secondary" disabled={busy} onClick={() => setConfirmRevoke(false)}>Keep credential</button><button className="button button-danger" disabled={busy} onClick={revoke}>{busy && <LoaderCircle size={14} className="spin"/>} Revoke credential</button></div></> : <button className="revoke-link" onClick={() => setConfirmRevoke(true)}>Revoke this credential</button>}</div>}{error && <p className="form-error" role="alert">{error}</p>}</Modal>;
}
