import type { OrderItemProductSnapshot, OrderItemType, OrderStatus } from "@/types/commerce";

export type AdminFormStatus = "idle" | "success" | "error";

export interface AdminActionState {
  status: AdminFormStatus;
  message: string;
  fieldErrors: Record<string, string>;
  details?: string[];
}

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  details: [],
};

export const initialAdminImportActionState: AdminActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  details: [],
};

export interface AdminOption {
  value: string;
  label: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface AdminProduct {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  regularPrice: number;
  salePrice: number | null;
  sku: string;
  imageUrl: string;
  galleryUrls: string[];
  stockQuantity: number;
  unitLabel: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface AdminDeal {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerImageUrl: string;
  discountType: "percentage" | "fixed" | "bundle";
  discountValue: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isFeatured: boolean;
  linkedProductIds: string[];
  linkedProductNames: string[];
  customItems: AdminDealCustomItem[];
}

export interface AdminDealCustomItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unitLabel: string;
  imageUrl: string;
}

export interface AdminDeliveryZoneArea {
  id: string;
  zoneId: string;
  areaName: string;
  deliveryCharge: number;
  description: string;
}

export interface AdminDeliveryZone {
  id: string;
  name: string;
  slug: string;
  description: string;
  deliveryCharge: number;
  freeDeliveryMinimum: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
  sortOrder: number;
  areas: AdminDeliveryZoneArea[];
}

export interface AdminSiteSettings {
  id: number;
  siteName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber: string;
  announcementBar: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  businessHours: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  homepageStoryTitle: string;
  homepageStoryBody: string;
  productsSectionTitle: string;
  dealsSectionTitle: string;
  contactSectionTitle: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  deliveryLabel: string;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  whatsappSent: boolean;
  createdAt: string;
}

export type AdminOrderSort = "newest" | "oldest";

export interface AdminOrderFilters {
  query: string;
  status: "all" | OrderStatus;
  sort: AdminOrderSort;
}

export interface AdminOrderLineItem {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  itemType: OrderItemType;
  productSnapshot: OrderItemProductSnapshot;
  createdAt: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  whatsappMessage: string;
  items: AdminOrderLineItem[];
}

export interface AdminDashboardData {
  totalProducts: number;
  totalCategories: number;
  totalActiveDeals: number;
  totalOrders: number;
  recentOrders: AdminOrderSummary[];
}
