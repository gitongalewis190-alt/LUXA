'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  projectId: string;
  title:     string;
  thumbnail: string;
  price:     number;
  currency:  string;
  creatorName: string;
}

interface CartStore {
  items:       CartItem[];
  addItem:     (item: CartItem) => void;
  removeItem:  (projectId: string) => void;
  clearCart:   () => void;
  hasItem:     (projectId: string) => boolean;
  totalAmount: () => number;
  itemCount:   () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().hasItem(item.projectId)) return;
        set(state => ({ items: [...state.items, item] }));
      },

      removeItem: (projectId) =>
        set(state => ({ items: state.items.filter(i => i.projectId !== projectId) })),

      clearCart: () => set({ items: [] }),

      hasItem: (projectId) => get().items.some(i => i.projectId === projectId),

      totalAmount: () => get().items.reduce((sum, i) => sum + i.price, 0),

      itemCount: () => get().items.length,
    }),
    { name: 'luxa-cart' }
  )
);
