import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import { businessInfo } from "@/data/business";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: businessInfo.name,
    template: `%s | ${businessInfo.name}`,
  },
  description: businessInfo.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="antialiased">

        <SessionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-5 focus:py-2.5 focus:font-bold focus:text-ink focus:shadow-lift"
          >
            Skip to main content
          </a>

          <Navbar />

          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>

          <Footer />
        </SessionProvider>

      </body>
      
    </html>
  );
}
