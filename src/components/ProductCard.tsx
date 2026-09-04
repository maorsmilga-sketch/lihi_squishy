"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { productSku } from "@/lib/products";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const [open, setOpen] = useState(false);
  const { addItem } = useCart();
  const accent =
    index % 3 === 0
      ? "from-squishy-yellow-soft"
      : index % 3 === 1
        ? "from-squishy-pink-soft"
        : "from-squishy-blue-soft";

  return (
    <>
      <article
        className={`pop-in overflow-hidden rounded-3xl bg-gradient-to-b ${accent} to-white p-2 text-right shadow-md ring-2 ring-white`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-right active:scale-[0.98]"
        >
          <div className="aspect-square overflow-hidden rounded-2xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.description || "סקווישי"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="px-1 pb-1 pt-2">
            <span className="inline-block rounded-full bg-squishy-yellow px-2.5 py-0.5 text-sm font-extrabold text-ink">
              {formatPrice(product.price)}
            </span>
            <span className="mr-1 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-ink/70">
              #{productSku(product)}
            </span>
            {product.category ? (
              <span className="mr-1 inline-block rounded-full bg-squishy-blue-soft px-2 py-0.5 text-[10px] font-bold text-ink/70">
                {product.category}
              </span>
            ) : null}
            {product.description ? (
              <p className="mt-1 line-clamp-2 text-xs font-medium text-ink/70">
                {product.description}
              </p>
            ) : null}
          </div>
        </button>
        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-1 w-full rounded-2xl bg-squishy-pink py-2 text-xs font-extrabold text-white active:scale-95"
        >
          הוסף לסל
        </button>
      </article>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
              onClick={() => setOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="פרטי סקווישי"
            >
              <div
                className="w-full max-w-sm overflow-hidden rounded-[1.8rem] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image_url}
                  alt={product.description || "סקווישי"}
                  className="h-64 w-full object-cover"
                />
                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-squishy-pink px-3 py-1 text-base font-extrabold text-white">
                      {formatPrice(product.price)}
                    </span>
                    <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-extrabold ring-1 ring-pink-100">
                      #{productSku(product)}
                    </span>
                    {product.category ? (
                      <span className="inline-block rounded-full bg-squishy-blue-soft px-3 py-1 text-xs font-bold">
                        {product.category}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-ink/80">
                    {product.description || "סקווישי מקסים מחכה לשחק!"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      addItem(product);
                      setOpen(false);
                    }}
                    className="w-full rounded-2xl bg-squishy-pink py-3 text-base font-extrabold text-white active:scale-95"
                  >
                    הוסף לסל
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-full rounded-2xl bg-squishy-yellow py-3 text-base font-extrabold text-ink active:scale-95"
                  >
                    סגור
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
