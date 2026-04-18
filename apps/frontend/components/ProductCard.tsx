"use client";

import Image from "next/image";
import type { ProductType } from "@ecommerce/types";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useCart from "@/store/cart-store";

const ProductCard = ({ product }: { product: ProductType }) => {
  const router = useRouter();
  const [productTypes, setProductTypes] = useState<{
    size: string;
    color: string;
  }>({
    size: product.sizes?.[0] || "",
    color: product.colors?.[0] || "",
  });

  const { addToCart } = useCart();

  const handleProductTypeChange = (type: "size" | "color", value: string) => {
    setProductTypes((prev) => ({ ...prev, [type]: value }));
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize: productTypes.size,
      selectedColor: productTypes.color,
      quantity: 1,
    });

    toast.success("Product added to cart!");
  };

  const handleProductClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden">
      {/* IMAGE */}
      <div className="relative aspect-[2/3] cursor-pointer" onClick={handleProductClick}>
        <Image
          src={(product.images as Record<string, string>)?.[productTypes.color] || ""}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* DETAILS */}
      <div className="flex flex-col gap-4 p-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.shortDescription}</p>
        {/* PRODUCT TYPES */}
        <div className="flex items-center justify-between">
          {/* SIZES */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Size</span>
            <select
              name="size"
              id="size"
              className="ring ring-gray-300 rounded-md px-2 py-1"
              onChange={(e) => handleProductTypeChange("size", e.target.value)}
            >
              {product.sizes?.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          {/* COLORS */}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500">Color</span>
            <div className="flex items-center gap-2">
              {product.colors?.map((color) => (
                <div
                  key={color}
                  className={`flex cursor-pointer border-1 items-center justify-center ${productTypes.color === color ? "border-gray-500" : "border-gray-200"} rounded-full p-[2px]`}
                  onClick={() => handleProductTypeChange("color", color)}
                >
                  <div
                    className="w-[14px] h-[14px] rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* PRICE & ADD TO CART */}
        <div className="flex items-center justify-between">
          <p className="font-medium">${product.price.toFixed(2)}</p>
          <button onClick={handleAddToCart} className="ring-1 ring-gray-200 shadow-lg transition-all flex items-center gap-2 duration-300 rounded-md px-2 py-1 text-sm cursor-pointer hover:text-white hover:bg-black">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
