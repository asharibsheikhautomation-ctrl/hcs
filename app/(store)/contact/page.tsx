import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  PhoneCall,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  FadeUp,
  SectionTransition,
  StaggerGroup,
  StaggerItem,
} from "@/components/motion";
import { ContactHeroVisual } from "@/components/store/contact-hero-visual";
import { deliveryZones as demoDeliveryZones } from "@/lib/demo-data";
import { fetchActiveDeliveryZones } from "@/lib/delivery-zones";
import { buildPageMetadata, defaultKeywords } from "@/lib/seo";
import { fetchResolvedSiteSettings } from "@/lib/site-settings";
import { formatCurrency } from "@/lib/utils";
import { createWhatsAppOrderUrl } from "@/lib/whatsapp";

const ContactInquiryForm = nextDynamic(
  () =>
    import("@/components/store/contact-inquiry-form").then(
      (module) => module.ContactInquiryForm,
    ),
  {
    loading: () => (
      <div className="cheese-surface luxe-panel grid gap-4 rounded-[2rem] p-6 md:p-7">
        <div className="h-4 w-28 rounded-full bg-surface-muted" />
        <div className="h-10 w-56 rounded-full bg-surface-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-14 rounded-[1rem] bg-surface-muted" />
          <div className="h-14 rounded-[1rem] bg-surface-muted" />
          <div className="h-14 rounded-[1rem] bg-surface-muted" />
          <div className="h-14 rounded-[1rem] bg-surface-muted" />
        </div>
        <div className="h-36 rounded-[1rem] bg-surface-muted" />
        <div className="h-14 rounded-full bg-surface-muted" />
      </div>
    ),
  },
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Reach Hyderabad Cheese Store by phone, WhatsApp, or contact form, and review delivery coverage and business hours before ordering.",
  path: "/contact",
  keywords: [...defaultKeywords, "contact page", "business hours", "delivery coverage"],
});

function formatContactNumber(value: string) {
  if (!value) {
    return "Not available";
  }

  return value.startsWith("+") ? value : `+${value}`;
}

function createPhoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export default async function ContactPage() {
  const [settings, zones] = await Promise.all([
    fetchResolvedSiteSettings(),
    fetchActiveDeliveryZones().catch((error) => {
      console.error("Failed to load delivery zones for contact page.", error);
      return demoDeliveryZones;
    }),
  ]);
  const whatsappDisplay = formatContactNumber(settings.whatsappNumber);
  const callDisplay = settings.contactPhone || whatsappDisplay;
  const whatsappHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I would like help with an order or product inquiry.",
  );
  const callHref = createPhoneHref(settings.contactPhone || settings.whatsappNumber);
  const heroTitle = settings.contactSectionTitle || "Contact the Store";
  const supportHighlights = [
    "Fast WhatsApp replies",
    "Bulk order support",
    "Same day guidance",
  ] as const;

  const contactCards = [
    {
      title: "Contact phone",
      value: callDisplay,
      copy: "Call for urgent help.",
      icon: PhoneCall,
    },
    {
      title: "WhatsApp",
      value: whatsappDisplay,
      copy: "Fastest reply channel.",
      icon: MessageCircle,
    },
    {
      title: "Address",
      value: settings.address || "Hyderabad, Sindh",
      copy: "Pickup and delivery base.",
      icon: MapPin,
    },
    {
      title: "Business hours",
      value: settings.businessHours || "Daily availability",
      copy: "Support window.",
      icon: Clock3,
    },
  ] as const;

  return (
    <>
      <section className="section-space border-y-[5px] border-[var(--color-accent-dark)] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] pb-8 pt-10 sm:pt-12">
        <div className="container-main">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <FadeUp className="max-w-2xl" distance={24}>
              <p className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-accent-dark)] bg-[rgba(255,255,255,0.10)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)] shadow-[0_10px_20px_rgba(0,0,0,0.18)]">
                <Sparkles className="h-3.5 w-3.5" />
                Contact Hyderabad Cheese Store
              </p>
              <h1 className="mt-5 text-balance text-[2.6rem] font-semibold leading-[0.92] text-[var(--color-accent)] sm:text-[3.3rem] md:text-[4.4rem]">
                {heroTitle}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[rgba(255,255,255,0.92)]">
                Call, WhatsApp, or send a quick message for daily supply,
                restaurant support, and home delivery help.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[rgba(255,248,231,0.82)]">
                Same warm gold theme, simple contact flow, and quick answers for
                products, pricing, and delivery coverage.
              </p>

              <div className="mt-7 grid gap-3 sm:flex sm:flex-row sm:flex-wrap">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-primary"
                >
                  Open WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={callHref} className="btn-base btn-secondary">
                  Call the Store
                  <PhoneCall className="h-4 w-4" />
                </a>
                <Link href="/products" className="btn-base btn-secondary">
                  Browse Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <StaggerGroup className="mt-6 flex flex-wrap gap-3" amount={0.14}>
                {supportHighlights.map((highlight) => (
                  <StaggerItem key={highlight}>
                    <span className="chip-link pointer-events-none border-[var(--color-accent-dark)] bg-[rgba(255,255,255,0.10)] text-[var(--color-accent)]">
                      <Sparkles className="h-4 w-4" />
                      {highlight}
                    </span>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </FadeUp>

            <SectionTransition delay={0.08}>
              <ContactHeroVisual
                phone={callDisplay}
                whatsapp={whatsappDisplay}
                hours={settings.businessHours || "Daily availability"}
                address={settings.address || "Hyderabad, Sindh"}
              />
            </SectionTransition>
          </div>
        </div>
      </section>

      <section className="container-main pb-12">
        <StaggerGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" amount={0.16}>
          {contactCards.map((item) => {
            const Icon = item.icon;

            return (
              <StaggerItem key={item.title}>
                <article className="cheese-surface luxe-panel rounded-[1.8rem] p-5 transition-transform duration-300 hover:-translate-y-1">
                  <Icon className="h-5 w-5 text-cheese-500" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-ink-700/55">
                    {item.title}
                  </p>
                  <p className="mt-3 break-words text-[1.45rem] font-semibold leading-[1.05] text-ink-950 sm:text-2xl">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-700/76">
                    {item.copy}
                  </p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      <section className="section-space bg-cheese-300 pt-2">
        <div className="container-main">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
            <SectionTransition>
              <div className="space-y-6">
                <div className="cheese-surface luxe-panel rounded-[2rem] p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
                    Direct Contact
                  </p>
                  <h2 className="mt-4 text-[2.5rem] font-semibold leading-[0.94] text-ink-950 sm:text-5xl">
                    Quick help, clean flow.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-ink-700/76">
                    WhatsApp for the fastest reply. Call for urgent support. Use
                    the form when you want stock checks, partnership details, or
                    regular kitchen supply help.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border-2 border-[rgba(224,123,0,0.24)] bg-[var(--color-bg-white)] p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                        Best for
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink-950">
                        Daily orders, urgent questions, delivery follow-up
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border-2 border-[rgba(224,123,0,0.24)] bg-[var(--color-bg-white)] p-4">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                        Good to ask
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink-950">
                        Product recommendations, bulk pricing, area coverage
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-base btn-primary justify-between rounded-[1.5rem] px-5 py-4"
                    >
                      Start WhatsApp
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <a
                      href={callHref}
                      className="btn-base btn-secondary justify-between rounded-[1.5rem] px-5 py-4"
                    >
                      Call {callDisplay}
                      <PhoneCall className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="cheese-surface luxe-panel rounded-[2rem] p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-cheese-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
                      Service Coverage
                    </p>
                  </div>
                  <h2 className="mt-4 text-4xl font-semibold text-ink-950">
                    Delivery areas
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-ink-700/74">
                    Clear zones, clear charges, and a simple route to checkout.
                  </p>
                  <div className="mt-6 grid gap-4">
                    {zones.map((zone) => (
                      <article
                        key={zone.id}
                        className="rounded-[1.6rem] border border-cheese-200/70 bg-cheese-50 p-5 shadow-[0_16px_40px_rgba(141,97,8,0.10)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
                              {zone.name}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-700/72">
                              {zone.description}
                            </p>
                          </div>
                          <div className="rounded-full bg-cheese-100 px-4 py-2 text-sm font-semibold text-ink-950">
                            From {formatCurrency(zone.deliveryCharge)}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-ink-700/55">
                          <span>{zone.areas.length} areas</span>
                          <span>{zone.estimatedDeliveryTime}</span>
                          <span>Free over {formatCurrency(zone.freeDeliveryMinimum)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </SectionTransition>

            <SectionTransition delay={0.06}>
              <div className="luxe-panel rounded-[2rem] p-3 md:p-4">
                <ContactInquiryForm />
              </div>
            </SectionTransition>
          </div>
        </div>
      </section>

      <section className="container-main pb-16 pt-4">
        <FadeUp>
          <div className="cheese-surface luxe-panel rounded-[2.2rem] px-6 py-7 md:px-8 md:py-9">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
                  Bulk Supply
                </p>
                <h2 className="mt-3 text-[2.1rem] font-semibold leading-[0.95] text-ink-950 sm:text-4xl">
                  Need daily kitchen stock?
                </h2>
                <p className="mt-3 text-sm leading-6 text-ink-700/76">
                  Message the store for restaurant orders, recurring supply, and
                  fast delivery planning.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-base btn-primary"
                >
                  Message on WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <Link href="/checkout" className="btn-base btn-secondary">
                  Go to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
