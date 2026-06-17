import React, { createContext, useContext, useState } from 'react';

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
  count: number;
  subtotal: number;    // numeric KWD total of non-sold items
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  count: 0,
  subtotal: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const activeItems = items.filter(i => !i.isSold);
  const subtotal = activeItems.reduce((sum, i) => {
    const num = parseFloat(i.price.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, count: activeItems.length, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
