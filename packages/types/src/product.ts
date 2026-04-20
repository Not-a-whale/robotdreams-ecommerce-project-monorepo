export type ProductType = {
  id: string;
  externalId: number | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  /** Amount in minor units (e.g. cents). */
  price: number;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  /** Image URL per color key; keys must match `colors` entries. */
  images: Record<string, string> | null;
  /** Lowercase slug; UI "All" is not stored — use only real category slugs. */
  categorySlug: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};
