import type { ProductType } from '@ecommerce/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartLineItem = ProductType & {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
};

function lineKey(item: Pick<CartLineItem, 'id' | 'selectedSize' | 'selectedColor'>) {
  return `${item.id}:${item.selectedSize}:${item.selectedColor}`;
}

type CartStoreState = {
  items: CartLineItem[];
  addToCart: (item: CartLineItem) => void;
  removeLine: (item: Pick<CartLineItem, 'id' | 'selectedSize' | 'selectedColor'>) => void;
  setQuantity: (
    item: Pick<CartLineItem, 'id' | 'selectedSize' | 'selectedColor'>,
    quantity: number,
  ) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          const key = lineKey(item);
          const idx = state.items.findIndex((i) => lineKey(i) === key);
          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = {
              ...next[idx],
              quantity: next[idx].quantity + item.quantity,
            };
            return { items: next };
          }
          return { items: [...state.items, item] };
        }),

      removeLine: (item) =>
        set((state) => ({
          items: state.items.filter((i) => lineKey(i) !== lineKey(item)),
        })),

      setQuantity: (item, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => lineKey(i) !== lineKey(item)),
            };
          }
          return {
            items: state.items.map((i) =>
              lineKey(i) === lineKey(item) ? { ...i, quantity } : i,
            ),
          };
        }),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' },
  ),
);

export default function useCart() {
  return useCartStore();
}
