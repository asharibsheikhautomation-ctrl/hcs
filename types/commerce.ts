export type UUID = string;

export type CategorySlug = string;
export type AccentTone = "gold" | "frost" | "ink";
export type ProductStockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type DealStatus = "scheduled" | "active" | "archived";
export type DealDiscountType = "percentage" | "fixed" | "bundle";
export type VoucherDiscountType = "fixed" | "percentage";
export type OrderStatus =
  | "New"
  | "Contacted"
  | "Confirmed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";
export type OrderItemType = "product" | "deal";
export type CheckoutPhase = "editing" | "submitting" | "submitted";

export interface Category {
  id: UUID;
  slug: CategorySlug;
  name: string;
  description: string;
  imageUrl?: string | null;
  accentTone: AccentTone;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: UUID;
  categoryId: UUID;
  categorySlug: CategorySlug;
  categoryName: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  unitLabel: string;
  badge?: string | null;
  stockStatus: ProductStockStatus;
  isFeatured: boolean;
  isFrozen: boolean;
  accentTone: AccentTone;
  imageUrl?: string | null;
  galleryUrls?: string[];
  createdAt?: string;
}

export interface Deal {
  id: UUID;
  slug: string;
  name: string;
  headline: string;
  description: string;
  savingsLabel: string;
  bannerImageUrl?: string | null;
  discountType: DealDiscountType;
  discountValue: number;
  startsAt?: string | null;
  endsAt?: string | null;
  status: DealStatus;
  isActive: boolean;
  isFeatured: boolean;
  accentTone: AccentTone;
  includedItems: DealIncludedItem[];
  originalTotal: number;
  dealPrice: number;
}

export interface DealItem {
  id: UUID;
  dealId: UUID;
  productId: UUID | null;
  quantity: number;
  customName?: string | null;
  customPrice?: number | null;
  customUnitLabel?: string | null;
  customImageUrl?: string | null;
}

export interface DealIncludedItem {
  id: UUID;
  dealId: UUID;
  productId: UUID | null;
  productSlug?: string | null;
  productName: string;
  quantity: number;
  unitLabel?: string | null;
  unitPrice: number;
  imageUrl?: string | null;
  source?: "product" | "custom";
}

export interface DeliveryZoneArea {
  id: UUID;
  deliveryZoneId: UUID;
  slug: string;
  name: string;
  deliveryCharge: number;
  description?: string | null;
  isActive: boolean;
  sortOrder?: number;
}

export interface DeliveryZone {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  deliveryCharge: number;
  freeDeliveryMinimum: number;
  estimatedDeliveryTime: string;
  accentTone: AccentTone;
  isActive: boolean;
  sortOrder?: number;
  areas: DeliveryZoneArea[];
}

export interface CartLine {
  id: UUID;
  itemType: OrderItemType;
  productId: UUID | null;
  slug?: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number | null;
  unitLabel?: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  imageUrl?: string | null;
  badge?: string | null;
  includedItems?: DealIncludedItem[] | null;
}

export interface Voucher {
  id: UUID;
  code: string;
  name: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  timesUsed: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemProductSnapshot {
  productId: UUID | null;
  slug?: string | null;
  name: string;
  itemType: OrderItemType;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number | null;
  unitLabel?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  imageUrl?: string | null;
  badge?: string | null;
  includedItems?: DealIncludedItem[] | null;
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemType: OrderItemType;
  productSnapshot: OrderItemProductSnapshot;
}

export interface Order {
  id: UUID;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string | null;
  deliveryZoneId: UUID | null;
  deliveryZoneName: string;
  deliveryZoneAreaId?: UUID | null;
  deliveryZoneAreaName?: string | null;
  voucherId?: UUID | null;
  voucherCode?: string | null;
  discountAmount: number;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  whatsappSent: boolean;
  items: OrderItem[];
  createdAt: string;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  tagline: string;
  whatsappNumber: string;
  logoUrl: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  homepageStoryTitle: string;
  homepageStoryBody: string;
  productsSectionTitle: string;
  dealsSectionTitle: string;
  contactSectionTitle: string;
  announcementBar: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  currencyCode: "PKR";
}

export interface DashboardMetric {
  label: string;
  value: string;
  hint: string;
}

export interface WhatsAppOrderPayload {
  orderNumber?: string;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  deliveryZoneName: string;
  deliveryZoneAreaName: string;
  voucherCode?: string | null;
  discountAmount?: number;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  items: CartLine[];
}

export interface CheckoutFormValues {
  customerName: string;
  phone: string;
  address: string;
  note: string;
  voucherCode: string;
  deliveryZoneId: string;
  deliveryZoneAreaId: string;
}

export interface CheckoutPricing {
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  deliveryCharge: number;
  total: number;
  qualifiesForFreeDelivery: boolean;
  freeDeliveryMinimum: number;
  remainingForFreeDelivery: number;
}

export interface CheckoutDraft {
  phase: CheckoutPhase;
  form: CheckoutFormValues;
}

export type CheckoutAction =
  | {
      type: "updateField";
      field: Exclude<
        keyof CheckoutFormValues,
        "deliveryZoneId" | "deliveryZoneAreaId"
      >;
      value: string;
    }
  | {
      type: "selectZone";
      deliveryZoneId: string;
      deliveryZoneAreaId: string;
    }
  | {
      type: "selectArea";
      deliveryZoneAreaId: string;
    }
  | {
      type: "setPhase";
      phase: CheckoutPhase;
    }
  | {
      type: "reset";
      deliveryZoneId?: string;
      deliveryZoneAreaId?: string;
    };
