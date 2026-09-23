# Club Luce favicon — 1d (Syne C, outlined)

Brown #1E1208 keyline and C on cream #FDF6EC.

- favicon.svg — vector, live text. Convert the C to outlines before shipping
  (the SVG references Syne; if it isn't loaded the glyph falls back to a sans).
- favicon-512.png / -180 / -64 / -32 / -16 — rasterised from the rendered mark,
  Syne baked in. -180 is the apple-touch icon.

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/favicon-180.png">
```
