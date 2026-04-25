import type { Category, Product } from "@/types/commerce";

function normalizeSortValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isCheeseCategoryValue(value: string | null | undefined) {
  return normalizeSortValue(value).includes("cheese");
}

export function isDairyCategoryValue(value: string | null | undefined) {
  return normalizeSortValue(value).includes("dairy");
}

function isFrozenCategoryValue(value: string | null | undefined) {
  return normalizeSortValue(value).includes("frozen");
}

function getCategoryDisplayPriority(
  category: Pick<Category, "slug" | "name" | "sortOrder">,
) {
  if (
    isCheeseCategoryValue(category.name) ||
    isCheeseCategoryValue(category.slug)
  ) {
    return 0;
  }

  if (
    isDairyCategoryValue(category.name) ||
    isDairyCategoryValue(category.slug)
  ) {
    return 1;
  }

  if (
    isFrozenCategoryValue(category.name) ||
    isFrozenCategoryValue(category.slug)
  ) {
    return 2;
  }

  return 3;
}

export function getProductCategoryPriority(
  product: Pick<Product, "categorySlug" | "categoryName">,
) {
  if (
    isCheeseCategoryValue(product.categoryName) ||
    isCheeseCategoryValue(product.categorySlug)
  ) {
    return 0;
  }

  if (
    isDairyCategoryValue(product.categoryName) ||
    isDairyCategoryValue(product.categorySlug)
  ) {
    return 1;
  }

  if (
    isFrozenCategoryValue(product.categoryName) ||
    isFrozenCategoryValue(product.categorySlug)
  ) {
    return 2;
  }

  return 3;
}

export function sortStoreCategoriesForDisplay(categories: Category[]) {
  return [...categories].sort((left, right) => {
    return (
      getCategoryDisplayPriority(left) - getCategoryDisplayPriority(right) ||
      left.sortOrder - right.sortOrder ||
      left.name.localeCompare(right.name)
    );
  });
}

export function getHomepageFeaturedProducts(products: Product[], limit = 4) {
  const rankedProducts = [...products].sort(
    (left, right) =>
      getProductCategoryPriority(left) - getProductCategoryPriority(right) ||
      Number(right.isFeatured) - Number(left.isFeatured) ||
      new Date(right.createdAt ?? 0).valueOf() -
        new Date(left.createdAt ?? 0).valueOf() ||
      left.name.localeCompare(right.name),
  );
  const selectedProductIds = new Set<string>();
  const selectedProducts: Product[] = [];

  const addMatchingProducts = (predicate: (product: Product) => boolean) => {
    for (const product of rankedProducts) {
      if (!predicate(product) || selectedProductIds.has(product.id)) {
        continue;
      }

      selectedProducts.push(product);
      selectedProductIds.add(product.id);

      if (selectedProducts.length >= limit) {
        return;
      }
    }
  };

  addMatchingProducts(
    (product) =>
      product.isFeatured && getProductCategoryPriority(product) <= 1,
  );
  addMatchingProducts(
    (product) =>
      !product.isFeatured && getProductCategoryPriority(product) <= 1,
  );
  addMatchingProducts(
    (product) =>
      product.isFeatured && getProductCategoryPriority(product) > 1,
  );
  addMatchingProducts(
    (product) =>
      !product.isFeatured && getProductCategoryPriority(product) > 1,
  );

  return selectedProducts.slice(0, limit);
}
