"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/cart-types";
import type { Product } from "@/lib/types";

const CART_KEY = "squishy-cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isOpen: boolean;
  addItem: (product: Product) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as unknown;
      Promise.resolve().then(() => {
        setItems(Array.isArray(parsed) ? (parsed as CartItem[]) : []);
        setLoaded(true);
      });
    } catch {
      Promise.resolve().then(() => setLoaded(true));
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((product: Product) => {
    const stock = product.stock ?? 1;
    if (stock < 1) return;
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= stock) return current;
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          image_url: product.image_url,
          price: Number(product.price),
          description: product.description,
          category: product.category ?? null,
          quantity: 1,
          stock,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) => {
      if (quantity < 1) {
        return current.filter((item) => item.id !== id);
      }
      return current.map((item) => {
        if (item.id !== id) return item;
        const max = item.stock ?? quantity;
        return { ...item, quantity: Math.min(quantity, max) };
      });
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      total,
      isOpen,
      addItem,
      setQuantity,
      removeItem,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [addItem, isOpen, items, removeItem, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
