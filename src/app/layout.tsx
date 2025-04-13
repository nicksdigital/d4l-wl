import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/core/Header";
import Footer from "@/components/core/Footer";
import MobileNavBar from "@/components/core/MobileNavBar";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { Providers } from "@/components/providers/Providers";
import PageTransition from "@/components/common/PageTransition";
import CookieConsent from "@/components/gdpr/CookieConsent";
import { baseMetadata } from "@/lib/metadata";
import { organizationSchema, websiteSchema } from "@/components/seo/StructuredData";
import StructuredDataManager from "@/components/seo/StructuredDataManager";
import { defaultCacheConfig } from "@/lib/cache";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Ensure text is visible during font loading
  variable: '--font-inter',
});

export const metadata: Metadata = baseMetadata;

// Configure default caching behavior
export const revalidate = 3600; // Revalidate content every hour

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Since we've disabled SSR in the wagmiAdapter config, we don't need to pass cookies
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#111827" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Move structured data to client-side to avoid hydration mismatches */}
      </head>
      <body className={`${inter.className} ${inter.variable} bg-gray-900 text-gray-100`}>
        <Providers cookies={null}>
          {/* Skip to content link for accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white">
            Skip to content
          </a>
          <PageTransition>
            <ErrorBoundary>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main id="main-content" className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <Footer />
                {/* Mobile Navigation Bar - fixed at bottom on mobile */}
                <MobileNavBar />
              </div>
              {/* GDPR Cookie Consent Banner */}
              <CookieConsent />
              {/* Use the client-only StructuredDataManager */}
              <StructuredDataManager />
            </ErrorBoundary>
          </PageTransition>
        </Providers>
      </body>
    </html>
  );
}
