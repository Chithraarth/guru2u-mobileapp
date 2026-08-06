import { customFetch } from '@workspace/api-client-react';

export interface Plan {
  product_id: string;
  name: string;
  description: string | null;
  metadata: { planKey?: string; dailyLimit?: string };
  price_id: string;
  unit_amount: number;
  currency: string;
  interval: string | null;
}

export interface BillingStatus {
  planKey: string | null;
  planName: string | null;
  dailyLimit: number | null;
  usedToday: number;
  extraCredits: number;
  freeUntil: string | null;
  canRead: boolean;
  reason: string;
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return customFetch<T>(`/api/billing/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function get<T>(path: string): Promise<T> {
  return customFetch<T>(`/api/billing/${path}`);
}

export const billing = {
  plans: () => get<{ data: Plan[] }>('plans'),
  status: () => get<BillingStatus>('status'),
  checkout: (priceId: string) =>
    post<{ url: string }>('checkout', { priceId, platform: 'mobile' }),
  extraCheckout: (quantity = 1) =>
    post<{ url: string }>('extra-checkout', { quantity, platform: 'mobile' }),
  confirm: (sessionId: string) => post<BillingStatus>('confirm', { sessionId }),
  portal: () => post<{ url: string }>('portal'),
};

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}
