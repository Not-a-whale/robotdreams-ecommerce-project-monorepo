// components/ProductListClient.tsx
"use client";

import { useState, useTransition } from "react";
import ProductCard from "./ProductCard";
import { SERVER_BACKEND_URL } from "@/lib/constants";
import type { ProductType } from "@ecommerce/types";

interface PaginatedProducts {
  items: ProductType[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface Props {
  initialData: PaginatedProducts;
  category: string;
  sort?: string;
  search?: string;
}

export default function ProductListClient({
  initialData,
  category,
  sort,
  search,
}: Props) {
  const [items, setItems] = useState<ProductType[]>(initialData?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(
    initialData?.nextCursor ?? null
  );
  const [hasMore, setHasMore] = useState<boolean>(
    initialData?.hasMore ?? false
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (!cursor || !hasMore || isPending) return;
    setError(null);

    try {
      const url = new URL("/products", SERVER_BACKEND_URL);
      if (category && category !== "all") url.searchParams.set("category", category);
      if (sort) url.searchParams.set("sort", sort);
      if (search) url.searchParams.set("search", search);
      url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load more");
      const data: PaginatedProducts = await res.json();

      startTransition(() => {
        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    }
  };

  return (
    <>
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No products found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        {error && <p className="text-red-500 mr-4">{error}</p>}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-6 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {isPending ? "Loading..." : "View More"}
          </button>
        )}
      </div>
    </>
  );
}