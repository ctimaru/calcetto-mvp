import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PK) {
  console.warn("⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not set. Payment functionality will be disabled.");
  console.warn("📖 See ENV_VARS.md or SPARK_ENV_SETUP.md for setup instructions.");
}

export const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;
