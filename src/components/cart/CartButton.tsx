"use client";

import { useCart } from "@/components/cart/CartProvider";

export function CartButton() {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="fixed bottom-[calc(5.6rem+env(safe-area-inset-bottom))] left-3 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-squishy-yellow shadow-lg ring-4 ring-white active:scale-95 sm:absolute sm:bottom-[5.6rem] sm:left-3"
      aria-label="פתיחת סל הקניות"
    >
      <span className="text-2xl" aria-hidden>
        🛒
      </span>
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-squishy-pink px-1 text-xs font-extrabold text-white">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
