repo: leanne-luce/club-luce
branch: main

## Last sync

date: 2026-09-19T12:57:00Z

### Updated in this project

- Rebuilt every token on the clubluce.com palette, type and shape system — cream/sand grounds, brass and terracotta, Fraunces + DM Sans + Syne, square corners, no shadows.
- Added eight brand components (Eyebrow, SectionHeading, TextLink, PlanCard, PullQuote, SandBlock, SiteNav, SiteFooter) and a marketing-site UI kit covering Home, Plans and About.
- Imported four real product photographs into `assets/photos/`.
- Reconciled Club Luce | Studio to the brand and documented the recommended app changes in `readme.md`.

## Screen map

| Screen | Repo files |
| --- | --- |
| `ui_kits/site/HomePage.jsx` | club-luce `index.html` |
| `ui_kits/site/PlansPage.jsx` | club-luce `plans.html`, `index.html` |
| `ui_kits/site/AboutPage.jsx` | club-luce `about.html` |
| `components/brand/*` | club-luce `index.html`, `about.html` (inline `<style>`) |
| `tokens/*` | club-luce `index.html` `:root`; house-projects-app `src/app/globals.css` |
| `ui_kits/studio/LoginScreen.jsx` | house-projects-app `src/app/login/login-form.tsx` |
| `ui_kits/studio/AppShell.jsx` | house-projects-app `src/app/(app)/layout.tsx`, `tab-nav.tsx` |
| `ui_kits/studio/HousesScreen.jsx` | house-projects-app `src/app/(app)/houses/house-tree.tsx` |
| `ui_kits/studio/InboxScreen.jsx` | house-projects-app `src/app/(app)/inbox/inbox-list.tsx` |
| `ui_kits/studio/ProjectsScreen.jsx` | house-projects-app `src/app/(app)/horizon/page.tsx` |
| `ui_kits/studio/ReceiptsScreen.jsx` | house-projects-app `src/app/(app)/receipts/receipts-list.tsx` |
| `ui_kits/studio/LookbookScreen.jsx` | house-projects-app `src/app/(app)/lookbook/page.tsx` |
| `ui_kits/studio/OverviewScreen.jsx` | house-projects-app `src/app/(app)/overview/page.tsx` |
| `ui_kits/studio/DetailScreen.jsx` | house-projects-app `src/app/(app)/detail/[id]/detail-page.tsx` |

## Sync history

- 2026-09-19 — initial build from `leanne-luce/house-projects-app` (Studio app only, before the brand site was known).
