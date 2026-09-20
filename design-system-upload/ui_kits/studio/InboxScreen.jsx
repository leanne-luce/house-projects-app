const { Card, Button, Textarea, Field, Select, SectionTitle, EmptyState } = window.ClubLuceDesignSystem_b992b6;

function InboxScreen({ items, onFile, onDiscard, onAdd }) {
  const [text, setText] = React.useState("");
  const [filing, setFiling] = React.useState(null);
  return (
    <>
      <Card pad style={{ marginBottom: "1rem" }}>
        <SectionTitle>Quick capture</SectionTitle>
        <Field><Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="A stray thought, a material, a link…" /></Field>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <Button variant="secondary">Add a photo or video</Button>
          <Button variant="primary" onClick={() => { if (text.trim()) { onAdd(text); setText(""); } }}>Add to inbox</Button>
        </div>
      </Card>
      {!items.length ? (
        <EmptyState glyph="📥">Inbox is empty. Whatever you capture on the fly lands here until you&rsquo;re ready to file it.</EmptyState>
      ) : (
        <Card>
          {items.map((item, i) => (
            <div key={item.id} style={{ display: "flex", gap: "0.7rem", padding: "0.7rem", borderBottom: i === items.length - 1 ? "none" : "1px solid var(--border)" }}>
              <div style={{ width: "3.2rem", height: "3.2rem", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid var(--border)" }}><span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-light)" }}>{item.photo ? "Photo" : "Note"}</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.9375rem", lineHeight: 1.6 }}>{item.text || <i style={{ color: "var(--text-faint)" }}>(photo only)</i>}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-light)", marginTop: "0.35rem" }}>{item.time}</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <Button variant="secondary" onClick={() => setFiling(filing === item.id ? null : item.id)}>File…</Button>
                  <Button variant="icon" onClick={() => onDiscard(item.id)}>Discard</Button>
                </div>
                {filing === item.id ? (
                  <div style={{ marginTop: "0.6rem", background: "var(--sand)", padding: "1rem" }}>
                    <Field label="File to existing detail">
                      <Select defaultValue="" onChange={(e) => e.target.value && onFile(item.id, e.target.value)}>
                        <option value="">Choose a detail…</option>
                        <option value="d1">Rosewood › Kitchen › Backsplash tile</option>
                        <option value="d3">Rosewood › Entry hall › Stair runner</option>
                        <option value="d5">Rosewood › Studio › Pegboard wall</option>
                      </Select>
                    </Field>
                    <Button variant="link">+ or create a new detail for this</Button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

Object.assign(window, { InboxScreen });
