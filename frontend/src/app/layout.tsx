import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodTrace — Food Supply Chain Intelligence & Traceability Platform",
  description:
    "From source to shelf, every step verified. A decentralized, immutable food traceability and bidirectional risk response network built for SIH 2026.",
  keywords: [
    "Food Traceability",
    "Supply Chain Intelligence",
    "Hyperledger Fabric",
    "Food Safety",
    "Product Provenance",
    "Smart India Hackathon",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
