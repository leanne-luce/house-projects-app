const { Eyebrow, PlanCard } = window.ClubLuceDesignSystem_b992b6;

function PlansPage({ site }) {
  const all = [...site.plans, ...site.plans.map((p) => ({ ...p, id: p.id + "-2", image: null }))];
  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 2.5rem" }}>
      <div style={{ padding: "7rem 0 4rem", maxWidth: 700 }}>
        <Eyebrow style={{ marginBottom: "1.5rem" }}>Plans</Eyebrow>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5.5vw,4.25rem)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.025em", color: "var(--brown)", marginBottom: "2rem" }}>
          Everything worth<br /><em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>making.</em>
        </h1>
        <p style={{ fontSize: "1.1875rem", color: "var(--brown-mid)", lineHeight: 1.75, maxWidth: 560 }}>
          Each plan includes a cut list, a materials list with rough costs, step-by-step instructions, and reference images.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "3rem 2.25rem", paddingBottom: "7rem", borderTop: "1px solid var(--sand)", paddingTop: "4rem" }}>
        {all.map((p) => <PlanCard key={p.id} {...p} />)}
      </div>
    </main>
  );
}

Object.assign(window, { PlansPage });
