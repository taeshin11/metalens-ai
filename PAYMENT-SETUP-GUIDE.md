# MetaLens AI — Payment Setup Guide (Lemon Squeezy)

When you're ready to enable paid plans, follow these steps.

---

## 1. Lemon Squeezy Account Setup

Store already created: **kingkingmarket** on https://app.lemonsqueezy.com

### Remaining Steps:
1. **Activate Store** — Identity verification (need bank account)
   - Website: `https://metalens-ai.vercel.app`
   - Product description: "MetaLens AI is a web application that provides AI-powered medical research meta-analysis summaries. Users enter medical keywords and receive structured analysis from 40M+ PubMed papers. We offer a free tier and a Pro subscription ($4.99/mo) through our website."
2. **Bank Account** (KakaoBank):
   - Name: Your passport English name (e.g., KIM TAESHIN)
   - SWIFT / BIC: `CITIKRSXKAK`
   - Account number: Your KakaoBank account number
3. **2FA** — Set up two-factor authentication
4. **Create 2 subscription products**:

| Product Name | Type | Price |
|---|---|---|
| MetaLens Pro Monthly | Subscription | $4.99/month |
| MetaLens Pro Yearly | Subscription | $39.99/year |

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
```

### Where to find these:
- **API Key**: Lemon Squeezy → Settings → API Keys → Create
- **Store ID**: Lemon Squeezy → Settings → Store → Store ID (number in URL)
- **Webhook Secret**: Created when you set up the webhook (step 3)
- **Variant IDs**: Lemon Squeezy → Store → Products → Click product → Variant ID in URL

---

## 3. Webhook Setup

In Lemon Squeezy dashboard → Settings → Webhooks → Add Webhook:

- **URL**: `https://metalens-ai.vercel.app/api/lemonsqueezy/webhook`
- **Secret**: Generate one and copy it → set as `LEMONSQUEEZY_WEBHOOK_SECRET`
- **Events to listen for**:
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_expired`

---

## 4. Paid Features Status

모든 유료화 코드가 활성화된 상태. 별도 조치 불필요:
- Clerk auth 통합 완료 (publicMetadata.tier로 플랜 관리)
- UpgradeGate / UpsellBanner 활성화
- Upstash Redis rate limiting 활성화

All payment-related code lives in:
- `lib/payments.ts` — Lemon Squeezy SDK integration
- `app/api/lemonsqueezy/checkout/route.ts` — Creates checkout sessions
- `app/api/lemonsqueezy/webhook/route.ts` — Handles subscription events
- `app/api/lemonsqueezy/portal/route.ts` — Customer portal
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
