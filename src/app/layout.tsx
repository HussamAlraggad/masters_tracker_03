import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Master's Tracker | Hashemite University SWE",
  description: "Track your master's degree progress with style",
  keywords: ["master's tracker", "Hashemite University", "Software Engineering", "course planner"],
  authors: [{ name: "SWE Master's Student" }],
  openGraph: {
    title: "Master's Tracker",
    description: "Track your master's degree progress with style",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030308",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${sora.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-bg-base text-text-primary antialiased font-ui">
        {children}
      </body>
    </html>
  );
}