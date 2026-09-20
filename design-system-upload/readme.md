# Club Luce — design system

Club Luce is Leanne Luce's umbrella brand for the things she makes: downloadable plans for
furniture, soft furnishings and small objects, plus the software she builds to keep her own house
projects straight. The through-line is a warm, unhurried, made-by-hand sensibility — cream paper,
terracotta and brass, a high-contrast serif, square corners, and no ornament anywhere.

Two surfaces exist today:

- **clubluce.com** — the marketing site and plan catalogue. This is the brand's canonical
  expression and the source of truth for every value in this system.
- **Club Luce | Studio** — a personal renovation and DIY project tracker (houses → rooms →
  details) with quick capture, a horizon view, budgets, receipt OCR, a mood board and a
  before/after lookbook.

## Sources this system was built from

| Source | URL | What was taken |
| --- | --- | --- |
| `leanne-luce/club-luce` | https://github.com/leanne-luce/club-luce | **Primary.** Palette, typography, shape, motion, layout rhythm, and the marketing UI kit. Read `index.html` and `about.html` — the whole design lives in their inline `<style>` blocks. |
| `leanne-luce/house-projects-app` | https://github.com/leanne-luce/house-projects-app | Product structure, screen layouts and the Studio UI kit. `src/app/globals.css` and the pages under `src/app/(app)/`. |

Both repos are worth exploring directly before building new Club Luce surfaces — they define
behaviour this system only summarises. No Figma file, slide template or written brand guide exists.

### Reconciling the two

The site and the app were designed separately and did not match. This system resolves that in the
site's favour, because the site is the brand:

| | Site (kept) | App (was) |
| --- | --- | --- |
| Ground | parchment `#FBF8F3` | `#FBF8F3` |
| Accent | brass `#9D8B5E` + terracotta `#B85540` | brass `#9D8B5E` |
| Headings | Fraunces 400 | Newsreader 700/800 |
| Body | Newsreader 400, 1.0625rem/1.75 | Newsreader 300, 0.85–0.9rem |
| Corners | square | 14px / 9px |
| Shadow | none | soft double shadow |
| Icons | none | emoji |

**Recommended changes to Club Luce | Studio**, all reflected in `ui_kits/studio/`:

1. Adopt the site palette. Status colours are re-cut in the same warm range (`--good` olive,
   `--warn` brass, `--danger` terracotta) so they belong to the brand rather than sitting beside it.
2. Keep the serif for prose but set it at weight **400**, not 300, and at 1.0625rem/1.75; move
   buttons, labels and nav to DM Sans; set detail names, house names and figures in Fraunces 400.
   This is the single biggest readability gain — 0.85rem at weight 300 was the real problem.
3. Drop `border-radius` and `box-shadow` to 0/none. Panels separate with sand fills and hairlines.
4. Replace the emoji section glyphs with the site's uppercase eyebrow labels. Emoji were the app's
   iconography by default rather than by decision, and they read as a different product to the site.
5. Keep the pill tab track and status pills — they're the one place a curve is correct.

## What's here

| Path | What it is |
| --- | --- |
| `styles.css` | The one file consumers link. `@import`s only. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `base.css` |
| `components/` | React primitives — `brand` / `core` / `forms` / `navigation` / `data` / `overlays` |
| `guidelines/` | Foundation specimen cards |
| `ui_kits/site/` | clubluce.com — home, plans, about |
| `ui_kits/studio/` | Club Luce | Studio — all six tabs, login, detail |
| `assets/photos/` | Four real product photographs imported from the site repo |
| `SKILL.md`, `github.md` | Agent-skill wrapper; source-repo association |

### Components

**brand** — `Eyebrow`, `SectionHeading`, `TextLink`, `PlanCard`, `PullQuote`, `SandBlock`, `SiteNav`, `SiteFooter`
**core** — `Button`, `Card`, `StatusPill`, `BadgeCount`, `EmptyState`, `Toast`, `Fab`
**forms** — `Field`, `TextInput`, `Textarea`, `Select`, `ChecklistItem`
**navigation** — `TabNav`, `HouseTabs`
**data** — `SectionTitle`, `PanelCard`, `StatCard`, `ListItem`, `TotalsStrip`, `BudgetBar`, `ProgressBar`
**overlays** — `Modal`

Every one has a counterpart in one of the two repos. **Intentional additions:** none.

---

## Content fundamentals

One person, talking plainly about work they did themselves. Warm, specific, a little dry, never
promotional.

- **First person for the brand, second person for the product.** The site says "I make things —
  furniture, soft furnishings, small objects — and I write down how I did it." Studio says
  "Whatever you capture on the fly lands here until you're ready to file it."
- **Sentence case everywhere.** The only uppercase is the eyebrow label, which is a typographic
  device, not a heading.
- **Headlines break across two lines with the second in italic terracotta:** "Plans for building /
  *a life you love.*" · "Making things is worth *doing well.*" That construction is the brand's
  signature and should be used sparingly — once per page, in the hero.
- **Em dashes carry the qualifier.** "Designed for real homes — not showrooms." "Not perfect
  things — things that are well-considered."
- **Concrete nouns, honest claims.** Solid timber over MDF. Linen over polyester. A cut list, a
  materials list with rough costs. Prices are named, not implied: "a one-time purchase, no
  subscription."
- **Domestic vocabulary in the product**: houses, rooms, details, the inbox, the lookbook, the
  horizon. Never tasks, tickets or workspaces. "Someday" is a legitimate timeframe.
