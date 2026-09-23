import Link from "next/link";
import type { houses as housesTable } from "@/db/schema";

type House = typeof housesTable.$inferSelect;

// Receipts, Lookbook, and Overview are per-house views (Projects stays
// cross-house, since scheduling doesn't naturally split by property) —
// this is the switcher every one of those three pages uses to pick which
// house it's showing. Plain server-renderable links (?house=id), no
// client state needed for a "pick one of N" nav control.
export function HouseSwitcher({
  houses,
  activeHouseId,
  basePath,
}: {
  houses: House[];
  activeHouseId: string;
  basePath: string;
}) {
  if (houses.length < 2) return null;
  return (
    <nav className="house-tabs">
      {houses.map((h) => (
        <Link
          key={h.id}
          href={`${basePath}?house=${h.id}`}
          className={h.id === activeHouseId ? "active" : ""}
        >
          {h.name}
        </Link>
      ))}
    </nav>
  );
}
