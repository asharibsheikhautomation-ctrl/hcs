import type { Product } from "@/types/commerce";

const quantityPattern =
  /\b\d+(?:\.\d+)?\s?(?:kg|kgs|g|gm|gr|grams?|ml|l|ltr|litre|litres|pack|packs|pcs|pieces?)\b/i;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeComparisonText(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeQuantityLabel(value: string) {
  const normalized = normalizeWhitespace(value.toLowerCase())
    .replace(/(\d+(?:\.\d+)?)\s*gm\b/g, "$1gm")
    .replace(/(\d+(?:\.\d+)?)\s*g\b/g, "$1gm")
    .replace(/(\d+(?:\.\d+)?)\s*kgs?\b/g, "$1kg")
    .replace(/(\d+(?:\.\d+)?)\s*ml\b/g, "$1ml")
    .replace(/(\d+(?:\.\d+)?)\s*l(?:tr|itre|itres)?\b/g, "$1l")
    .replace(/(\d+(?:\.\d+)?)\s*pieces?\b/g, "$1pcs")
    .replace(/(\d+(?:\.\d+)?)\s*pcs?\b/g, "$1pcs")
    .replace(/(\d+(?:\.\d+)?)\s*packs?\b/g, "$1 pack");

  return normalized.replace(/\b[a-z]/g, (match) => match.toLowerCase());
}

function extractQuantityLabel(product: Product) {
  const candidates = [
    product.name,
    product.shortDescription,
    product.description,
    product.unitLabel,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const match = candidate?.match(quantityPattern);

    if (match?.[0]) {
      return normalizeQuantityLabel(match[0]);
    }
  }

  if (product.unitLabel && product.unitLabel.toLowerCase() !== "unit") {
    return normalizeQuantityLabel(product.unitLabel);
  }

  return "";
}

function shortenSentence(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");

  return `${sliced.slice(0, lastSpace > 24 ? lastSpace : maxLength).trimEnd()}...`;
}

function getSourceSentence(product: Product) {
  const source = product.shortDescription || product.description || product.name;
  const sentence = normalizeWhitespace(source.split(/[.!?]/)[0] ?? source);

  return shortenSentence(sentence, 78);
}

function isDuplicateOfTitle(product: Product, value: string) {
  const normalizedValue = normalizeComparisonText(value);
  const normalizedTitle = normalizeComparisonText(getProductDisplayTitle(product));
  const normalizedName = normalizeComparisonText(product.name);

  return (
    normalizedValue.length > 0 &&
    (normalizedValue === normalizedTitle ||
      normalizedValue === normalizedName ||
      normalizedValue.includes(normalizedTitle) ||
      normalizedTitle.includes(normalizedValue) ||
      normalizedValue.includes(normalizedName))
  );
}

function getSearchText(product: Product) {
  return [
    product.name,
    product.shortDescription,
    product.description,
    product.categoryName,
    product.badge ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function getProductQuantityLabel(product: Product) {
  return extractQuantityLabel(product);
}

export function getProductDisplayTitle(product: Product) {
  const cleanedName = normalizeWhitespace(
    product.name
      .replace(quantityPattern, "")
      .replace(/\(\s*\)/g, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  );

  return cleanedName || normalizeWhitespace(product.name);
}

export function getProductQuickNote(product: Product) {
  const sourceSentence = getSourceSentence(product);

  if (!isDuplicateOfTitle(product, sourceSentence)) {
    return sourceSentence;
  }

  return getProductUsageText(product);
}

export function getProductStorageText(product: Product) {
  const searchText = getSearchText(product);

  if (product.isFrozen || searchText.includes("frozen")) {
    return "Keep frozen until ready to cook or serve";
  }

  if (
    searchText.includes("cheese") ||
    searchText.includes("dairy") ||
    searchText.includes("cream") ||
    searchText.includes("butter")
  ) {
    return "Keep refrigerated for best texture and freshness";
  }

  if (
    searchText.includes("mayo") ||
    searchText.includes("sauce") ||
    searchText.includes("dip")
  ) {
    return "Keep refrigerated after opening";
  }

  if (
    searchText.includes("bun") ||
    searchText.includes("bread") ||
    searchText.includes("paratha")
  ) {
    return "Store in a cool, dry place and use fresh";
  }

  return "Store as packed and keep in a cool place";
}

export function getProductUsageText(product: Product) {
  const searchText = getSearchText(product);

  if (searchText.includes("pizza") || searchText.includes("mozzarella")) {
    return "Perfect for pizzas, lasagna, and cheesy bakes";
  }

  if (searchText.includes("cheddar") || searchText.includes("cheese")) {
    return "Perfect for sandwiches, burgers, and cooking";
  }

  if (searchText.includes("fries")) {
    return "Perfect for side orders, platters, and snacks";
  }

  if (searchText.includes("nugget")) {
    return "Perfect for snacks, wraps, and platters";
  }

  if (
    searchText.includes("mayo") ||
    searchText.includes("sauce") ||
    searchText.includes("dip")
  ) {
    return "Perfect for burgers, fries, and dipping";
  }

  if (
    searchText.includes("bun") ||
    searchText.includes("bread") ||
    searchText.includes("paratha")
  ) {
    return "Perfect for burgers, sandwiches, and serving";
  }

  if (product.isFrozen) {
    return "Perfect for quick meals, platters, and side orders";
  }

  return "Perfect for everyday kitchen use";
}

export function getProductUsageTag(product: Product) {
  const searchText = getSearchText(product);

  if (searchText.includes("pizza") || searchText.includes("mozzarella")) {
    return "Pizza use";
  }

  if (searchText.includes("cheddar") || searchText.includes("cheese")) {
    return "Cooking";
  }

  if (searchText.includes("fries") || searchText.includes("nugget")) {
    return "Snacks";
  }

  if (
    searchText.includes("mayo") ||
    searchText.includes("sauce") ||
    searchText.includes("dip")
  ) {
    return "Dipping";
  }

  if (
    searchText.includes("bun") ||
    searchText.includes("bread") ||
    searchText.includes("paratha")
  ) {
    return "Serving";
  }

  return "Daily use";
}

export function getProductDetailPoints(product: Product) {
  const safeUnitLabel =
    product.unitLabel && product.unitLabel.toLowerCase() !== "unit"
      ? product.unitLabel
      : "";
  const quantityLabel = getProductQuantityLabel(product) || safeUnitLabel || "As packed";

  return [
    {
      label: "Pack Size",
      value: quantityLabel,
    },
    {
      label: "Storage",
      value: getProductStorageText(product),
    },
    {
      label: "Usage",
      value: getProductUsageText(product),
    },
  ] as const;
}

export function getProductCardDescription(product: Product) {
  const descriptionCandidates = [
    product.shortDescription,
    product.description,
    getProductQuickNote(product),
  ]
    .map((value) => normalizeWhitespace(value ?? ""))
    .filter(Boolean);

  for (const candidate of descriptionCandidates) {
    const firstSentence = shortenSentence(candidate.split(/[.!?]/)[0] ?? candidate, 96);

    if (!isDuplicateOfTitle(product, firstSentence)) {
      return firstSentence;
    }
  }

  return `${getProductStorageText(product)}. ${getProductUsageText(product)}.`;
}
