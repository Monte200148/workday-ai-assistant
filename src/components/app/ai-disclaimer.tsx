import { ShieldCheck } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-border bg-muted/60 p-3.5 text-xs text-muted-foreground ${className}`}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        <span className="font-semibold text-foreground">Responsible AI:</span> AI-generated content can be
        inaccurate or incomplete. Review, fact-check and edit every output before sharing or acting on it,
        and avoid pasting confidential information you're not permitted to share.
      </p>
    </div>
  );
}
