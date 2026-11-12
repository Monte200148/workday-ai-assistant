// Client-safe definitions shared by the AI server function and the UI:
// input validation, structured prompts, JSON output schemas, and formatters
// that turn structured AI output into editable text.
import { z } from "zod";

export const TONES = ["Formal", "Friendly", "Persuasive"] as const;
export type Tone = (typeof TONES)[number];

export const emailInputSchema = z.object({
  purpose: z.string().trim().min(3, "Describe the purpose of the email.").max(500),
  details: z.string().trim().min(3, "Add a few key details.").max(4000),
  recipient: z.string().trim().max(200).optional().default(""),
  tone: z.enum(TONES),
});

export const meetingInputSchema = z.object({
  notes: z.string().trim().min(40, "Paste at least a few lines of meeting notes.").max(30000),
});

export const researchInputSchema = z.object({
  mode: z.enum(["topic", "article"]),
  text: z.string().trim().min(3, "Enter a topic or paste some text.").max(30000),
  focus: z.string().trim().max(300).optional().default(""),
});

export const toolRequestSchema = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("email"), input: emailInputSchema }),
  z.object({ tool: z.literal("meeting"), input: meetingInputSchema }),
  z.object({ tool: z.literal("research"), input: researchInputSchema }),
]);

export type EmailInput = z.infer<typeof emailInputSchema>;
export type MeetingInput = z.infer<typeof meetingInputSchema>;
export type ResearchInput = z.infer<typeof researchInputSchema>;
export type ToolRequest = z.infer<typeof toolRequestSchema>;
export type ToolId = ToolRequest["tool"];

export type EmailResult = { subject: string; body: string };
export type MeetingResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  deadlines: { item: string; date: string }[];
  openQuestions: string[];
};
export type ResearchResult = {
  title: string;
  overview: string;
  sections: { heading: string; content: string }[];
  insights: string[];
  recommendations: { action: string; rationale: string }[];
  caveats: string[];
};

export type ToolResponse =
  | { ok: true; tool: ToolId; text: string; title: string }
  | { ok: false; kind: "setup" | "credits" | "rate" | "invalid" | "refusal" | "generic"; message: string };

// ---------- Structured prompts ----------

export const SYSTEM_PROMPTS: Record<ToolId, string> = {
  email: [
    "You are an expert business communication writer.",
    "Write one complete, ready-to-send email based ONLY on the user's purpose and details.",
    "Use every concrete fact the user provides (names, dates, numbers, places). Never invent facts, figures, links or commitments the user did not give; if something essential is missing, use a clear bracketed placeholder like [date].",
    "Match the requested tone exactly:",
    "- Formal: polished, respectful, concise, no slang or exclamation marks.",
    "- Friendly: warm, conversational, approachable while still professional.",
    "- Persuasive: benefit-led, confident, with a clear call to action.",
    "Structure: greeting, short opening line stating the purpose, body paragraphs, a clear next step, and a sign-off. Use [Your Name] for the sender's signature unless a name is given.",
    "The subject line must be specific to the content (max ~70 characters).",
  ].join("\n"),
  meeting: [
    "You are a meticulous executive assistant who summarizes meeting notes.",
    "Work ONLY from the notes provided. Do not invent people, decisions, tasks or dates.",
    "summary: 2-4 sentence overview of what the meeting covered and its outcome.",
    "keyPoints: the most important discussion points, each one short.",
    "decisions: only things that were actually agreed or decided.",
    "actionItems: concrete tasks. owner = the responsible person named in the notes, or 'Unassigned' if nobody is named. deadline = the due date/time as stated in the notes, or 'Not specified'.",
    "deadlines: every date, time-bound commitment or due date mentioned, with what it is for. Empty array if none.",
    "openQuestions: unresolved issues or items needing follow-up. Empty array if none.",
    "title: a short descriptive meeting title based on the content.",
  ].join("\n"),
  research: [
    "You are a senior research analyst helping a busy professional.",
    "If given a TOPIC: produce a well-organized briefing using your general knowledge. Be explicit about uncertainty and note that recent developments may not be covered. Do not fabricate statistics, quotes or sources.",
    "If given ARTICLE TEXT: summarize and analyse ONLY that text; do not add outside facts except as clearly labelled context.",
    "overview: a detailed 3-5 sentence summary.",
    "sections: 3-5 organized sections with a clear heading and a substantive paragraph each, specific to the subject.",
    "insights: the most important, non-obvious takeaways.",
    "recommendations: practical, actionable steps for a professional, each with a short rationale.",
    "caveats: limitations, risks, or points that should be verified.",
    "title: a concise title for the briefing.",
  ].join("\n"),
};

