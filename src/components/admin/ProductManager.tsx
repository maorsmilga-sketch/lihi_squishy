"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin-client";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

type FormState = {
  id?: string;
  price: string;
  description: string;
  category: string;
  external_link: string;
  imageFile: File | null;
  imagePreview: string;
};

const emptyForm: FormState = {
  price: "",
  description: "",
  category: "",
  external_link: "",
  imageFile: null,
  imagePreview: "",
};

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadProducts() {
    const response = await adminFetch("/api/products");
    const data = await response.json();
    setProducts(data.products ?? []);
  }

  useEffect(() => {
    let ignore = false;
    adminFetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setProducts(data.products ?? []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let imageUrl = form.imagePreview;
      if (form.imageFile) {
        const payload = new FormData();
        payload.set("file", form.imageFile);
        payload.set("folder", "products");
        const upload = await adminFetch("/api/upload", {
          method: "POST",
          body: payload,
        });
        const uploaded = await upload.json();
        if (!upload.ok) {
          throw new Error(uploaded.error || "העלאת התמונה נכשלה");
        }
        imageUrl = uploaded.url;
      }

      if (!imageUrl) {
        throw new Error("צריך לבחור תמונה לסקווישי");
      }

      const body = {
        image_url: imageUrl,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        external_link: form.external_link,
      };

      const response = await adminFetch(
        form.id ? `/api/products/${form.id}` : "/api/products",
        {
          method: form.id ? "PATCH" : "POST",
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "השמירה נכשלה");
      }

      setForm(emptyForm);
      setMessage(form.id ? "הסקווישי עודכן!" : "סקווישי חדש נוסף!");
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "משהו השתבש");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הסקווישי הזה?")) return;
    const response = await adminFetch(`/api/products/${id}`, { method: "DELETE" });
    if (response.ok) {
      setProducts((current) => current.filter((item) => item.id !== id));
      if (form.id === id) setForm(emptyForm);
    }
  }

  function startEdit(product: Product) {
    setForm({
      id: product.id,
      price: String(product.price),
      description: product.description ?? "",
      category: product.category ?? "",
      external_link: product.external_link ?? "",
      imageFile: null,
      imagePreview: product.image_url,
    });
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-2 ring-squishy-yellow-soft"
      >
        <h3 className="text-lg font-extrabold">
          {form.id ? "עריכת סקווישי" : "הוספת סקווישי חדש"}
        </h3>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">תמונה</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setForm((current) => ({
                ...current,
                imageFile: file,
                imagePreview: file
                  ? URL.createObjectURL(file)
                  : current.imagePreview,
              }));
            }}
            className="w-full rounded-2xl bg-squishy-yellow-soft px-3 py-3 text-sm file:ml-3 file:rounded-full file:border-0 file:bg-squishy-pink file:px-3 file:py-1 file:font-bold file:text-white"
          />
        </label>

        {form.imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imagePreview}
            alt="תצוגה מקדימה"
            className="h-36 w-full rounded-2xl object-cover"
          />
        ) : null}

        <label className="block">
          <span className="mb-1 block text-sm font-bold">מחיר</span>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price}
            onChange={(event) =>
              setForm((current) => ({ ...current, price: event.target.value }))
            }
            className="w-full rounded-2xl border-2 border-squishy-blue/40 bg-squishy-blue-soft px-4 py-3 font-bold outline-none"
            placeholder="לדוגמה 25"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">קטגוריה</span>
          <input
            list="product-categories"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="w-full rounded-2xl border-2 border-squishy-yellow/50 bg-squishy-yellow-soft px-4 py-3 font-bold outline-none"
            placeholder="לדוגמה: אוכל, חיות, קשת"
          />
          <datalist id="product-categories">
            {Array.from(
              new Set(
                products
                  .map((product) => product.category?.trim())
                  .filter((category): category is string => Boolean(category)),
              ),
            ).map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">תיאור (לא חובה)</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="w-full resize-none rounded-2xl border-2 border-squishy-pink/30 bg-squishy-pink-soft px-4 py-3 outline-none"
            placeholder="סקווישי רך ומתוק..."
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">
            קישור חיצוני (מוסתר מהחנות)
          </span>
          <input
            type="url"
            value={form.external_link}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                external_link: event.target.value,
              }))
            }
            className="w-full rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-sm outline-none"
            placeholder="https://..."
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-2xl bg-squishy-yellow py-3 font-extrabold active:scale-95 disabled:opacity-60"
          >
            {saving ? "שומרות..." : form.id ? "עדכון" : "הוספה"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="rounded-2xl bg-white px-4 py-3 font-bold ring-1 ring-pink-100"
            >
              ביטול
            </button>
          ) : null}
        </div>
        {message ? (
          <p className="text-center text-sm font-bold text-ink/80">{message}</p>
        ) : null}
      </form>

      <ul className="space-y-3">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex gap-3 rounded-3xl bg-white p-3 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{formatPrice(product.price)}</p>
              {product.category ? (
                <p className="text-[11px] font-bold text-squishy-pink">
                  {product.category}
                </p>
              ) : null}
              <p className="line-clamp-2 text-xs text-ink/70">
                {product.description || "בלי תיאור"}
              </p>
              {product.external_link ? (
                <p className="mt-1 truncate text-[11px] text-ink/40" dir="ltr">
                  {product.external_link}
                </p>
              ) : null}
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded-full bg-squishy-blue-soft px-3 py-1 text-xs font-bold"
                >
                  עריכה
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="rounded-full bg-squishy-pink-soft px-3 py-1 text-xs font-bold"
                >
                  מחיקה
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
