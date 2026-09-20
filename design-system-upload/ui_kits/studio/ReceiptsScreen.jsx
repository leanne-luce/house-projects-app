const { Card, HouseTabs, Button, StatusPill, ListItem, SectionTitle } = window.ClubLuceDesignSystem_b992b6;

const RECEIPTS = [
  { id: "r1", vendor: "Otto Tiles", date: "12 Sep 2026", total: 620, pending: 1, items: [{ d: "Zellige 4×4 oatmeal, 38 sq ft", a: 560, s: "assigned" }, { d: "Delivery", a: 60, s: "pending" }] },
  { id: "r2", vendor: "Lowe's", date: "3 Sep 2026", total: 320, pending: 2, items: [{ d: "Tile adhesive, 2 bags", a: 84, s: "pending" }, { d: "Sanded grout, warm grey", a: 36, s: "pending" }, { d: "Spacers + trowel", a: 200, s: "assigned" }] }
];

function ReceiptsScreen({ data, houseId, onHouse }) {
  const [open, setOpen] = React.useState("r1");
  return (
    <>
      <HouseTabs houses={data.houses} active={houseId} onSelect={onHouse} />
      <Card pad style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <SectionTitle style={{ marginBottom: 0, flex: 1 }}>Add a receipt</SectionTitle>
        <Button variant="secondary">Photo or PDF</Button>
        <Button variant="primary">Scan receipt</Button>
      </Card>
      {RECEIPTS.map((r) => (
        <Card key={r.id} style={{ marginBottom: "0.9rem" }}>
          <div onClick={() => setOpen(open === r.id ? null : r.id)} style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.8rem 0.9rem", cursor: "pointer" }}>
            <span style={{ color: "var(--text-faint)", fontSize: "0.85rem", transform: open === r.id ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
            <div style={{ width: "3.4rem", height: "3.4rem", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--brown-light)" }}>PDF</span></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.25rem", letterSpacing: "-0.01em" }}>{r.vendor}</div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-mid)", marginTop: "0.25rem" }}>{r.date} · {money(r.total)} · {r.pending} item{r.pending === 1 ? "" : "s"} pending</div>
            </div>
            <StatusPill status={r.pending ? "in_progress" : "done"} label={r.pending ? "Pending" : "Filed"} />
          </div>
          {open === r.id ? (
            <div style={{ padding: "0.7rem 0.9rem 0.9rem", borderTop: "1px solid var(--border)" }}>
              {r.items.map((it, i) => (
                <ListItem key={i} main={it.d} sub={it.s === "assigned" ? "Assigned to Kitchen › Backsplash tile" : "Unassigned"} right={
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <b style={{ fontSize: "0.85rem" }}>{money(it.a)}</b>
                    {it.s === "pending" ? <Button variant="link">Assign…</Button> : null}
                  </span>} />
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </>
  );
}

Object.assign(window, { ReceiptsScreen });
