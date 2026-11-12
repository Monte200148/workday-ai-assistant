import { Check, Copy, Eye, Pencil, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { AiError } from "@/hooks/use-ai-tool";

import { ErrorNotice } from "./error-notice";
import { RichText } from "./rich-text";

type Props = {
  title: string;
  text: string;
  onChange: (text: string) => void;
  loading: boolean;
  error: AiError | null;
  onRegenerate: () => void;
  onClear: () => void;
  canRegenerate: boolean;
  emptyHint: string;
};

export function OutputPanel({
  title,
  text,
  onChange,
  loading,
  error,
  onRegenerate,
  onClear,
  canRegenerate,
  emptyHint,
}: Props) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const hasText = text.trim().length > 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text.replace(/==([^=]+)==/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1"));
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select the text and copy it manually.");
    }
  };

  return (
    <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">{title}</h2>
        </div>
        {hasText && !loading && (
          <div className="flex rounded-lg bg-muted p-0.5 text-xs" role="tablist" aria-label="Output view">
            {(["preview", "edit"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium capitalize transition-colors ${
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "preview" ? <Eye className="size-3.5" /> : <Pencil className="size-3.5" />}
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 p-4 sm:p-5">
        {error && <ErrorNotice error={error} />}

        {loading ? (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-glow opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
              </span>
              Generating with AI…
            </div>
            {[90, 75, 95, 60, 85, 70].map((w, i) => (
              <div key={i} className="h-3.5 animate-pulse rounded-full bg-muted" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : hasText ? (
          mode === "edit" ? (
            <Textarea
              value={text}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[360px] resize-y font-mono text-sm leading-relaxed"
              aria-label="Edit generated output"
            />
          ) : (
            <RichText text={text} />
          )
        ) : (
          !error && (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-gradient-soft p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-primary shadow-soft">
                <Sparkles className="size-5" />
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
            </div>
          )
        )}
      </div>

      {(hasText || canRegenerate) && !loading && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 sm:px-5">
          <Button size="sm" variant="gradient" onClick={copy} disabled={!hasText}>
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" variant="outline" onClick={onRegenerate} disabled={!canRegenerate}>
            <RefreshCw /> Regenerate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onClear();
              setMode("preview");
            }}
            disabled={!hasText && !error}
          >
            <Trash2 /> Clear
          </Button>
          {hasText && mode === "preview" && (
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setMode("edit")}>
              <Pencil /> Edit
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
