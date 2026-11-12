import { FileText, Mail, Search, type LucideIcon } from "lucide-react";

import type { ToolId } from "./ai-tools";

export type ToolMeta = {
  id: ToolId;
  name: string;
  short: string;
  path: "/email" | "/meetings" | "/research";
  description: string;
  icon: LucideIcon;
  /** Rough minutes a person would spend doing this by hand; used for the "time saved" estimate. */
  minutesSaved: number;
};

export const APP_NAME = "Workday AI Assistant";

export const TOOLS: ToolMeta[] = [
  {
    id: "email",
    name: "Smart Email Generator",
    short: "Email",
    path: "/email",
    description: "Turn a purpose and a few details into a polished, ready-to-send email.",
    icon: Mail,
    minutesSaved: 8,
  },
  {
    id: "meeting",
    name: "Meeting Notes Summarizer",
    short: "Meetings",
    path: "/meetings",
    description: "Condense long notes into decisions, action items, owners and deadlines.",
    icon: FileText,
    minutesSaved: 15,
  },
  {
    id: "research",
    name: "AI Research Assistant",
    short: "Research",
    path: "/research",
    description: "Get organized summaries, insights and recommendations on any topic or article.",
    icon: Search,
    minutesSaved: 20,
  },
];

export const toolById = (id: ToolId) => TOOLS.find((t) => t.id === id)!;
