import type { ReactNode } from "react";

export function FormCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
