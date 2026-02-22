# Supabase Edge Function Setup for App Calcetto

## ⚠️ Important: Edge Functions are Deployed Separately

Supabase Edge Functions **cannot** be deployed from this Spark frontend project. They must be deployed to your Supabase project using the Supabase CLI.

## 📋 What You Need

1. **Supabase CLI** installed locally
2. **Supabase project** already created
3. **Stripe account** (for payment processing)
4. **Stripe Secret Key** (starts with `sk_test_` or `sk_live_`)

## 🚀 Quick Setup

### Step 1: Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use npm (any OS)
npm install -g supabase
```

### Step 2: Link Your Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project (you'll need your project ref from the dashboard URL)
supabase link --project-ref your-project-ref
```

### Step 3: Create the Edge Function Locally

Create this folder structure in a **separate directory** (not in this Spark project):

```
my-supabase-functions/
└── supabase/
    └── functions/
        └── create-payment-intent/
            └── index.ts
```

### Step 4: Add the Edge Function Code

Create `supabase/functions/create-payment-intent/index.ts` with this content:

```typescript
console.log("create-payment-intent HIT");

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY");
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials");
}

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

serve(async (req) => {
  console.log("Request received:", req.method);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    console.log("Parsing authorization header...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Verifying user token...");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid token:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("User verified:", user.id);

    const { matchId } = await req.json();
    console.log("Match ID:", matchId);

    if (!matchId) {
      return new Response(
        JSON.stringify({ error: "Missing matchId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching match details...");
    const { data: match, error: matchError } = await supabaseAdmin
      .from("matches")
      .select("id, price_per_player_cents, city, start_time")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      console.error("Match not found:", matchError);
      return new Response(
        JSON.stringify({ error: "Match not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Match found:", match.id);

    console.log("Fetching participation...");
    const { data: participation, error: partError } = await supabaseAdmin
      .from("participations")
      .select("id, status, stripe_payment_intent_id")
      .eq("match_id", matchId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (partError) {
      console.error("Participation error:", partError);
      return new Response(
        JSON.stringify({ error: partError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Participation:", participation);

    if (participation?.status === "confirmed") {
      console.log("Already confirmed, skipping payment");
      return new Response(
        JSON.stringify({ alreadyConfirmed: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!participation) {
      console.error("No participation found - user must join first");
      return new Response(
        JSON.stringify({ error: "Must join match before payment" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Creating Stripe PaymentIntent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: match.price_per_player_cents,
      currency: "eur",
      metadata: {
        matchId: match.id,
        userId: user.id,
        participationId: participation.id,
      },
      automatic_payment_methods: { enabled: true },
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    console.log("Updating participation with payment intent ID...");
    const { error: updateError } = await supabaseAdmin
      .from("participations")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", participation.id);

    if (updateError) {
      console.error("Failed to update participation:", updateError);
    }

    console.log("Success - returning client secret");
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### Step 5: Set Stripe Secret in Supabase

Go to your Supabase Dashboard → Settings → Edge Functions → Secrets:

Add a new secret:
- Name: `STRIPE_SECRET_KEY`
- Value: `sk_test_your_stripe_secret_key`

### Step 6: Deploy the Function

```bash
cd my-supabase-functions  # wherever you created the folder
supabase functions deploy create-payment-intent
```

### Step 7: Verify Deployment

Check the deployment:

```bash
supabase functions list
```

You should see `create-payment-intent` in the list.

## 🔍 Testing the Function

You can test it from your Supabase Dashboard:
1. Go to Edge Functions
2. Select `create-payment-intent`
3. View logs to see the "create-payment-intent HIT" message

## 🐛 Troubleshooting 401 Errors

The `console.log("create-payment-intent HIT")` at the top of the function helps diagnose:

- **If you see the log**: The function is running, but there's an auth issue in your code
- **If you don't see the log**: The function isn't deployed or there's a network/routing issue

### Common 401 Causes:

1. **Missing Authorization header** - Make sure your frontend passes the token
2. **Invalid token** - Token might be expired
3. **Function not deployed** - Deploy the function first
4. **Wrong Supabase URL** - Verify your env vars match

## 📝 Frontend Integration

Once deployed, your frontend code (already in this project) will call it like this:

```typescript
const { data, error } = await supabase.functions.invoke("create-payment-intent", {
  body: { matchId },
});
```

The Supabase client automatically includes the auth token in the request.

## 🔗 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Deploy Edge Functions](https://supabase.com/docs/guides/functions/deploy)

## ❓ Still Getting 401?

Check these in order:

1. ✅ Function is deployed: `supabase functions list`
2. ✅ Stripe secret is set in Supabase dashboard
3. ✅ User is logged in when calling from frontend
4. ✅ Authorization header is being sent (check browser Network tab)
5. ✅ Check Edge Function logs in Supabase dashboard for the "HIT" message
