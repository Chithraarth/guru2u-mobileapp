import { customFetch } from '@workspace/api-client-react';

export const READING_PACK_SKU = 'reading_pack_60';

export interface VerifyPurchaseResponse {
  scansRemaining: number;
}

export function verifyPurchase(purchaseToken: string, productId: string): Promise<VerifyPurchaseResponse> {
  return customFetch<VerifyPurchaseResponse>('/api/billing/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purchaseToken, productId }),
  });
}

export interface BillingStatus {
  scansRemaining: number;
}

export function getBillingStatus(): Promise<BillingStatus> {
  return customFetch<BillingStatus>('/api/billing/status');
}
