const { Button, Eyebrow, SectionHeading, TextLink, PlanCard } = window.ClubLuceDesignSystem_b992b6;

function HomePage({ site, onNav }) {
  return (
    <main>
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "82vh", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "6rem 3rem 5rem clamp(1.25rem, calc((100vw - 1160px) / 2 + 2.5rem), 8rem)" }}>
          <Eyebrow tone="brass" style={{ marginBottom: "1.75rem" }}>Woodwork &middot; Textiles &middot; Home</Eyebrow>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,4.5vw,4.25rem)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-0.025em", color: "var(--brown)", marginBottom: "2rem" }}>
            Plans for building<br /><em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>a life you love.</em>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--brown-mid)", maxWidth: 420, lineHeight: 1.75, marginBottom: "2.75rem" }}>
            Downloadable plans for furniture, soft furnishings, and things worth making. Designed for real homes — not showrooms.
          </p>
          <div><Button variant="outline" onClick={() => onNav("plans")}>Browse all plans</Button></div>
        </div>
        <div style={{ overflow: "hidden", background: "var(--sand)" }}>
          <img src="../../assets/photos/long-low-shelves-wide-view.png" alt="A warm, light-filled living room" style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "none" }} />
        </div>
      </section>

      <section style={{ padding: "7rem 0" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 2.5rem" }}>
          <SectionHeading label="Featured" action={<TextLink onClick={(e) => { e.preventDefault(); onNav("plans"); }}>View all &rarr;</TextLink>}>Recent plans</SectionHeading>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "3rem 2.25rem" }}>
            {site.plans.map((p) => <PlanCard key={p.id} {...p} />)}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--sand)", padding: "7rem 0" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ maxWidth: 580 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.875rem,3.5vw,2.875rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.15, color: "var(--brown)", marginBottom: "1.125rem" }}>New plans, straight to your inbox.</h2>
            <p style={{ color: "var(--brown-mid)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.7 }}>Join the list for early access to new plans, making notes, and the occasional honest home update.</p>
            <div style={{ border: "1.5px dashed var(--brown-light)", padding: "3rem 2.5rem", textAlign: "center" }}>
              <strong style={{ display: "block", fontWeight: 500, color: "var(--brown-light)", marginBottom: "0.375rem", letterSpacing: "0.04em", fontSize: "0.75rem", textTransform: "uppercase" }}>Email signup</strong>
              <p style={{ fontSize: "0.875rem", color: "var(--brown-mid)", fontStyle: "italic", lineHeight: 1.7 }}>Paste your Kit / ConvertKit embed code here to replace this placeholder.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { HomePage });
