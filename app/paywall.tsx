import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useIAP, ErrorCode } from 'react-native-iap';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/authContext';
import { READING_PACK_SKU, getBillingStatus, verifyPurchase } from '@/lib/billing';
import { contactOf } from '@/lib/user';
import { ErrorBox, PrimaryButton } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

const BENEFIT_KEYS = ['mobile.plans.benefit2', 'mobile.plans.benefit3'];

export default function PaywallScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const statusQuery = useQuery({ queryKey: ['billing', 'status'], queryFn: getBillingStatus });
  const scansRemaining = statusQuery.data?.scansRemaining;

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      setActionError(null);
      try {
        if (!purchase.purchaseToken) throw new Error('Missing purchase token');
        const result = await verifyPurchase(purchase.purchaseToken, purchase.productId);
        queryClient.setQueryData(['billing', 'status'], { scansRemaining: result.scansRemaining });
        setPurchased(true);
        await finishTransaction({ purchase, isConsumable: true });
      } catch (e) {
        setActionError(e instanceof Error ? e.message : t('mobile.paywall.genericError'));
      } finally {
        setBusy(false);
      }
    },
    onPurchaseError: (error) => {
      setBusy(false);
      if (error.code !== ErrorCode.UserCancelled) {
        setActionError(error.message || t('mobile.paywall.genericError'));
      }
    },
  });

  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: [READING_PACK_SKU], type: 'in-app' });
    }
  }, [connected, fetchProducts]);

  const product = products.find((p) => p.id === READING_PACK_SKU);
  const price = product?.displayPrice ?? '₹699';

  const buy = async () => {
    if (!connected || !user) return;
    setActionError(null);
    setBusy(true);
    try {
      await requestPurchase({
        request: {
          google: {
            skus: [READING_PACK_SKU],
            obfuscatedAccountId: user.uid,
          },
        },
        type: 'in-app',
      });
    } catch (e) {
      setBusy(false);
      setActionError(e instanceof Error ? e.message : t('mobile.paywall.genericError'));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View style={[styles.crown, { backgroundColor: c.secondary }]}>
            <MaterialCommunityIcons name="crown-outline" size={30} color={c.accent} />
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.foreground, textAlign: 'center' }}>
            {t('mobile.plans.title')}
          </Text>
          {scansRemaining != null ? (
            <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground, textAlign: 'center' }}>
              {t('mobile.paywall.creditsRemaining', { count: scansRemaining })}
            </Text>
          ) : null}
        </View>

        {purchased ? (
          <View style={[styles.notice, { backgroundColor: c.accent + '1A', borderColor: c.accent }]}>
            <Feather name="check-circle" size={18} color={c.accent} />
            <Text style={{ flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: c.accentSoft }}>
              {t('mobile.paywall.purchaseSuccess')}
            </Text>
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          {BENEFIT_KEYS.map((key) => (
            <View key={key} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Feather name="check" size={18} color={c.accent} />
              <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 15, color: c.foreground }}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.pack, { backgroundColor: c.card, borderColor: c.accent }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={[styles.packIcon, { backgroundColor: c.primaryFill }]}>
              <Feather name="star" size={22} color={c.primaryForeground} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fonts.semibold, fontSize: 17, color: c.foreground }}>
                {t('mobile.paywall.packTitle')}
              </Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: c.accent }}>{price}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.mutedForeground }}>
            {t('mobile.paywall.packDesc')}
          </Text>
        </View>

        {!connected ? (
          <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground, textAlign: 'center' }}>
            {t('mobile.paywall.storeUnavailable')}
          </Text>
        ) : null}
        {actionError ? <ErrorBox message={actionError} /> : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.background }]}>
        <PrimaryButton
          testID="buy-reading-pack"
          variant="gold"
          title={busy ? t('mobile.paywall.purchasing') : t('mobile.paywall.buyButton', { price })}
          onPress={buy}
          loading={busy}
          disabled={!connected || !product}
        />
        <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: c.subtle, textAlign: 'center' }}>
          {t('mobile.paywall.signedIn')}: {contactOf(user)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  crown: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: colors.radius,
    padding: 12,
  },
  pack: {
    borderWidth: 2,
    borderRadius: colors.radiusLg,
    padding: 18,
    gap: 12,
  },
  packIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 10,
  },
});
