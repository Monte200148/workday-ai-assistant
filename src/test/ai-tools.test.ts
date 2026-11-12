import { describe, expect, it } from "vitest";

import { emailInputSchema, formatMeeting, meetingInputSchema } from "@/lib/ai-tools";
import { computeStats } from "@/lib/activity";

describe("AI tool rules", () => {
  it("only accepts the three tones Formal, Friendly and Persuasive", () => {
    const base = { purpose: "Follow up", details: "Met on Monday" };
    expect(emailInputSchema.safeParse({ ...base, tone: "Friendly" }).success).toBe(true);
    expect(emailInputSchema.safeParse({ ...base, tone: "Casual" }).success).toBe(false);
  });

  it("rejects meeting notes that are too short to summarize", () => {
    expect(meetingInputSchema.safeParse({ notes: "too short" }).success).toBe(false);
  });

  it("lists action items with their owner and a highlighted deadline", () => {
    const text = formatMeeting({
      title: "Sync",
      summary: "s",
      keyPoints: [],
      decisions: ["Ship Dec 4"],
      actionItems: [{ task: "Finalize pricing", owner: "Tom", deadline: "Nov 20" }],
      deadlines: [{ item: "Launch", date: "Dec 4" }],
      openQuestions: [],
    });
    expect(text).toContain("- **Tom**: Finalize pricing (Due: ==Nov 20==)");
    expect(text).toContain("- ==Dec 4== Launch");
  });

  it("estimates time saved per completed task", () => {
    const stats = computeStats([
      { id: "1", tool: "email", title: "a", at: 0 },
      { id: "2", tool: "research", title: "b", at: 0 },
    ]);
    expect(stats.total).toBe(2);
    expect(stats.minutesSaved).toBe(28);
  });
});
