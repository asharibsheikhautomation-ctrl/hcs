import Image from "next/image";
import {
  deleteCategoryAction,
  deleteDealAction,
  deleteDeliveryZoneAction,
  deleteDeliveryZoneAreaAction,
  deleteSimpleProductAction,
  updateSimpleOrderStatusAction,
} from "@/app/admin/actions";
import { DeliveryZoneAreaForm } from "@/components/admin/delivery-zone-area-form";
import { DeliveryZoneForm } from "@/components/admin/delivery-zone-form";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminErrorState } from "@/components/admin/error-state";
import {
  MobileAdminSection,
  MobileAdminSections,
} from "@/components/admin/mobile-admin-sections";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { PanelCard } from "@/components/admin/panel-card";
import { ProductImportForm } from "@/components/admin/product-import-form";
import { SimpleCategoryForm } from "@/components/admin/simple-category-form";
import { SimpleDealForm } from "@/components/admin/simple-deal-form";
import { SimpleProductForm } from "@/components/admin/simple-product-form";
import { SimpleSettingsForm } from "@/components/admin/simple-settings-form";
import { fetchAdminDeals, fetchSimpleAdminPageData } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";
import { createAdminCustomerOrderWhatsAppUrl } from "@/lib/whatsapp";
import type { AdminDeal } from "@/types/admin";

function formatOrderDate(value: string) {
  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDealDiscount(deal: AdminDeal) {
  if (deal.discountType === "percentage") {
    return `${deal.discountValue}% off`;
  }

  if (deal.discountType === "fixed") {
    return `${formatCurrency(deal.discountValue)} off`;
  }

  return "Bundle offer";
}

function formatDealWindow(deal: AdminDeal) {
  if (!deal.startsAt && !deal.endsAt) {
    return "Always on";
  }

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-PK", {
      month: "short",
      day: "numeric",
    });

  if (deal.startsAt && deal.endsAt) {
    return `${formatDate(deal.startsAt)} - ${formatDate(deal.endsAt)}`;
  }

  if (deal.startsAt) {
    return `From ${formatDate(deal.startsAt)}`;
  }

  return `Until ${formatDate(deal.endsAt)}`;
}

