import { loadStripe, Stripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn("⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not set. Payment functionality will be disabled.");
  console.warn("📖 See ENV_VARS.md or SPARK_ENV_SETUP.md for setup instructions.");
}

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
