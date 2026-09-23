import { getHousesTreeData } from "@/lib/queries";
import { detailPath } from "@/lib/derived";
import { fmtTimeframe, monthKeyFromWeek } from "@/lib/format";
import Link from "next/link";
import type { details as detailsTable } from "@/db/schema";

export const dynamic = "force-dynamic";

type Detail = typeof detailsTable.$inferSelect;

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
// attention right now); on_hold/not_started come after.
const STATUS_SORT: Record<string, number> = { in_progress: 0, not_started: 1, on_hold: 1, done: 2 };

function groupByTimeframe(details: Detail[]) {
  const buckets = new Map<string, { gran: string; value: string; items: Detail[] }>();
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
  return keys.map((k) => {
    const b = buckets.get(k)!;
    const label = b.gran
      ? fmtTimeframe(b.gran, b.value) || `${GRAN_LABEL[b.gran]}: ${b.value || "—"}`
      : "Someday / unscheduled";
    const items = [...b.items].sort((x, y) => {
      const si = (STATUS_SORT[x.status || "not_started"] ?? 1) - (STATUS_SORT[y.status || "not_started"] ?? 1);
      if (si !== 0) return si;
      return x.name.localeCompare(y.name);
    });
    return { key: k, label, items };
  });
}

function DetailRow({ detail, houses, rooms }: { detail: Detail; houses: Parameters<typeof detailPath>[0]; rooms: Parameters<typeof detailPath>[1] }) {
  return (
    <Link href={`/detail/${detail.id}`} className="list-item clickable" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="list-item-main">
        <div className="list-item-title">{detail.name}</div>
        <div className="list-item-meta">{detailPath(houses, rooms, detail)}</div>
      </div>
      <div className="list-item-trailing">
        <span className={`status-pill status-${detail.status || "not_started"}`}>
          {STATUS_LABEL[detail.status || "not_started"]}
        </span>
      </div>
    </Link>
  );
}

export default async function HorizonPage() {
  const { details, houses, rooms } = await getHousesTreeData();

  if (!details.length) {
    return (
      <div className="empty-state">
        Nothing scheduled yet — timeframes you set on a detail will show up here, grouped from soonest to
        someday.
      </div>
    );
  }

  // Done projects are a settled record, not something to act on — pulling
  // them into one collapsed section (instead of leaving them scattered
  // across every date group) keeps what's actually in progress above the
  // fold.
  const active = details.filter((d) => d.status !== "done");
  const done = details.filter((d) => d.status === "done");
  const activeGroups = groupByTimeframe(active);
  const doneGroups = groupByTimeframe(done);

  return (
    <>
      {activeGroups.length ? (
        activeGroups.map((g) => (
          <div className="horizon-group" key={g.key}>
            <h3>{g.label}</h3>
            {g.items.map((d) => (
              <DetailRow key={d.id} detail={d} houses={houses} rooms={rooms} />
            ))}
          </div>
        ))
      ) : (
        <div className="empty-note">Nothing active — everything scheduled is done.</div>
      )}

      {done.length ? (
        <details className="horizon-done">
          <summary>Done ({done.length})</summary>
          {doneGroups.map((g) => (
            <div className="horizon-group" key={g.key}>
              <h3>{g.label}</h3>
              {g.items.map((d) => (
                <DetailRow key={d.id} detail={d} houses={houses} rooms={rooms} />
              ))}
            </div>
          ))}
        </details>
      ) : null}
    </>
  );
}
