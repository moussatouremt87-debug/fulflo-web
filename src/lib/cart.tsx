"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  size: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  category?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  subtotal: number;
  serviceFee: number;
  shipping: number;
  total: number;
  itemCount: number;
  totalSavings: number;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "fulflo_cart_v1";

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(readStorage());

    // Sync cart across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setItems(e.newValue ? (JSON.parse(e.newValue) as CartItem[]) : []);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((product: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      const next = existing
        ? prev.map((i) =>
            i.productId === product.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { ...product, quantity: 1 }];
      // Write synchronously so navigation can't race the useEffect flush
      writeStorage(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      writeStorage(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setItems((prev) => {
      const next =
        qty <= 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) =>
              i.productId === productId ? { ...i, quantity: qty } : i
            );
      writeStorage(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // Derived totals
  const subtotal     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const serviceFee   = Math.round(subtotal * 0.05 * 100) / 100;
  const shipping     = subtotal >= 40 ? 0 : 4.9;
  const total        = subtotal + serviceFee + shipping;
  const itemCount    = items.reduce((s, i) => s + i.quantity, 0);
  const totalSavings = items.reduce(
    (s, i) => s + (i.originalPrice - i.price) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        serviceFee,
        shipping,
        total,
        itemCount,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
