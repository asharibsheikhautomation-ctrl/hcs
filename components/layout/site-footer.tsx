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
    <footer className="border-t-4 border-[var(--color-primary)] bg-[var(--color-primary-dark)] text-[var(--color-bg-light)]">
      <div className="container-main py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.7fr_0.9fr]">
          <div className="space-y-5">
            <LogoMark className="[&_p]:!text-[var(--color-bg-light)] [&_p:last-child]:!text-[rgba(255,248,231,0.76)]" />
            <p className="max-w-lg text-sm leading-6 text-[rgba(255,248,231,0.86)]">
              {settings.tagline}
            </p>
            <a
              href={footerWhatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-secondary w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Help
            </a>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Menu
            </p>
            <div className="grid gap-3 text-sm">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="text-[var(--color-primary)] transition-colors hover:text-[var(--color-accent)]"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[rgba(255,248,231,0.86)]">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Contact
            </p>
            <div className="grid gap-3">
              <p className="inline-flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <span className="break-words">{settings.address}</span>
              </p>
              <p className="inline-flex items-center gap-3">
                <PhoneCall className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <span className="break-words">
                  {settings.contactPhone || settings.whatsappNumber}
                </span>
              </p>
              <p className="inline-flex items-center gap-3">
                <Clock3 className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                <span className="break-words">{settings.businessHours}</span>
              </p>
            </div>
            {settings.contactEmail ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(255,248,231,0.74)]">
                {settings.contactEmail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
