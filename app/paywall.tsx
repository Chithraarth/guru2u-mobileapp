import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/lib/authContext';
import { signOutUser } from '@/lib/firebase';
import { Feather } from '@expo/vector-icons';
import { billing, formatMoney, type Plan } from '@/lib/billing';
import { Card, PrimaryButton } from '@/components/ui';
import { ErrorBox } from '@/components/ui';
import { useColors } from '@/hooks/useColors';

async function openCheckout(url: string) {
  await WebBrowser.openBrowserAsync(url);
}

function PlanCard({
  plan,
  current,
  onSubscribe,
  busy,
}: {
  plan: Plan;
  current: boolean;
  onSubscribe: () => void;
  busy: boolean;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const price = formatMoney(plan.unit_amount / 100, plan.currency);
  return (
    <Card style={{ gap: 8, borderColor: current ? c.primary : c.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 17 }}>
          {plan.name}
        </Text>
        {current ? (
          <View
            style={{
              backgroundColor: c.primary + '22',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: c.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>
              {t('mobile.paywall.currentPlan')}
            </Text>
          </View>
        ) : null}
      </View>
      {plan.description ? (
        <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {plan.description}
        </Text>
      ) : null}
      <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 22 }}>
        {price}
        <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
          {plan.interval ? ` / ${plan.interval}` : ''}
        </Text>
      </Text>
      {!current ? (
        <PrimaryButton title={t('mobile.paywall.subscribe')} onPress={onSubscribe} loading={busy} />
      ) : null}
    </Card>
  );
}

export default function PaywallScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const plansQuery = useQuery({ queryKey: ['billing', 'plans'], queryFn: billing.plans });
  const statusQuery = useQuery({ queryKey: ['billing', 'status'], queryFn: billing.status });

  const status = statusQuery.data;
  const plans = (plansQuery.data?.data ?? []).filter(
    (p) => p.metadata?.planKey !== 'extra_reading',
  );
  const extraPlan = (plansQuery.data?.data ?? []).find(
    (p) => p.metadata?.planKey === 'extra_reading',
  );

  const run = async (key: string, fn: () => Promise<{ url: string }>) => {
    setActionError(null);
    setBusyKey(key);
    try {
      const { url } = await fn();
      await openCheckout(url);
      // Refresh entitlements after the browser closes.
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t('mobile.paywall.genericError'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 14 }}
    >
      {status ? (
        <Card style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Feather name="zap" size={16} color={c.primary} />
            <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
              {status.planName ?? t('mobile.paywall.noActivePlan')}
            </Text>
          </View>
          <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            {status.dailyLimit != null
              ? t('mobile.paywall.usageWithLimit', { used: status.usedToday, limit: status.dailyLimit })
              : t('mobile.paywall.usageNoLimit')}
            {status.extraCredits > 0 ? t('mobile.paywall.extraLeft', { count: status.extraCredits }) : ''}
          </Text>
        </Card>
      ) : null}

      {actionError ? <ErrorBox message={actionError} /> : null}

      {plans.map((plan) => (
        <PlanCard
          key={plan.price_id}
          plan={plan}
          current={Boolean(status?.planKey && plan.metadata?.planKey === status.planKey)}
          busy={busyKey === plan.price_id}
          onSubscribe={() => run(plan.price_id, () => billing.checkout(plan.price_id))}
        />
      ))}

      {extraPlan ? (
        <Card style={{ gap: 8 }}>
          <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 17 }}>
            {t('mobile.paywall.extraTitle')}
          </Text>
          <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            {t('mobile.paywall.extraDesc', {
              price: formatMoney(extraPlan.unit_amount / 100, extraPlan.currency),
            })}
          </Text>
          <PrimaryButton
            title={t('mobile.paywall.buyExtra')}
            loading={busyKey === 'extra'}
            onPress={() => run('extra', () => billing.extraCheckout(1))}
          />
        </Card>
      ) : null}

      {status?.planKey ? (
        <Card style={{ gap: 8 }}>
          <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
            {t('mobile.paywall.manageSubscription')}
          </Text>
          <PrimaryButton
            title={t('mobile.paywall.openBillingPortal')}
            loading={busyKey === 'portal'}
            onPress={() => run('portal', billing.portal)}
          />
        </Card>
      ) : null}

      <Card style={{ gap: 8 }}>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
          {t('mobile.paywall.account')}
        </Text>
        <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {user?.email ?? user?.phoneNumber ?? t('mobile.paywall.signedIn')}
        </Text>
        <Text
          onPress={() => signOutUser()}
          style={{
            color: c.destructive,
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            paddingVertical: 6,
          }}
        >
          {t('mobile.paywall.signOut')}
        </Text>
      </Card>
    </ScrollView>
  );
}
