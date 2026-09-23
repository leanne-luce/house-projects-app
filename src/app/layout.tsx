import type { Metadata } from "next";
import { DM_Sans, Fraunces, Newsreader, Syne } from "next/font/google";
import "./globals.css";

// Loaded without a fixed `weight` list, which for a variable-axis font
// gives the whole weight range from one font resource instead of separate
// files per cut — CSS just picks a weight with `font-weight`, same as any
// other font. Club Luce's three-face system: Fraunces for headings and
// figures, Newsreader for running prose, DM Sans for interface chrome
// (buttons, labels, nav, dense product rows), Syne for the wordmark alone
// (`.site-title` in globals.css), not applied globally.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Club Luce | Studio",
  description: "Personal renovation project tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${dmSans.variable} ${syne.variable}`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen) inject attributes onto <body> before React
          hydrates, which React otherwise flags as a mismatch even though
          nothing we render is actually wrong. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
