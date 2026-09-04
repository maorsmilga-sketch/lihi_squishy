export const PUBLIC_PRODUCT_COLUMNS =
  "id, image_url, price, description, category, stock, sku, created_at";

export const ADMIN_PRODUCT_COLUMNS =
  "id, image_url, price, description, category, stock, sku, external_link, created_at";

const SKU_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSku() {
  let code = "S-";
  for (let index = 0; index < 4; index += 1) {
    code += SKU_CHARS[Math.floor(Math.random() * SKU_CHARS.length)];
  }
  return code;
}

export function skuFromId(id: string) {
  const hex = id.replace(/-/g, "").slice(-6).toUpperCase();
  return `S-${hex}`;
}

export function productSku(product: { id: string; sku?: string | null }) {
  const sku = product.sku?.trim();
  return sku || skuFromId(product.id);
}

export function productLabel(product: { description: string | null }) {
  const name = product.description?.trim();
  return name || "סקווישי";
}
