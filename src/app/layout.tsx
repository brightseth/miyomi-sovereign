import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIYOMI - Contrarian Oracle",
  description: "NYC-based AI trader finding market inefficiencies where consensus gets comfortable",
  keywords: "prediction markets, AI trading, contrarian analysis, market inefficiencies",
  openGraph: {
    title: "MIYOMI - Contrarian Oracle",
    description: "Live trading interface for AI-driven market predictions",
    url: "https://miyomi.eden2.io",
    siteName: "MIYOMI",
    images: [
      {
        url: "/og-miyomi.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIYOMI - Contrarian Oracle",
    description: "Live trading interface for AI-driven market predictions",
    creator: "@miyomi_markets",
    images: ["/og-miyomi.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}