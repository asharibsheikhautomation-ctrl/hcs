import { NextResponse, type NextRequest } from "next/server";
import { buildAdminRedirectPath, isAdminRequestAuthenticated } from "@/lib/admin-auth";
import { buildCsv, createCsvDownloadResponse } from "@/lib/admin/csv";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(
    new URL(
      buildAdminRedirectPath(request.nextUrl.pathname, request.nextUrl.search),
      request.url,
    ),
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return redirectToLogin(request);
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name"),
      supabase
        .from("products")
        .select(
          "id, category_id, name, description, short_description, base_price, sale_price, image_url, is_active, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);

  if (categoriesError) {
    throw new Error(categoriesError.message);
  }

  if (productsError) {
    throw new Error(productsError.message);
  }

  const categoryNameById = new Map(
    (categories ?? []).map((category) => [category.id, category.name]),
  );

  const csv = buildCsv(
    [
      "id",
      "name",
      "category",
      "description",
      "price",
      "sale_price",
      "image_url",
      "is_active",
      "created_at",
    ],
    (products ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      category: categoryNameById.get(product.category_id) ?? "",
      description: product.description ?? product.short_description ?? "",
      price: product.base_price,
      sale_price: product.sale_price ?? "",
      image_url: product.image_url ?? "",
      is_active: product.is_active,
      created_at: product.created_at,
    })),
  );

  return createCsvDownloadResponse(
    "hyderabad-cheese-store-products.csv",
    csv,
  );
}
