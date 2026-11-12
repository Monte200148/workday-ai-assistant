import { Fragment, type ReactNode } from "react";

// Renders the app's markdown-lite output: "# "/"## " headings, "- " bullets,
// **bold** and ==highlight== (used for deadlines).
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|==[^=]+==)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("==") && part.endsWith("==")) {
      return (
        <mark key={i} className="rounded-md bg-highlight px-1.5 py-0.5 text-xs font-semibold text-highlight-foreground">
          {part.slice(2, -2)}
        </mark>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gradient-primary" />
            <span>{inline(b)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      return;
    }
    flush();
    if (!line.trim()) return;
    if (line.startsWith("## ")) {
      blocks.push(
        <h4 key={i} className="pt-3 text-xs font-semibold uppercase tracking-wider text-primary">
          {line.slice(3)}
        </h4>,
      );
    } else if (line.startsWith("# ")) {
      blocks.push(<h3 key={i} className="text-lg font-semibold text-foreground">{line.slice(2)}</h3>);
    } else if (line.startsWith("Subject: ")) {
      blocks.push(
        <p key={i} className="rounded-lg bg-muted px-3 py-2 text-sm">
          <span className="font-semibold text-muted-foreground">Subject: </span>
          <span className="font-semibold text-foreground">{line.slice(9)}</span>
        </p>,
      );
    } else {
      blocks.push(<p key={i}>{inline(line)}</p>);
    }
  });
  flush();

  return <div className="space-y-2.5 text-sm leading-relaxed text-foreground/85">{blocks}</div>;
}
