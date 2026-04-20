import Link from "next/link";
import Categories from "./Categories";
import ProductCard from "./ProductCard";
import Filter from "./Filter";
import { SERVER_BACKEND_URL } from "@/lib/constants";
import type { ProductType } from "@ecommerce/types";


const fetchProducts = async ({
  category,
  sort = "newest",
  search,
  params
}: {
  category: string;
  sort?: string;
  search?: string;
  params: "homepage" | "products";
}) => {
  const url = new URL("/products", SERVER_BACKEND_URL);
  if (category && category !== "all") {
    url.searchParams.set("category", category);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return (await res.json()) as ProductType[];
}

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
  const products = await fetchProducts({ category, sort, search, params });
  return (
    <div className="w-full">
      <Categories />
      {params === "homepage" && (
        <Filter />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Link
        href={`${category ? `/products/${category}` : "/products"}`}
        className="flex justify-end"
      >
        View All Products
      </Link>
    </div>
  );
};

export default ProductList;
