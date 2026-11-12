import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
        <Icon className="size-6" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
    </div>
  );
}
