import { Platform } from 'react-native';
import { customFetch } from '@workspace/api-client-react';

export const READING_PACK_SKU = 'reading_pack_60';

export interface VerifyPurchaseResponse {
  scansRemaining: number;
}

/**
 * Sends a completed purchase to the server for verification and crediting.
 * `purchaseToken` is the Play purchase token on Android and the StoreKit 2
 * signed transaction (JWS) on iOS.
 */
export function verifyPurchase(purchaseToken: string, productId: string): Promise<VerifyPurchaseResponse> {
  return customFetch<VerifyPurchaseResponse>('/api/billing/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purchaseToken, productId, platform: Platform.OS === 'ios' ? 'ios' : 'android' }),
  });
}

export interface BillingStatus {
  scansRemaining: number;
}

export function getBillingStatus(): Promise<BillingStatus> {
  return customFetch<BillingStatus>('/api/billing/status');
}
