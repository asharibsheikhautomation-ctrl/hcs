export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/deals", label: "Deals" },
  { href: "/contact", label: "Contact" },
  { href: "/checkout", label: "Checkout" },
] as const;

export const adminNavigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/delivery-zones", label: "Delivery Zones" },
  { href: "/admin/settings", label: "Settings" },
] as const;
