# UI kit — clubluce.com

Recreation of the Club Luce marketing site, built from `leanne-luce/club-luce` (`index.html`,
`about.html`, `plans.html`) — the same inline CSS the live site serves.

| Screen | File | Source |
| --- | --- | --- |
| Home — hero, featured plans, signup | `HomePage.jsx` | `index.html` |
| Plans index | `PlansPage.jsx` | `plans.html`, `index.html` grid |
| About — prose, pull quote, sticky sidebar | `AboutPage.jsx` | `about.html` |
| Nav / footer | `window.SiteNav`, `window.SiteFooter` | `.nav`, `.footer` |

**Image substitution:** the site's hero photo (`img/Living-Room-photo.png`) was too large to import,
so the hero uses `assets/photos/long-low-shelves-wide-view.png` instead. Swap it back when the real
file is available. The two plan cards without photography fall back to the site's own timber gradient,
exactly as the live site does.

The click-through nav (Plans / About) works; Shop and Pinterest are inert, as on the live site.
