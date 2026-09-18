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
// offer the unique set as import candidates. Verified against a live public
// board while building this (32 unique pins extracted, spot-checked that
// the URLs resolve to real images).

const PIN_IMAGE_PATTERN =
  /i\.pinimg\.com\/(?:236x|474x|736x|originals)\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]+)\.(jpg|jpeg|png|gif|webp)/gi;

const MAX_CANDIDATES = 60;
const FETCH_TIMEOUT_MS = 15000;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function previewPinterestBoard(
  boardUrl: string
): Promise<{ images: string[] } | { error: string }> {
  let url: URL;
  try {
    url = new URL(boardUrl);
  } catch {
    return { error: "That doesn't look like a valid URL." };
  }
  if (!/(^|\.)pinterest\.[a-z.]+$/i.test(url.hostname)) {
    return { error: "That doesn't look like a Pinterest URL." };
  }

  let html: string;
  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return {
        error: `Pinterest returned an error (${res.status}) — the board may be private, or the link may be wrong.`,
      };
    }
    html = await res.text();
  } catch {
    return { error: "Couldn't reach Pinterest just now — try again in a moment." };
  }

  const seen = new Map<string, string>();
  for (const match of html.matchAll(PIN_IMAGE_PATTERN)) {
    const [, a, b, c, hash, ext] = match;
    if (!seen.has(hash)) {
      seen.set(hash, `https://i.pinimg.com/736x/${a}/${b}/${c}/${hash}.${ext}`);
    }
    if (seen.size >= MAX_CANDIDATES) break;
  }

  if (!seen.size) {
    return {
      error:
        "Couldn't find any pins on that page — the board may be private or empty, or Pinterest may have changed something on their end since this was built.",
    };
  }

  return { images: [...seen.values()] };
}
