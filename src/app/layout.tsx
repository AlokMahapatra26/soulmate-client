import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "SoulMate",
  description: "Premium minimal music player",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SOULMATE",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={outfit.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
