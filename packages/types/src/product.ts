export type ProductType = {
  id: string;
  externalId: number | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  stock: number;
  sizes: string[] | null;
  colors: string[] | null;
  images: Record<string, string> | null;
  categorySlug: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};
