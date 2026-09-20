const { Card, HouseTabs, EmptyState } = window.ClubLuceDesignSystem_b992b6;

function Thumb() {
  return <div style={{ aspectRatio: "4/3", background: "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", fontSize: "0.68rem" }}>photo</div>;
}

function LookbookScreen({ data, houseId, onHouse }) {
  const [openId, setOpenId] = React.useState(null);
  const details = data.details.filter((d) => d.houseId === houseId && d.act > 0);
  return (
    <>
      <HouseTabs houses={data.houses} active={houseId} onSelect={onHouse} />
      {!details.length ? <EmptyState glyph="">No photos or inspiration in this house yet.</EmptyState> : details.map((d) => {
        const room = data.rooms.find((r) => r.id === d.roomId);
        return (
          <Card key={d.id} pad style={{ marginBottom: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.8rem" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.375rem", letterSpacing: "-0.01em" }}>{d.name}</span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-mid)" }}>{room ? room.name : "Not in a specific room"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(9rem,1fr))", gap: "0.8rem" }}>
              {["Before", "During", "After"].map((p) => (
                <div key={p}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-light)", marginBottom: "0.4rem" }}>{p}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem,1fr))", gap: "0.4rem" }}><Thumb /><Thumb /></div>
                </div>
              ))}
            </div>
            <details onToggle={(e) => setOpenId(e.currentTarget.open ? d.id : null)} style={{ marginTop: "0.9rem", paddingTop: "0.8rem", borderTop: "1px solid var(--sand)" }}>
              <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-mid)" }}>
                <span style={{ display: "inline-block", color: "var(--brown-light)", fontSize: "0.78rem", transform: openId === d.id ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
                Inspiration (4)
              </summary>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem,1fr))", gap: "0.6rem", marginTop: "0.6rem" }}><Thumb /><Thumb /><Thumb /><Thumb /></div>
            </details>
          </Card>
        );
      })}
    </>
  );
}

Object.assign(window, { LookbookScreen });
