// Content for the "flip the assignment" pedagogy: students engineer the prompt that
// produces an A-level essay and are graded on the prompt as well as the output.
// The Euthyphro example is carried over from the original AuthWords proposal site.

export const basicPrompt = `In Plato's dialogue Euthyphro, Socrates asks: "Is the pious loved by the gods because it is pious, or is it pious because it is loved by the gods?" Explain the dilemma in your own words using a concrete moral example of your choosing. Clearly lay out the logical structure, identifying the key premises that lead to the conclusion. Be sure to explain why each horn of the dilemma presents a problem for divine command theory. Your essay should be 4-6 pages double spaced 12 point font excluding any references. You do not need any references.`;

export const engineeredPrompt = `Write a 4-6 page (double spaced 12 point font) philosophical essay analyzing the Euthyphro Dilemma. Follow these precise specifications:

CORE PHILOSOPHICAL STRUCTURE:
Present the dilemma as a destructive dilemma with this logical form:
• Either (A) actions are good because God commands them, OR (B) God commands them because they are good
• If (A), then morality is arbitrary and could change based on divine whim
• If (B), then morality exists independently of God, making divine command theory false
• Therefore, divine command theory faces a fatal problem either way

PREMISE PRESENTATION REQUIREMENTS:
For EACH premise you identify:
• STATE the premise clearly (label as P1, P2, etc.)
• ARGUE for why we should accept this premise as true
• PROVIDE evidence or reasoning that supports it
• ACKNOWLEDGE if you will later refute it (but still present the strongest case first)

ORIGINAL EXAMPLE REQUIREMENT:
DO NOT use any examples mentioned in the assignment (murder, truth-telling, promise-keeping). Create your own concrete moral example. Consider: charitable giving, respect for parents, protecting the innocent, sharing resources, showing gratitude, or develop something entirely different.

TERMINOLOGY CONSISTENCY:
• Choose one formulation (e.g., "God" not alternating with "the divine" or "deity")
• Define technical terms immediately upon first use
• Include definitions for: divine command theory, moral realism, arbitrary, metaphysical vs. epistemological

LOGICAL RIGOR:
• Use logical connectives ONLY when there's actual logical entailment
• "It follows that" requires deductive consequence
• Use "This suggests" for inductive reasoning
• Never use philosophical connectives merely as transitions

CRITICAL ANALYSIS SECTION:
Address this escape attempt: "God commands based on His perfectly good nature"
• First, present this objection in its strongest form
• Then demonstrate why it merely relocates the problem
• Show this is the same dilemma at a different level`;

export const promptImprovements = [
  { title: "Detailed structure requirements", body: "The engineered prompt specifies the exact logical form, premise labeling (P1, P2, and so on), and argument flow. Writing it requires understanding formal argumentation, not just the topic." },
  { title: "Original example requirement", body: "Common examples are prohibited, so the student has to understand the principle well enough to invent a novel illustration." },
  { title: "Critical-analysis depth", body: "The prompt demands the strongest form of the 'perfectly good nature' objection and an explanation of why it relocates the dilemma rather than escaping it." },
  { title: "Logical rigor standards", body: "It distinguishes deductive from inductive connectives and bans using philosophical phrases as mere transitions. You cannot specify that without knowing the difference." },
  { title: "Subject mastery on display", body: "The prompt itself demonstrates understanding of divine command theory, moral realism, and the metaphysical versus epistemological reading of the dilemma." },
];

export const promptRubric = [
  { grade: "D", title: "Minimal effort", body: "The student pasted the assignment verbatim. They read it, so it is not an F, but there is no evidence of prompt-engineering understanding." },
  { grade: "C", title: "Basic structure", body: "Some formatting and basic requirements were added. The student knows prompts need structure but shows little depth or specificity." },
  { grade: "B+", title: "Good first iteration", body: "Logical structure, premise requirements, and terminology consistency are all specified. This is where the engineered example sits: a solid foundation with room to refine." },
  { grade: "A", title: "Excellent prompt", body: "Adds explanations of each premise, historical context, multiple philosophical perspectives, citation requirements, and iterative-refinement instructions. Mastery of both the subject and the craft." },
];

export const learningOutcomes = [
  "Deep subject mastery, because specifying accurate requirements demands it",
  "Understanding of academic structure and argumentation",
  "Critical evaluation skills for judging output quality",
  "Metacognitive awareness of what good reasoning looks like",
  "Precise technical communication",
  "Iterative refinement and attention to detail",
];

export const implementationSteps = [
  { title: "Start with an existing assignment", body: "Take any essay or problem-solving task you already set." },
  { title: "Convert it to a prompt-engineering task", body: "Students must write a prompt that would generate an A-level response." },
  { title: "Require documentation", body: "Students explain their design choices and why each one improves the output." },
  { title: "Grade both components", body: "Assess the prompt and the resulting output. The prompt is the primary artifact." },
  { title: "Iterate", body: "Students refine prompts against the output they get, and keep the revision history. That history is the authorship evidence." },
];

export const historyExample = {
  traditional: "Write an essay on the causes of World War I.",
  flipped: "Create a prompt that will generate an A-level essay analyzing the interconnected causes of World War I, demonstrating understanding of historiographical debates, primary-source integration, and causal complexity.",
  note: "To write that prompt the student must supply historical context, define the historiographical schools, give examples of strong arguments, and specify citation formats. All of it requires subject mastery.",
};
