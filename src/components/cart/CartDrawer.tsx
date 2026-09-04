"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, formatShekels, productLabel } from "@/lib/format";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

export function CartDrawer() {
  const { items, total, isOpen, closeCart, setQuantity, removeItem } = useCart();

  if (!isOpen) {
    return null;
  }

  const checkoutUrl = items.length > 0 ? buildWhatsAppOrderUrl(items) : "";

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-ink/45 p-3"
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-label="סל קניות"
    >
      <div
        className="flex max-h-[85%] w-full flex-col overflow-hidden rounded-[1.8rem] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-gradient-to-l from-squishy-yellow-soft to-squishy-pink-soft px-4 py-3">
          <h2 className="text-lg font-extrabold">הסל שלי</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full bg-white px-3 py-1 text-sm font-bold"
          >
            סגור
          </button>
        </div>

        <div className="app-scroll flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="rounded-3xl bg-squishy-blue-soft px-4 py-8 text-center text-sm font-bold text-ink/70">
              הסל ריק. הוסיפו סקווישים מהחנות!
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-3xl bg-squishy-pink-soft/60 p-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt=""
                  className="h-16 w-16 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    {productLabel(item)}
                  </p>
                  <p className="text-xs font-bold text-ink/60">
                    {formatPrice(item.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 rounded-full bg-white text-lg font-extrabold leading-none"
                      aria-label="הפחתה"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-extrabold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 rounded-full bg-white text-lg font-extrabold leading-none"
                      aria-label="הוספה"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mr-auto rounded-full bg-white px-2 py-1 text-[11px] font-bold text-ink/60"
                    >
                      הסרה
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-pink-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between text-base font-extrabold">
            <span>סה״כ לתשלום</span>
            <span>{formatShekels(total)}</span>
          </div>
          {items.length > 0 ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-2xl bg-[#25D366] py-3.5 text-center text-base font-extrabold text-white shadow-sm active:scale-95"
            >
              שלח הזמנה לליהי בווצאפ
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
