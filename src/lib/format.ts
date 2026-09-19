// Formatting helpers, adapted from the prototype's money()/fmtDate() — money()
// now always rounds to the nearest whole dollar (no cents), on request.

export function num(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

export function money(n: unknown): string {
  const v = num(n);
  return "$" + Math.round(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// A short "$X over" / "$X left" label for a planned-vs-actual rollup —
// null when there's nothing real to compare against (see
// derived.ts's hasRealBudget/estimatedSpendFor).
export function budgetDeltaLabel(actual: number, planned: number): { text: string; over: boolean } | null {
  const diff = actual - planned;
  // Rounded to match money()'s display — a sub-dollar difference would
  // otherwise render as a misleading "$0 over"/"$0 left".
  if (Math.round(Math.abs(diff)) === 0) return null;
  return diff > 0 ? { text: `${money(diff)} over`, over: true } : { text: `${money(-diff)} left`, over: false };
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ISO week ("2026-W38") -> the Date of that week's Thursday (ISO 8601: a
// week belongs to whichever year/month contains its Thursday), used below
// to fold "week" granularity down to just its containing month.
export function isoWeekToDate(value: string): Date | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7 + 3); // that week's Thursday
  return target;
}

// "2026-W38" -> "2026-09" (that week's containing month) — used to fold a
// week-granularity item into the same Horizon group as month-granularity
// items in the same month, since both now display identically ("Sep '26").
export function monthKeyFromWeek(value: string): string | null {
  const date = isoWeekToDate(value);
  if (!date) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Concise display for a Detail's timeframe, e.g. "Sept '26" for a month,
// folding "week" down to just its containing month (a specific week number
// isn't meaningful at a glance) and leaving "year" as a bare year. All
// parsing/formatting uses UTC getters throughout — the stored values are
// plain date strings with no time zone, and `new Date("2026-09-01")`
// parses as UTC midnight, so mixing in local-time getters would shift the
// displayed month/day by one for anyone west of UTC.
export function fmtTimeframe(granularity: string | null | undefined, value: string | null | undefined): string {
  if (!granularity || !value) return "";
  if (granularity === "year") return value;
  if (granularity === "quarter") {
    const m = /^(\d{4})-?Q([1-4])$/i.exec(value.trim());
    return m ? `Q${m[2]} '${m[1].slice(2)}` : value;
  }
  if (granularity === "week") {
    const date = isoWeekToDate(value);
    if (!date) return value;
    return `${MONTH_ABBR[date.getUTCMonth()]} '${String(date.getUTCFullYear()).slice(2)}`;
  }
  if (granularity === "month") {
    if (!/^\d{4}-\d{2}$/.test(value)) return value;
    const date = new Date(`${value}-01T00:00:00Z`);
    return `${MONTH_ABBR[date.getUTCMonth()]} '${String(date.getUTCFullYear()).slice(2)}`;
  }
  if (granularity === "day") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(`${value}T00:00:00Z`);
    return `${MONTH_ABBR[date.getUTCMonth()]} ${date.getUTCDate()} '${String(date.getUTCFullYear()).slice(2)}`;
  }
  return value;
}

export function fmtDate(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(iso);
  }
}
