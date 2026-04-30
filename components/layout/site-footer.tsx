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
    <footer className="border-t border-black/10 bg-cheese-300 text-ink-950">
      <div className="container-main py-12">
        <div className="grid gap-8 p-2 sm:p-4 lg:grid-cols-[1.1fr_0.7fr_0.9fr]">
          <div className="space-y-5">
            <LogoMark className="[&_p]:text-ink-950 [&_p:last-child]:text-ink-950/68" />
            <p className="max-w-lg text-sm leading-6 text-ink-950/76">
              {settings.tagline}
            </p>
            <div className="flex flex-wrap gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-950/88">
              <span className="rounded-full border border-black/10 bg-white/90 px-3 py-2">
                Cheese & dairy
              </span>
              <span className="rounded-full border border-black/10 bg-white/90 px-3 py-2">
                Frozen supplies
              </span>
              <span className="rounded-full border border-black/10 bg-white/90 px-3 py-2">
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-950/62">
              Navigate
            </p>
            <div className="grid gap-3 text-sm text-ink-950/78">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-ink-950"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="transition-colors hover:text-ink-950"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-sm text-ink-950/78">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink-950/62">
              Contact
            </p>
            <div className="grid gap-3">
              <p className="inline-flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-950" />
                <span className="break-words">{settings.address}</span>
              </p>
              <p className="inline-flex items-center gap-3">
                <PhoneCall className="h-4 w-4 shrink-0 text-ink-950" />
                <span className="break-words">
                  {settings.contactPhone || settings.whatsappNumber}
                </span>
              </p>
              <p className="inline-flex items-center gap-3">
                <Clock3 className="h-4 w-4 shrink-0 text-ink-950" />
                <span className="break-words">{settings.businessHours}</span>
              </p>
            </div>
            {settings.contactEmail ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-950/52">
                {settings.contactEmail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
