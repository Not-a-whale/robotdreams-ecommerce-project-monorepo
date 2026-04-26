"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ProductType } from "@ecommerce/types";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import useCart from "@/store/cart-store";
import { toast } from "react-toastify";

const ProductInteraction = ({
  product,
  selectedColor,
  selectedSize,
}: {
  product: ProductType;
  selectedColor: string;
  selectedSize: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [quantity, setQuantity] = useState(1);
  const {addToCart} = useCart();

  const handleTypeChange = (type: "size" | "color", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment") {
      setQuantity(quantity + 1);
    } else {
      setQuantity(Math.max(1, quantity - 1));
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedColor,
      selectedSize,
      quantity,
    });
    toast.success("Product added to cart!");
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* SIZE */}
      <div className="flex flex-col gap-2 text-xss">
        <span className="text-gray-500">Size</span>
        <div className="flex items-center gap-2">
          {(product.sizes ?? []).map((size) => (
            <div
              className={`cursor-pointer border-1 p-[2px] ${selectedSize === size ? "border-gray-600" : "border-gray-300"}`}
              key={size}
              onClick={() => handleTypeChange("size", size)}
            >
              <div
                className={`w-6 h-6 text-center flex items-center justify-center ${selectedSize === size ? "bg-black text-white" : "bg-white text-black"}`}
              >
                {size.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* COLOR */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-gray-500">Color</span>
        <div className="flex items-center gap-2">
          {(product.colors ?? []).map((color) => (
            <div
              className={`cursor-pointer border-1 p-[2px] ${selectedColor === color ? "border-gray-600" : "border-gray-300"}`}
              key={color}
              onClick={() => handleTypeChange("color", color)}
            >
              <div
                className={`w-6 h-6 text-center flex items-center justify-center ${selectedColor === color ? "bg-black text-white" : "bg-white text-black"}`}
              >
                {color.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* QUANTITY */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-gray-500">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 border border-gray-300 flex items-center justify-center cursor-pointer"
            onClick={() => handleQuantityChange("decrement")}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span>{quantity}</span>
          <button
            className="w-6 h-6 border border-gray-300 flex items-center justify-center cursor-pointer"
            onClick={() => handleQuantityChange("increment")}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {/* BUTTONS */}
        <button onClick={handleAddToCart} className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm font-medium">
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
        <button className="ring-1 ring-gray-400 shadow-lg text-gray-800 px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium">
          <ShoppingCart className="w-4 h-4" />
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductInteraction;
