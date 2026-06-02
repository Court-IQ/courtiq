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
  title: "HooprLab — Your AI scouting report after every game",
  description:
    "Send us your game film. We send back a shot chart, your tendencies, and exactly what to work on before the next game.",
  openGraph: {
    title: "HooprLab — AI scouting reports for hoopers",
    description:
      "Send us your game film. We send back a player scouting report.",
    images: ["/cards/01_cover.png"],
  },
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
