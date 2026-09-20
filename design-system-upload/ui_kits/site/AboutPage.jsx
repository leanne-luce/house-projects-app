const { Eyebrow, PullQuote, SandBlock, TextLink } = window.ClubLuceDesignSystem_b992b6;

function AboutPage() {
  return (
    <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 2.5rem" }}>
      <div style={{ padding: "7rem 0 6rem", maxWidth: 700 }}>
        <Eyebrow style={{ marginBottom: "1.5rem" }}>About</Eyebrow>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5.5vw,4.25rem)", fontWeight: 400, lineHeight: 1.08, letterSpacing: "-0.025em", color: "var(--brown)", marginBottom: "2rem" }}>
          Making things<br />is worth <em style={{ fontStyle: "italic", color: "var(--terracotta)" }}>doing well.</em>
        </h1>
        <p style={{ fontSize: "1.1875rem", color: "var(--brown-mid)", lineHeight: 1.75, maxWidth: 560 }}>
          Club Luce is a small collection of plans for building and making at home. Thoughtfully designed, honestly priced, and meant to be used.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "6rem", padding: "6rem 0 7rem", borderTop: "1px solid var(--sand)", alignItems: "start" }}>
        <div>
          <Section title="What this is" paras={[
            "Club Luce is a one-person project. I make things — furniture, soft furnishings, small objects — and I write down how I did it. The plans here are the ones I'd want to find when I'm starting a new build: clear enough to follow, honest about the materials, and designed for real homes rather than workshops.",
            "Every plan starts as something I've built or made myself. I don't publish anything I haven't put in front of my own saw or sewn on my own table."
          ]} />
          <PullQuote>&ldquo;I believe in buying fewer things and making them better.&rdquo;</PullQuote>
          <Section title="The approach" paras={[
            "I'm interested in things that last. Not perfect things — things that are well-considered. Solid timber over MDF. Linen over polyester. A joint that's cut right rather than filled with caulk.",
            "The plans are written for people who are reasonably handy but not professionals. If you can follow a recipe, you can follow these."
          ]} />
        </div>
        <aside style={{ position: "sticky", top: 88 }}>
          <SandBlock title="Find me here" style={{ marginBottom: "1.25rem" }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", margin: 0, padding: 0 }}>
              {["Pinterest →", "All plans →", "Ko-fi shop →"].map((l) => (
                <li key={l} style={{ paddingLeft: "1.25rem", position: "relative", lineHeight: 1.55 }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--brass)", fontSize: "0.75rem", top: "0.2em" }}>&mdash;</span>
                  <TextLink style={{ fontSize: "0.9rem", color: "var(--brown-mid)", fontWeight: 300 }}>{l}</TextLink>
                </li>
              ))}
            </ul>
          </SandBlock>
          <SandBlock title="Stay in the loop">
            <p style={{ marginBottom: "1.25rem" }}>New plans, making notes, and the occasional honest update — straight to your inbox.</p>
            <div style={{ border: "1.5px dashed var(--brown-light)", padding: "2.5rem 2rem", textAlign: "center" }}>
              <strong style={{ display: "block", fontWeight: 500, color: "var(--brown-light)", marginBottom: "0.5rem", letterSpacing: "0.05em", fontSize: "0.7rem", textTransform: "uppercase" }}>Email signup</strong>
              <p style={{ fontSize: "0.875rem", fontStyle: "italic", lineHeight: 1.65 }}>Paste your Kit / ConvertKit embed code here.</p>
            </div>
          </SandBlock>
        </aside>
      </div>
    </main>
  );
}

function Section({ title, paras }) {
  return (
    <div style={{ marginBottom: "4.5rem" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,2.5vw,2rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.2, color: "var(--brown)", marginBottom: "1.25rem" }}>{title}</h2>
      {paras.map((p, i) => <p key={i} style={{ fontSize: "1rem", color: "var(--brown-mid)", lineHeight: 1.8, marginBottom: "1.5rem", maxWidth: 580 }}>{p}</p>)}
    </div>
  );
}

Object.assign(window, { AboutPage });
