import { TabNav } from "./tab-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="app-shell">
      <header className="top">
        <h1 className="site-title">Club Luce | Studio</h1>
        <TabNav />
      </header>
      {children}
    </div>
  );
}
