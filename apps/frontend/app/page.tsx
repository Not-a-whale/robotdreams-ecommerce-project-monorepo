import ProductList from "@/components/ProductList";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; search?: string }>;
}) {
  const { category = "all", sort, search } = await searchParams;

  return (
    <main>
      <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
        <ProductList
          category={category}
          sort={sort}
          search={search}
          params="homepage"
        />
      </div>
    </main>
  );
}
