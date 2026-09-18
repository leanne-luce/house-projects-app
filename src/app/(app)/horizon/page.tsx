import { getHousesTreeData } from "@/lib/queries";
import { detailPath } from "@/lib/derived";
import { fmtTimeframe, monthKeyFromWeek } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

const GRAN_LABEL: Record<string, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};
const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
  on_hold: "On hold",
};
const ORDER = ["day", "week", "month", "quarter", "year", ""];
// In progress work floats to the top of each group (it's what needs
// attention right now); done sinks to the bottom (it's just a record at
// this point).
const STATUS_SORT: Record<string, number> = { in_progress: 0, not_started: 1, on_hold: 1, done: 2 };

export default async function HorizonPage() {
  const { details, houses, rooms } = await getHousesTreeData();

  if (!details.length) {
    return (
      <div className="empty-state">
        <div className="big-emoji">🗓️</div>
        Nothing scheduled yet — timeframes you set on a detail will show up here, grouped from soonest to
        someday.
      </div>
    );
  }

  const buckets = new Map<string, { gran: string; value: string; items: typeof details }>();
  for (const d of details) {
    let gran = d.timeframeGranularity || "";
    let value = gran ? d.timeframeValue || "" : "";
    // Week now displays as just its containing month ("Sep '26" — see
    // fmtTimeframe), so a week-granularity item folds into the same group
    // as month-granularity items in that month, rather than getting its
    // own identically-labeled group elsewhere in the sort order.
    if (gran === "week" && value) {
      const monthKey = monthKeyFromWeek(value);
      if (monthKey) {
        gran = "month";
        value = monthKey;
      }
    }
    const key = gran + "||" + value;
    if (!buckets.has(key)) buckets.set(key, { gran, value, items: [] });
    buckets.get(key)!.items.push(d);
  }
  const keys = [...buckets.keys()].sort((a, b) => {
    const A = buckets.get(a)!;
    const B = buckets.get(b)!;
    const oi = ORDER.indexOf(A.gran) - ORDER.indexOf(B.gran);
    if (oi !== 0) return oi;
    return A.value.localeCompare(B.value);
  });

  return (
    <>
      {keys.map((k) => {
        const b = buckets.get(k)!;
        const label = b.gran
          ? fmtTimeframe(b.gran, b.value) || `${GRAN_LABEL[b.gran]}: ${b.value || "—"}`
          : "Someday / unscheduled";
        const items = [...b.items].sort((x, y) => {
          const si =
            (STATUS_SORT[x.status || "not_started"] ?? 1) - (STATUS_SORT[y.status || "not_started"] ?? 1);
          if (si !== 0) return si;
          return x.name.localeCompare(y.name);
        });
        return (
          <div className="horizon-group" key={k}>
            <h3>{label}</h3>
            {items.map((d) => (
              <Link href={`/detail/${d.id}`} key={d.id} className="horizon-item" style={{ textDecoration: "none", color: "inherit" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{d.name}</div>
                  <div className="breadcrumb">{detailPath(houses, rooms, d)}</div>
                </div>
                <span className={`status-pill status-${d.status || "not_started"}`}>
                  {STATUS_LABEL[d.status || "not_started"]}
                </span>
              </Link>
            ))}
          </div>
        );
      })}
    </>
  );
}
