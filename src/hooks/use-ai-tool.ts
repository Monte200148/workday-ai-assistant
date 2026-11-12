import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";

import type { EmailInput, MeetingInput, ResearchInput, ToolId, ToolRequest, ToolResponse } from "@/lib/ai-tools";
import { runAiTool } from "@/lib/ai.functions";
import { logActivity } from "@/lib/activity";

type InputMap = { email: EmailInput; meeting: MeetingInput; research: ResearchInput };
type InputFor<T extends ToolId> = InputMap[T];
export type AiError = Extract<ToolResponse, { ok: false }>;

export function useAiTool<T extends ToolId>(tool: T) {
  const run = useServerFn(runAiTool);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AiError | null>(null);
  const lastInput = useRef<InputFor<T> | null>(null);

  const generate = useCallback(
    async (input: InputFor<T>) => {
      lastInput.current = input;
      setLoading(true);
      setError(null);
      try {
        const res = await run({ data: { tool, input } as ToolRequest });
        if (res.ok) {
          setText(res.text);
          logActivity(tool, res.title);
        } else {
          setError(res);
        }
      } catch (e) {
        console.error(e);
        setError({
          ok: false,
          kind: "generic",
          message: "We couldn't reach the AI service. Check your connection and try again.",
        });
      } finally {
        setLoading(false);
      }
    },
    [run, tool],
  );

  const regenerate = useCallback(() => {
    if (lastInput.current) void generate(lastInput.current);
  }, [generate]);

  const clear = useCallback(() => {
    setText("");
    setError(null);
  }, []);

  return { text, setText, loading, error, generate, regenerate, clear, canRegenerate: !!lastInput.current };
}
