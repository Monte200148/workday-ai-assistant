import { AlertTriangle, PlugZap } from "lucide-react";

import type { AiError } from "@/hooks/use-ai-tool";

export function ErrorNotice({ error }: { error: AiError }) {
  const setup = error.kind === "setup";
  const Icon = setup ? PlugZap : AlertTriangle;
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        setup
          ? "border-primary/30 bg-secondary text-secondary-foreground"
          : "border-destructive/30 bg-destructive/5 text-foreground"
      }`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${setup ? "text-primary" : "text-destructive"}`} />
      <div>
        <p className="font-semibold">{setup ? "AI setup needed" : "Couldn't generate a result"}</p>
        <p className="mt-0.5 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}
