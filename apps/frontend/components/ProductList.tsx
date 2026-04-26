// components/ProductList.tsx
import Categories from "./Categories";
import Filter from "./Filter";
import ProductListClient from "./ProductListClient";
import { SERVER_BACKEND_URL } from "@/lib/constants";
import type { ProductType } from "@ecommerce/types";

// Тип ответа от бэка — соответствует тому, что мы сделали в NestJS
interface PaginatedProducts {
  items: ProductType[];
  nextCursor: string | null;
  hasMore: boolean;
}

const fetchProducts = async ({
  category,
  sort = "newest",
  search,
}: {
  category: string;
  sort?: string;
  search?: string;
}): Promise<PaginatedProducts> => {
  const url = new URL("/products", SERVER_BACKEND_URL);

  if (category && category !== "all") {
    url.searchParams.set("category", category);
  }
  if (sort) {
    url.searchParams.set("sort", sort);
  }
  // ВАЖНО: передаём search на бэк, бэк делает ILIKE.
  // Это работает для любого размера каталога.
  if (search) {
    url.searchParams.set("search", search);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json() as Promise<PaginatedProducts>;
};

const ProductList = async ({
  category,
  sort,
  search,
  params,
}: {
  category: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  // Грузим первую страницу на сервере (для SEO и быстрого первого paint).
  const initialData = await fetchProducts({ category, sort, search });

  return (
    <div className="w-full">
      <Categories />
      {params === "homepage" && <Filter />}

      {/* key гарантирует пересоздание клиентского компонента
          при смене любого из фильтров — иначе старые items
          смешаются с новыми */}
      <ProductListClient
        key={`${category}-${sort ?? ""}-${search ?? ""}`}
        initialData={initialData}
        category={category}
        sort={sort}
        search={search}
      />
    </div>
  );
};

export default ProductList;