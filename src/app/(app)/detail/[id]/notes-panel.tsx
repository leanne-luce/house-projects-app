"use client";

import { useTransition } from "react";
import { updateDetail } from "@/lib/actions";
import { Panel } from "@/components/panel";

const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/g;

function extractLinks(text: string | null): string[] {
  if (!text) return [];
  const found = text.match(URL_PATTERN) || [];
  // dedupe, keep first-seen order
  return [...new Set(found)];
}

export function NotesPanel({ detailId, notes }: { detailId: string; notes: string | null }) {
  const [, startTransition] = useTransition();
  const links = extractLinks(notes);

  return (
    <Panel title="Notes">
      <textarea
        rows={5}
        defaultValue={notes || ""}
        placeholder="Anything else — links, measurements someone gave you, a contractor's number…"
        onBlur={(e) => startTransition(() => updateDetail(detailId, { notes: e.target.value || null }))}
      />
      {links.length ? (
        <div style={{ marginTop: "var(--db-space-2)", display: "flex", flexWrap: "wrap", gap: "var(--db-space-2)" }}>
          {links.map((link) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="link-btn"
              style={{ textDecoration: "underline", wordBreak: "break-all" }}
            >
              {link.replace(/^https?:\/\//, "").slice(0, 40)}
              {link.replace(/^https?:\/\//, "").length > 40 ? "…" : ""} ↗
            </a>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
