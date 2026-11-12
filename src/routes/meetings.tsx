import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, FileText, Lightbulb, ListChecks, Loader2, Sparkles, Users } from "lucide-react";
import { useState } from "react";

import { AiDisclaimer } from "@/components/app/ai-disclaimer";
import { FormCard } from "@/components/app/form-card";
import { OutputPanel } from "@/components/app/output-panel";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiTool } from "@/hooks/use-ai-tool";
import { meetingInputSchema } from "@/lib/ai-tools";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · Workday AI Assistant" },
      { name: "description", content: "Paste meeting notes and get a structured summary with decisions, action items, owners and deadlines." },
      { property: "og:title", content: "Meeting Notes Summarizer · Workday AI Assistant" },
      { property: "og:description", content: "Paste meeting notes and get a structured summary with decisions, action items, owners and deadlines." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

const EXAMPLE = `Product sync – Tuesday 12 Nov
Attendees: Maya (PM), Daniel (Eng lead), Priya (Design), Leo (Marketing)

- Maya: beta feedback mostly positive, but onboarding is confusing for 40% of testers.
- Priya showed new onboarding flow mockups. Team liked the 3-step version.
- Decided to go with the 3-step onboarding for the v2 launch.
- Daniel says the API migration is 2 weeks behind; risk for the Dec 2 launch date.
- Agreed to keep Dec 2 launch but cut the reporting dashboard from v2 scope.
- Leo needs final screenshots by Nov 22 for the launch campaign.
- Priya to deliver final onboarding designs by Friday Nov 15.
- Daniel to share a revised migration plan by Thursday.
- Someone should check with legal about the new data consent copy — no owner yet.
- Next sync: Nov 19.`;

const EXTRACTS = [
  { icon: ListChecks, label: "Key decisions" },
  { icon: Users, label: "Action items & owners" },
  { icon: CalendarClock, label: "Deadlines highlighted" },
];

function MeetingsPage() {
  const ai = useAiTool("meeting");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = meetingInputSchema.safeParse({ notes });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your notes.");
      return;
    }
    setError("");
    void ai.generate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Paste raw notes or a transcript. Get a concise summary with decisions, owners and deadlines pulled out for you." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form onSubmit={submit} noValidate>
          <FormCard title="Meeting notes">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Paste your notes</Label>
                <span className="text-xs text-muted-foreground">{notes.length.toLocaleString()} / 30,000</span>
              </div>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste meeting notes, a transcript or bullet points…" className="min-h-72" maxLength={30000} aria-invalid={!!error} />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {EXTRACTS.map((x) => (
                <span key={x.label} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  <x.icon className="size-3.5" /> {x.label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" variant="gradient" disabled={ai.loading} className="flex-1 sm:flex-none">
                {ai.loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {ai.loading ? "Summarizing…" : "Summarize notes"}
              </Button>
              <Button type="button" variant="soft" onClick={() => { setNotes(EXAMPLE); setError(""); }} disabled={ai.loading}>
                <Lightbulb /> Try an example
              </Button>
            </div>
          </FormCard>
        </form>

        <OutputPanel
          title="Meeting summary"
          text={ai.text}
          onChange={ai.setText}
          loading={ai.loading}
          error={ai.error}
          onRegenerate={ai.regenerate}
          onClear={ai.clear}
          canRegenerate={ai.canRegenerate}
          emptyHint="Your structured summary — decisions, action items with owners, and highlighted deadlines — will appear here."
        />
      </div>
      <AiDisclaimer />
    </div>
  );
}
