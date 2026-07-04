'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface CartItem {
  id: string;
  brand: string;
  name: string;
  price: string;       // e.g. "234.00 KWD"
  imageUri?: string;
  isSold?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;    // numeric KWD total of non-sold items
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clear: () => {},
  count: 0,
  subtotal: 0,
});

// Persisted so page refreshes and full navigations never empty the cart
const CART_STORAGE_KEY = 'erlume_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  // Load the saved cart once on startup
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch { /* corrupted or unavailable storage — start empty */ }
    hydrated.current = true;
  }, []);

  // Save on every change — but only after hydration, so the initial empty
  // state never overwrites a stored cart
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch { /* noop */ }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clear = () => setItems([]);

  const activeItems = items.filter(i => !i.isSold);
  const subtotal = activeItems.reduce((sum, i) => {
    const num = parseFloat(i.price.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, count: activeItems.length, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
