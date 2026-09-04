import { productLabel } from "@/lib/products";

export function formatPrice(price: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(Number(price));
}

export function formatShekels(price: number) {
  const value = Number(price);
  const amount = value % 1 === 0 ? String(value) : value.toFixed(2);
  return `${amount} ש״ח`;
}

export function uniqueCategories(products: { category?: string | null }[]) {
  return Array.from(
    new Set(
      products
        .map((product) => product.category?.trim())
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((a, b) => a.localeCompare(b, "he"));
}

export { productLabel };
