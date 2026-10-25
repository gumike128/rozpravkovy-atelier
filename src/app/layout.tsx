import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Rozprávkový ateliér | Tvorba animovaných príbehov",
  description:
    "Tvorivý pracovný priestor na plánovanie animovaných detských príbehov, postáv, sveta a produkčného pasu.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sk">
      <body className={`${inter.variable} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
