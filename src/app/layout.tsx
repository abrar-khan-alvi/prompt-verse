// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptVerse",
  description: "Trade and own AI Prompts securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground`}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-20 sm:pt-24 pb-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
