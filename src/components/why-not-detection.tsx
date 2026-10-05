"use client";
import { ArrowRight, Repeat2, ScanSearch, ShieldAlert, TrendingDown, Layers3, Fingerprint, CircleHelp, Check } from "lucide-react";
import type { View } from "@/lib/client";

const misuse = [
  ["Direct generation", "A chatbot writes the entire paper."],
  ["Paraphrasing tools", "Rewriters disguise generated text."],
  ["Hybrid drafts", "AI drafts, the student edits."],
  ["Prompt engineering", "Custom instructions mimic the student's voice."],
  ["Model shopping", "Several tools are used so no single pattern shows."],
  ["Self-training", "The student feeds a model their own past writing."],
];

const methods = [
  { title: "Pattern recognition", body: "Looks for repetitive structures, overused transitions, uniform paragraph length, and a relentlessly formal tone.", limit: "A student edits those patterns out in minutes." },
  { title: "Statistical analysis", body: "Examines word-choice probabilities, n-gram frequencies, vocabulary sophistication, and syntactic complexity.", limit: "Models are trained to match human statistics ever more closely." },
  { title: "Perplexity scoring", body: "Measures how predictable the text is to a language model. Low perplexity is read as machine-like.", limit: "It assumes machines write predictably. Modern models are tuned not to." },
];

const argumentsAgainst = [
  { title: "The proliferation problem", premises: ["New models ship faster than detectors can be retrained.", "Each model has its own patterns.", "A detector must be retrained for every one."], conclusion: "Detection tools are perpetually out of date." },
  { title: "The customization problem", premises: ["Models can be fine-tuned and prompted to mimic a specific style.", "Students can train on their own prior writing.", "Personalized output is indistinguishable from the student's own."], conclusion: "Detection becomes impossible once the model writes like the individual." },
  { title: "The arms race", premises: ["Model developers optimize for human-sounding text.", "Detection research reveals exactly what makes text detectable.", "That knowledge feeds the next, less detectable model."], conclusion: "Detection research directly enables evasion." },
];

export function WhyNotDetectionView({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <>
    <div className="page-heading"><div><h1>Detection is a race you cannot win.</h1><p>Three arguments for asking a different question, carried over from the original AuthWords proposal.</p></div><button className="button button-primary" onClick={() => onNavigate("flip")}><Repeat2 size={16}/> See the flipped assignment <ArrowRight size={15}/></button></div>

    <section className="card argument-intro"><div className="card-heading"><div><h3>The current landscape</h3><p>How generated text actually enters a classroom.</p></div><ScanSearch size={20}/></div><div className="misuse-grid">{misuse.map(([title, body]) => <div key={title}><strong>{title}</strong><span>{body}</span></div>)}</div></section>

    <section className="card"><div className="card-heading"><div><h3>What detectors do today</h3><p>Commercial tools claim 80 to 95 percent accuracy. Results in practice vary widely, and false positives land hardest on multilingual writers.</p></div><TrendingDown size={20}/></div><div className="method-grid">{methods.map(method => <article key={method.title}><h4>{method.title}</h4><p>{method.body}</p><p className="method-limit"><ShieldAlert size={13}/> {method.limit}</p></article>)}</div></section>

    <div className="argument-grid">{argumentsAgainst.map((item, index) => <article className="card argument-card" key={item.title}><span className="eyebrow">ARGUMENT {index + 1}</span><h3>{item.title}</h3><ol>{item.premises.map((premise, i) => <li key={premise}><span>P{i + 1}</span>{premise}</li>)}</ol><p className="argument-conclusion"><strong>Therefore:</strong> {item.conclusion}</p></article>)}</div>

    <section className="flip-banner"><div><span className="eyebrow">THE FLIP</span><h2>Stop asking <em>“Did an AI write this?”</em><br/>Start asking <em>“Did this student write this?”</em></h2><p>Stop chasing every new model. Verify what can be verified: consistent, attributable human authorship. Use the institution’s own evidence to protect the student.</p></div><div className="flip-banner-points"><span><Check size={14}/> Future-proof: works regardless of model progress</span><span><Check size={14}/> Positive framing: verifies achievement, does not police</span><span><Check size={14}/> Evidence-based, so it is defensible</span><span><Check size={14}/> Private by architecture</span></div></section>

    <section className="card honest-caveat"><div className="card-heading"><div><h3>Read argument two again. It cuts both ways.</h3><p>A student who trains a model on their own writing defeats a style comparison too. The institution’s only real advantage is writing the student never had a copy of: supervised, timed, in-class work and the revision history behind a draft.</p></div><CircleHelp size={20}/></div><div className="caveat-points"><div><Fingerprint size={18}/><div><strong>So style is a secondary signal.</strong><p>The production design weights supervised writing and signed revision history most heavily, and treats stylometry as context rather than verdict. The public demo shows why: a simple style index cannot tell Austen from Shelley.</p></div></div><div><Layers3 size={18}/><div><strong>And the assignment itself can change.</strong><p>When the prompt is the graded artifact, the student’s prompts and iterations are the evidence. There is nothing to detect, because the generated essay was never the point.</p></div></div></div><div className="caveat-actions"><button className="text-button" onClick={() => onNavigate("blueprint")}>Read the engine design <ArrowRight size={13}/></button><button className="text-button" onClick={() => onNavigate("flip")}>Flip the assignment <ArrowRight size={13}/></button></div></section>

    <div className="bottom-explainer"><Check size={17}/><p><strong>What changed since the original proposal.</strong> Demographic priors and regional language models were removed; context is voluntary and can never raise a misconduct prior. Email collection is off by default and never crawled. Surveillance concerns are answered with architecture and consent, not with “no worse than plagiarism detection.”</p></div>
  </>;
}
