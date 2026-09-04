import { formatShekels, productLabel } from "@/lib/format";
import type { CartItem } from "@/lib/cart-types";

export const WHATSAPP_NUMBER = "972543206418";

export function buildWhatsAppOrderMessage(items: CartItem[]) {
  const lines = items.map(
    (item) =>
      `${item.quantity}x ${productLabel(item)} (${formatShekels(item.price)})`,
  );
  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return [
    "היי ליהי! אני רוצה להזמין מהחנות:",
    "",
    ...lines,
    "",
    `סה״כ לתשלום: ${formatShekels(total)}`,
  ].join("\n");
}

export function buildWhatsAppOrderUrl(items: CartItem[]) {
  const text = encodeURIComponent(buildWhatsAppOrderMessage(items));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
