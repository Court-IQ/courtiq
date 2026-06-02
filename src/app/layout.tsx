import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://courtiq-ebon.vercel.app"),
  title: "HooprLab — AI scouting reports for hoopers",
  description:
    "Send us your game film. We send back a shot chart, your tendencies, and exactly what to work on before the next game.",
  keywords: [
    "basketball training app",
    "AI basketball coach",
    "scouting report",
    "AAU",
    "high school basketball",
    "hooper",
    "HooprLab",
  ],
  openGraph: {
    title: "HooprLab — AI scouting reports for hoopers",
    description:
      "Send your game film. Get a scouting report — shot chart, tendencies, what to work on.",
    images: ["/cards/01_cover.png"],
    type: "website",
    siteName: "HooprLab",
  },
  twitter: {
    card: "summary_large_image",
    title: "HooprLab — AI scouting reports for hoopers",
    description:
      "Send your game film. Get a scouting report — shot chart, tendencies, what to work on.",
    images: ["/cards/01_cover.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
