"use client";
import { useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowLeft, ExternalLink, Search, Layers3, ShieldCheck, BrainCircuit, Network, Award, BookOpen, X } from "lucide-react";
import { blueprint, blueprintMarkdown, blueprintSources } from "@/lib/blueprint";
import { downloadFile } from "@/lib/client";
import { EmptyState } from "@/components/primitives";

const sectionIcons = [Layers3, BrainCircuit, ShieldCheck, Network, Award];
export function BlueprintView() {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const visible = search ? blueprint.filter(section => JSON.stringify(section).toLowerCase().includes(search)) : [blueprint[active]];
  function go(index: number) { setActive(index); setQuery(""); document.getElementById("blueprint-reader")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  return <div className="blueprint-page">
    <div className="page-heading"><div><div className="eyebrow">THE AUTHWORDS PRODUCTION BLUEPRINT</div><h1>Built on trust. By design.</h1><p>A concrete architecture for verifying authorship without compromising the author.</p></div><button className="button button-primary" onClick={() => downloadFile(blueprintMarkdown(), "authwords-production-blueprint.md", "text/markdown")}><ArrowDownToLine size={16}/> Export blueprint</button></div>
    <div className="blueprint-intro"><div className="blueprint-intro-icon"><Layers3 size={28} strokeWidth={1.5}/></div><div><h3>We don’t ask “Did an AI write this?”</h3><p>We ask <strong>“Did this specific student write this?”</strong> The difference changes everything.</p></div><span className="version-pill">REFERENCE DESIGN · V1.0</span></div>
    <div className="blueprint-toolbar"><div className="blueprint-meta"><span><span className="green-dot"/> Local-first</span><span>Consent-led</span><span>Institution-owned</span></div><div className="search-input"><Search size={16}/><input aria-label="Search blueprint" placeholder="Search the blueprint…" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button className="icon-button" onClick={() => setQuery("")} aria-label="Clear blueprint search"><X size={14}/></button>}</div></div>
    <div className="blueprint-tabs" aria-label="Blueprint sections">{blueprint.map((section, i) => { const Icon = sectionIcons[i]; return <button key={section.id} onClick={() => go(i)} className={active === i && !search ? "active" : ""} aria-current={active === i && !search ? "step" : undefined}><span className="blueprint-tab-icon"><Icon size={19}/></span><span><small>{section.number}</small>{section.shortTitle}</span></button>; })}</div>
    <div className="implementation-note"><BookOpen size={15}/><p><strong>Read this as a production design.</strong> This interactive reference uses Next.js in the provided sandbox; the proposed deployment natively preserves TanStack Start, React 19, Vite, Tailwind v4, and Bun. Demo scores are not trained-model outputs.</p></div>
    <div id="blueprint-reader" className="blueprint-reader">
      {search && <p className="search-summary">{visible.length} of 5 sections match “{query}”</p>}
      {visible.length === 0 && <EmptyState title="No matching sections" description="Try “consent”, “Bun”, “Bayesian”, or “credential”." action={<button className="button button-secondary" onClick={() => setQuery("")}>Clear search</button>}/>}
      {visible.map(section => <article className="blueprint-article" key={section.id}>
        <div className="article-heading"><span className="article-number">{section.number}</span><div><div className="eyebrow">{section.shortTitle}</div><h2>{section.title}</h2><p>{section.summary}</p></div></div>
        <div className="tech-tags">{section.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        {section.blocks.map(block => <section className="blueprint-block" key={block.title}><h3>{block.title}</h3>{block.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}{block.bullets && <ul>{block.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul>}{block.code && <pre className="architecture-code"><code>{block.code}</code></pre>}{block.table && <div className="blueprint-table-wrap"><table className="blueprint-table"><thead><tr>{block.table.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}</section>)}
      </article>)}
    </div>
    {!search && <div className="blueprint-pagination"><button className="button button-secondary" disabled={active === 0} onClick={() => go(active - 1)}><ArrowLeft size={15}/> Previous section</button><span>{active + 1} of 5</span><button className="button button-primary" disabled={active === 4} onClick={() => go(active + 1)}>Next section <ArrowRight size={15}/></button></div>}
    <div className="sources-card"><div className="card-heading"><div><h3>Built on documented standards</h3><p>Primary sources and technical reading behind the design.</p></div><BookOpen size={20}/></div><div className="source-links">{blueprintSources.map(source => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}>{source.title}<ExternalLink size={13}/></a>)}</div></div>
  </div>;
}
