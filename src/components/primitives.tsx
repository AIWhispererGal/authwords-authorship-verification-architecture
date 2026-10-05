"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X, Check, CircleHelp, Info } from "lucide-react";
import type { SubmissionStatus } from "@/lib/demo-data";

export function Modal({ title, subtitle, children, onClose, wide = false }: { title: string; subtitle?: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      const target = ref.current?.querySelector<HTMLElement>("input,textarea,select") || ref.current?.querySelector<HTMLElement>("button,[tabindex='0']");
      target?.focus();
    });
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key === "Tab") {
        const elements = ref.current?.querySelectorAll<HTMLElement>("button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex='0']");
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", listener);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", listener); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}><div className="modal-heading"><div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{children}</div></div>;
}
export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <span className={`status-badge ${status === "Verified" ? "verified" : status === "Needs context" ? "context" : "insufficient"}`}>{status === "Verified" ? <Check size={12} strokeWidth={2.5}/> : <CircleHelp size={12}/>} {status}</span>;
}
export function DemoNotice({ children }: { children?: ReactNode }) {
  return <div className="demo-notice"><Info size={15}/><span>{children || "A thoughtfully designed demo. All profiles, scores, and academic records are synthetic."}</span></div>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><CircleHelp size={26}/></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}
