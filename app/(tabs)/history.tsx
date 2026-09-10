import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useListReadings, type Reading } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useIsRtl } from '@/hooks/useIsRtl';
import colors from '@/constants/colors';

const KIND_ICON: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  face: 'camera',
  palm: 'sun',
  voice: 'mic',
  astro: 'moon',
  combo: 'eye',
};

const KIND_LABEL_KEY: Record<string, string> = {
  face: 'mobile.history.kindFace',
  palm: 'mobile.history.kindPalm',
  voice: 'mobile.history.kindVoice',
  astro: 'mobile.history.kindAstro',
  combo: 'mobile.history.kindCombo',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase();
}

export default function HistoryScreen() {
  const c = useColors();
  const rtl = useIsRtl();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useListReadings();
  const [query, setQuery] = useState('');

  const topPad = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;
  const allReadings = data ?? [];

  const readings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allReadings;
    return allReadings.filter((r: Reading) =>
      r.archetype.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      (KIND_LABEL_KEY[r.kind] ? t(KIND_LABEL_KEY[r.kind]) : r.kind).toLowerCase().includes(q)
    );
  }, [allReadings, query, t]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={readings}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={allReadings.length > 0}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={c.primary} />
        }
        contentContainerStyle={{
          paddingTop: topPad,
          paddingHorizontal: 20,
          paddingBottom: 120,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 8 }}>
            <View>
              <Text style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 26 }}>
                {t('mobile.history.title')}
              </Text>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                {t('mobile.history.subtitle')}
              </Text>
            </View>
            {allReadings.length > 0 ? (
              <View
                style={{
                  flexDirection: rtl ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: colors.radius,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Feather name="search" size={16} color={c.mutedForeground} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('mobile.history.searchPlaceholder')}
                  placeholderTextColor={c.mutedForeground}
                  style={{
                    flex: 1,
                    color: c.foreground,
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    textAlign: rtl ? 'right' : 'left',
                  }}
                />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={c.primary} />
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 60, alignItems: 'center', gap: 10 }}>
              <Feather name="alert-circle" size={28} color={c.destructive} />
              <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular' }}>
                {t('mobile.history.loadError')}
              </Text>
              <Pressable onPress={() => refetch()}>
                <Text style={{ color: c.primary, fontFamily: 'Inter_600SemiBold' }}>{t('mobile.common.retry')}</Text>
              </Pressable>
            </View>
          ) : allReadings.length > 0 ? (
            <View style={{ paddingVertical: 60, alignItems: 'center', gap: 10 }}>
              <Feather name="search" size={28} color={c.mutedForeground} />
              <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
                {t('mobile.history.noResults')}
              </Text>
            </View>
          ) : (
            <View style={{ paddingVertical: 60, alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons name="crystal-ball" size={34} color={c.mutedForeground} />
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                {t('mobile.history.empty')}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`reading-${item.id}`}
            onPress={() => router.push(`/reading/${item.id}` as never)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={[styles.iconWrap, { backgroundColor: c.secondary }]}>
                <Feather name={KIND_ICON[item.kind] ?? 'star'} size={18} color={c.primary} />
              </View>
              <Text
                style={{
                  color: c.mutedForeground,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={{ gap: 4 }}>
              <Text
                style={{ color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 }}
                numberOfLines={1}
              >
                {KIND_LABEL_KEY[item.kind] ? t(KIND_LABEL_KEY[item.kind]) : item.kind}
              </Text>
              <Text
                style={{ color: c.primary, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}
                numberOfLines={1}
              >
                {item.archetype}
              </Text>
              <Text
                style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 }}
                numberOfLines={2}
              >
                {item.summary}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    borderWidth: 1,
    borderRadius: colors.radius,
    padding: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
