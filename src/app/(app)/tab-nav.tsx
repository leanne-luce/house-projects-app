"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const TABS = [
  { href: "/houses", label: "Houses" },
  { href: "/inbox", label: "Inbox" },
  { href: "/horizon", label: "Projects" },
  { href: "/receipts", label: "Receipts" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/overview", label: "Overview" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="tabs">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link key={tab.href} href={tab.href} className={active ? "active" : ""}>
            {tab.label}
          </Link>
        );
      })}
      <LogoutButton />
    </nav>
  );
}
