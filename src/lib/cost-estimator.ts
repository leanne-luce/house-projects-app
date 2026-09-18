// A free, static heuristic for the Detail page's "Estimate" button — no AI
// API call involved (this project stays on genuinely free services; see
// PLAN.md's cost model). It matches keywords in a Detail's name against
// rough national-average costs for common renovation categories and
// returns a single ballpark number, not a quote. Coverage is necessarily
// partial and the numbers are approximate midpoints of typical ranges —
// good for a starting guess to react to, not for budgeting precision.
//
// A genuinely "smart" version of this (tuned to the specific house, market,
// and finish level) would need either a real pricing API or an LLM call,
// both of which cost money per use — a deliberate scope line, not an
// oversight.

const HEURISTICS: { keywords: string[]; amount: number }[] = [
  { keywords: ["kitchen remodel", "kitchen renovation", "full kitchen"], amount: 25000 },
  { keywords: ["kitchen cabinet", "cabinet refacing", "cabinets"], amount: 6000 },
  { keywords: ["backsplash"], amount: 800 },
  { keywords: ["countertop"], amount: 3500 },
  { keywords: ["bathroom remodel", "bathroom renovation", "full bathroom"], amount: 12000 },
  { keywords: ["shower"], amount: 5000 },
  { keywords: ["vanity"], amount: 1200 },
  { keywords: ["toilet"], amount: 400 },
  { keywords: ["tile"], amount: 1500 },
  { keywords: ["hardwood"], amount: 6000 },
  { keywords: ["carpet"], amount: 2000 },
  { keywords: ["floor"], amount: 4000 },
  { keywords: ["exterior paint", "paint exterior", "house paint", "siding paint"], amount: 4000 },
  { keywords: ["paint"], amount: 500 },
  { keywords: ["roof"], amount: 10000 },
  { keywords: ["window"], amount: 500 },
  { keywords: ["door"], amount: 400 },
  { keywords: ["fence"], amount: 3500 },
  { keywords: ["deck"], amount: 8000 },
  { keywords: ["patio"], amount: 5000 },
  { keywords: ["landscap"], amount: 5000 },
  { keywords: ["driveway"], amount: 5000 },
  { keywords: ["siding"], amount: 12000 },
  { keywords: ["hvac", "furnace", "air condition"], amount: 6000 },
  { keywords: ["water heater"], amount: 1800 },
  { keywords: ["rewir", "electrical"], amount: 4000 },
  { keywords: ["plumbing"], amount: 3000 },
  { keywords: ["closet"], amount: 2000 },
  { keywords: ["shutter"], amount: 1200 },
  { keywords: ["gutter"], amount: 1500 },
  { keywords: ["garage door"], amount: 1200 },
  { keywords: ["shed"], amount: 3000 },
  { keywords: ["pool"], amount: 45000 },
  { keywords: ["sconce", "light fixture", "lighting"], amount: 300 },
  { keywords: ["chandelier"], amount: 800 },
  { keywords: ["nightstand", "headboard", "bookcase", "furniture"], amount: 300 },
];

export function estimateCost(name: string): number | null {
  const n = name.toLowerCase();
  let best: { amount: number; matchLength: number } | null = null;
  for (const { keywords, amount } of HEURISTICS) {
    for (const kw of keywords) {
      if (n.includes(kw) && (!best || kw.length > best.matchLength)) {
        best = { amount, matchLength: kw.length };
      }
    }
  }
  return best ? best.amount : null;
}
