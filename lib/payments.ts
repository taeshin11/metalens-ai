// Lemon Squeezy payment integration (no business registration needed)

import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
} from '@lemonsqueezy/lemonsqueezy.js';

let initialized = false;

function init() {
  if (initialized) return;
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error('LEMONSQUEEZY_API_KEY not set');
  lemonSqueezySetup({ apiKey: key });
  initialized = true;
}

// Variant IDs from Lemon Squeezy dashboard
export const VARIANT_IDS = {
  pro_monthly: process.env.LS_VARIANT_PRO_MONTHLY || '',
  pro_yearly: process.env.LS_VARIANT_PRO_YEARLY || '',
  ultra_monthly: process.env.LS_VARIANT_ULTRA_MONTHLY || '',
  ultra_yearly: process.env.LS_VARIANT_ULTRA_YEARLY || '',
} as const;

export type PlanKey = keyof typeof VARIANT_IDS;

export function planKeyToTier(key: string): 'pro' | 'ultra' {
  return key.startsWith('ultra') ? 'ultra' : 'pro';
}

export function variantIdToPlanKey(variantId: string): PlanKey | null {
  for (const [key, id] of Object.entries(VARIANT_IDS)) {
    if (id === variantId) return key as PlanKey;
  }
  return null;
}

export async function createCheckoutUrl(
  variantId: string,
  email: string,
  redirectUrl: string,
): Promise<string | null> {
  init();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID not set');

  const { data, error } = await createCheckout(Number(storeId), Number(variantId), {
    checkoutData: {
      email,
      custom: { email },
    },
    productOptions: {
      redirectUrl,
    },
  });

  if (error) throw new Error(String(error));

  return data?.data.attributes.url ?? null;
}

export async function getSubscriptionDetails(subscriptionId: string) {
  init();
  const { data, error } = await getSubscription(subscriptionId);
  if (error) throw new Error(String(error));
  return data?.data.attributes ?? null;
}
