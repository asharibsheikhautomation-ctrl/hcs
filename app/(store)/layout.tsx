import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/components/providers/cart-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { MobileCartBar } from "@/components/store/mobile-cart-bar";
import {
  buildSiteThemeStyle,
  fetchResolvedSiteSettings,
} from "@/lib/site-settings";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await fetchResolvedSiteSettings();

  return (
    <SmoothScrollProvider>
      <CartProvider>
        <div
          className="scroll-shell relative flex min-h-screen flex-col"
          style={buildSiteThemeStyle(settings)}
        >
          <SiteHeader settings={settings} />
          <main className="min-w-0 flex-1 overflow-x-hidden pb-20 md:pb-0">{children}</main>
          <MobileCartBar />
          <SiteFooter settings={settings} />
        </div>
      </CartProvider>
    </SmoothScrollProvider>
  );
}
