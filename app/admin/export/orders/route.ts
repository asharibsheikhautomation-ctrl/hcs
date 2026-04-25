import { NextResponse, type NextRequest } from "next/server";
import { buildAdminRedirectPath, isAdminRequestAuthenticated } from "@/lib/admin-auth";
import { buildCsv, createCsvDownloadResponse } from "@/lib/admin/csv";
import { fetchAdminOrdersWithItems } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(
    new URL(
      buildAdminRedirectPath(request.nextUrl.pathname, request.nextUrl.search),
      request.url,
    ),
  );
}

function buildItemsSummary(items: Awaited<ReturnType<typeof fetchAdminOrdersWithItems>>[number]["items"]) {
  return items
    .map(
      (item) =>
        `${item.productName} x${item.quantity} @ ${item.unitPrice} = ${item.lineTotal}`,
    )
    .join(" | ");
}

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return redirectToLogin(request);
  }

  const orders = await fetchAdminOrdersWithItems();
  const csv = buildCsv(
    [
      "order_number",
      "customer_name",
      "phone",
      "address",
      "delivery_zone_name",
      "subtotal",
      "delivery_charge",
      "total",
      "status",
      "order_note",
      "created_at",
      "items_summary",
    ],
    orders.map((order) => ({
      order_number: order.orderNumber,
      customer_name: order.customerName,
      phone: order.phone,
      address: order.address,
      delivery_zone_name: order.deliveryLabel,
      subtotal: order.subtotal,
      delivery_charge: order.deliveryCharge,
      total: order.total,
      status: order.status,
      order_note: order.note,
      created_at: order.createdAt,
      items_summary: buildItemsSummary(order.items),
    })),
  );

  return createCsvDownloadResponse("hyderabad-cheese-store-orders.csv", csv);
}
