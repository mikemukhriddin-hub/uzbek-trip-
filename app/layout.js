import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Samarqand CrafTour - Custom Tour Constructor & Trip Planner",
  description: "Samarqand bo'ylab shaxsiy sayohatingizni yarating. Спланируйте свое путешествие в Самарканд. Build your own personalized travel adventure in Samarkand.",
  keywords: "Samarkand, tour builder, Uzbekistan travel, customize tour, Samarkand guide, Samarkand driver, Samarkand bread, Urgut mountains, Samarqand sayohat, Самарканд гид, самаркандский плов",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
