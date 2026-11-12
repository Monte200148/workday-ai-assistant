// Recent activity is kept in this browser only (no account or database).
import { useSyncExternalStore } from "react";

import type { ToolId } from "./ai-tools";
import { TOOLS } from "./tools-meta";

export type Activity = { id: string; tool: ToolId; title: string; at: number };

const KEY = "workday-ai-activity";
const MAX = 25;
const EMPTY: Activity[] = [];
const listeners = new Set<() => void>();
let cache: Activity[] | null = null;

function read(): Activity[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? (parsed as Activity[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Activity[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

export function logActivity(tool: ToolId, title: string) {
  const entry: Activity = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tool,
    title: title.slice(0, 120),
    at: Date.now(),
  };
  write([entry, ...read()].slice(0, MAX));
}

export function clearActivity() {
  write([]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useActivity() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function computeStats(items: Activity[]) {
  const byTool = Object.fromEntries(TOOLS.map((t) => [t.id, 0])) as Record<ToolId, number>;
  for (const a of items) byTool[a.tool] = (byTool[a.tool] ?? 0) + 1;
  const minutesSaved = TOOLS.reduce((sum, t) => sum + byTool[t.id] * t.minutesSaved, 0);
  return { total: items.length, byTool, minutesSaved };
}
