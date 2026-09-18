import type { Metadata } from "next";
import { Newsreader, Syne } from "next/font/google";
import "./globals.css";

// Loaded without a fixed `weight` list, which for a variable-axis font
// (both of these support it) gives the whole weight range from one font
// resource instead of separate files per cut — CSS just picks a weight
// with `font-weight`, same as any other font. Newsreader is the site-wide
// body font (light, per request); Syne is scoped to the site title only
// (`.site-title` in globals.css), not applied globally.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
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
    <html lang="en" className={`${newsreader.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  );
}
