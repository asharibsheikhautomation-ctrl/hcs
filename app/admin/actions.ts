"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCsv } from "@/lib/admin/csv";
import { uploadAdminImage } from "@/lib/admin-media";
import { siteSettings as demoSiteSettings } from "@/lib/demo-data";
import { buildDealSavingsLabel } from "@/lib/deal-utils";
import { ORDER_STATUSES } from "@/lib/orders";
import {
  clearAdminSessionCookie,
  requireAdminSession,
  setAdminSessionCookie,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import { fetchAdminSiteSettings } from "@/lib/admin-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/types/admin";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

const PRODUCT_IMPORT_REQUIRED_COLUMNS = ["name", "price"] as const;
const MAX_IMPORT_DETAILS = 12;

function successState(
  message: string,
  details: string[] = [],
): AdminActionState {
  return {
    status: "success",
    message,
    fieldErrors: {},
    details,
  };
}

function errorState(
  message: string,
  fieldErrors: Record<string, string> = {},
  details: string[] = [],
): AdminActionState {
  return {
    status: "error",
    message,
    fieldErrors,
    details,
  };
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size <= 0) {
    return null;
  }

  return value;
}

function getInteger(formData: FormData, key: string) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return 0;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function getDecimal(formData: FormData, key: string) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return 0;
  }

  const parsedValue = Number.parseFloat(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function getOptionalDecimal(formData: FormData, key: string) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return null;
  }

  const parsedValue = Number.parseFloat(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function getDateTimeValue(formData: FormData, key: string) {
  const rawValue = getString(formData, key);

  if (!rawValue) {
    return null;
  }

  const date = new Date(rawValue);

  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function isValidSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isValidHexColor(value: string) {
  return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function parseGalleryUrls(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getCheckboxValues(formData: FormData, key: string) {
  return Array.from(
    new Set(
      formData
        .getAll(key)
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean),
    ),
  );
}

async function calculateDealIncludedValue(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  linkedProductIds: string[],
) {
  let linkedProductsValue = 0;

  if (linkedProductIds.length > 0) {
    const { data: linkedProducts, error } = await supabase
      .from("products")
      .select("id, base_price, sale_price")
      .in("id", linkedProductIds);

    if (error) {
      throw error;
    }

    linkedProductsValue = (linkedProducts ?? []).reduce(
      (total, product) => total + Number(product.sale_price ?? product.base_price),
      0,
    );
  }

  return linkedProductsValue;
}

function getStockStatus(stockQuantity: number) {
  if (stockQuantity <= 0) {
    return "out_of_stock";
  }

  if (stockQuantity <= 5) {
    return "low_stock";
  }

  return "in_stock";
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);
}

function normalizeLookupValue(value: string) {
  return value.trim().toLowerCase();
}

function parseImportDecimal(value: string) {
  const normalizedValue = value
    .trim()
    .replace(/,/g, "")
    .replace(/rs\.?/gi, "")
    .replace(/pkr/gi, "");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function parseImportBoolean(value: string) {
  const normalizedValue = normalizeLookupValue(value);

  if (!normalizedValue) {
    return null;
  }

  if (
    ["true", "1", "yes", "y", "active", "on"].includes(normalizedValue)
  ) {
    return true;
  }

  if (
    ["false", "0", "no", "n", "inactive", "off"].includes(normalizedValue)
  ) {
    return false;
  }

  return undefined;
}

function summarizeImportDetails(details: string[]) {
  if (details.length <= MAX_IMPORT_DETAILS) {
    return details;
  }

  return [
    ...details.slice(0, MAX_IMPORT_DETAILS),
    `${details.length - MAX_IMPORT_DETAILS} more rows failed. Fix the CSV and import again.`,
  ];
}

async function getOrCreateSimpleProductCategory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data: existingCategory, error: existingCategoryError } = await supabase
    .from("categories")
    .select("id, slug, accent_tone")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingCategoryError) {
    throw existingCategoryError;
  }

  if (existingCategory) {
    return existingCategory;
  }

  const { data: createdCategory, error: createCategoryError } = await supabase
    .from("categories")
    .upsert(
      {
        slug: "extra-items",
        name: "Extra Items",
        description: "General products managed from the simplified admin panel.",
        accent_tone: "gold",
        sort_order: 0,
        is_active: true,
      } satisfies TablesInsert<"categories">,
      { onConflict: "slug" },
    )
    .select("id, slug, accent_tone")
    .maybeSingle();

  if (createCategoryError) {
    throw createCategoryError;
  }

  if (!createdCategory) {
    throw new Error("A default category could not be prepared for products.");
  }

  return createdCategory;
}

async function buildUniqueProductSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  name: string,
  currentId?: string,
) {
  return buildUniqueSlug(supabase, "products", name, currentId);
}