- **Empty states explain, never scold**: "Nothing over budget." "Nothing waiting on sourcing."
- **No emoji.** The site uses none, and the app should stop.

Avoid: exclamation marks, "Let's", "Awesome", gerund headings, superlatives, and any copy that
congratulates the reader for showing up.

---

## Visual foundations

**The idea.** Warm paper and daylight. A room in the afternoon with the work half-finished on the
table. Nothing glossy, nothing floating.

**Colour.** Cream `#FDF6EC` ground, sand `#F0E2C8` for tinted blocks and rules, white only for
product cards. Ink runs brown `#1E1208` → brown-mid `#7A5230` (all body copy) → brown-light
`#A67C55` (labels, meta). Two saturated colours: **brass** `#9D8B5E` marks (eyebrows, rules,
bullets) and **terracotta** `#B85540` acts (links, italic emphasis, primary buttons). Body copy at
brown-mid on cream is 6.4:1 — the palette is genuinely readable, which is why it replaced the app's.

**Type.** Three roles, three faces. **Fraunces** 400 for every heading, tracked −0.02em, with italic set in
terracotta for emphasis. **Newsreader** 400 for all running prose at 1.0625rem/1.75 (1.8 in long
passages) — a text serif set solidly rather than a sans set light, which is what makes it read
easily. **DM Sans** is the interface face: buttons, inputs, eyebrows, nav, pills, and every dense product row — list items, table cells, metadata, anything under ~1rem inside an app screen. Marketing card copy counts as prose and stays in Newsreader. **Syne** 700
for the wordmark and nothing else. Wide-tracked uppercase (+0.12em eyebrows, +0.06em nav) is the second
voice and appears above almost every heading.

**Spacing.** Generous: 7rem between sections, 3.25rem from a section heading to its content, a
1160px container with 2.5rem gutters, prose capped at 580px. The app runs tighter inside a 62rem
shell but draws from the same scale.

**Shape.** **No radius and no shadow anywhere.** Surfaces separate by fill, hairline rule, or empty
space. Borders are 1px sand for dividers, 1.5px brown for buttons, 1.5px dashed brown-light for
placeholders, 2px brass for a pull quote. The only curve in the system is a status pill, which is a
pill by definition.

**Backgrounds.** Flat parchment, or a full-bleed band of sand. No texture, no pattern, and — apart from
the two legacy plan-card fallback gradients — no gradients.

**Photography.** Real, warm, daylit, uncorrected: finished pieces in the rooms they live in.
Square edges, no border, no overlay, never tinted or duotoned. 4:3 in the catalogue grid, full-bleed
in a hero. Four real photographs are in `assets/photos/`.

**Animation.** Slow and optical. A card's image scales to 1.04 over 0.55s on hover; a button
inverts over 0.25s; link and title colours shift over 0.2s. Nothing bounces, nothing springs,
nothing animates on entry.

**Hover.** The outline button inverts to solid brown — the brand's one piece of interactive theatre.
Plan-card titles turn terracotta and their images creep. Nav links turn terracotta. Text links fade
to 70% rather than underlining.

**Press.** None. There is no press state anywhere in either surface.

**Focus.** A 1.5px terracotta outline on inputs.

**Transparency and blur.** No blur. Transparency appears twice: the modal scrim
`rgba(30,18,8,0.45)` and badges floating over a photo `rgba(30,18,8,0.62)`.

**Fixed elements.** A sticky cream nav with a hairline sand underline (no blur, no shadow); in the
app, a square terracotta quick-capture button bottom-right and a toast above it.

**Dark mode.** Studio only, and re-cut from the brand palette rather than inverted. The site has none.

---

## Iconography

**There is no icon set, and that is deliberate.** Neither repo contains an icon font, sprite sheet
or icon library. The site uses exactly one piece of vector art — the Pinterest glyph in its nav,
an inline 24×24 brand mark from Pinterest itself — and otherwise relies on typography.

- **Unicode carries every affordance the site needs**: `→` forward navigation ("View all →",
  "View plan →"), `—` as an brass list bullet, `·` as a separator in the hero eyebrow, `☰` for
  the mobile menu.
- **The app currently uses emoji** (🏡 📥 🗓️ 🧾 📷 📊 🧱 ✨ ⚠️ 📝) as section markers plus `▸ ✕ ✓ +`
  for chrome. **This system recommends removing them**, replacing each with the site's uppercase
  eyebrow label — see "Recommended changes to Studio" above. The `ui_kits/studio/` recreation shows
  the app with emoji removed.
- **Do not substitute an icon library.** Lucide, Heroicons, Feather — all would read as a different
  product. If a drawn icon set is ever needed, it is a brand decision to make deliberately.
- **No logo file exists.** Wherever a mark would go, set "Club Luce" in Syne 700 at −0.01em.

---

## Known gaps

- **Fonts load from Google Fonts.** Fraunces, DM Sans, Syne and Newsreader are all Google-hosted in
  both repos; no binaries exist to ship. These are the real brand fonts, not substitutions.
- **The site's hero photograph** (`img/Living-Room-photo.png`) was too large to import. The site
  kit substitutes `long-low-shelves-wide-view.png` — swap it back when you can.
- **No logo, no illustration, no icon set** exists in either source.
- **`plans.html` was not read in full** — the Plans page in the site kit reuses the home page's
  card grid and the About page's hero pattern, which is how the live page is built, but its exact
  copy is invented.
