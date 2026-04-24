import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fff7df",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: "Hyderabad Cheese Store",
  title: {
    default: "Hyderabad Cheese Store",
    template: "%s | Hyderabad Cheese Store",
  },
  description:
    "Premium frozen and dairy provisions for Hyderabad, built for elegant browsing and fast WhatsApp ordering.",
  keywords: [
    "Hyderabad Cheese Store",
    "premium frozen food",
    "dairy delivery Hyderabad",
    "WhatsApp order store",
  ],
  category: "ecommerce",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hyderabad Cheese Store",
    description:
      "Premium frozen and dairy provisions for Hyderabad, built for elegant browsing and fast WhatsApp ordering.",
    url: "/",
    siteName: "Hyderabad Cheese Store",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyderabad Cheese Store",
    description:
      "Premium frozen and dairy provisions for Hyderabad, built for elegant browsing and fast WhatsApp ordering.",
  },
  robots: {
    index: true,
    follow: true,
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
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${cormorant.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
