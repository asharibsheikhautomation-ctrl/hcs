import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, PhoneCall } from "lucide-react";
import { LogoMark } from "@/components/common/logo-mark";
import { publicNavigation } from "@/lib/navigation";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/commerce";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const footerWhatsAppHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I have a question about your catalogue.",
  );

  return (
    <footer className="cheese-footer-shell relative overflow-hidden border-t border-black/6 bg-ink-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,221,125,0.18),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(189,223,255,0.12),transparent_22%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div aria-hidden="true" className="cheese-footer-drip" />

      <div className="container-main section-space relative pb-8 pt-14 sm:pt-16">
        <div className="rounded-[2.3rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl sm:rounded-[2.8rem] sm:p-7 lg:p-10">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_0.75fr_0.9fr]">
            <div className="space-y-6">
              <LogoMark className="[&_p]:text-white" />
              <p className="max-w-lg text-sm leading-6 text-white/70">
                {settings.tagline}
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.26em] text-white/54">
                <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2">
                  Luxury frozen goods
                </span>
                <span className="rounded-full border border-white/12 bg-white/8 px-4 py-2">
                  Refined dairy staples
                </span>
              </div>
              <a
                href={footerWhatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="btn-base btn-primary cheese-cta"
              >
                Start an Order
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
                Navigate
              </p>
              <div className="grid gap-3 text-sm text-white/72">
                {publicNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-sm text-white/72">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
                Contact
              </p>
              <div className="grid gap-3">
                <p className="inline-flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cheese-200" />
                  <span className="break-words">{settings.address}</span>
                </p>
                <p className="inline-flex items-center gap-3">
                  <PhoneCall className="h-4 w-4 shrink-0 text-cheese-200" />
                  <span className="break-words">{settings.contactPhone}</span>
                </p>
                <p className="inline-flex items-center gap-3">
                  <Clock3 className="h-4 w-4 shrink-0 text-cheese-200" />
                  <span className="break-words">{settings.businessHours}</span>
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
                Area-based delivery charges.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2 pt-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/38 md:flex-row md:items-center md:justify-between md:text-left md:tracking-[0.24em]">
          <p>{settings.siteName}</p>
          <p className="break-all">{settings.contactEmail}</p>
        </div>
      </div>
    </footer>
  );
}
