import { Archivo, Inter_Tight, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

/**
 * Archivo is loaded as a variable font with its width axis, so headlines can
 * be pushed wide (wdth 112) the way broadcast scoreboard type is. One file
 * covers every weight and width we use.
 */
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const body = Inter_Tight({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/** Every number on the page is set in this, with tabular figures, so columns
 *  of goals and clean sheets line up instead of jittering. */
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "Football Premier League — Season 1",
  description:
    "Inter-hostel football, first season. The inaugural season's player pool and auction.",
  // 64px copy of the crest: the full logo is 503KB, which is a lot to ask
  // of every page load for a 16px browser tab.
  icons: { icon: "/icon-64.png", apple: "/icon-64.png" },
  openGraph: {
    title: "Football Premier League — Season 1",
    description: "Same turf, same ball, same chance. The Season 1 auction is live.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#07090a",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
