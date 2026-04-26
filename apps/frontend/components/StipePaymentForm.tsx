"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { CartItemsType, ShippingFormInputs } from "@/lib/cart";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

const fetchClientSecret = async (cart: CartItemsType): Promise<string> => {
  const response = await fetch("/api/payments/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  const json = (await response.json()) as { clientSecret?: string };

  if (!json.clientSecret) {
    throw new Error("Missing checkout session client secret");
  }

  return json.clientSecret;
};

const StripePaymentForm = ({
  shippingForm,
}: {
  shippingForm: ShippingFormInputs;
}) => {
  const { cart } = useCartStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientSecret(cart as CartItemsType)
      .then(setClientSecret)
      .catch((e: unknown) =>
        setError(
          e instanceof Error ? e.message : "Failed to initialise payment",
        ),
      );
  }, [cart]);

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!clientSecret) {
    return <p className="text-sm text-gray-500">Preparing payment…</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm shippingForm={shippingForm} />
    </Elements>
  );
};

export default StripePaymentForm;
