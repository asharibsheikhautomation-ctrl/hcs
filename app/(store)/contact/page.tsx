import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { Clock3, MapPin, MessageCircle, PhoneCall, Truck } from "lucide-react";
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
      <div className="grid gap-4 rounded-[1.6rem] border border-black/10 bg-white p-6">
        <div className="h-4 w-28 rounded-full bg-[var(--color-bg-light)]" />
        <div className="h-10 w-56 rounded-full bg-[var(--color-bg-light)]" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-14 rounded-[1rem] bg-[var(--color-bg-light)]" />
          <div className="h-14 rounded-[1rem] bg-[var(--color-bg-light)]" />
          <div className="h-14 rounded-[1rem] bg-[var(--color-bg-light)]" />
          <div className="h-14 rounded-[1rem] bg-[var(--color-bg-light)]" />
        </div>
        <div className="h-36 rounded-[1rem] bg-[var(--color-bg-light)]" />
        <div className="h-14 rounded-full bg-[var(--color-bg-light)]" />
      </div>
    ),
  },
);

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Reach Hyderabad Cheese Store by phone, WhatsApp, or inquiry form and review delivery zones before ordering.",
  path: "/contact",
  keywords: [...defaultKeywords, "contact page", "business hours", "delivery coverage"],
});

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

  const whatsappHref = createWhatsAppOrderUrl(
    settings.whatsappNumber,
    "Hello Hyderabad Cheese Store, I would like help with products or delivery.",
  );
  const callValue = settings.contactPhone || settings.whatsappNumber;
  const callHref = createPhoneHref(callValue);
  const infoCards = [
    {
      title: "WhatsApp",
      value: settings.whatsappNumber,
      copy: "Fastest reply for bulk and daily supply.",
      icon: MessageCircle,
    },
    {
      title: "Call",
      value: callValue,
      copy: "Best for urgent support.",
      icon: PhoneCall,
    },
    {
      title: "Address",
      value: settings.address || "Hyderabad",
      copy: "Main service and dispatch location.",
      icon: MapPin,
    },
    {
      title: "Hours",
      value: settings.businessHours || "Daily",
      copy: "Customer support window.",
      icon: Clock3,
    },
  ] as const;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={settings.contactSectionTitle || "Need help with an order?"}
        description="Call, WhatsApp, or send a quick inquiry for daily supply, restaurant orders, and delivery questions."
        actions={
          <>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-base btn-primary">
              WhatsApp Us
            </a>
            <a href={callHref} className="btn-base btn-dark">
              Call Now
            </a>
          </>
        }
      />

      <section className="section-space bg-[var(--color-bg-light)] pt-8">
        <div className="container-main">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {infoCards.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_10px_24px_rgba(17,17,17,0.08)]"
                >
                  <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    {item.title}
                  </p>
                  <p className="mt-3 break-words text-[1.3rem] font-extrabold leading-[1.05] text-black">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                    {item.copy}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <div className="space-y-6">
              <div className="rounded-[1.6rem] border border-black/10 bg-white p-6 shadow-[0_10px_24px_rgba(17,17,17,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Contact Us
                </p>
                <h2 className="mt-3 text-3xl font-extrabold text-black sm:text-4xl">
                  Fast help for daily supply
                </h2>
                <p className="mt-3 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                  For bulk orders and daily restaurant supply, message us on WhatsApp or send a quick inquiry below.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-base btn-primary sm:w-auto">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <Link href="/products" className="btn-base btn-secondary sm:w-auto">
                    View Menu
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-black/10 bg-white p-6 shadow-[0_10px_24px_rgba(17,17,17,0.08)]">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-[var(--color-accent)]" />
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                    Delivery Zones
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {zones.map((zone) => (
                    <article
                      key={zone.id}
                      className="rounded-[1.25rem] border border-black/10 bg-[var(--color-bg-light)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-extrabold text-black">{zone.name}</p>
                          <p className="mt-1 text-sm leading-6 text-[rgba(17,17,17,0.72)]">
                            {zone.areas.length} areas
                          </p>
                        </div>
                        <span className="rounded-full bg-[var(--color-primary)] px-3 py-2 text-sm font-bold text-black">
                          From {formatCurrency(zone.deliveryCharge)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-black/10 bg-white p-3 shadow-[0_10px_24px_rgba(17,17,17,0.08)] md:p-4">
              <ContactInquiryForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
