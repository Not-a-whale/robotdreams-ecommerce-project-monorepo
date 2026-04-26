"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export const ShoppingCartIcon = () => {
  const { cart, hasHydrated } = useCartStore();

  return (
    <Link href="/cart" className="relative  mr-4">
      <ShoppingCart className="w-4 h-4 text-white" />
      <span className="absolute -top-2 -right-3 bg-amber-400 text-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
        {hasHydrated ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0}
      </span>
    </Link>
  );
};
