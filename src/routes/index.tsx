import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, History, Mail, Sparkles, Trash2, TrendingUp, Zap } from "lucide-react";

import { AiDisclaimer } from "@/components/app/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { clearActivity, computeStats, useActivity } from "@/lib/activity";
import { APP_NAME, TOOLS, toolById } from "@/lib/tools-meta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Workday AI Assistant" },
      {
        name: "description",
        content: "Your AI productivity dashboard: write emails, summarize meetings and research topics in seconds.",
      },
      { property: "og:title", content: "Dashboard · Workday AI Assistant" },
      {
        property: "og:description",
        content: "Your AI productivity dashboard: write emails, summarize meetings and research topics in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function formatMinutes(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function Dashboard() {
  const activity = useActivity();
  const stats = computeStats(activity);

  const statCards = [
    { label: "AI tasks completed", value: String(stats.total), icon: Zap },
    { label: "Est. time saved", value: formatMinutes(stats.minutesSaved), icon: Clock },
    { label: "Emails drafted", value: String(stats.byTool.email), icon: Mail },
    { label: "Meetings & research", value: String(stats.byTool.meeting + stats.byTool.research), icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-glow sm:p-8 md:p-10">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="absolute -bottom-24 right-24 size-56 rounded-full bg-primary-foreground/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" /> {APP_NAME}
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Welcome back. Let's clear your to-do list.</h1>
          <p className="mt-3 text-sm text-primary-foreground/85 sm:text-base">
            Draft emails, turn messy meeting notes into clear action plans, and get research briefings — all
            generated from your own input in seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <Button
                key={t.id}
                asChild
                size="sm"
                className="h-9 rounded-full bg-primary-foreground text-primary shadow-none hover:bg-primary-foreground/90"
              >
                <Link to={t.path}>
                  <t.icon /> {t.short}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Productivity statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</p>
              <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-primary">
                <s.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Tools */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Productivity tools</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TOOLS.map((t) => (
            <Link
              key={t.id}
              to={t.path}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <t.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{t.name}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="text-xs text-muted-foreground">Saves ~{t.minutesSaved} min</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h2 className="font-semibold">Recent activity</h2>
          </div>
          {activity.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearActivity}>
              <Trash2 /> Clear history
            </Button>
          )}
        </div>
        {activity.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No activity yet. Your generated emails, summaries and research will appear here.
            </p>
            <Button asChild variant="gradient" size="sm" className="mt-4">
              <Link to="/email">
                <Sparkles /> Generate your first email
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activity.slice(0, 8).map((a) => {
              const tool = toolById(a.tool);
              return (
                <li key={a.id}>
                  <Link to={tool.path} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                      <tool.icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{tool.name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(a.at, { addSuffix: true })}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AiDisclaimer />
    </div>
  );
}
