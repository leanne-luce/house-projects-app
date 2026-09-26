"use client";

import { useState, useTransition } from "react";
import { updateDetail } from "@/lib/actions";
import { Panel } from "@/components/panel";

const PLACEHOLDER = `board_length = 12
panel_length = 4
panels_per_board = board_length / panel_length
panels_needed = 16
boards_needed = ceil(panels_needed / panels_per_board)`;

// Ported from the original prototype's scratchpad. Safe by construction:
// the only substitution into the eval'd string is "ceil/floor/round/sqrt/
// abs/min/max(" -> "Math.$1(", and the whitelist regex runs against that
// substitution already stripped back out — so nothing but digits,
// operators, parens and commas can ever reach Function().
function evalMathExpr(expr: string): number | null {
  const e = expr.replace(/\b(ceil|floor|round|sqrt|abs|min|max)\s*\(/g, "Math.$1(");
  const stripped = e.replace(/Math\.(ceil|floor|round|sqrt|abs|min|max)\(/g, "(");
  if (!/^[0-9+\-*/().,\s]+$/.test(stripped) || !stripped.trim()) return null;
  try {
    // eslint-disable-next-line no-new-func
    const val = Function('"use strict"; return (' + e + ")")();
    return typeof val === "number" && isFinite(val) ? val : null;
  } catch {
    return null;
  }
}

type ScratchLine = { text: string; kind: "comment" | "blank" | "result" | "plain"; result?: number };

function renderScratchpad(text: string): ScratchLine[] {
  const vars: Record<string, number> = {};
  return text.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return { text: line, kind: "blank" };
    if (trimmed.startsWith("#")) return { text: line, kind: "comment" };

    const assign = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    const name = assign ? assign[1] : null;
    let expr = assign ? assign[2] : trimmed;

    for (const n of Object.keys(vars).sort((a, b) => b.length - a.length)) {
      expr = expr.replace(new RegExp(`\\b${n}\\b`, "g"), `(${vars[n]})`);
    }

    const value = evalMathExpr(expr);
    if (value === null) return { text: line, kind: "plain" };
    if (name) vars[name] = value;
    const rounded = Number.isInteger(value) ? value : Math.round(value * 1000) / 1000;
    return { text: line, kind: "result", result: rounded };
  });
}

export function ScratchpadPanel({ detailId, initialValue }: { detailId: string; initialValue: string }) {
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);

  return (
    <Panel title="Materials note pad">
      <div className="scratchpad-wrap">
        <textarea
          id="scratchpadInput"
          placeholder={PLACEHOLDER}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => {
            if (e.target.value !== initialValue) {
              startTransition(() => updateDetail(detailId, { scratchpad: e.target.value }));
            }
          }}
        />
        {value.trim() ? (
          <div className="scratchpad-preview">
            {renderScratchpad(value).map((l, i) => (
              <div className={`sp-line${l.kind === "comment" ? " sp-comment" : ""}`} key={i}>
                <span className="sp-src">{l.text || " "}</span>
                {l.kind === "result" ? <span className="sp-result">{l.result}</span> : null}
              </div>
            ))}
          </div>
        ) : null}
        <div className="scratchpad-help">
          Basic math per line — name = expression, or just an expression. Use ceil(), floor(), round() to round up
          or down. Lines starting with # are notes.
        </div>
      </div>
    </Panel>
  );
}
