import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/styles/tailwind.css";
import "@/styles/globals.scss";
import Providers from "../providers/providers";
import ClientLayout from "@/components/layout/ClientLayout";

// Primary font for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Secondary font for headings
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArenaOps - Stadium Management",
  description: "Premium stadium management platform for modern operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
