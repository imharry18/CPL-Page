import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Campus Premier League | Season 4",
  description:
    "The largest inter-college cricket league — champions, stats, and Season 4 registration.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Campus Premier League",
    description: "Where campus meets cricket. Season 4 coming 2026.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.7);
            --text-muted: rgba(255, 255, 255, 0.45);
            --accent-gold: #d4af37;
            --accent-gold-light: #f3e5ab;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { background-color: transparent; }
          body {
            font-family: var(--font-primary), 'Inter', sans-serif;
            background: transparent;
            color: var(--text-primary);
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
          }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 4px; }
          .reveal { opacity: 1; transform: translateY(0); }
          @keyframes reveal-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes orb-float {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(30px, -20px) scale(1.05); }
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
