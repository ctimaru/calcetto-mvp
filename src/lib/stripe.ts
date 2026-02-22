import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PK) {
  throw new Error("Missing VITE_STRIPE_PUBLISHABLE_KEY");
}

export const stripePromise = loadStripe(STRIPE_PK);
