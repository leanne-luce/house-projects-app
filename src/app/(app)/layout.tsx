import { TabNav } from "./tab-nav";
import { LogoutButton } from "./logout-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="app-shell">
      <header className="top">
        <h1>
          <span className="house-emoji">🏠</span>House Projects Hub
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <TabNav />
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
