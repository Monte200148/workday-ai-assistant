import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, Loader2, Mail, Sparkles } from "lucide-react";
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
import { TONES, emailInputSchema, type Tone } from "@/lib/ai-tools";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · Workday AI Assistant" },
      { name: "description", content: "Generate formal, friendly or persuasive emails from your purpose and key details." },
      { property: "og:title", content: "Smart Email Generator · Workday AI Assistant" },
      { property: "og:description", content: "Generate formal, friendly or persuasive emails from your purpose and key details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const TONE_HINTS: Record<Tone, string> = {
  Formal: "Polished & respectful",
  Friendly: "Warm & approachable",
  Persuasive: "Confident, clear ask",
};

function EmailPage() {
  const ai = useAiTool("email");
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [errors, setErrors] = useState<Partial<Record<"purpose" | "details", string>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailInputSchema.safeParse({ purpose, recipient, details, tone });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    void ai.generate(parsed.data);
  };

  const fillExample = () => {
    setPurpose("Request a deadline extension for the Q4 marketing report");
    setRecipient("Sarah Chen, Head of Marketing");
    setDetails(
      "Report currently due Friday 15 Nov. Need until Wednesday 20 Nov. Reason: waiting on final campaign data from the analytics team, expected Monday. Draft sections 1-3 are done and I can share them today.",
    );
    setErrors({});
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={Mail} title="Smart Email Generator" description="Describe what you need to say — the AI writes a clear, professional email in the tone you choose." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form onSubmit={submit} noValidate>
          <FormCard title="Email details">
            <div className="space-y-1.5">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow up after a client meeting" maxLength={500} aria-invalid={!!errors.purpose} />
              {errors.purpose && <p className="text-xs text-destructive">{errors.purpose}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipient">
                Recipient <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Alex, Procurement Manager at Acme" maxLength={200} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="details">Key details</Label>
              <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Names, dates, numbers, what you want the reader to do…" className="min-h-36" maxLength={4000} aria-invalid={!!errors.details} />
              {errors.details ? <p className="text-xs text-destructive">{errors.details}</p> : <FieldHint>Specific facts make the email more accurate.</FieldHint>}
            </div>
            <fieldset className="space-y-1.5">
              <legend className="mb-1.5 text-sm font-medium">Tone</legend>
              <div className="grid grid-cols-3 gap-2" role="radiogroup">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tone === t}
                    onClick={() => setTone(t)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      tone === t ? "border-primary bg-secondary shadow-glow" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${tone === t ? "text-primary" : ""}`}>{t}</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">{TONE_HINTS[t]}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" variant="gradient" disabled={ai.loading} className="flex-1 sm:flex-none">
                {ai.loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {ai.loading ? "Generating…" : "Generate email"}
              </Button>
              <Button type="button" variant="soft" onClick={fillExample} disabled={ai.loading}>
                <Lightbulb /> Try an example
              </Button>
            </div>
          </FormCard>
        </form>

        <OutputPanel
          title="Generated email"
          text={ai.text}
          onChange={ai.setText}
          loading={ai.loading}
          error={ai.error}
          onRegenerate={ai.regenerate}
          onClear={ai.clear}
          canRegenerate={ai.canRegenerate}
          emptyHint="Fill in the purpose and details, pick a tone, and your email will appear here — ready to edit and copy."
        />
      </div>
      <AiDisclaimer />
    </div>
  );
}
