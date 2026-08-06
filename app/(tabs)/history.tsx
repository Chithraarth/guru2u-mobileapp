import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useListReadings } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
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

export default function HistoryScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useListReadings();

  const topPad = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;
  const readings = data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={readings}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={readings.length > 0}
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
          <Text
            style={{
              color: c.foreground,
              fontFamily: 'Inter_700Bold',
              fontSize: 26,
              marginBottom: 8,
            }}
          >
            {t('mobile.history.title')}
          </Text>
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
              styles.row,
              { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: c.secondary }]}>
              <Feather name={KIND_ICON[item.kind] ?? 'star'} size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{ color: c.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}
                numberOfLines={1}
              >
                {item.archetype}
              </Text>
              <Text
                style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12 }}
                numberOfLines={1}
              >
                {(KIND_LABEL_KEY[item.kind] ? t(KIND_LABEL_KEY[item.kind]) : item.kind)} ·{' '}
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={c.mutedForeground} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: colors.radius,
    padding: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
