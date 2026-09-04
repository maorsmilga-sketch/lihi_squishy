import { formatShekels, productLabel } from "@/lib/format";
import type { CartItem } from "@/lib/cart-types";

export const WHATSAPP_NUMBER = "972543206418";

const RLM = "\u200F";

function rtl(line: string) {
  return `${RLM}${line}`;
}

export function buildWhatsAppOrderMessage(items: CartItem[]) {
  const lines = items.map((item) =>
    rtl(`🧸 ${item.quantity} × ${productLabel(item)}  •  ${formatShekels(item.price)}`),
  );
  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return [
    rtl("🩷💛🩵 הזמנה מעולם הסקווישים"),
    rtl("היי ליהי! אני רוצה להזמין מהחנות:"),
    "",
    ...lines,
    "",
    rtl(`💰 סה״כ לתשלום: ${formatShekels(total)}`),
    rtl("✨ מחכה לאישור 💗"),
  ].join("\n");
}

export function buildWhatsAppOrderUrl(items: CartItem[]) {
  const text = encodeURIComponent(buildWhatsAppOrderMessage(items));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
