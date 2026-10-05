"use client";

import { useState } from "react";
import { Fingerprint, Check, Sparkles } from "lucide-react";

export function Brand({ small = false }: { small?: boolean }) {
  return <span className={`brand ${small ? "brand-small" : ""}`}><svg width="33" height="37" viewBox="0 0 33 37" fill="none" aria-hidden="true"><path d="M6 24V14a10.5 10.5 0 0 1 21 0v10M11 24V14a5.5 5.5 0 0 1 11 0v13M16.5 14v17M1 19v5c0 5 2.2 8 6 10M32 19v5c0 5-2.2 8-6 10M6 24c0 5 2 9 5 11M11 24c0 5 2 9 5.5 11M22 27c0 4-1 6-2 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg><span>authwords<span className="brand-period">.</span></span></span>;
}

export function HeroArtwork() {
  return <div className="hero-art" aria-hidden="true">
    <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
    <div className="fingerprint-seal">
      <svg className="seal-lettering" viewBox="0 0 240 240"><defs><path id="seal-circle" d="M120,120 m-96,0 a96,96 0 1,1 192,0 a96,96 0 1,1 -192,0"/></defs><text><textPath href="#seal-circle" startOffset="3%">YOUR WORDS. YOUR VOICE. YOUR FUTURE. ✳ </textPath></text></svg>
      <div className="seal-center"><Fingerprint size={112} strokeWidth={1.05}/></div>
      <div className="seal-check"><Check size={19} strokeWidth={2.5}/></div>
    </div>
    <div className="floating-proof"><span><Check size={12} strokeWidth={3}/></span> Authentically yours</div>
    <Sparkles className="art-sparkle" size={25} strokeWidth={1}/>
  </div>;
}

