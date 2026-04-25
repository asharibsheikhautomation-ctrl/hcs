import Link from "next/link";
import { Clock3, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { LogoMark } from "@/components/common/logo-mark";
import { publicNavigation } from "@/lib/navigation";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";
import type { SiteSettings } from "@/types/commerce";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const footerWhatsAppHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I need help with products or delivery.",
  );

  return (
    <footer className="relative border-t border-black/8 bg-ink-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,221,125,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <div className="container-main relative py-12">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.7fr_0.9fr]">
          <div className="space-y-5">
            <LogoMark className="[&_p]:text-white [&_p:last-child]:text-cheese-100/70" />
            <p className="max-w-lg text-sm leading-6 text-white/72">
              {settings.tagline}
            </p>
            <div className="flex flex-wrap gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-cheese-100/80">
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-2">
                Cheese & dairy
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-2">
                Frozen supplies
              </span>
              <span className="rounded-full border border-white/12 bg-white/6 px-3 py-2">
                Fast delivery
              </span>
            </div>
            <a
              href={footerWhatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-primary w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-100/55">
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
              <Link
                href="/admin"
                className="transition-colors hover:text-white"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-sm text-white/72">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cheese-100/55">
              Contact
            </p>
            <div className="grid gap-3">
              <p className="inline-flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cheese-200" />
                <span className="break-words">{settings.address}</span>
              </p>
              <p className="inline-flex items-center gap-3">
                <PhoneCall className="h-4 w-4 shrink-0 text-cheese-200" />
                <span className="break-words">
                  {settings.contactPhone || settings.whatsappNumber}
                </span>
              </p>
              <p className="inline-flex items-center gap-3">
                <Clock3 className="h-4 w-4 shrink-0 text-cheese-200" />
                <span className="break-words">{settings.businessHours}</span>
              </p>
            </div>
            {settings.contactEmail ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {settings.contactEmail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
