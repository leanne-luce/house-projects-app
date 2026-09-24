// Pure helpers for a material's product link — no server/DB dependency, so
// both the server action (authoritative validation) and the client form
// (immediate feedback + retailer-name suggestion) can import this directly.

// Common home-improvement/furniture retailers where the domain doesn't
// split into a display name on its own (e.g. "homedepot" has no separator
// to guess "Home Depot" from). Anything not listed here falls back to a
// capitalized guess from the domain — always editable by hand either way.
const RETAILER_NAMES: Record<string, string> = {
  "homedepot.com": "Home Depot",
  "lowes.com": "Lowe's",
  "wayfair.com": "Wayfair",
  "amazon.com": "Amazon",
  "target.com": "Target",
  "ikea.com": "IKEA",
  "overstock.com": "Overstock",
  "potterybarn.com": "Pottery Barn",
  "westelm.com": "West Elm",
  "cb2.com": "CB2",
  "crateandbarrel.com": "Crate & Barrel",
  "houzz.com": "Houzz",
  "build.com": "Build.com",
  "ferguson.com": "Ferguson",
  "floordecor.com": "Floor & Decor",
  "menards.com": "Menards",
  "acehardware.com": "Ace Hardware",
  "etsy.com": "Etsy",
  "worldmarket.com": "World Market",
  "article.com": "Article",
  "allmodern.com": "AllModern",
  "benjaminmoore.com": "Benjamin Moore",
  "sherwin-williams.com": "Sherwin-Williams",
  "serenaandlily.com": "Serena & Lily",
  "rejuvenation.com": "Rejuvenation",
  "schoolhouse.com": "Schoolhouse",
};

// Tracking params to strip on save — prefix-matched (utm_*) plus a fixed
// list of common ad/analytics click ids that add nothing to a product page.
const TRACKING_PARAM_PREFIXES = ["utm_"];
const TRACKING_PARAM_NAMES = new Set([
  "gclid",
  "fbclid",
  "msclkid",
  "mc_eid",
  "mc_cid",
  "igshid",
  "yclid",
  "dclid",
  "twclid",
  "vero_id",
  "_hsenc",
  "_hsmi",
  "si",
  "spm",
]);

function stripWww(hostname: string): string {
  return hostname.replace(/^www\./i, "");
}

export function retailerNameFromUrl(url: string): string {
  let hostname: string;
  try {
    hostname = stripWww(new URL(url).hostname.toLowerCase());
  } catch {
    return "";
  }
  if (RETAILER_NAMES[hostname]) return RETAILER_NAMES[hostname];

  // Fallback: capitalize the second-level domain ("example.com" -> "Example").
  const secondLevel = hostname.split(".").slice(0, -1).join(".") || hostname;
  const firstLabel = secondLevel.split(".")[0];
  return firstLabel.charAt(0).toUpperCase() + firstLabel.slice(1);
}

// Validates + normalizes a pasted/typed product URL. Throws on anything
// that isn't a well-formed http/https URL — callers (client and server)
// both surface that as a user-facing error.
export function sanitizeProductUrl(input: string): string {
  const trimmed = input.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`That doesn't look like a valid URL: ${trimmed}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Product links must start with http:// or https://");
  }
  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (TRACKING_PARAM_PREFIXES.some((p) => lower.startsWith(p)) || TRACKING_PARAM_NAMES.has(lower)) {
      url.searchParams.delete(key);
    }
  }
  return url.toString();
}
