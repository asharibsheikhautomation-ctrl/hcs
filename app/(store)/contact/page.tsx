import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  PhoneCall,
  Truck,
} from "lucide-react";
import { SectionTransition, StaggerGroup, StaggerItem } from "@/components/motion";
import { PageHero } from "@/components/store/page-hero";
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
      <div className="grid gap-4 rounded-[2rem] bg-white/70 p-6 shadow-[0_18px_60px_rgba(17,17,17,0.06)] md:p-7">
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

  const contactCards = [
    {
      title: "Contact phone",
      value: callDisplay,
      copy: "Call for quick help.",
      icon: PhoneCall,
    },
    {
      title: "WhatsApp",
      value: whatsappDisplay,
      copy: "Best for fast orders.",
      icon: MessageCircle,
    },
    {
      title: "Address",
      value: settings.address || "Hyderabad, Sindh",
      copy: "Delivery base.",
      icon: MapPin,
    },
    {
      title: "Business hours",
      value: settings.businessHours || "Daily availability",
      copy: "Open hours.",
      icon: Clock3,
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={settings.contactSectionTitle || "Contact Store"}
        description="Call, WhatsApp, or send a quick message."
        actions={
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-base btn-primary"
            >
              Open WhatsApp
            </a>
            <a
              href={callHref}
              className="btn-base btn-secondary"
            >
              Call the Store
            </a>
            <Link
              href="/products"
              className="btn-base btn-secondary"
            >
              Browse Products
            </Link>
          </>
        }
      />

      <section className="container-main pb-10">
        <StaggerGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" amount={0.16}>
          {contactCards.map((item) => {
            const Icon = item.icon;

            return (
              <StaggerItem key={item.title}>
                <article className="luxe-panel rounded-[1.8rem] p-5">
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

      <section className="section-space pt-4">
        <div className="container-main">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
            <SectionTransition>
              <div className="space-y-6">
                <div className="luxe-panel rounded-[2rem] p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cheese-500">
                    Direct Contact
                  </p>
                  <h2 className="mt-4 text-[2.5rem] font-semibold leading-[0.94] text-ink-950 sm:text-5xl">
                    Need help fast?
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-ink-700/76">
                    WhatsApp for quick replies. Call for urgent help.
                  </p>

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

                <div className="frozen-panel rounded-[2rem] p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-mist-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-mist-500">
                      Service Coverage
                    </p>
                  </div>
                  <h2 className="mt-4 text-4xl font-semibold text-ink-950">
                    Delivery areas
                  </h2>
                  <div className="mt-6 grid gap-4">
                    {zones.map((zone) => (
                      <article
                        key={zone.id}
                        className="rounded-[1.6rem] border border-white/70 bg-white/76 p-5 shadow-[0_16px_40px_rgba(93,127,152,0.10)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-mist-500">
                              {zone.name}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-700/72">
                              {zone.description}
                            </p>
                          </div>
                          <div className="rounded-full bg-frost-100 px-4 py-2 text-sm font-semibold text-mist-500">
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
    </>
  );
}
