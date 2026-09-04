"use client";

import { useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { uniqueCategories } from "@/lib/format";
import type { Product } from "@/lib/types";

const ALL_CATEGORY = "הכל";

export function Storefront({
  products,
  configured,
}: {
  products: Product[];
  configured: boolean;
}) {
  const [category, setCategory] = useState(ALL_CATEGORY);
  const categories = [ALL_CATEGORY, ...uniqueCategories(products)];
  const visible =
    category === ALL_CATEGORY
      ? products
      : products.filter((product) => product.category?.trim() === category);

  if (!configured) {
    return (
      <EmptyState
        emoji="🌈"
        title="עוד רגע מתחילים"
        text="חברו את סופאבייס כדי שהסקווישים יופיעו כאן."
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        emoji="🧸"
        title="עוד אין סקווישים"
        text="ליהי וארי יוסיפו כאן בקרוב סקווישים חדשים ומתוקים!"
      />
    );
  }

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((item) => {
          const active = item === category;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold active:scale-95 ${
                active
                  ? "bg-squishy-yellow text-ink shadow-sm"
                  : "bg-white text-ink/70 ring-1 ring-pink-100"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="אין סקווישים בקטגוריה הזו"
          text="נסו קטגוריה אחרת, או בחרו בהכל."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
