"use client";
import { useState } from "react";
import { ArrowRight, Repeat2, Fingerprint, BookOpen, Lightbulb, ListChecks, GraduationCap, Check, Sparkles, History } from "lucide-react";
import { basicPrompt, engineeredPrompt, promptImprovements, promptRubric, learningOutcomes, implementationSteps, historyExample } from "@/lib/flip-assignment";
import type { View } from "@/lib/client";

export function FlipAssignmentView({ onNavigate, onNew }: { onNavigate: (view: View) => void; onNew: () => void }) {
  const [shown, setShown] = useState<"both" | "basic" | "engineered">("both");
  return <>
    <div className="page-heading"><div><div className="eyebrow">A PEDAGOGICAL FLIP</div><h1>Make the shortcut the lesson.</h1><p>Students engineer the prompt that produces an A-level essay, and are graded on the prompt as well as the output.</p></div><button className="button button-primary" onClick={onNew}><Fingerprint size={16}/> Try a prompt-mode verification <ArrowRight size={15}/></button></div>

    <section className="flip-paradox"><span className="flip-paradox-icon"><Repeat2 size={28} strokeWidth={1.4}/></span><div><h2>The paradox</h2><p>To “cheat” with AI under this assignment, a student has to understand the subject deeply enough to teach the model how to write about it. Prompt quality is the graded artifact. The essay is the receipt.</p></div><span className="quiet-tag">FROM THE ORIGINAL PROPOSAL</span></section>

    <section className="card"><div className="card-heading"><div><h3>Worked example: the Euthyphro dilemma</h3><p>The same philosophy assignment, as a pasted brief and as an engineered prompt.</p></div><div className="segmented-control">{([["both", "Both"], ["basic", "Basic"], ["engineered", "Engineered"]] as const).map(([value, label]) => <button key={value} className={shown === value ? "active" : ""} onClick={() => setShown(value)}>{label}</button>)}</div></div>
      <div className={`prompt-compare ${shown !== "both" ? "single" : ""}`}>
        {shown !== "engineered" && <article className="prompt-pane prompt-basic"><div className="prompt-pane-head"><span className="rubric-grade">D</span><div><strong>Basic prompt</strong><small>The assignment, pasted. Not an F, because they read it.</small></div></div><pre>{basicPrompt}</pre></article>}
        {shown !== "basic" && <article className="prompt-pane prompt-engineered"><div className="prompt-pane-head"><span className="rubric-grade good">B+</span><div><strong>Engineered prompt</strong><small>First iteration. Shows understanding of structure, premises, and rigor.</small></div></div><pre>{engineeredPrompt}</pre></article>}
      </div>
    </section>

    <div className="flip-grid">
      <section className="card"><div className="card-heading"><div><h3>What makes the better prompt better</h3><p>Each requirement is something the student had to understand first.</p></div><Lightbulb size={20}/></div><div className="improvement-list">{promptImprovements.map(item => <div key={item.title}><Check size={15}/><div><strong>{item.title}</strong><p>{item.body}</p></div></div>)}</div></section>
      <section className="card"><div className="card-heading"><div><h3>Grading the prompt</h3><p>An illustrative rubric for the prompt itself.</p></div><ListChecks size={20}/></div><div className="rubric-list">{promptRubric.map(item => <div key={item.grade}><span className={`rubric-grade ${item.grade === "A" || item.grade === "B+" ? "good" : ""}`}>{item.grade}</span><div><strong>{item.title}</strong><p>{item.body}</p></div></div>)}</div><p className="rubric-note">In practice students refine the prompt over several iterations and document each change. That documentation is what gets verified.</p></section>
    </div>

    <div className="flip-grid">
      <section className="card"><div className="card-heading"><div><h3>What students learn</h3><p>Analysis, synthesis, and evaluation: the top of the taxonomy.</p></div><GraduationCap size={20}/></div><ul className="outcome-list">{learningOutcomes.map(item => <li key={item}><Sparkles size={13}/>{item}</li>)}</ul></section>
      <section className="card"><div className="card-heading"><div><h3>Adapting any assignment</h3><p>Five steps for an instructor.</p></div><BookOpen size={20}/></div><ol className="step-list">{implementationSteps.map((step, i) => <li key={step.title}><span>{i + 1}</span><div><strong>{step.title}</strong><p>{step.body}</p></div></li>)}</ol></section>
    </div>

    <section className="card history-example"><div className="card-heading"><div><h3>A second example: history class</h3><p>The same move works in any discipline.</p></div><History size={20}/></div><div className="history-compare"><div><span className="eyebrow">TRADITIONAL</span><p>{historyExample.traditional}</p></div><ArrowRight size={18}/><div><span className="eyebrow">FLIPPED</span><p>{historyExample.flipped}</p></div></div><p className="history-note">{historyExample.note}</p></section>

    <section className="secure-box-card"><div className="secure-box-heading"><span className="secure-box-icon"><Fingerprint size={28}/></span><div><div className="eyebrow">HOW IT MEETS VERIFICATION</div><h3>The prompt is the authorship evidence.</h3></div><span className="quiet-tag">ENGINE RULE</span></div><p>A prompt-engineering submission is never scored against an essay-writing baseline. The engine routes it to a prompt-specific baseline built from the student’s own prompts, iterations, critiques, and rationale. In this reference app, prompt mode abstains with the flag <code>PROMPT_BASELINE_REQUIRED</code> because no such baseline exists yet. That abstention is the correct answer, not a gap.</p><div className="caveat-actions"><button className="text-button" onClick={() => onNavigate("why-not-detection")}>Why the question had to flip <ArrowRight size={14}/></button><button className="text-button" onClick={() => onNavigate("blueprint")}>Engine section of the blueprint <ArrowRight size={14}/></button></div></section>
  </>;
}
