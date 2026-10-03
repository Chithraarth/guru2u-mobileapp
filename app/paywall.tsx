import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { billing, formatMoney, type Plan } from '@/lib/billing';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

const BENEFIT_KEYS = ['mobile.plans.benefit1', 'mobile.plans.benefit2', 'mobile.plans.benefit3'];

function PlanOption({
  plan,
  selected,
  current,
  featured,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  current: boolean;
  featured: boolean;
  onSelect: () => void;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const price = formatMoney(plan.unit_amount / 100, plan.currency);
  const limit = plan.metadata?.dailyLimit;
  return (
    <Pressable
      testID={`plan-${plan.price_id}`}
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[
        styles.plan,
        {
          backgroundColor: c.card,
          borderColor: selected ? c.accent : c.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {featured || current ? (
        <View style={[styles.badge, { backgroundColor: current ? c.primaryFill : c.accent }]}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 11, color: current ? c.primaryForeground : c.accentForeground }}>
            {current ? t('mobile.paywall.currentPlan').toUpperCase() : t('mobile.plans.popular')}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: selected ? 6 : 2,
          borderColor: selected ? c.accent : c.borderStrong,
        }}
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 16, color: c.foreground }}>{plan.name}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground }} numberOfLines={2}>
          {limit ? t('mobile.plans.perDay', { count: Number(limit) }) : plan.description ?? t('mobile.plans.unlimited')}
        </Text>
      </View>
      <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: c.foreground }}>
        {price}
        {plan.interval ? (
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground }}> / {plan.interval}</Text>
        ) : null}
      </Text>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const plansQuery = useQuery({ queryKey: ['billing', 'plans'], queryFn: billing.plans });
  const statusQuery = useQuery({ queryKey: ['billing', 'status'], queryFn: billing.status });

  const status = statusQuery.data;
  const allPlans = plansQuery.data?.data ?? [];
  const plans = allPlans.filter((p) => p.metadata?.planKey !== 'extra_reading');
  const extraPlan = allPlans.find((p) => p.metadata?.planKey === 'extra_reading');
  const isCurrent = (p: Plan) => Boolean(status?.planKey && p.metadata?.planKey === status.planKey);
  const featuredId = plans.length > 1 ? plans[0]?.price_id : undefined;

  useEffect(() => {
    if (selectedId || plans.length === 0) return;
    setSelectedId((plans.find((p) => !isCurrent(p)) ?? plans[0]).price_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans.length, status?.planKey]);

  const selected = plans.find((p) => p.price_id === selectedId);

  const run = async (key: string, fn: () => Promise<{ url: string }>) => {
    setActionError(null);
    setBusyKey(key);
    try {
      const { url } = await fn();
      await WebBrowser.openBrowserAsync(url);
      // Refresh entitlements after the browser closes.
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t('mobile.paywall.genericError'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View style={[styles.crown, { backgroundColor: c.secondary }]}>
            <MaterialCommunityIcons name="crown-outline" size={30} color={c.accent} />
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.foreground, textAlign: 'center' }}>
            {t('mobile.plans.title')}
          </Text>
          {status ? (
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground, textAlign: 'center' }}>
              {status.dailyLimit != null
                ? t('mobile.paywall.usageWithLimit', { used: status.usedToday, limit: status.dailyLimit })
                : t('mobile.paywall.usageNoLimit')}
              {status.extraCredits > 0 ? t('mobile.paywall.extraLeft', { count: status.extraCredits }) : ''}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 10 }}>
          {BENEFIT_KEYS.map((key) => (
            <View key={key} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Feather name="check" size={18} color={c.accent} />
              <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: c.foreground }}>{t(key)}</Text>
            </View>
          ))}
        </View>

        {actionError ? <ErrorBox message={actionError} /> : null}
        {plansQuery.isLoading ? <ActivityIndicator color={c.accent} style={{ marginVertical: 20 }} /> : null}
        {plansQuery.isError ? <ErrorBox message={t('mobile.paywall.genericError')} /> : null}

        <View style={{ gap: 12, marginTop: 6 }}>
          {plans.map((plan) => (
            <PlanOption
              key={plan.price_id}
              plan={plan}
              selected={plan.price_id === selectedId}
              current={isCurrent(plan)}
              featured={plan.price_id === featuredId}
              onSelect={() => setSelectedId(plan.price_id)}
            />
          ))}
        </View>

        {extraPlan ? (
          <View style={[styles.extra, { borderColor: c.borderStrong }]}>
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, color: c.secondaryForeground }}>
              {t('mobile.plans.extraPrompt')}
            </Text>
            <Pressable
              testID="buy-extra"
              disabled={busyKey === 'extra'}
              onPress={() => run('extra', () => billing.extraCheckout(1))}
              accessibilityRole="button"
              style={({ pressed }) => [styles.extraBtn, { borderColor: c.borderStrong, opacity: pressed || busyKey === 'extra' ? 0.7 : 1 }]}
            >
              {busyKey === 'extra' ? (
                <ActivityIndicator size="small" color={c.accent} />
              ) : (
                <Text style={{ fontFamily: fonts.semibold, fontSize: 13, color: c.accent }}>
                  {t('mobile.plans.oneReading', { price: formatMoney(extraPlan.unit_amount / 100, extraPlan.currency) })}
                </Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {status?.planKey ? (
          <Pressable
            onPress={() => run('portal', billing.portal)}
            disabled={busyKey === 'portal'}
            accessibilityRole="button"
            style={{ alignItems: 'center', padding: 8 }}
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.accent }}>
              {busyKey === 'portal' ? '…' : t('mobile.paywall.manageSubscription')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {selected && !isCurrent(selected) ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: c.secondary }}>
          <PrimaryButton
            testID="subscribe"
            variant="gold"
            title={t('mobile.plans.continueWith', { plan: selected.name })}
            loading={busyKey === selected.price_id}
            onPress={() => run(selected.price_id, () => billing.checkout(selected.price_id))}
          />
          <Text style={{ marginTop: 10, textAlign: 'center', fontFamily: fonts.regular, fontSize: 12, color: c.mutedForeground }}>
            {t('mobile.plans.cancelAnytime')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  crown: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    padding: 16,
  },
  badge: {
    position: 'absolute',
    top: -11,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  extra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: colors.radiusLg - 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  extraBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
