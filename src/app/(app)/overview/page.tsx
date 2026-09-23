import Link from "next/link";
import { getOverviewData } from "@/lib/queries";
import { actualCost, estimatedSpendFor, hasRealBudget, nonFurniture, furnitureRollup, roomPath } from "@/lib/derived";
import { money, num, fmtTimeframe } from "@/lib/format";
import { HouseSwitcher } from "@/components/house-switcher";

export const dynamic = "force-dynamic";

const GRAN_ORDER = ["day", "week", "month", "quarter", "year"];
const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold",
};

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ house?: string }>;
}) {
  const { houses, rooms: allRooms, details: allDetails, materialItems, lineItems } = await getOverviewData();

  if (!houses.length) {
    return (
      <div className="empty-state">
        Add a house first — Overview shows spend, budget, and sourcing per house.
      </div>
    );
  }

  const { house: houseParam } = await searchParams;
  const activeHouseId = houses.some((h) => h.id === houseParam) ? houseParam! : houses[0].id;
  const activeHouse = houses.find((h) => h.id === activeHouseId)!;
  const rooms = allRooms.filter((r) => r.houseId === activeHouseId);
  const details = nonFurniture(allDetails.filter((d) => d.houseId === activeHouseId));
  const furniture = furnitureRollup(allDetails, materialItems, lineItems, activeHouseId);

  const switcher = <HouseSwitcher houses={houses} activeHouseId={activeHouseId} basePath="/overview" />;

  if (!details.length) {
    return (
      <>
        {switcher}
        <div className="empty-state">
          No details in {activeHouse.name} yet — add a few to see spend, budget, and sourcing at a glance.
        </div>
      </>
    );
  }

  const activeCount = details.filter((d) => d.status === "in_progress").length;

  let totalSpent = 0;
  let totalProjected = 0;
  let overBudgetTotal = 0;
  let remainingTotal = 0;
  const overBudget: { detail: (typeof details)[number]; est: number; act: number }[] = [];
  for (const d of details) {
    const act = actualCost(lineItems, d.id);
    const est = estimatedSpendFor(d, materialItems, act);
    totalSpent += act;
    totalProjected += est;
    if (hasRealBudget(d, materialItems)) {
      if (act > est) {
        overBudgetTotal += act - est;
        overBudget.push({ detail: d, est, act });
      } else {
        remainingTotal += est - act;
      }
    }
  }
  overBudget.sort((a, b) => b.act - b.est - (a.act - a.est));

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

  const purchasePrice = num(activeHouse.purchasePrice);
  const downPayment = num(activeHouse.downPayment);

  return (
    <>
      {switcher}
      <div className="ov-stats">
        <div className="ov-stat">
          <div className="ov-stat-num">{activeCount}</div>
          <div className="ov-stat-label">Active details</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{money(totalSpent)}</div>
          <div className="ov-stat-label">Total spent</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{money(totalProjected)}</div>
          <div className="ov-stat-label">Total projected</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num" style={{ color: overBudgetTotal ? "var(--danger)" : undefined }}>
            {money(overBudgetTotal)}
          </div>
          <div className="ov-stat-label">Over budget</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{money(remainingTotal)}</div>
          <div className="ov-stat-label">Left to spend (budgeted)</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{needsSourcing.length}</div>
          <div className="ov-stat-label">Need sourcing</div>
        </div>
        <div className="ov-stat">
          <div className="ov-stat-num">{money(furniture.actual)}</div>
          <div className="ov-stat-label">Furniture spend</div>
        </div>
      </div>

      {purchasePrice || downPayment ? (
        <div className="panel-card" style={{ marginBottom: "1rem" }}>
          <h4>All-in value — {activeHouse.name}</h4>
          <div className="totals-strip">
            {purchasePrice ? (
              <div className="tot">
                Purchase price
                <b>{money(purchasePrice)}</b>
              </div>
            ) : null}
            <div className="tot">
              + Spent on projects
              <b>{money(totalSpent)}</b>
            </div>
            {purchasePrice ? (
              <>
                <div className="tot">
                  All-in so far
                  <b style={{ color: "var(--accent-strong)" }}>
                    {money(purchasePrice + totalSpent)}
                  </b>
                </div>
                <div className="tot">
                  All-in if fully spent as planned
                  <b style={{ color: "var(--accent-strong)" }}>
                    {money(purchasePrice + totalProjected)}
                  </b>
                </div>
              </>
            ) : null}
            {downPayment ? (
              <>
                <div className="tot">
                  Down payment
                  <b>{money(downPayment)}</b>
                </div>
                <div className="tot">
                  Cash in so far
                  <b style={{ color: "var(--accent-strong)" }}>
                    {money(downPayment + totalSpent)}
                  </b>
                </div>
                <div className="tot">
                  Cash in if fully spent as planned
                  <b style={{ color: "var(--accent-strong)" }}>
                    {money(downPayment + totalProjected)}
                  </b>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="panel-grid">
        <div className="panel-card">
          <h4>Over budget</h4>
          {overBudget.length ? (
            overBudget.map(({ detail, est, act }) => (
              <Link
                key={detail.id}
                href={`/detail/${detail.id}`}
                className="list-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="list-item-main">{roomPath(rooms, detail)}</div>
                <div style={{ fontFamily: "var(--font-sans)", color: "var(--danger)", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {money(act)} / {money(est)}
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-note">Nothing over budget.</div>
          )}
        </div>

        <div className="panel-card">
          <h4>Materials needing sourcing</h4>
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
                  <div className="list-item-sub">{roomPath(rooms, detail)}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="empty-note">Nothing waiting on sourcing.</div>
          )}
        </div>

        <div className="panel-card span2">
          <h4>Coming up</h4>
          {upcoming.length ? (
            upcoming.map((d) => (
              <Link
                key={d.id}
                href={`/detail/${d.id}`}
                className="list-item"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="list-item-main">{roomPath(rooms, d)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                  <span className={`status-pill status-${d.status || "not_started"}`}>
                    {STATUS_LABEL[d.status || "not_started"]}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {fmtTimeframe(d.timeframeGranularity, d.timeframeValue)}
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
