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
    <footer className="border-t-4 border-[var(--color-accent)] bg-[var(--color-primary-dark)] text-[var(--color-bg-light)]">
      <div className="container-main py-12">
        <div className="grid gap-8 p-2 sm:p-4 lg:grid-cols-[1.1fr_0.7fr_0.9fr]">
          <div className="space-y-5">
            <LogoMark className="[&_p]:text-[var(--color-bg-light)] [&_p:last-child]:text-[color:rgba(255,248,231,0.72)]" />
            <p className="max-w-lg text-sm leading-6 text-[rgba(255,248,231,0.86)]">
              {settings.tagline}
            </p>
            <div className="flex flex-wrap gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-bg-light)]">
              <span className="rounded-full border border-[var(--color-accent-dark)] bg-[rgba(255,248,231,0.08)] px-3 py-2">
                Cheese & dairy
              </span>
              <span className="rounded-full border border-[var(--color-accent-dark)] bg-[rgba(255,248,231,0.08)] px-3 py-2">
                Frozen supplies
              </span>
              <span className="rounded-full border border-[var(--color-accent-dark)] bg-[rgba(255,248,231,0.08)] px-3 py-2">
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Navigate
            </p>
            <div className="grid gap-3 text-sm text-[rgba(255,248,231,0.84)]">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-[var(--color-accent-dark)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="transition-colors hover:text-[var(--color-accent-dark)]"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[rgba(255,248,231,0.84)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Contact
            </p>
            <div className="grid gap-3">
              <p className="inline-flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                <span className="break-words">{settings.address}</span>
              </p>
              <p className="inline-flex items-center gap-3">
                <PhoneCall className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                <span className="break-words">
                  {settings.contactPhone || settings.whatsappNumber}
                </span>
              </p>
              <p className="inline-flex items-center gap-3">
                <Clock3 className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                <span className="break-words">{settings.businessHours}</span>
              </p>
            </div>
            {settings.contactEmail ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,248,231,0.72)]">
                {settings.contactEmail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
