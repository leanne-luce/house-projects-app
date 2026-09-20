const { StatCard, PanelCard, ListItem, TotalsStrip, HouseTabs, StatusPill } = window.ClubLuceDesignSystem_b992b6;

function OverviewScreen({ data, houseId, onHouse, onOpen }) {
  const house = data.houses.find((h) => h.id === houseId);
  const details = data.details.filter((d) => d.houseId === houseId);
  const rooms = data.rooms;
  const spent = details.reduce((s, d) => s + d.act, 0);
  const projected = details.reduce((s, d) => s + Math.max(d.est, d.act), 0);
  const over = details.filter((d) => d.act > d.est && d.est > 0);
  const overTotal = over.reduce((s, d) => s + (d.act - d.est), 0);
  const remaining = details.filter((d) => d.est > d.act).reduce((s, d) => s + (d.est - d.act), 0);
  const sourcing = data.materials.filter((m) => m.status === "need_to_source" && details.some((d) => d.id === m.detailId));
  const path = (d) => { const r = rooms.find((x) => x.id === d.roomId); return house.name + (r ? " › " + r.name : "") + " › " + d.name; };
  return (
    <>
      <HouseTabs houses={data.houses} active={houseId} onSelect={onHouse} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(7rem,1fr))", gap: "0.7rem", marginBottom: "1rem" }}>
        <StatCard value={details.filter((d) => d.status === "in_progress").length} label="Active details" />
        <StatCard value={money(spent)} label="Total spent" />
        <StatCard value={money(projected)} label="Total projected" />
        <StatCard value={money(overTotal)} label="Over budget" tone={overTotal ? "danger" : "default"} />
        <StatCard value={money(remaining)} label="Left to spend (budgeted)" />
        <StatCard value={sourcing.length} label="Need sourcing" />
      </div>
      <PanelCard title={"All-in value — " + house.name} style={{ marginBottom: "1rem" }}>
        <TotalsStrip style={{ marginBottom: 0 }} items={[
          { label: "Purchase price", value: money(house.purchasePrice) },
          { label: "+ Spent on projects", value: money(spent) },
          { label: "All-in so far", value: money(house.purchasePrice + spent), emphasis: true },
          { label: "All-in if fully spent as planned", value: money(house.purchasePrice + projected), emphasis: true }
        ]} />
      </PanelCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <PanelCard title="Over budget">
          {over.length ? over.map((d) => (
            <ListItem key={d.id} onClick={() => onOpen(d)} main={path(d)} right={<span style={{ color: "var(--danger)", fontWeight: 700, fontSize: "0.85rem" }}>{money(d.act)} / {money(d.est)}</span>} />
          )) : <div style={{ color: "var(--text-faint)", fontSize: "0.85rem", fontStyle: "italic" }}>Nothing over budget.</div>}
        </PanelCard>
        <PanelCard title="Materials needing sourcing">
          {sourcing.length ? sourcing.map((m) => {
            const d = details.find((x) => x.id === m.detailId);
            return <ListItem key={m.id} onClick={() => onOpen(d)} main={m.description} sub={path(d)} />;
          }) : <div style={{ color: "var(--text-faint)", fontSize: "0.85rem", fontStyle: "italic" }}>Nothing waiting on sourcing.</div>}
        </PanelCard>
        <PanelCard title="Coming up" span2>
          {details.filter((d) => d.status !== "done").map((d) => (
            <ListItem key={d.id} onClick={() => onOpen(d)} main={path(d)} right={
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <StatusPill status={d.status} />
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{d.timeframe}</span>
              </span>} />
          ))}
        </PanelCard>
      </div>
    </>
  );
}

Object.assign(window, { OverviewScreen });
