const { StatusPill, Button, ProgressBar } = window.ClubLuceDesignSystem_b992b6;

function money(n) { return "$" + Math.round(n).toLocaleString(); }

function RoomCard({ room, details, onOpen }) {
  const [open, setOpen] = React.useState(true);
  const done = details.filter((d) => d.status === "done").length;
  const pct = details.length ? (done / details.length) * 100 : 0;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--sand)", overflow: "hidden", position: "relative", alignSelf: open ? "stretch" : undefined, display: open ? "flex" : undefined, flexDirection: "column" }}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "var(--accent)" }} />
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.75rem 0.65rem 0.9rem", cursor: "pointer" }}>
        <span style={{ color: "var(--text-faint)", fontSize: "0.85rem", transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-mid)" }}>{room.name}</div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--brown-mid)", marginTop: "0.25rem" }}>{details.length} details · {money(details.reduce((s, d) => s + d.act, 0))} spent</div>
          <div style={{ display: "flex", height: "0.35rem", borderRadius: 999, overflow: "hidden", background: "var(--border)", marginTop: "0.45rem" }}>
            {details.map((d) => <span key={d.id} style={{ flex: 1, background: d.status === "done" ? "var(--good)" : d.status === "in_progress" ? "var(--warn)" : d.status === "on_hold" ? "var(--danger)" : "var(--text-faint)" }} />)}
          </div>
          <ProgressBar pct={pct} showPct style={{ marginTop: "0.3rem" }} />
        </div>
      </div>
      {open ? (
        <div style={{ padding: "0.6rem 0.75rem 0.75rem 0.9rem", borderTop: "1px solid var(--border)", flex: 1 }}>
          {details.map((d) => (
            <div key={d.id} onClick={() => onOpen(d)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sand-deep)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--sand)")}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", padding: "0.55rem 0.7rem", background: "var(--sand)", marginBottom: "0.4rem", cursor: "pointer" }}>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.9375rem" }}>{d.name}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-mid)", marginTop: "0.15rem" }}>{d.timeframe} · {money(d.act)} of {money(d.est)}</div>
              </div>
              <StatusPill status={d.status} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
            <Button variant="ghost">+ Add detail</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HousesScreen({ data, onOpen }) {
  return (
    <>
      {data.houses.map((h) => {
        const rooms = data.rooms.filter((r) => r.houseId === h.id);
        const details = data.details.filter((d) => d.houseId === h.id);
        return (
          <div key={h.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.9rem 1rem", gap: "0.6rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: "1 1 20rem", maxWidth: "20rem" }}>
                <span style={{ color: "var(--text-faint)", transform: "rotate(90deg)" }}>▸</span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.375rem", letterSpacing: "-0.01em" }}>{h.name}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-light)", marginTop: "0.2rem" }}>{h.address}</div>
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-mid)", textAlign: "right", minWidth: "9rem" }}>
                {details.length} details · {money(details.reduce((s, d) => s + d.act, 0))} spent
              </div>
            </div>
            <div style={{ padding: "0 1rem 1rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(15rem,1fr))", gap: "0.7rem", marginTop: "0.9rem", alignItems: "start" }}>
                {rooms.map((r) => <RoomCard key={r.id} room={r} details={details.filter((d) => d.roomId === r.id)} onOpen={onOpen} />)}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                <Button variant="ghost">+ Add room</Button>
                <Button variant="ghost">+ Add detail</Button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

Object.assign(window, { HousesScreen, money });