export function Sparkline({ variant = 0, color = "#6e914c" }: { variant?: number; color?: string }) {
  const paths = ["M2 34L14 30L24 32L36 21L47 24L58 14L71 17L84 6", "M2 34L13 27L25 30L38 17L49 21L60 11L72 14L84 5", "M2 36L15 35L27 27L39 28L51 19L61 20L73 11L84 8", "M2 35L17 35L17 26L34 26L34 20L52 20L52 13L68 13L68 5L84 5"];
  return <svg className="sparkline" viewBox="0 0 88 44" fill="none" aria-hidden="true"><path d={paths[variant % paths.length]} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function ConfidenceChart({ period = "6m" }: { period?: "6m" | "1y" }) {
  const [hover, setHover] = useState<number | null>(null);
  const values = period === "6m" ? [92.1, 93.5, 92.9, 95.2, 94.8, 95.5, 95.1, 97.0, 96.7, 97.8, 97.4, 98.6] : [87.1, 88.5, 88.0, 90.3, 91.0, 90.6, 92.1, 93.5, 94.8, 95.5, 97.0, 98.6];
  const min = period === "6m" ? 88 : 85;
  const coords = values.map((v, i) => ({ x: 48 + i * 50.5, y: 164 - ((v - min) / (100 - min)) * 150 }));
  let curve = `M ${coords[0].x} ${coords[0].y}`;
  coords.slice(1).forEach((p, i) => { const previous = coords[i]; const midpoint = (previous.x + p.x) / 2; curve += ` C ${midpoint} ${previous.y}, ${midpoint} ${p.y}, ${p.x} ${p.y}`; });
  const labels = period === "6m" ? ["Dec", "Jan", "Feb", "Mar", "Apr", "May"] : ["Jun", "Aug", "Oct", "Dec", "Feb", "May"];
  const selected = hover === null ? null : coords[hover];
  return <div className="confidence-chart"><svg viewBox="0 0 650 207" preserveAspectRatio="none" role="img" aria-label={`Illustrative authorship confidence over ${period === "6m" ? "six months" : "one year"}, ending at 98.6 percent`}>
    <defs><linearGradient id={`chart-fill-${period}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b8d49b" stopOpacity=".36"/><stop offset="100%" stopColor="#b8d49b" stopOpacity=".015"/></linearGradient></defs>
    {[100, 96, 92, 88].map((v, i) => { const label = period === "1y" ? 100 - i * 5 : v; const y = 14 + i * 50; return <g key={v}><line x1="46" y1={y} x2="612" y2={y} stroke="#ecede8" strokeDasharray="3 4"/><text x="1" y={y + 4} className="chart-label">{label}%</text></g>; })}
    <path d={`${curve} L ${coords[11].x} 165 L 48 165 Z`} fill={`url(#chart-fill-${period})`}/>
    <path d="M48 125 C125 130 152 99 207 101 S310 83 359 77 S467 53 604 46" stroke="#c7cec0" strokeDasharray="4 5" fill="none" strokeWidth="1.5"/>
    <path d={curve} fill="none" stroke="#638444" strokeWidth="2.5" strokeLinecap="round"/>
    {labels.map((label, i) => <text key={label} x={48 + i * 111.1} y="195" className="chart-label" textAnchor={i === 5 ? "end" : "start"}>{label}</text>)}
    <circle cx={coords[11].x} cy={coords[11].y} r="4" fill="#5e7f40" stroke="white" strokeWidth="2"/>
    {coords.map((p, i) => <rect key={i} x={p.x - 23} y="0" width="48" height="174" fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}/>)}
    {selected && hover !== null && <g pointerEvents="none"><line x1={selected.x} y1="10" x2={selected.x} y2="168" stroke="#819b69" strokeDasharray="3 4"/><circle cx={selected.x} cy={selected.y} r="4.5" fill="#638444" stroke="white" strokeWidth="2"/><rect x={Math.max(36, Math.min(546, selected.x - 29))} y={Math.max(0, selected.y - 36)} width="61" height="26" rx="6" fill="#253a29"/><text x={Math.max(66.5, Math.min(576.5, selected.x + 1.5))} y={Math.max(17, selected.y - 19)} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{values[hover]}%</text></g>}
  </svg></div>;
}

export function RadarChart({ large = false }: { large?: boolean }) {
  const center = { x: 150, y: 105 };
  const point = (radius: number, i: number) => ({ x: center.x + Math.sin(i * Math.PI * 2 / 5) * radius, y: center.y - Math.cos(i * Math.PI * 2 / 5) * radius });
  const poly = (radius: number) => Array.from({ length: 5 }, (_, i) => { const p = point(radius, i); return `${p.x},${p.y}`; }).join(" ");
  const values = [65, 67, 59, 70, 61];
  return <svg className={`radar-chart ${large ? "radar-large" : ""}`} viewBox="0 0 300 211" role="img" aria-label="Synthetic writing fingerprint across vocabulary, syntax, rhythm, structure, and punctuation">
    {[72, 54, 36, 18].map(r => <polygon key={r} points={poly(r)} fill={r === 72 ? "#fafbf7" : "none"} stroke="#e6eadf"/>)}
    {Array.from({ length: 5 }, (_, i) => { const p = point(72, i); return <line key={i} x1="150" y1="105" x2={p.x} y2={p.y} stroke="#e6eadf"/>; })}
    <polygon points={[53, 51, 56, 48, 51].map((r, i) => { const p = point(r, i); return `${p.x},${p.y}`; }).join(" ")} stroke="#b9c8a5" strokeDasharray="4 3" fill="#e7eddb" fillOpacity=".35"/>
    <polygon points={values.map((r, i) => { const p = point(r, i); return `${p.x},${p.y}`; }).join(" ")} stroke="#7b9956" strokeWidth="1.6" fill="#bad393" fillOpacity=".4"/>
    {values.map((r, i) => { const p = point(r, i); return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#78954e" stroke="white" strokeWidth="1.3"/>; })}
    <text x="150" y="19" textAnchor="middle">Vocabulary</text><text x="237" y="79">Syntax</text><text x="207" y="181" textAnchor="middle">Rhythm</text><text x="91" y="181" textAnchor="middle">Structure</text><text x="6" y="79">Punctuation</text>
  </svg>;
}

export function CredentialMedallion({ compact = false }: { compact?: boolean }) {
  return <div className={`credential-medallion ${compact ? "compact" : ""}`} aria-hidden="true"><div className="medallion-outline"><div className="medallion-inner"><span>✳</span><span className="medallion-check"><Check size={compact ? 14 : 19} strokeWidth={2.5}/></span></div></div></div>;
}
