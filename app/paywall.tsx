import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useIAP, ErrorCode } from 'react-native-iap';
import { useAuth } from '@/lib/authContext';
import { signOutUser } from '@/lib/firebase';
import { READING_PACK_SKU, verifyPurchase } from '@/lib/billing';
import { Card, PrimaryButton, ErrorBox } from '@/components/ui';
import { useColors } from '@/hooks/useColors';

export default function PaywallScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      setActionError(null);
      try {
        if (!purchase.purchaseToken) throw new Error('Missing purchase token');
        const result = await verifyPurchase(purchase.purchaseToken, purchase.productId);
        setScansRemaining(result.scansRemaining);
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
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      {scansRemaining !== null ? (
        <Card style={{ gap: 8, borderColor: c.primary }}>
          <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>
            {t('mobile.paywall.purchaseSuccess')}
          </Text>
          <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            {t('mobile.paywall.creditsRemaining', { count: scansRemaining })}
          </Text>
        </Card>
      ) : null}

      <Card style={{ gap: 8 }}>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 20 }}>
          {t('mobile.paywall.packTitle')}
        </Text>
        <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {t('mobile.paywall.packDesc')}
        </Text>
        {!connected ? (
          <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
            {t('mobile.paywall.storeUnavailable')}
          </Text>
        ) : (
          <PrimaryButton
            testID="buy-reading-pack"
            title={
              busy
                ? t('mobile.paywall.purchasing')
                : t('mobile.paywall.buyButton', { price: product?.displayPrice ?? '₹699' })
            }
            onPress={buy}
            loading={busy}
            disabled={!product}
          />
        )}
      </Card>

      {actionError ? <ErrorBox message={actionError} /> : null}

      <Card style={{ gap: 8 }}>
        <Text style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
          {t('mobile.paywall.account')}
        </Text>
        <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>
          {t('mobile.paywall.signedIn')}: {user?.email ?? user?.phoneNumber ?? ''}
        </Text>
        <PrimaryButton title={t('mobile.paywall.signOut')} onPress={() => signOutUser()} />
      </Card>
    </ScrollView>
  );
}
