"use client";

import { ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ShippingFormInputs } from "@/lib/cart";
import useCart from "@/store/cart-store";
import ShippingForm from "@/components/ShippingForm";
import StripePaymentForm from "@/components/StipePaymentForm";

const steps = [
  {
    id: 1,
    title: "Shopping Cart",
  },
  {
    id: 2,
    title: "Shipping Address",
  },
  {
    id: 3,
    title: "Payment Method",
  },
];

const CartPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();

  const { cart, removeFromCart } = useCart();

  const activeStep = parseInt(searchParams.get("step") || "1");

  return (
    <div className="flex flex-col gap-8 items-center justify-center mt-12">
      <h1 className="text-2xl font-medium">Your Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 border-b-2 pb-2 ${
              step.id === activeStep
                ? "border-amber-400 text-amber-400"
                : "border-gray-200 text-gray-500"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full text-white p-4 flex items-center justify-center ${
                step.id === activeStep ? "bg-amber-800" : "bg-gray-200"
              }`}
            >
              {step.id}
            </div>
            <p
              className={`text-sm font-medium ${
                step.id === activeStep ? "text-amber-800" : "text-gray-400"
              }`}
            >
              {step.title}
            </p>
          </div>
        ))}
      </div>
      <div className="w-full flex flex-col lg:flex-row gap-16">
        <div className="w-full lg:w-7/12 shadow-lg border-1 border-gray-100 p-8">
          {activeStep === 1 &&
            cart.map((item) => (
              <div
                key={item.id + item.selectedSize + item.selectedColor}
                className="flex items-center justify-between"
              >
                <div className="flex gap-8">
                  <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={(item.images as Record<string, string>)?.[item.selectedColor] || ""}
                      alt={item.name}
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="flex-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {item.selectedSize}
                      </p>
                      <p className="text-xs text-gray-500">
                        Color: {item.selectedColor}
                      </p>
                    </div>
                    <p className="font-medium">${((item.price / 100) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item)}
                  className="w-8 h-8 bg-red-100 bg-gray-100 rounded-full transition-all duration-300 text-red-400 flex items-center"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          {activeStep === 2 && (
            <ShippingForm setShippingForm={setShippingForm} />
          )}
          {activeStep === 3 && shippingForm ? (
            <StripePaymentForm shippingForm={shippingForm} />
          ) : (
            <p className="text-sm text-gray-500">
              Please fill shipping form first
            </p>
          )}
        </div>
        <div className="w-full lg:w-5/12  shadow-lg border-1 border-gray-100 p-8 h-max">
          <h2 className="font-semibold">Cart Details</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="text-gray-500">Subtotal</p>
              <p className="font-medium">${cart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="text-gray-500">Discount (10%)</p>
              <p className="font-medium">${(cart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0) * 0.1).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="text-gray-500">Shipping Fee</p>
              <p className="font-medium">$ 10</p>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <p className="text-gray-500">Total</p>
              <p className="font-medium">${(cart.reduce((acc, item) => acc + (item.price / 100) * item.quantity, 0) * 0.9 + 10).toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/cart?step=2", { scroll: false })}
            className="w-full bg-gray-800 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
