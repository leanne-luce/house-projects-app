const { Card, Field, TextInput, Button } = window.ClubLuceDesignSystem_b992b6;

function LoginScreen({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <form onSubmit={(e) => { e.preventDefault(); onEnter(); }} style={{ width: "100%", maxWidth: "22rem", padding: "1.5rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}>
        <h1 className="site-title" style={{ fontSize: "1.2rem", margin: "0 0 1rem" }}>Club Luce | Studio</h1>
        <Field label="Passphrase" htmlFor="pass"><TextInput id="pass" type="password" autoFocus /></Field>
        <Button variant="primary" type="submit" style={{ width: "100%", marginTop: "0.75rem" }}>Enter</Button>
      </form>
    </div>
  );
}

Object.assign(window, { LoginScreen });
