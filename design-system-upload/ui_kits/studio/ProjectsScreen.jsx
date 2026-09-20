const { StatusPill } = window.ClubLuceDesignSystem_b992b6;

function HorizonRow({ d, path, onOpen }) {
  return (
    <div onClick={() => onOpen(d)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sand-deep)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--sand)")}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.55rem 0.7rem", background: "var(--sand)", marginBottom: "0.4rem", cursor: "pointer" }}>
      <div>
        <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: "0.9375rem" }}>{d.name}</div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.8125rem", color: "var(--brown-mid)" }}>{path}</div>
      </div>
      <StatusPill status={d.status} />
    </div>
  );
}

function ProjectsScreen({ data, onOpen }) {
  const [doneOpen, setDoneOpen] = React.useState(false);
  const path = (d) => {
    const h = data.houses.find((x) => x.id === d.houseId);
    const r = data.rooms.find((x) => x.id === d.roomId);
    return [h && h.name, r && r.name].filter(Boolean).join(" › ");
  };
  const active = data.details.filter((d) => d.status !== "done");
  const done = data.details.filter((d) => d.status === "done");
  const groups = {};
  active.forEach((d) => { (groups[d.timeframe] = groups[d.timeframe] || []).push(d); });
  return (
    <>
      {Object.keys(groups).map((label) => (
        <div key={label} style={{ marginBottom: "1.1rem" }}>
          <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-light)", margin: "0 0 0.75rem", fontWeight: 400 }}>{label}</h3>
          {groups[label].map((d) => <HorizonRow key={d.id} d={d} path={path(d)} onOpen={onOpen} />)}
        </div>
      ))}
      <details onToggle={(e) => setDoneOpen(e.currentTarget.open)} style={{ marginTop: "1.4rem", paddingTop: "1rem", borderTop: "1px solid var(--sand)" }}>
        <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brown-mid)", padding: "0.3rem 0" }}>
          <span style={{ display: "inline-block", color: "var(--brown-light)", fontSize: "0.78rem", transform: doneOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>▸</span>
          Done ({done.length})
        </summary>
        <div style={{ marginTop: "0.9rem" }}>
          {done.map((d) => <HorizonRow key={d.id} d={d} path={path(d)} onOpen={onOpen} />)}
        </div>
      </details>
    </>
  );
}

Object.assign(window, { ProjectsScreen });

// Matches globals.css: summary::-webkit-details-marker { display:none }
const marker = document.createElement("style");
marker.textContent = "summary::-webkit-details-marker{display:none}summary::marker{content:''}";
document.head.appendChild(marker);
