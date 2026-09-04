export const PUBLIC_PRODUCT_COLUMNS =
  "id, image_url, price, description, category, created_at";

export const ADMIN_PRODUCT_COLUMNS =
  "id, image_url, price, description, category, external_link, created_at";

export function productLabel(product: { description: string | null }) {
  const name = product.description?.trim();
  return name || "סקווישי";
}