export function buildUserPrompt(req: ToolRequest): string {
  switch (req.tool) {
    case "email": {
      const { purpose, details, recipient, tone } = req.input;
      return [
        `TONE: ${tone}`,
        `PURPOSE: ${purpose}`,
        recipient ? `RECIPIENT: ${recipient}` : "RECIPIENT: not specified",
        `KEY DETAILS:\n${details}`,
      ].join("\n\n");
    }
    case "meeting":
      return `MEETING NOTES:\n"""\n${req.input.notes}\n"""`;
    case "research": {
      const { mode, text, focus } = req.input;
      return [
        mode === "topic" ? `TOPIC:\n${text}` : `ARTICLE TEXT:\n"""\n${text}\n"""`,
        focus ? `FOCUS / AUDIENCE: ${focus}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  }
}

// ---------- JSON output schemas (strict) ----------

const str = { type: "string" } as const;
const strArr = { type: "array", items: str } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

export const OUTPUT_SCHEMAS: Record<ToolId, Record<string, unknown>> = {
  email: obj({ subject: str, body: str }),
  meeting: obj({
    title: str,
    summary: str,
    keyPoints: strArr,
    decisions: strArr,
    actionItems: { type: "array", items: obj({ task: str, owner: str, deadline: str }) },
    deadlines: { type: "array", items: obj({ item: str, date: str }) },
    openQuestions: strArr,
  }),
  research: obj({
    title: str,
    overview: str,
    sections: { type: "array", items: obj({ heading: str, content: str }) },
    insights: strArr,
    recommendations: { type: "array", items: obj({ action: str, rationale: str }) },
    caveats: strArr,
  }),
};

// ---------- Formatters: structured result -> editable text ----------
// Markdown-lite: "## " headings, "- " bullets, **bold**, ==highlight==.

const list = (items: string[], empty = "None noted.") =>
  items.length ? items.map((i) => `- ${i}`).join("\n") : `- ${empty}`;

export function formatEmail(r: EmailResult): string {
  return `Subject: ${r.subject.trim()}\n\n${r.body.trim()}`;
}

export function formatMeeting(r: MeetingResult): string {
  const actions = r.actionItems.length
    ? r.actionItems
        .map((a) => `- **${a.owner || "Unassigned"}**: ${a.task} (Due: ==${a.deadline || "Not specified"}==)`)
        .join("\n")
    : "- No action items identified.";
  const deadlines = r.deadlines.length
    ? r.deadlines.map((d) => `- ==${d.date}== ${d.item}`).join("\n")
    : "- No deadlines mentioned.";
  return [
    `# ${r.title}`,
    `## Summary\n${r.summary}`,
    `## Key Points\n${list(r.keyPoints)}`,
    `## Key Decisions\n${list(r.decisions, "No decisions recorded.")}`,
    `## Action Items\n${actions}`,
    `## Deadlines\n${deadlines}`,
    `## Open Questions\n${list(r.openQuestions)}`,
  ].join("\n\n");
}

export function formatResearch(r: ResearchResult): string {
  const recs = r.recommendations.length
    ? r.recommendations.map((x) => `- **${x.action}** ${x.rationale}`).join("\n")
    : "- None.";
  return [
    `# ${r.title}`,
    `## Overview\n${r.overview}`,
    ...r.sections.map((s) => `## ${s.heading}\n${s.content}`),
    `## Key Insights\n${list(r.insights)}`,
    `## Recommendations\n${recs}`,
    `## Caveats & Things to Verify\n${list(r.caveats)}`,
  ].join("\n\n");
}

export function formatResult(tool: ToolId, data: unknown): { text: string; title: string } {
  if (tool === "email") {
    const r = data as EmailResult;
    return { text: formatEmail(r), title: r.subject };
  }
  if (tool === "meeting") {
    const r = data as MeetingResult;
    return { text: formatMeeting(r), title: r.title };
  }
  const r = data as ResearchResult;
  return { text: formatResearch(r), title: r.title };
}
