"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { ShippingFormInputs } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

const CheckoutForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Validation failed");
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: shippingForm.name,
            email: shippingForm.email,
            phone: shippingForm.phone,
            address: {
              line1: shippingForm.address,
              city: shippingForm.city,
            },
          },
        },
        return_url: `${window.location.origin}/cart?step=4`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
    } else {
      clearCart();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full bg-gray-800 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
};

export default CheckoutForm;
