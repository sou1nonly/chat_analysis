import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { clsx } from "clsx";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Orbit",
  description: "A privacy-first Relationship Zine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={clsx(inter.variable, spaceGrotesk.variable, "antialiased min-h-screen transition-colors duration-300 selection:bg-pink-500/30")}>
        {children}
      </body>
    </html>
  );
}