async function buildUniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: "categories" | "products" | "deals" | "delivery_zones",
  name: string,
  currentId?: string,
) {
  const baseSlug = slugifyValue(name) || "item";

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    let query = supabase
      .from(table)
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (currentId) {
      query = query.neq("id", currentId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now().toString().slice(-5)}`;
}

async function resolveUploadedImageUrl({
  formData,
  fileKey,
  urlKey,
  folder,
  slugSource,
}: {
  formData: FormData;
  fileKey: string;
  urlKey: string;
  folder: "categories" | "products" | "deals";
  slugSource: string;
}) {
  const upload = getFile(formData, fileKey);
  const manualUrl = getString(formData, urlKey);

  if (!upload) {
    return manualUrl || null;
  }

  return uploadAdminImage({
    file: upload,
    folder,
    slugSource,
  });
}

function buildImportedProductValues({
  category,
  name,
  description,
  price,
  salePrice,
  imageUrl,
  isActive,
}: {
  category: Pick<Tables<"categories">, "id" | "slug" | "accent_tone">;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  isActive: boolean;
}) {
  return {
    category_id: category.id,
    name,
    short_description: description ? description.slice(0, 120) : null,
    description: description || null,
    image_url: imageUrl,
    gallery_urls: imageUrl ? [imageUrl] : [],
    base_price: price,
    sale_price: salePrice,
    compare_at_price: salePrice !== null ? price : null,
    is_active: isActive,
    is_frozen: category.slug === "frozen-food",
    accent_tone: category.accent_tone ?? "gold",
  };
}

export async function loginAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const username = getString(formData, "username");
  const password = getString(formData, "password");
  const nextPath = getString(formData, "next") || "/admin";

  if (!username || !password) {
    return errorState("Enter both admin username and password.", {
      username: !username ? "Username is required." : "",
      password: !password ? "Password is required." : "",
    });
  }

  const credentials = validateAdminCredentials(username, password);

  if (!credentials.ok) {
    return errorState(credentials.message, {
      password: credentials.message,
    });
  }

  await setAdminSessionCookie(username);
  redirect(nextPath);
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin-login");
}

export async function saveCategoryAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin/categories");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const requestedSlug = getString(formData, "slug");
  const description = getString(formData, "description");
  const sortOrder = getInteger(formData, "sortOrder");
  const isActive = getBoolean(formData, "isActive");
  const fieldErrors: Record<string, string> = {};
  let slug = requestedSlug;

  if (!name) {
    fieldErrors.name = "Category name is required.";
  }

  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    fieldErrors.sortOrder = "Sort order must be zero or greater.";
  }

  if (!slug) {
    if (id) {
      const { data: currentCategory, error: currentCategoryError } = await supabase
        .from("categories")
        .select("slug")
        .eq("id", id)
        .maybeSingle();

      if (currentCategoryError) {
        return errorState(currentCategoryError.message);
      }

      slug =
        currentCategory?.slug ||
        (await buildUniqueSlug(supabase, "categories", name, id || undefined));
    } else {
      slug = await buildUniqueSlug(supabase, "categories", name);
    }
  }

  if (!slug || !isValidSlug(slug)) {
    fieldErrors.slug = "Use a lowercase slug like frozen-food.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fix the category form.", fieldErrors);
  }

  let imageUrl: string | null = null;

  try {
    imageUrl = await resolveUploadedImageUrl({
      formData,
      fileKey: "imageFile",
      urlKey: "imageUrl",
      folder: "categories",
      slugSource: slug,
    });
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Category image upload could not be completed.",
      { imageUrl: "Please upload a valid category image." },
    );
  }

  const values = {
    name,
    slug,
    description: description || null,
    image_url: imageUrl || null,
    sort_order: sortOrder,
    is_active: isActive,
    accent_tone: "gold",
  };

  const { error } = id
    ? await supabase
        .from("categories")
        .update(values satisfies TablesUpdate<"categories">)
        .eq("id", id)
    : await supabase
        .from("categories")
        .insert(values satisfies TablesInsert<"categories">);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/products");

  return successState(id ? "Category updated." : "Category created.");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdminSession("/admin/categories");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
}

export async function saveProductAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin/products");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const categoryId = getString(formData, "categoryId");
  const name = getString(formData, "name");
  const requestedSlug = getString(formData, "slug");
  const shortDescription = getString(formData, "shortDescription");
  const description = getString(formData, "description");
  const regularPrice = getDecimal(formData, "regularPrice");
  const salePrice = getOptionalDecimal(formData, "salePrice");
  const sku = getString(formData, "sku");
  const galleryUrls = parseGalleryUrls(getString(formData, "galleryUrls"));
  const stockQuantity = getInteger(formData, "stockQuantity");
  const unitLabel = getString(formData, "unitLabel") || "unit";
  const isFeatured = getBoolean(formData, "isFeatured");
  const isActive = getBoolean(formData, "isActive");
  const fieldErrors: Record<string, string> = {};
  let slug = requestedSlug;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, accent_tone")
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryError) {
    return errorState(categoryError.message);
  }

  if (!category) {
    fieldErrors.categoryId = "Choose a valid category.";
  }

  if (!name) {
    fieldErrors.name = "Product name is required.";
  }

  if (!slug) {
    if (id) {
      const { data: currentProduct, error: currentProductError } = await supabase
        .from("products")
        .select("slug")
        .eq("id", id)
        .maybeSingle();

      if (currentProductError) {
        return errorState(currentProductError.message);
      }

      slug =
        currentProduct?.slug ||
        (await buildUniqueSlug(supabase, "products", name, id || undefined));
    } else {
      slug = await buildUniqueSlug(supabase, "products", name);
    }
  }

  if (!slug || !isValidSlug(slug)) {
    fieldErrors.slug = "Use a lowercase slug like pizza-mozzarella.";
  }

  if (!Number.isFinite(regularPrice) || regularPrice <= 0) {
    fieldErrors.regularPrice = "Price must be greater than zero.";
  }

  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
    fieldErrors.salePrice = "Sale price must be zero or greater.";
  }

  if (
    salePrice !== null &&
    Number.isFinite(regularPrice) &&
    salePrice > regularPrice
  ) {
    fieldErrors.salePrice = "Sale price cannot be greater than price.";
  }

  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
    fieldErrors.stockQuantity = "Stock quantity must be zero or greater.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fix the product form.", fieldErrors);
  }

  let imageUrl: string | null = null;

  try {
    imageUrl = await resolveUploadedImageUrl({
      formData,
      fileKey: "imageFile",
      urlKey: "imageUrl",
      folder: "products",
      slugSource: slug,
    });
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Product image upload could not be completed.",
      { imageUrl: "Please upload a valid product image." },
    );
  }

  const values = {
    category_id: categoryId,
    name,
    slug,
    short_description: shortDescription || null,
    description: description || null,
    image_url: imageUrl || null,
    gallery_urls: galleryUrls as unknown as Json,
    sku: sku || null,
    base_price: regularPrice,
    sale_price: salePrice,
    compare_at_price: salePrice ? regularPrice : null,
    unit_label: unitLabel,
    stock_quantity: stockQuantity,
    stock_status: getStockStatus(stockQuantity),
    is_featured: isFeatured,
    is_active: isActive,
    is_frozen: category?.slug === "frozen-food",
    accent_tone: category?.accent_tone ?? "gold",
    badge: null,
    sort_order: 0,
  };

  const { error } = id
    ? await supabase
        .from("products")
        .update(values satisfies TablesUpdate<"products">)
        .eq("id", id)
    : await supabase
        .from("products")
        .insert(values satisfies TablesInsert<"products">);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return successState(id ? "Product updated." : "Product created.");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession("/admin/products");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function saveSimpleProductAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const categoryId = getString(formData, "categoryId");
  const name = getString(formData, "name");
  const description = getString(formData, "description");
  const price = getDecimal(formData, "price");
  const fieldErrors: Record<string, string> = {};

  if (!name) {
    fieldErrors.name = "Product name is required.";
  }

  if (!description) {
    fieldErrors.description = "Product description is required.";
  }

  if (!Number.isFinite(price) || price <= 0) {
    fieldErrors.price = "Price must be greater than zero.";
  }

  let category: Awaited<ReturnType<typeof getOrCreateSimpleProductCategory>> | null =
    null;

  if (categoryId) {
    const { data: selectedCategory, error: selectedCategoryError } = await supabase
      .from("categories")
      .select("id, slug, accent_tone")
      .eq("id", categoryId)
      .maybeSingle();

    if (selectedCategoryError) {
      return errorState(selectedCategoryError.message);
    }

    category = selectedCategory;
  } else {
    category = await getOrCreateSimpleProductCategory(supabase);
  }

  if (!category) {
    fieldErrors.categoryId = "Choose a valid category.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fill in all product details.", fieldErrors);
  }

  if (!category) {
    return errorState("Please fill in all product details.", {
      categoryId: "Choose a valid category.",
    });
  }

  let slug = await buildUniqueProductSlug(supabase, name, id || undefined);

  if (id) {
    const { data: currentProduct, error: currentProductError } = await supabase
      .from("products")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    if (currentProductError) {
      return errorState(currentProductError.message);
    }

    if (currentProduct?.slug) {
      slug = currentProduct.slug;
    }
  }

  let imageUrl: string | null = null;

  try {
    imageUrl = await resolveUploadedImageUrl({
      formData,
      fileKey: "imageFile",
      urlKey: "imageUrl",
      folder: "products",
      slugSource: slug,
    });
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Product image upload could not be completed.",
      { imageUrl: "Please upload a valid product image." },
    );
  }

  if (!imageUrl) {
    return errorState("Please fill in all product details.", {
      imageUrl: "Product image is required.",
    });
  }

  const values = {
    category_id: category.id,
    slug,
    name,
    short_description: description.slice(0, 120),
    description,
    image_url: imageUrl,
    gallery_urls: [imageUrl] as unknown as Json,
    badge: null,
    sku: null,
    base_price: price,
    sale_price: null,
    compare_at_price: null,
    unit_label: "unit",
    stock_quantity: 100,
    stock_status: "in_stock",
    is_featured: false,
    is_active: true,
    is_frozen: category.slug === "frozen-food",
    accent_tone: category.accent_tone ?? "gold",
    sort_order: 0,
  };

  const { error } = id
    ? await supabase
        .from("products")
        .update(values satisfies TablesUpdate<"products">)
        .eq("id", id)
    : await supabase
        .from("products")
        .insert(values satisfies TablesInsert<"products">);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/deals");

  return successState(id ? "Product updated." : "Product added.");
}

export async function deleteSimpleProductAction(formData: FormData) {
  await requireAdminSession("/admin");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/deals");
}

export async function importProductsCsvAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin#products");

  const file = getFile(formData, "file");

  if (!file) {
    return errorState("Please upload a CSV file first.", {
      file: "Choose a CSV file to import products.",
    });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return errorState(
      "Please upload a CSV file. XLSX import is not enabled yet.",
      {
        file: "Use a .csv file with the product columns.",
      },
    );
  }

  let parsedCsv: ReturnType<typeof parseCsv>;

  try {
    parsedCsv = parseCsv(await file.text());
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "The CSV file could not be read.",
      {
        file: "Use a valid CSV file with a header row.",
      },
    );
  }

  const missingColumns = PRODUCT_IMPORT_REQUIRED_COLUMNS.filter(
    (column) => !parsedCsv.headers.includes(column),
  );

  if (missingColumns.length > 0) {
    return errorState(
      `The CSV is missing required columns: ${missingColumns.join(", ")}.`,
      {
        file: "Add the required columns and import again.",
      },
    );
  }

  if (parsedCsv.rows.length === 0) {
    return errorState("The CSV does not contain any product rows.", {
      file: "Add at least one product row below the header.",
    });
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from("categories").select("id, name, slug, accent_tone"),
      supabase.from("products").select("*"),
    ]);

  if (categoriesError) {
    return errorState(categoriesError.message);
  }

  if (productsError) {
    return errorState(productsError.message);
  }

  if (!categories || categories.length === 0) {
    return errorState("Create at least one category before importing products.");
  }

  const categoryByLookup = new Map<
    string,
    Pick<Tables<"categories">, "id" | "name" | "slug" | "accent_tone">
  >();

  for (const category of categories) {
    categoryByLookup.set(normalizeLookupValue(category.name), category);
    categoryByLookup.set(normalizeLookupValue(category.slug), category);
    categoryByLookup.set(normalizeLookupValue(slugifyValue(category.name)), category);
  }

  const productsByName = new Map<string, Tables<"products">>();

  for (const product of products ?? []) {
    productsByName.set(normalizeLookupValue(product.name), product);
  }

  let successCount = 0;
  const failureDetails: string[] = [];

  for (const row of parsedCsv.rows) {
    const name = row.values.name?.trim() ?? "";
    const description = row.values.description?.trim() ?? "";
    const categoryInput = row.values.category?.trim() ?? "";
    const imageUrl = row.values.image_url?.trim() || null;
    const price = parseImportDecimal(row.values.price ?? "");
    const salePriceRaw = parseImportDecimal(row.values.sale_price ?? "");
    const isActiveRaw = parseImportBoolean(row.values.is_active ?? "");
    const existingProduct = productsByName.get(normalizeLookupValue(name));
    const category =
      categoryByLookup.get(normalizeLookupValue(categoryInput)) ??
      categoryByLookup.get(normalizeLookupValue(slugifyValue(categoryInput))) ??
      (existingProduct
        ? categories.find((item) => item.id === existingProduct.category_id) ?? null
        : null);

    if (!name) {
      failureDetails.push(`Row ${row.rowNumber}: Product name is required.`);
      continue;
    }

    if (price === null || !Number.isFinite(price) || price <= 0) {
      failureDetails.push(
        `Row ${row.rowNumber}: Price must be a valid number greater than zero.`,
      );
      continue;
    }

    if (salePriceRaw !== null && (!Number.isFinite(salePriceRaw) || salePriceRaw < 0)) {
      failureDetails.push(
        `Row ${row.rowNumber}: Sale price must be zero or greater.`,
      );
      continue;
    }

    if (salePriceRaw !== null && salePriceRaw > price) {
      failureDetails.push(
        `Row ${row.rowNumber}: Sale price cannot be greater than price.`,
      );
      continue;
    }

    if (isActiveRaw === undefined) {
      failureDetails.push(
        `Row ${row.rowNumber}: is_active should be true/false, yes/no, or 1/0.`,
      );
      continue;
    }

    if (!category) {
      failureDetails.push(
        `Row ${row.rowNumber}: Category "${categoryInput || "blank"}" was not found. Use an existing category name or slug.`,
      );
      continue;
    }

    const isActive = isActiveRaw ?? existingProduct?.is_active ?? true;
    const salePrice = salePriceRaw ?? null;
    const baseValues = buildImportedProductValues({
      category,
      name,
      description,
      price,
      salePrice,
      imageUrl,
      isActive,
    });

    if (existingProduct) {
      const { data: updatedProduct, error: updateError } = await supabase
        .from("products")
        .update(baseValues satisfies TablesUpdate<"products">)
        .eq("id", existingProduct.id)
        .select("*")
        .single();

      if (updateError || !updatedProduct) {
        failureDetails.push(
          `Row ${row.rowNumber}: ${updateError?.message ?? "Product could not be updated."}`,
        );
        continue;
      }

      productsByName.set(normalizeLookupValue(updatedProduct.name), updatedProduct);
      successCount += 1;
      continue;
    }

    let slug = "";

    try {
      slug = await buildUniqueProductSlug(supabase, name);
    } catch (error) {
      failureDetails.push(
        `Row ${row.rowNumber}: ${
          error instanceof Error ? error.message : "Product slug could not be prepared."
        }`,
      );
      continue;
    }

    const { data: insertedProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        ...baseValues,
        slug,
        badge: null,
        sku: null,
        unit_label: "unit",
        stock_quantity: 100,
        stock_status: "in_stock",
        is_featured: false,
        sort_order: 0,
      } satisfies TablesInsert<"products">)
      .select("*")
      .single();

    if (insertError || !insertedProduct) {
      failureDetails.push(
        `Row ${row.rowNumber}: ${insertError?.message ?? "Product could not be created."}`,
      );
      continue;
    }

    productsByName.set(normalizeLookupValue(insertedProduct.name), insertedProduct);
    successCount += 1;
  }

  if (successCount === 0) {
    return errorState(
      "No products were imported.",
      {},
      summarizeImportDetails(failureDetails),
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/deals");

  if (failureDetails.length > 0) {
    return errorState(
      `${successCount} products imported successfully. ${failureDetails.length} rows failed.`,
      {},
      summarizeImportDetails(failureDetails),
    );
  }

  return successState(`${successCount} products imported successfully.`);
}

export async function saveDealAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin/deals");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const title = getString(formData, "title");
  const requestedSlug = getString(formData, "slug");
  const description = getString(formData, "description");
  const discountType = getString(formData, "discountType") || "percentage";
  const discountValue = getDecimal(formData, "discountValue");
  const offerPrice = getOptionalDecimal(formData, "offerPrice");
  const startsAt = getDateTimeValue(formData, "startsAt");
  const endsAt = getDateTimeValue(formData, "endsAt");
  const isActive = getBoolean(formData, "isActive");
  const isFeatured = getBoolean(formData, "isFeatured");
  const linkedProductIds = getCheckboxValues(formData, "linkedProductIds");
  const fieldErrors: Record<string, string> = {};
  let slug = requestedSlug;

  if (!title) {
    fieldErrors.title = "Deal title is required.";
  }

  if (!slug) {
    if (id) {
      const { data: currentDeal, error: currentDealError } = await supabase
        .from("deals")
        .select("slug")
        .eq("id", id)
        .maybeSingle();

      if (currentDealError) {
        return errorState(currentDealError.message);
      }

      slug =
        currentDeal?.slug ||
        (await buildUniqueSlug(supabase, "deals", title, id || undefined));
    } else {
      slug = await buildUniqueSlug(supabase, "deals", title);
    }
  }

  if (!slug || !isValidSlug(slug)) {
    fieldErrors.slug = "Use a lowercase slug like weekend-box.";
  }

  if (!description) {
    fieldErrors.description = "Deal description is required.";
  }

  if (!["percentage", "fixed", "bundle"].includes(discountType)) {
    fieldErrors.discountType = "Choose a valid discount type.";
  }

  if (!Number.isFinite(discountValue) || discountValue < 0) {
    fieldErrors.discountValue = "Discount value must be zero or greater.";
  }

  if (offerPrice !== null && (!Number.isFinite(offerPrice) || offerPrice <= 0)) {
    fieldErrors.offerPrice = "Offer price must be greater than zero.";
  }

  if (startsAt && endsAt && startsAt > endsAt) {
    fieldErrors.endsAt = "End date must be after the start date.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fix the deal form.", fieldErrors);
  }

  let includedValue = 0;

  try {
    includedValue = await calculateDealIncludedValue(
      supabase,
      linkedProductIds,
    );
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Included items total could not be calculated.",
    );
  }

  if (offerPrice !== null) {
    if (includedValue <= 0) {
      return errorState("Add at least one deal item before setting an offer price.", {
        offerPrice: "Offer price needs included products to calculate savings.",
      });
    }

    if (offerPrice > includedValue) {
      return errorState("Offer price cannot be greater than the total included items value.", {
        offerPrice: "Set a price that is lower than or equal to the included items total.",
      });
    }
  }

  let bannerImageUrl: string | null = null;

  try {
    bannerImageUrl = await resolveUploadedImageUrl({
      formData,
      fileKey: "bannerImageFile",
      urlKey: "bannerImageUrl",
      folder: "deals",
      slugSource: slug,
    });
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Deal banner upload could not be completed.",
      { bannerImageUrl: "Please upload a valid banner image." },
    );
  }

  const effectiveDiscountType =
    offerPrice !== null
      ? "fixed"
      : (discountType as "percentage" | "fixed" | "bundle");
  const effectiveDiscountValue =
    offerPrice !== null
      ? Math.max(includedValue - offerPrice, 0)
      : discountValue;
  const savingsLabel =
    offerPrice !== null && includedValue > 0
      ? `Worth PKR ${includedValue.toLocaleString("en-PK")} - Offer PKR ${offerPrice.toLocaleString("en-PK")}`
      : buildDealSavingsLabel(
          effectiveDiscountType,
          effectiveDiscountValue,
        );

  const values = {
    name: title,
    slug,
    headline: description.slice(0, 120),
    description,
    savings_label: savingsLabel,
    banner_image_url: bannerImageUrl || null,
    banner_tone: "gold",
    discount_type: effectiveDiscountType,
    discount_value: effectiveDiscountValue,
    starts_at: startsAt,
    ends_at: endsAt,
    is_active: isActive,
    is_featured: isFeatured,
  };

  const result = id
    ? await supabase
        .from("deals")
        .update(values satisfies TablesUpdate<"deals">)
        .eq("id", id)
        .select("id")
        .single()
    : await supabase
        .from("deals")
        .insert(values satisfies TablesInsert<"deals">)
        .select("id")
        .single();

  if (result.error || !result.data) {
    return errorState(result.error?.message ?? "Unable to save the deal.");
  }

  const dealId = result.data.id;

  const { error: deleteItemsError } = await supabase
    .from("deal_items")
    .delete()
    .eq("deal_id", dealId);

  if (deleteItemsError) {
    return errorState(deleteItemsError.message);
  }

  if (linkedProductIds.length > 0) {
    const dealItems: TablesInsert<"deal_items">[] = linkedProductIds.map(
      (productId) => ({
        deal_id: dealId,
        product_id: productId,
        quantity: 1,
      }),
    );

    const { error: insertItemsError } = await supabase
      .from("deal_items")
      .insert(dealItems);

    if (insertItemsError) {
      return errorState(insertItemsError.message);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/deals");
  revalidatePath("/deals");
  revalidatePath("/");

  return successState(id ? "Deal updated." : "Deal created.");
}

export async function deleteDealAction(formData: FormData) {
  await requireAdminSession("/admin/deals");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await supabase.from("deals").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/deals");
  revalidatePath("/deals");
  revalidatePath("/");
}

export async function saveDeliveryZoneAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin/delivery-zones");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const name = getString(formData, "name");
  const requestedSlug = getString(formData, "slug");
  const description = getString(formData, "description");
  const deliveryCharge = getDecimal(formData, "deliveryCharge");
  const freeDeliveryMinimum = getDecimal(formData, "freeDeliveryMinimum");
  const estimatedDeliveryTime = getString(formData, "estimatedDeliveryTime");
  const sortOrder = getInteger(formData, "sortOrder");
  const isActive = getBoolean(formData, "isActive");
  const fieldErrors: Record<string, string> = {};
  let slug = requestedSlug;

  if (!name) {
    fieldErrors.name = "Zone name is required.";
  }

  if (!slug) {
    if (id) {
      const { data: currentZone, error: currentZoneError } = await supabase
        .from("delivery_zones")
        .select("slug")
        .eq("id", id)
        .maybeSingle();

      if (currentZoneError) {
        return errorState(currentZoneError.message);
      }

      slug =
        currentZone?.slug ||
        (await buildUniqueSlug(
          supabase,
          "delivery_zones",
          name,
          id || undefined,
        ));
    } else {
      slug = await buildUniqueSlug(supabase, "delivery_zones", name);
    }
  }

  if (!slug || !isValidSlug(slug)) {
    fieldErrors.slug = "Use a lowercase slug like latifabad.";
  }

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    fieldErrors.deliveryCharge = "Delivery charge must be zero or greater.";
  }

  if (
    !Number.isFinite(freeDeliveryMinimum) ||
    freeDeliveryMinimum < 0
  ) {
    fieldErrors.freeDeliveryMinimum =
      "Free-delivery minimum must be zero or greater.";
  }

  if (!Number.isFinite(sortOrder) || sortOrder < 0) {
    fieldErrors.sortOrder = "Sort order must be zero or greater.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fix the delivery zone form.", fieldErrors);
  }

  const values = {
    name,
    slug,
    description: description || null,
    delivery_charge: deliveryCharge,
    free_delivery_minimum: freeDeliveryMinimum,
    estimated_delivery_time: estimatedDeliveryTime || null,
    sort_order: sortOrder,
    is_active: isActive,
    accent_tone: "gold",
  };

  const { error } = id
    ? await supabase
        .from("delivery_zones")
        .update(values satisfies TablesUpdate<"delivery_zones">)
        .eq("id", id)
    : await supabase
        .from("delivery_zones")
        .insert(values satisfies TablesInsert<"delivery_zones">);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/delivery-zones");
  revalidatePath("/checkout");

  return successState(id ? "Delivery zone updated." : "Delivery zone created.");
}

export async function deleteDeliveryZoneAction(formData: FormData) {
  await requireAdminSession("/admin/delivery-zones");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await supabase.from("delivery_zone_areas").delete().eq("zone_id", id);
  await supabase.from("delivery_zones").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/delivery-zones");
}

export async function saveDeliveryZoneAreaAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin/delivery-zones");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const zoneId = getString(formData, "zoneId");
  const areaName = getString(formData, "areaName");
  const deliveryCharge = getDecimal(formData, "deliveryCharge");
  const description = getString(formData, "description");
  const fieldErrors: Record<string, string> = {};

  if (!zoneId) {
    fieldErrors.zoneId = "Choose a zone for this area.";
  }

  if (!areaName) {
    fieldErrors.areaName = "Area name is required.";
  }

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    fieldErrors.deliveryCharge = "Delivery charge must be zero or greater.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fix the area form.", fieldErrors);
  }

  const values = {
    zone_id: zoneId,
    area_name: areaName,
    delivery_charge: deliveryCharge,
    description: description || null,
  };

  const { error } = id
    ? await supabase
        .from("delivery_zone_areas")
        .update(values satisfies TablesUpdate<"delivery_zone_areas">)
        .eq("id", id)
    : await supabase
        .from("delivery_zone_areas")
        .insert(values satisfies TablesInsert<"delivery_zone_areas">);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/delivery-zones");
  revalidatePath("/checkout");

  return successState(id ? "Delivery area updated." : "Delivery area created.");
}

export async function deleteDeliveryZoneAreaAction(formData: FormData) {
  await requireAdminSession("/admin/delivery-zones");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  await supabase.from("delivery_zone_areas").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/delivery-zones");
}

export async function saveSiteSettingsAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin/settings");

  const supabase = await createSupabaseServerClient();
  const currentSettings = await fetchAdminSiteSettings(supabase);
  const siteName = getString(formData, "siteName");
  const tagline = getString(formData, "tagline");
  const logoUrl = getString(formData, "logoUrl");
  const whatsappNumber = getString(formData, "whatsappNumber");
  const announcementBar = getString(formData, "announcementBar");
  const contactPhone = getString(formData, "contactPhone");
  const contactEmail = getString(formData, "contactEmail");
  const address = getString(formData, "address");
  const businessHours = getString(formData, "businessHours");
  const heroKicker = getString(formData, "heroKicker");
  const heroTitle = getString(formData, "heroTitle");
  const heroSubtitle = getString(formData, "heroSubtitle");
  const homepageStoryTitle = getString(formData, "homepageStoryTitle");
  const homepageStoryBody = getString(formData, "homepageStoryBody");
  const productsSectionTitle = getString(formData, "productsSectionTitle");
  const dealsSectionTitle = getString(formData, "dealsSectionTitle");
  const contactSectionTitle = getString(formData, "contactSectionTitle");
  const primaryColor = getString(formData, "primaryColor");
  const secondaryColor = getString(formData, "secondaryColor");
  const backgroundColor = getString(formData, "backgroundColor");
  const surfaceColor = getString(formData, "surfaceColor");
  const fieldErrors: Record<string, string> = {};

  if (!siteName) {
    fieldErrors.siteName = "Site name is required.";
  }

  if (!tagline) {
    fieldErrors.tagline = "Tagline is required.";
  }

  if (!whatsappNumber) {
    fieldErrors.whatsappNumber = "WhatsApp number is required.";
  }

  if (!heroTitle) {
    fieldErrors.heroTitle = "Hero title is required.";
  }

  if (!heroSubtitle) {
    fieldErrors.heroSubtitle = "Hero subtitle is required.";
  }

  for (const [key, value] of [
    ["primaryColor", primaryColor],
    ["secondaryColor", secondaryColor],
    ["backgroundColor", backgroundColor],
    ["surfaceColor", surfaceColor],
  ] as const) {
    if (!isValidHexColor(value)) {
      fieldErrors[key] = "Use a valid hex color like #d7a128.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please fix the site settings form.", fieldErrors);
  }

  const payload: TablesInsert<"site_settings"> = {
    id: 1,
    site_name: siteName,
    tagline,
    whatsapp_number: whatsappNumber,
    logo_url: logoUrl || null,
    business_hours: businessHours || null,
    hero_kicker: heroKicker || currentSettings?.heroKicker || "Cold chain, curated beautifully",
    hero_title: heroTitle,
    hero_subtitle: heroSubtitle,
    homepage_story_title:
      homepageStoryTitle || currentSettings?.homepageStoryTitle || "A store built like a tasting room, not a supermarket.",
    homepage_story_body:
      homepageStoryBody || currentSettings?.homepageStoryBody || "",
    products_section_title: productsSectionTitle || null,
    deals_section_title: dealsSectionTitle || null,
    contact_section_title: contactSectionTitle || null,
    announcement_bar: announcementBar || null,
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
    address: address || null,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    background_color: backgroundColor,
    surface_color: surfaceColor,
    currency_code: "PKR",
  };

  const { error } = await supabase.from("site_settings").upsert(payload);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/deals");
  revalidatePath("/contact");
  revalidatePath("/checkout");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");

  return successState("Site settings updated.");
}

export async function saveSimpleAdminSettingsAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdminSession("/admin");

  const supabase = await createSupabaseServerClient();
  const currentSettings = await fetchAdminSiteSettings(supabase);
  const whatsappNumber = getString(formData, "whatsappNumber");
  const businessHours = getString(formData, "businessHours");
  const fieldErrors: Record<string, string> = {};

  if (!whatsappNumber) {
    fieldErrors.whatsappNumber = "WhatsApp number is required.";
  }

  if (!businessHours) {
    fieldErrors.businessHours = "Business hours are required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Please complete the settings form.", fieldErrors);
  }

  const settingsSource = currentSettings ?? {
    siteName: demoSiteSettings.siteName,
    tagline: demoSiteSettings.tagline,
    logoUrl: demoSiteSettings.logoUrl,
    announcementBar: demoSiteSettings.announcementBar,
    contactPhone: demoSiteSettings.contactPhone,
    contactEmail: demoSiteSettings.contactEmail,
    address: demoSiteSettings.address,
    heroKicker: demoSiteSettings.heroKicker,
    heroTitle: demoSiteSettings.heroTitle,
    heroSubtitle: demoSiteSettings.heroSubtitle,
    homepageStoryTitle: demoSiteSettings.homepageStoryTitle,
    homepageStoryBody: demoSiteSettings.homepageStoryBody,
    productsSectionTitle: demoSiteSettings.productsSectionTitle,
    dealsSectionTitle: demoSiteSettings.dealsSectionTitle,
    contactSectionTitle: demoSiteSettings.contactSectionTitle,
    primaryColor: demoSiteSettings.primaryColor,
    secondaryColor: demoSiteSettings.secondaryColor,
    backgroundColor: demoSiteSettings.backgroundColor,
    surfaceColor: demoSiteSettings.surfaceColor,
  };

  const payload: TablesInsert<"site_settings"> = {
    id: 1,
    site_name: settingsSource.siteName,
    tagline: settingsSource.tagline,
    logo_url: settingsSource.logoUrl || null,
    whatsapp_number: whatsappNumber,
    announcement_bar: settingsSource.announcementBar || null,
    contact_phone: settingsSource.contactPhone || null,
    contact_email: settingsSource.contactEmail || null,
    address: settingsSource.address || null,
    business_hours: businessHours,
    hero_kicker: settingsSource.heroKicker,
    hero_title: settingsSource.heroTitle,
    hero_subtitle: settingsSource.heroSubtitle,
    homepage_story_title: settingsSource.homepageStoryTitle,
    homepage_story_body: settingsSource.homepageStoryBody,
    products_section_title: settingsSource.productsSectionTitle || null,
    deals_section_title: settingsSource.dealsSectionTitle || null,
    contact_section_title: settingsSource.contactSectionTitle || null,
    primary_color: settingsSource.primaryColor,
    secondary_color: settingsSource.secondaryColor,
    background_color: settingsSource.backgroundColor,
    surface_color: settingsSource.surfaceColor,
    currency_code: "PKR",
  };

  const { error } = await supabase.from("site_settings").upsert(payload);

  if (error) {
    return errorState(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/checkout");

  return successState("Settings saved.");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession("/admin/orders");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const status = getString(formData, "status");

  if (!id || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return;
  }

  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateSimpleOrderStatusAction(formData: FormData) {
  await requireAdminSession("/admin");

  const supabase = await createSupabaseServerClient();
  const id = getString(formData, "id");
  const status = getString(formData, "status");

  if (!id || !["Confirmed", "Delivered"].includes(status)) {
    return;
  }

  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin");
}
