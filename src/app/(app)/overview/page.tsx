import Link from "next/link";
import { getOverviewData } from "@/lib/queries";
import { actualCost, estimatedSpendFor, detailPath } from "@/lib/derived";
import { money, num } from "@/lib/format";

export const dynamic = "force-dynamic";

const GRAN_LABEL: Record<string, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};
const GRAN_ORDER = ["day", "week", "month", "quarter", "year"];
const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold",
};

function monthKeyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function quarterKeyOf(d: Date) {
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

export default async function OverviewPage() {
  const { houses, rooms, details, materialItems, lineItems, inboxItems } = await getOverviewData();

  if (!details.length) {
    return (
      <div className="empty-state">
        <div className="big-emoji">📊</div>
        Nothing to show yet — add a house and a few details to see spend, budget, and sourcing at a
        glance.
      </div>
    );
  }

  const now = new Date();
  const thisMonth = monthKeyOf(now);
  const thisQuarter = quarterKeyOf(now);
  let monthSpend = 0;
  let quarterSpend = 0;
  for (const l of lineItems) {
    if (!l.date) continue;
    const d = new Date(l.date);
    if (Number.isNaN(d.getTime())) continue;
    if (monthKeyOf(d) === thisMonth) monthSpend += num(l.cost);
    if (quarterKeyOf(d) === thisQuarter) quarterSpend += num(l.cost);
  }

  const activeCount = details.filter((d) => d.status === "in_progress").length;
  const unfiledInbox = inboxItems.filter((i) => !i.filedTo).length;

  // Same "over budget" definition as the Detail page's own budget bars
  // (src/app/(app)/detail/[id]/detail-page.tsx): only meaningful once an
  // estimate actually exists.
  const overBudget = details
    .map((d) => {
      const est = estimatedSpendFor(d, materialItems);
      const act = actualCost(lineItems, d.id);
      return { detail: d, est, act };
    })
    .filter((x) => x.est > 0 && x.act > x.est)
    .sort((a, b) => b.act - b.est - (a.act - a.est));

  const needsSourcing = materialItems
    .filter((m) => m.status === "need_to_source")
    .map((m) => ({ material: m, detail: details.find((d) => d.id === m.detailId) || null }))
    .filter((x): x is { material: (typeof materialItems)[number]; detail: NonNullable<typeof x.detail> } => !!x.detail);

  const upcoming = details
    .filter((d) => d.timeframeGranularity && d.status !== "done")
    .sort((a, b) => {
      const oi =
        GRAN_ORDER.indexOf(a.timeframeGranularity!) - GRAN_ORDER.indexOf(b.timeframeGranularity!);
      if (oi !== 0) return oi;
      return (a.timeframeValue || "").localeCompare(b.timeframeValue || "");
    })
    .slice(0, 6);

  return (
    <>
      <div className="ov-stats">
        <div className="ov-stat">
          <div className="ov-stat-num">{activeCount}</div>
          <div className="ov-stat-label">Active details</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{money(monthSpend)}</div>
          <div className="ov-stat-label">Spent this month</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{money(quarterSpend)}</div>
          <div className="ov-stat-label">Spent this quarter</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{unfiledInbox}</div>
          <div className="ov-stat-label">Unfiled inbox</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{overBudget.length}</div>
          <div className="ov-stat-label">Over budget</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{needsSourcing.length}</div>
          <div className="ov-stat-label">Need sourcing</div>
        </div>
      </div>

      <div className="panel-grid">
        <div className="panel-card">
          <h4>⚠️ Over budget</h4>
          {overBudget.length ? (
            overBudget.map(({ detail, est, act }) => (
              <Link
                key={detail.id}
                href={`/detail/${detail.id}`}
                className="list-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="list-item-main">
                  {detail.name}
                  <div className="list-item-sub">{detailPath(houses, rooms, detail)}</div>
                </div>
                <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {money(act)} / {money(est)}
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-note">Nothing over budget.</div>
          )}
        </div>

        <div className="panel-card">
          <h4>🧱 Materials needing sourcing</h4>
          {needsSourcing.length ? (
            needsSourcing.map(({ material, detail }) => (
              <Link
                key={material.id}
                href={`/detail/${detail.id}`}
                className="list-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="list-item-main">
                  {material.description}
                  <div className="list-item-sub">{detailPath(houses, rooms, detail)}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-note">Nothing waiting on sourcing.</div>
          )}
        </div>

        <div className="panel-card span2">
          <h4>🗓️ Coming up</h4>
          {upcoming.length ? (
            upcoming.map((d) => (
              <Link
                key={d.id}
                href={`/detail/${d.id}`}
                className="list-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="list-item-main">
                  {d.name}
                  <div className="list-item-sub">{detailPath(houses, rooms, d)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                  <span className={`status-pill status-${d.status || "not_started"}`}>
                    {STATUS_LABEL[d.status || "not_started"]}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {GRAN_LABEL[d.timeframeGranularity!]}: {d.timeframeValue || "—"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-note">Nothing scheduled yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
