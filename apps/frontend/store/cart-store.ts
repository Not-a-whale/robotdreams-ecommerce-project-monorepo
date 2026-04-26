import { create } from "zustand";
import type { ProductType } from "@ecommerce/types";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartLineItem = ProductType & {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
};

type CartStoreStateType = {
  cart: CartLineItem[];
  hasHydrated: boolean;
};

type CartStoreActionsType = {
  addToCart: (item: CartLineItem) => void;
  removeFromCart: (
    product: Pick<CartLineItem, "id" | "selectedSize" | "selectedColor">,
  ) => void;
  clearCart: () => void;
};

const useCart = create<CartStoreStateType & CartStoreActionsType>()(
  persist(
    (set) => ({
      cart: [],
      hasHydrated: false,
      addToCart: (item) => {
        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (p) =>
              p.id === item.id &&
              p.selectedSize === item.selectedSize &&
              p.selectedColor === item.selectedColor,
          );
          if (existingItemIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart![existingItemIndex]!.quantity += item.quantity;
            return { cart: updatedCart };
          } else {
            return { cart: [...state.cart, item] };
          }
        });
      },
      removeFromCart: (product) =>
        set((state) => ({
          cart: state.cart.filter(
            (p) =>
              !(
                p.id === product.id &&
                p.selectedSize === product.selectedSize &&
                p.selectedColor === product.selectedColor
              ),
          ),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    },
  ),
);

export const useCartStore = useCart;
export default useCart;
