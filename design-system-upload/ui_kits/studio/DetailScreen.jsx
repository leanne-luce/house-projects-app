const { Button, PanelCard, ListItem, BudgetBar, ProgressBar, ChecklistItem, SectionTitle, Select, TextInput, StatusPill } = window.ClubLuceDesignSystem_b992b6;

const STATUS_COLOR = { not_started: "var(--text-faint)", in_progress: "var(--warn)", done: "var(--good)", on_hold: "var(--danger)" };
const CHECK_LABELS = ["Measure the run", "Order tile samples", "Book the tiler", "Pick grout colour", "Seal and clean"];

function DetailScreen({ detail, data, onBack }) {
  const [checks, setChecks] = React.useState(detail.checklist);
  const room = data.rooms.find((r) => r.id === detail.roomId);
  const house = data.houses.find((h) => h.id === detail.houseId);
  const materials = data.materials.filter((m) => m.detailId === detail.id);
  const spend = data.spend.filter((s) => s.detailId === detail.id);
  const act = spend.reduce((s, x) => s + x.amount, 0);
  const est = detail.est;
  const max = Math.max(est, act, 1);
  const donePct = checks.length ? (checks.filter(Boolean).length / checks.length) * 100 : 0;
  return (
    <div>
      <div style={{ marginBottom: "0.7rem" }}>
        <Button variant="link" onClick={onBack} style={{ fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}>← Back</Button>
      </div>
      <div style={{ position: "relative", overflow: "hidden", padding: "2rem 2rem 2rem 2.25rem", marginBottom: "1.2rem", background: "var(--sand)" }}>
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: STATUS_COLOR[detail.status] }} />
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown-light)" }}>{house.name} › {room ? room.name : "No room"}</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: "0.25rem" }}>{detail.name}</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
          <Select defaultValue={detail.status} style={{ width: "auto", fontSize: "0.82rem", padding: "0.35rem 0.6rem", fontWeight: 700 }}>
            <option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="on_hold">On hold</option><option value="done">Done</option>
          </Select>
          <TextInput defaultValue={detail.timeframe} style={{ width: "auto", fontSize: "0.82rem", padding: "0.35rem 0.6rem" }} />
        </div>
        <div style={{ marginTop: "1.15rem", display: "flex", flexDirection: "column", gap: "0.55rem", background: "var(--cream)", padding: "1.125rem 1.25rem" }}>
          <BudgetBar label="Estimated" value={est} max={max} amount={money(est)} />
          <BudgetBar label="Actual" value={act} max={max} amount={money(act)} over={act > est} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <PanelCard title="Materials plan">
          {materials.map((m) => <ListItem key={m.id} main={m.description} sub={m.qty} right={<StatusPill status={m.status === "have" ? "done" : m.status === "ordered" ? "in_progress" : "not_started"} label={m.status.replace(/_/g, " ")} />} />)}
          <Button variant="ghost" style={{ marginTop: "0.4rem" }}>+ Add material</Button>
        </PanelCard>
        <PanelCard title="Actual spend">
          {spend.map((s) => <ListItem key={s.id} main={s.description} sub={s.vendor} right={<b style={{ fontSize: "0.85rem" }}>{money(s.amount)}</b>} />)}
          <Button variant="ghost" style={{ marginTop: "0.4rem" }}>+ Log spend</Button>
        </PanelCard>
        <PanelCard title="Checklist">
          <ProgressBar pct={donePct} showPct style={{ marginBottom: "0.5rem" }} />
          {checks.map((c, i) => (
            <ChecklistItem key={i} checked={c} onChange={() => setChecks(checks.map((v, j) => (j === i ? !v : v)))}>{CHECK_LABELS[i] || "Task " + (i + 1)}</ChecklistItem>
          ))}
        </PanelCard>
        <PanelCard title="Notes">
          <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Warm grey grout, not white. Samples at <a href="#">ottotiles.co.uk</a>.</div>
        </PanelCard>
        <PanelCard title="Mood board & reference" span2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem,1fr))", gap: "0.6rem" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", fontSize: "0.68rem", textAlign: "center", padding: 6 }}>image</div>
            ))}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.5rem", fontStyle: "italic" }}>Photo slots are intentionally blank — Studio stores user photos in Blob storage.</div>
        </PanelCard>
      </div>
    </div>
  );
}

Object.assign(window, { DetailScreen });
