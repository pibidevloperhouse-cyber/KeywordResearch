import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import AdSenseScript from "@/components/AdSenseScript";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Keyword Intelligence - SEO Research Tool",
  description: "Deep dive into search intent, competitors, and trends across 5 major regions. Analyze keywords, competitors, news, and ads with powerful AI-driven insights.",
  keywords: ["keyword research", "SEO tool", "competitor analysis", "search trends", "digital marketing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <AdSenseScript />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} font-inter antialiased bg-slate-950 text-slate-200`}
      >
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none brightness-100 contrast-150"></div>
        <Navbar />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
