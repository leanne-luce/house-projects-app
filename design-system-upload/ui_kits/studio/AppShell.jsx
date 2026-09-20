const { TabNav, Fab } = window.ClubLuceDesignSystem_b992b6;

const TABS = [
  { id: "houses", label: "Houses" },
  { id: "inbox", label: "Inbox" },
  { id: "projects", label: "Projects" },
  { id: "receipts", label: "Receipts" },
  { id: "lookbook", label: "Lookbook" },
  { id: "overview", label: "Overview" }
];

function AppShell({ tab, onTab, onCapture, children }) {
  return (
    <div style={{ maxWidth: "62rem", margin: "0 auto", padding: "1rem 1rem 6rem" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", padding: "1.25rem 0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "1rem" }}>
        <h1 className="site-title" style={{ fontSize: "1.375rem", margin: 0, flexShrink: 0, whiteSpace: "nowrap" }}>Club Luce | Studio</h1>
        <TabNav tabs={TABS} active={tab} onSelect={onTab} />
      </header>
      {children}
      <Fab onClick={onCapture} />
    </div>
  );
}

Object.assign(window, { AppShell, TABS });
