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
    "Premium cheese, dairy, and frozen supplies for restaurants and home kitchens with fast checkout and delivery.",
  keywords: [
    "Hyderabad Cheese Store",
    "premium cheese",
    "dairy delivery Hyderabad",
    "frozen food supplies",
  ],
  category: "ecommerce",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hyderabad Cheese Store",
    description:
      "Premium cheese, dairy, and frozen supplies for restaurants and home kitchens with fast checkout and delivery.",
    url: "/",
    siteName: "Hyderabad Cheese Store",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyderabad Cheese Store",
    description:
      "Premium cheese, dairy, and frozen supplies for restaurants and home kitchens with fast checkout and delivery.",
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
      className={`${manrope.variable} ${cormorant.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
