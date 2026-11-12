import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Lightbulb, Loader2, Search, Sparkles, Type } from "lucide-react";
import { useState } from "react";

import { AiDisclaimer } from "@/components/app/ai-disclaimer";
import { FieldHint, FormCard } from "@/components/app/form-card";
import { OutputPanel } from "@/components/app/output-panel";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";
import { researchInputSchema } from "@/lib/ai-tools";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · Workday AI Assistant" },
      { name: "description", content: "Research a topic or summarize an article into insights, recommendations and organized sections." },
      { property: "og:title", content: "AI Research Assistant · Workday AI Assistant" },
      { property: "og:description", content: "Research a topic or summarize an article into insights, recommendations and organized sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

type Mode = "topic" | "article";

const MODES: { id: Mode; label: string; icon: typeof Type }[] = [
  { id: "topic", label: "Research a topic", icon: Type },
  { id: "article", label: "Summarize article text", icon: BookOpen },
];

function ResearchPage() {
  const ai = useAiTool("research");
  const [mode, setMode] = useState<Mode>("topic");
  const [text, setText] = useState("");
  const [focus, setFocus] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = researchInputSchema.safeParse({ mode, text, focus });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your input.");
      return;
    }
    setError("");
    void ai.generate(parsed.data);
  };

  const fillExample = () => {
    setMode("topic");
    setText("Adopting a four-day work week at a 50-person software company");
    setFocus("Operations manager preparing a proposal for leadership");
    setError("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={Search} title="AI Research Assistant" description="Enter a topic or paste an article. Get a detailed summary, key insights and practical recommendations, organized into clear sections." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form onSubmit={submit} noValidate>
          <FormCard title="What should we research?">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="tablist" aria-label="Research input type">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                    mode === m.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <m.icon className="size-4" /> {m.label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="research-text">{mode === "topic" ? "Topic or question" : "Article text"}</Label>
              <Textarea
                id="research-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={mode === "topic" ? "e.g. Best practices for onboarding remote employees" : "Paste the full article or report text here…"}
                className={mode === "topic" ? "min-h-28" : "min-h-64"}
                maxLength={30000}
                aria-invalid={!!error}
              />
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : (
                <FieldHint>
                  {mode === "topic"
                    ? "Topic research uses the AI's general knowledge and may not include the latest news."
                    : "The summary will be based only on the text you paste."}
                </FieldHint>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focus">
                Focus or audience <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="focus" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Cost impact for a small HR team" maxLength={300} />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" variant="gradient" disabled={ai.loading} className="flex-1 sm:flex-none">
                {ai.loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {ai.loading ? "Researching…" : "Generate research"}
              </Button>
              <Button type="button" variant="soft" onClick={fillExample} disabled={ai.loading}>
                <Lightbulb /> Try an example
              </Button>
            </div>
          </FormCard>
        </form>

        <OutputPanel
          title="Research findings"
          text={ai.text}
          onChange={ai.setText}
          loading={ai.loading}
          error={ai.error}
          onRegenerate={ai.regenerate}
          onClear={ai.clear}
          canRegenerate={ai.canRegenerate}
          emptyHint="Your briefing — overview, organized sections, key insights and recommendations — will appear here."
        />
      </div>
      <AiDisclaimer />
    </div>
  );
}