export default async function AdminDashboardPage() {
  const [result, dealsResult] = await Promise.all([
    fetchSimpleAdminPageData()
      .then((data) => ({ data, error: null as string | null }))
      .catch((error) => ({
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading admin data.",
      })),
    fetchAdminDeals()
      .then((deals) => ({ deals, error: null as string | null }))
      .catch((error) => ({
        deals: [] as AdminDeal[],
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while loading deals data.",
      })),
  ]);

  if (!result.data) {
    return (
      <AdminErrorState
        title="Admin data could not be loaded."
        description={result.error ?? "Unexpected error while loading admin data."}
      />
    );
  }

  const {
    totalOrders,
    totalRevenue,
    categories,
    deliveryZones,
    products,
    orders,
    settings,
  } = result.data;
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const deliveryZoneOptions = deliveryZones.map((zone) => ({
    value: zone.id,
    label: zone.name,
  }));
  const dealProductOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  return (
    <MobileAdminSections
      defaultOpenId="products"
      links={[
        { id: "overview", label: "Overview" },
        { id: "products", label: "Products" },
        { id: "orders", label: "Orders" },
        { id: "deals", label: "Deals" },
        { id: "categories", label: "Categories" },
        { id: "delivery", label: "Delivery" },
        { id: "settings", label: "Settings" },
      ]}
    >
      <MobileAdminSection
        id="overview"
        title="Overview"
        description="Orders and revenue at a glance."
      >
      <section className="grid gap-4 md:grid-cols-2">
        <div className="luxe-panel rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
            Total orders
          </p>
          <p className="mt-4 text-5xl font-semibold text-ink-950 md:text-6xl">
            {totalOrders}
          </p>
          <p className="mt-3 text-base leading-8 text-ink-700/78">
            All orders saved from the checkout page.
          </p>
        </div>

        <div className="luxe-panel rounded-[2rem] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
            Total revenue
          </p>
          <p className="mt-4 text-5xl font-semibold text-ink-950 md:text-6xl">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="mt-3 text-base leading-8 text-ink-700/78">
            Combined total from all saved orders.
          </p>
        </div>
      </section>
      </MobileAdminSection>

      <MobileAdminSection
        id="categories"
        title="Categories"
        description="Organize products into simple shelves."
      >
      <section>
        <PanelCard
          title="Categories"
          description="Keep products separated into simple sections like Frozen Food, Dairy Items, and Extra Items."
          compactHeaderOnMobile
        >
          <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
            <SimpleCategoryForm />

            <div className="space-y-4">
              {categories.length === 0 ? (
                <AdminEmptyState
                  title="No categories yet"
                  description="Add your first category so products stay organized."
                />
              ) : (
                categories.map((category) => (
                  <details
                    key={category.id}
                    className="rounded-[1.75rem] border border-black/6 bg-surface-muted p-5"
                  >
                    <summary className="flex cursor-pointer list-none flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-[1.4rem] border border-black/6 bg-white">
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              alt={category.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink-700/45">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-2xl font-semibold text-ink-950">
                              {category.name}
                            </p>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">
                              {category.productCount} products
                            </span>
                            <span className="rounded-full bg-cheese-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cheese-700">
                              {category.isActive ? "Visible" : "Hidden"}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-ink-700/78">
                            {category.description || "Simple section for grouped products."}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cheese-500">
                        Tap to edit
                      </span>
                    </summary>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto]">
                      <SimpleCategoryForm category={category} />

                      <div className="space-y-3 xl:self-start">
                        <form action={deleteCategoryAction}>
                          <input type="hidden" name="id" value={category.id} />
                          <button
                            type="submit"
                            disabled={category.productCount > 0}
                            className="btn-base w-full rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete Category
                          </button>
                        </form>

                        {category.productCount > 0 ? (
                          <p className="max-w-[17rem] text-sm leading-6 text-ink-700/72">
                            Move or delete the products in this category before removing it.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </PanelCard>
      </section>
      </MobileAdminSection>

      <MobileAdminSection
        id="products"
        title="Products"
        description="Add, edit, import, and remove products."
      >
      <section>
        <PanelCard
          title="Products"
          description="Add products one by one or bulk upload them from a simple CSV file. You can also export the current list anytime."
          compactHeaderOnMobile
        >
          <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="space-y-4">
              <ProductImportForm />
              <SimpleProductForm categories={categoryOptions} />
            </div>

            <div className="space-y-4">
              {products.length === 0 ? (
                <AdminEmptyState
                  title="No products yet"
                  description="Use the simple form to add your first product."
                />
              ) : (
                products.map((product) => (
                  <details
                    key={product.id}
                    className="rounded-[1.75rem] border border-black/6 bg-surface-muted p-5"
                  >
                    <summary className="flex cursor-pointer list-none flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 overflow-hidden rounded-[1.4rem] border border-black/6 bg-white">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-semibold text-ink-700/60">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-ink-950">
                            {product.name}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">
                              {product.categoryName}
                            </span>
                          </div>
                          <p className="mt-2 text-base text-ink-700/75">
                            {formatCurrency(product.salePrice ?? product.regularPrice)}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cheese-500">
                        Tap to edit
                      </span>
                    </summary>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto]">
                      <SimpleProductForm
                        categories={categoryOptions}
                        product={product}
                      />

                      <form action={deleteSimpleProductAction} className="xl:self-start">
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="btn-base w-full rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700 md:w-auto">
                          Delete Product
                        </button>
                      </form>
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </PanelCard>
      </section>
      </MobileAdminSection>

      <MobileAdminSection
        id="deals"
        title="Deals"
        description="Create, edit, and manage active offers."
      >
      <section>
        <PanelCard
          title="Deals"
          description="Create visual offers with a banner image, simple discounts, linked products, and manual custom items."
          compactHeaderOnMobile
        >
          {dealsResult.error ? (
            <AdminErrorState
              title="Deals could not be loaded."
              description={dealsResult.error}
            />
          ) : (
            <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
              <SimpleDealForm products={dealProductOptions} />

              <div className="space-y-4">
                {dealsResult.deals.length === 0 ? (
                  <AdminEmptyState
                    title="No deals yet"
                    description="Use the deal form to add your first visual campaign."
                  />
                ) : (
                  dealsResult.deals.map((deal) => (
                    <details
                      key={deal.id}
                      className="rounded-[1.75rem] border border-black/6 bg-surface-muted p-5"
                    >
                      <summary className="flex cursor-pointer list-none flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative h-20 w-20 overflow-hidden rounded-[1.4rem] border border-black/6 bg-white">
                            <Image
                              src={deal.bannerImageUrl || "/logo.png"}
                              alt={deal.title}
                              fill
                              sizes="80px"
                              className={
                                deal.bannerImageUrl
                                  ? "object-cover"
                                  : "object-contain bg-white p-2"
                              }
                            />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-2xl font-semibold text-ink-950">
                                {deal.title}
                              </p>
                              <span className="rounded-full bg-cheese-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cheese-700">
                                {formatDealDiscount(deal)}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">
                                {deal.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-ink-700/72">
                              {formatDealWindow(deal)}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-700/78">
                              {deal.description}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-semibold uppercase tracking-[0.22em] text-cheese-500">
                          Tap to edit
                        </span>
                      </summary>

                      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_18rem]">
                        <SimpleDealForm
                          products={dealProductOptions}
                          deal={deal}
                        />

                        <div className="space-y-4 xl:self-start">
                          <div className="rounded-[1.5rem] bg-white/80 p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                              Included items
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {deal.linkedProductNames.length > 0 || deal.customItems.length > 0 ? (
                                <>
                                  {deal.linkedProductNames.map((productName) => (
                                    <span
                                      key={`${deal.id}-${productName}`}
                                      className="rounded-full border border-black/8 bg-surface-muted px-3 py-2 text-sm font-semibold text-ink-950"
                                    >
                                      {productName}
                                    </span>
                                  ))}
                                  {deal.customItems.map((item) => (
                                    <span
                                      key={`${deal.id}-${item.id}`}
                                      className="rounded-full border border-cheese-200 bg-cheese-100/70 px-3 py-2 text-sm font-semibold text-cheese-800"
                                    >
                                      {item.name}
                                    </span>
                                  ))}
                                </>
                              ) : (
                                <p className="text-sm leading-6 text-ink-700/72">
                                  No included items yet.
                                </p>
                              )}
                            </div>
                          </div>

                          <form action={deleteDealAction}>
                            <input type="hidden" name="id" value={deal.id} />
                            <button
                              type="submit"
                              className="btn-base w-full rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700"
                            >
                              Delete Deal
                            </button>
                          </form>
                        </div>
                      </div>
                    </details>
                  ))
                )}
              </div>
            </div>
          )}
        </PanelCard>
      </section>
      </MobileAdminSection>

      <MobileAdminSection
        id="delivery"
        title="Delivery"
        description="Manage zones, areas, and delivery charges."
      >
      <section>
        <PanelCard
          title="Delivery Locations"
          description="Manage checkout locations, zone pricing, free-delivery minimums, and area-wise charges from one place."
          compactHeaderOnMobile
        >
          <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <DeliveryZoneForm />

            <div className="space-y-4">
              {deliveryZones.length === 0 ? (
                <AdminEmptyState
                  title="No delivery zones yet"
                  description="Add a zone first, then create areas with their own delivery charges."
                />
              ) : (
                deliveryZones.map((zone) => (
                  <details
                    key={zone.id}
                    className="rounded-[1.75rem] border border-black/6 bg-surface-muted p-5"
                  >
                    <summary className="flex cursor-pointer list-none flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-2xl font-semibold text-ink-950">
                            {zone.name}
                          </p>
                          <span className="rounded-full bg-cheese-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cheese-700">
                            {zone.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">
                            {zone.areas.length} areas
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-ink-700/78">
                          {zone.description || "Zone shown in checkout before customers pick an area."}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 xl:w-[28rem]">
                        <div className="rounded-[1.25rem] bg-white/80 px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Base charge
                          </p>
                          <p className="mt-2 text-lg font-semibold text-ink-950">
                            {formatCurrency(zone.deliveryCharge)}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white/80 px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Free delivery
                          </p>
                          <p className="mt-2 text-lg font-semibold text-ink-950">
                            {zone.freeDeliveryMinimum > 0
                              ? formatCurrency(zone.freeDeliveryMinimum)
                              : "Off"}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white/80 px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            ETA
                          </p>
                          <p className="mt-2 text-lg font-semibold text-ink-950">
                            {zone.estimatedDeliveryTime || "Not set"}
                          </p>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_18rem]">
                      <div className="space-y-4">
                        <DeliveryZoneForm zone={zone} />

                        <div className="rounded-[1.5rem] bg-white/80 p-5">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                                Area pricing
                              </p>
                              <p className="mt-2 text-base leading-7 text-ink-700/76">
                                Checkout will use the selected area&apos;s delivery charge.
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {zone.areas.length > 0 ? (
                              zone.areas.map((area) => (
                                <details
                                  key={area.id}
                                  className="rounded-[1.25rem] border border-black/6 bg-surface-muted px-4 py-4"
                                >
                                  <summary className="flex cursor-pointer list-none flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <p className="text-lg font-semibold text-ink-950">
                                        {area.areaName}
                                      </p>
                                      <p className="mt-1 text-sm leading-6 text-ink-700/72">
                                        {area.description || "Area-specific delivery pricing"}
                                      </p>
                                    </div>

                                    <span className="text-lg font-semibold text-ink-950">
                                      {formatCurrency(area.deliveryCharge)}
                                    </span>
                                  </summary>

                                  <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_auto]">
                                    <DeliveryZoneAreaForm
                                      zones={deliveryZoneOptions}
                                      area={area}
                                    />

                                    <form action={deleteDeliveryZoneAreaAction}>
                                      <input type="hidden" name="id" value={area.id} />
                                      <button
                                        type="submit"
                                        className="btn-base w-full rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700 xl:w-auto"
                                      >
                                        Delete Area
                                      </button>
                                    </form>
                                  </div>
                                </details>
                              ))
                            ) : (
                              <div className="rounded-[1.25rem] border border-dashed border-black/10 bg-surface-muted px-4 py-4 text-base text-ink-700/72">
                                No areas yet. Add the first area below.
                              </div>
                            )}
                          </div>

                          <div className="mt-4">
                            <DeliveryZoneAreaForm
                              zones={deliveryZoneOptions}
                              initialZoneId={zone.id}
                            />
                          </div>
                        </div>
                      </div>

                      <form action={deleteDeliveryZoneAction} className="xl:self-start">
                        <input type="hidden" name="id" value={zone.id} />
                        <button
                          type="submit"
                          className="btn-base w-full rounded-[1.25rem] border border-red-200 bg-red-50 px-6 py-4 text-red-700"
                        >
                          Delete Zone
                        </button>
                      </form>
                    </div>
                  </details>
                ))
              )}
            </div>
          </div>
        </PanelCard>
      </section>
      </MobileAdminSection>

      <MobileAdminSection
        id="orders"
        title="Orders"
        description="Review orders, update status, and send WhatsApp summaries."
      >
      <section>
        <PanelCard
          title="Orders"
          description="View customer details, confirm or deliver the order, send the full order summary to WhatsApp, and export all orders to CSV."
          compactHeaderOnMobile
        >
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <a
              href="/admin/export/orders"
              className="btn-base btn-secondary w-full justify-center rounded-[1.25rem] px-6 py-4 md:w-auto"
            >
              Export Orders CSV
            </a>
          </div>

          {orders.length === 0 ? (
            <AdminEmptyState
              title="No orders yet"
              description="Orders placed from checkout will appear here automatically."
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const whatsappHref = createAdminCustomerOrderWhatsAppUrl(
                  order.phone,
                  {
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    status: order.status,
                    deliveryLabel: order.deliveryLabel,
                    subtotal: order.subtotal,
                    deliveryCharge: order.deliveryCharge,
                    total: order.total,
                    note: order.note,
                    items: order.items.map((item) => ({
                      productName: item.productName,
                      quantity: item.quantity,
                      lineTotal: item.lineTotal,
                      productSnapshot: {
                        unitLabel: item.productSnapshot.unitLabel,
                        includedItems: item.productSnapshot.includedItems,
                      },
                    })),
                  },
                );

                return (
                  <details
                    key={order.id}
                    open={index === 0}
                    className="rounded-[1.75rem] border border-black/6 bg-surface-muted p-5"
                  >
                    <summary className="flex cursor-pointer list-none flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cheese-500">
                            {order.orderNumber}
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <h3 className="mt-3 text-2xl font-semibold text-ink-950 md:text-3xl">
                          {order.customerName}
                        </h3>
                        <p className="mt-2 text-base leading-8 text-ink-700/80">
                          {order.phone}
                        </p>
                        <p className="text-base leading-8 text-ink-700/80">
                          {order.address}
                        </p>
                      </div>

                      <div className="grid gap-3 text-left sm:grid-cols-3 xl:w-[24rem] xl:grid-cols-1">
                        <div className="rounded-[1.25rem] bg-white/78 px-4 py-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Total
                          </p>
                          <p className="mt-2 text-xl font-semibold text-ink-950">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white/78 px-4 py-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Delivery
                          </p>
                          <p className="mt-2 text-xl font-semibold text-ink-950">
                            {order.deliveryLabel}
                          </p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white/78 px-4 py-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Created
                          </p>
                          <p className="mt-2 text-base font-semibold text-ink-950">
                            {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                    </summary>

                    <div className="mt-5 grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-[1.5rem] bg-white/80 p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                              Customer
                            </p>
                            <p className="mt-3 text-xl font-semibold text-ink-950">
                              {order.customerName}
                            </p>
                            <p className="mt-2 text-base leading-8 text-ink-700/80">
                              {order.phone}
                            </p>
                          </div>

                          <div className="rounded-[1.5rem] bg-white/80 p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                              Address
                            </p>
                            <p className="mt-3 text-base leading-8 text-ink-700/80">
                              {order.address}
                            </p>
                          </div>
                        </div>

                        {order.note ? (
                          <div className="rounded-[1.5rem] bg-white/80 p-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                              Note
                            </p>
                            <p className="mt-3 text-base leading-8 text-ink-700/80">
                              {order.note}
                            </p>
                          </div>
                        ) : null}

                        <div className="rounded-[1.5rem] bg-white/80 p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Items
                          </p>
                          <div className="mt-4 space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-[1.25rem] border border-black/6 bg-surface-muted px-4 py-4"
                              >
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <p className="text-lg font-semibold text-ink-950">
                                      {item.productName}
                                    </p>
                                    <p className="mt-1 text-sm leading-7 text-ink-700/75">
                                      {item.quantity} x{" "}
                                      {item.productSnapshot.unitLabel || "item"}
                                    </p>
                                  </div>
                                  <p className="text-lg font-semibold text-ink-950">
                                    {formatCurrency(item.lineTotal)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-[1.5rem] bg-white/80 p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Update status
                          </p>
                          <div className="mt-4 flex flex-col gap-3">
                            <form action={updateSimpleOrderStatusAction}>
                              <input type="hidden" name="id" value={order.id} />
                              <input type="hidden" name="status" value="Confirmed" />
                              <button
                                type="submit"
                                disabled={order.status === "Confirmed"}
                                className="btn-base btn-secondary w-full justify-center rounded-[1.25rem] px-6 py-4"
                              >
                                Mark Confirmed
                              </button>
                            </form>

                            <form action={updateSimpleOrderStatusAction}>
                              <input type="hidden" name="id" value={order.id} />
                              <input type="hidden" name="status" value="Delivered" />
                              <button
                                type="submit"
                                disabled={order.status === "Delivered"}
                                className="btn-base btn-primary w-full justify-center rounded-[1.25rem] px-6 py-4"
                              >
                                Mark Delivered
                              </button>
                            </form>
                          </div>
                        </div>

                        <div className="rounded-[1.5rem] bg-white/80 p-5">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                            Send details
                          </p>
                          {whatsappHref ? (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-base btn-dark mt-4 w-full justify-center rounded-[1.25rem] px-6 py-4"
                            >
                              Send to WhatsApp
                            </a>
                          ) : (
                            <div className="mt-4 rounded-[1.25rem] border border-dashed border-black/10 bg-surface-muted px-4 py-4 text-base text-ink-700/75">
                              Customer phone number is not valid for WhatsApp.
                            </div>
                          )}
                        </div>

                        <div className="rounded-[1.5rem] bg-ink-950 p-5 text-white">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">
                            Order total
                          </p>
                          <div className="mt-4 space-y-3 text-base">
                            <div className="flex items-center justify-between">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Delivery</span>
                              <span>{formatCurrency(order.deliveryCharge)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xl font-semibold">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </PanelCard>
      </section>
      </MobileAdminSection>

      <MobileAdminSection
        id="settings"
        title="Settings"
        description="Update WhatsApp number and business hours."
      >
      <section>
        <PanelCard
          title="Settings"
          description="Only the essential settings are shown here so daily updates stay easy."
          compactHeaderOnMobile
        >
          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <SimpleSettingsForm settings={settings} />

            <div className="rounded-[1.75rem] border border-black/6 bg-surface-muted p-5 md:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cheese-500">
                Current values
              </p>
              <div className="mt-5 grid gap-4">
                <div className="rounded-[1.5rem] bg-white/82 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                    WhatsApp number
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-ink-950">
                    {settings.whatsappNumber}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white/82 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-700/55">
                    Business hours
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-ink-950">
                    {settings.businessHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PanelCard>
      </section>
      </MobileAdminSection>
    </MobileAdminSections>
  );
}
