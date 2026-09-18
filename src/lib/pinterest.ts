"use server";

// Best-effort Pinterest board image extraction — Leanne explicitly chose
// this approach (over the official OAuth API, or pasting individual pin
// links) knowing the tradeoffs: no developer account or OAuth needed and it
// works today, but it's outside Pinterest's official API, is not sanctioned
// by their terms of service for automated access, and can silently break if
// Pinterest changes their page markup. If board pulling stops working
// someday, this file — specifically PIN_IMAGE_PATTERN below — is the first
// place to check.
//
// How it works: Pinterest doesn't render the pin grid itself into a public
// board page's initial HTML (that grid loads via client-side JS/XHR after
// the page loads) — but it does still embed every pin's thumbnail URL
// server-side, as CSS background-image blur-up placeholders elsewhere in
// the same HTML. We fetch that HTML with a browser-like User-Agent and
// regex out every i.pinimg.com/<size>/<hash>.<ext> URL, dedupe by hash, and
// offer the unique set as import candidates. Verified against live public
// boards while building this — one board yielded 170 unique pins this way.
//
// Sections (a board URL with a third path segment, e.g.
// /<user>/<board>/<section>/) do NOT get this treatment: confirmed by
// fetching a real section page and finding exactly one i.pinimg.com
// reference on the entire page (a shared site-wide default, not board
// content) — Pinterest loads a section's pins purely via a client-side API
// call after the page runs in a real browser, so there is nothing for a
// plain server-side fetch to see there, regardless of regex — including a
// stray shared default image that DOES appear once on every section page
// and would otherwise look like a "found" result. So a section URL is
// detected up front by its path shape and redirected straight to its
// parent board instead, with a note explaining why.

const PIN_IMAGE_PATTERN =
  /i\.pinimg\.com\/(?:236x|474x|736x|originals)\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]+)\.(jpg|jpeg|png|gif|webp)/gi;

const MAX_CANDIDATES = 200;
const FETCH_TIMEOUT_MS = 15000;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchPinsFromUrl(targetUrl: string): Promise<string[] | { fetchError: string }> {
  let html: string;
  try {
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return {
        fetchError: `Pinterest returned an error (${res.status}) — the board may be private, or the link may be wrong.`,
      };
    }
    html = await res.text();
  } catch {
    return { fetchError: "Couldn't reach Pinterest just now — try again in a moment." };
  }

  const seen = new Map<string, string>();
  for (const match of html.matchAll(PIN_IMAGE_PATTERN)) {
    const [, a, b, c, hash, ext] = match;
    if (!seen.has(hash)) {
      seen.set(hash, `https://i.pinimg.com/736x/${a}/${b}/${c}/${hash}.${ext}`);
    }
    if (seen.size >= MAX_CANDIDATES) break;
  }
  return [...seen.values()];
}

export async function previewPinterestBoard(
  boardUrl: string
): Promise<{ images: string[]; note?: string } | { error: string }> {
  let url: URL;
  try {
    url = new URL(boardUrl);
  } catch {
    return { error: "That doesn't look like a valid URL." };
  }
  if (!/(^|\.)pinterest\.[a-z.]+$/i.test(url.hostname)) {
    return { error: "That doesn't look like a Pinterest URL." };
  }

  // A section URL (/<user>/<board>/<section>/, 3+ path segments) never has
  // real pin data in its own page — confirmed empirically: a real section
  // page's HTML contains exactly one i.pinimg.com reference, and it's a
  // shared site-wide default image, not board content. Rather than fetch a
  // page we already know is empty (and risk that one stray shared image
  // masquerading as a "found" result), go straight to the parent board.
  const segments = url.pathname.split("/").filter(Boolean);
  const isSection = segments.length >= 3;
  const fetchUrl = isSection
    ? new URL("/" + segments.slice(0, 2).join("/") + "/", url.origin).toString()
    : url.toString();

  const result = await fetchPinsFromUrl(fetchUrl);
  if (!Array.isArray(result)) {
    return { error: result.fetchError };
  }
  if (!result.length) {
    return {
      error:
        "Couldn't find any pins on that page — the board may be private or empty, or Pinterest may have changed something on their end since this was built.",
    };
  }

  return {
    images: result,
    note: isSection
      ? "That link is a section within a board — sections only load their pins in-browser, so there was nothing to read directly there. These are pulled from the whole board instead; pick out just the ones that belong here."
      : undefined,
  };
}
