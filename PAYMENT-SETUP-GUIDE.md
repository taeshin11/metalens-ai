# MetaLens AI — Payment Setup Guide (Lemon Squeezy)

When you're ready to enable paid plans, follow these steps.

---

## 1. Lemon Squeezy Account Setup

Store already created: **kingkingmarket** on https://app.lemonsqueezy.com

### Remaining Steps:
1. **Activate Store** — Identity verification (need bank account)
   - Website: `https://metalens-ai.vercel.app`
   - Product description: "MetaLens AI is a web application that provides AI-powered medical research meta-analysis summaries. Users enter medical keywords and receive structured analysis from 40M+ PubMed papers. We offer free and paid subscription plans (Pro $2.99/mo, Ultra $6.99/mo) through our website."
2. **Bank Account** (KakaoBank):
   - Name: Your passport English name (e.g., KIM TAESHIN)
   - SWIFT / BIC: `CITIKRSXKAK`
   - Account number: Your KakaoBank account number
3. **2FA** — Set up two-factor authentication
4. **Create 4 subscription products**:

| Product Name | Type | Price |
|---|---|---|
| MetaLens Pro Monthly | Subscription | $2.99/month |
| MetaLens Pro Yearly | Subscription | $29.99/year |
| MetaLens Ultra Monthly | Subscription | $6.99/month |
| MetaLens Ultra Yearly | Subscription | $69.99/year |

5. **Copy Variant IDs** from each product → set as env vars

---

## 2. Environment Variables to Set

On Vercel (https://vercel.com/dashboard) → MetaLens project → Settings → Environment Variables:

```env
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

LS_VARIANT_PRO_MONTHLY=variant_id_here
LS_VARIANT_PRO_YEARLY=variant_id_here
LS_VARIANT_ULTRA_MONTHLY=variant_id_here
LS_VARIANT_ULTRA_YEARLY=variant_id_here
```

### Where to find these:
- **API Key**: Lemon Squeezy → Settings → API Keys → Create
- **Store ID**: Lemon Squeezy → Settings → Store → Store ID (number in URL)
- **Webhook Secret**: Created when you set up the webhook (step 3)
- **Variant IDs**: Lemon Squeezy → Store → Products → Click product → Variant ID in URL

---

## 3. Webhook Setup

In Lemon Squeezy dashboard → Settings → Webhooks → Add Webhook:

- **URL**: `https://metalens-ai.vercel.app/api/stripe/webhook`
- **Secret**: Generate one and copy it → set as `LEMONSQUEEZY_WEBHOOK_SECRET`
- **Events to listen for**:
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_expired`

---

## 4. Re-enable Paid Features in Code

The paid tier code is already built but hidden. To re-enable:

1. In `components/Header.tsx` — uncomment the Pricing link
2. In `components/UpsellBanner.tsx` — re-enable the component
3. In `components/UpgradeGate.tsx` — re-enable the component
4. In the homepage and results pages — restore upgrade prompts
5. In `lib/constants.ts` — the tier config is already defined (free/pro/ultra)

All payment-related code lives in:
- `lib/payments.ts` — Lemon Squeezy SDK integration
- `lib/stripe.ts` — Re-exports from payments.ts
- `app/api/stripe/checkout/route.ts` — Creates checkout sessions
- `app/api/stripe/webhook/route.ts` — Handles subscription events
- `app/api/stripe/portal/route.ts` — Customer portal
- `app/[locale]/pricing/page.tsx` — Pricing page UI
- `lib/rate-limit.ts` — Rate limiting by tier
- `lib/usage-tracker.ts` — Usage tracking

---

## 5. Testing

Before going live:
1. Use Lemon Squeezy **Test Mode** first
2. Create test products with test variant IDs
3. Test the full flow: checkout → webhook → tier upgrade
4. Switch to Live Mode when ready

---

*Last updated: 2026-04-02*
