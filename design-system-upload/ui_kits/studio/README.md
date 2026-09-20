# UI kit — Club Luce | Studio

A click-through recreation of the Studio app (`leanne-luce/house-projects-app`), built from its real
source: `src/app/globals.css` for every value, and the page components under `src/app/(app)/` for layout.

Open `index.html`. It starts on the passphrase login, then gives you the whole app shell:

| Screen | File | Source |
| --- | --- | --- |
| Login | `LoginScreen.jsx` | `src/app/login/login-form.tsx` |
| Houses (tree of houses → rooms → details) | `HousesScreen.jsx` | `src/app/(app)/houses/house-tree.tsx`, `.house-card`/`.room-card` CSS |
| Inbox (quick capture + file) | `InboxScreen.jsx` | `src/app/(app)/inbox/inbox-list.tsx` |
| Projects (horizon, grouped by timeframe) | `ProjectsScreen.jsx` | `src/app/(app)/horizon/page.tsx` |
| Receipts | `ReceiptsScreen.jsx` | `src/app/(app)/receipts/receipts-list.tsx`, `.receipt-card-*` CSS |
| Lookbook | `LookbookScreen.jsx` | `src/app/(app)/lookbook/page.tsx` |
| Overview | `OverviewScreen.jsx` | `src/app/(app)/overview/page.tsx` |
| Detail page | `DetailScreen.jsx` | `src/app/(app)/detail/[id]/detail-page.tsx`, `.db-*` CSS |
| Shell + tab nav + FAB | `AppShell.jsx` | `src/app/(app)/layout.tsx`, `tab-nav.tsx` |

Sample content lives in `data.js` and is invented; it is not real project data.

**Imagery is deliberately blank.** The source repo stores all photos in Vercel Blob, so no photography
ships with it. Every photo slot renders as a labelled placeholder rather than a stand-in image.
