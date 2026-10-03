import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useListReadings, type Reading } from '@workspace/api-client-react';
import { Chip } from '@/components/ui';
import { KindTile, StarMark } from '@/components/nebula';
import { TAB_BAR_SPACE } from '@/components/NebulaTabBar';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const KIND_LABEL_KEY: Record<string, string> = {
  face: 'mobile.history.kindFace',
  palm: 'mobile.history.kindPalm',
  voice: 'mobile.history.kindVoice',
  astro: 'mobile.history.kindAstro',
  combo: 'mobile.history.kindCombo',
};

const FILTERS = ['all', 'face', 'voice', 'palm', 'astro', 'combo'] as const;
type Filter = (typeof FILTERS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

function sectionKeyFor(date: Date, now: Date): 'today' | 'week' | 'earlier' {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const time = date.getTime();
  if (time >= startOfToday) return 'today';
  if (time >= startOfToday - 6 * DAY_MS) return 'week';
  return 'earlier';
}

export default function HistoryScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useListReadings();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const kindLabel = (kind: string) => (KIND_LABEL_KEY[kind] ? t(KIND_LABEL_KEY[kind]) : kind);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const filtered = (data ?? []).filter(
      (r) =>
        (filter === 'all' || r.kind === filter) &&
        (!q || r.archetype.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q)),
    );
    const groups: Record<'today' | 'week' | 'earlier', Reading[]> = { today: [], week: [], earlier: [] };
    for (const r of filtered) groups[sectionKeyFor(new Date(r.createdAt), now)].push(r);
    return (['today', 'week', 'earlier'] as const)
      .filter((k) => groups[k].length > 0)
      .map((k) => ({ key: k, title: t(`mobile.history.section_${k}`), data: groups[k] }));
  }, [data, filter, query, t]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;
  const hasAny = (data ?? []).length > 0;

  const header = (
    <View style={{ gap: 14, marginBottom: 6 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 32, color: c.foreground }}>{t('mobile.history.title')}</Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: c.mutedForeground }}>
          {t('mobile.history.subtitle')}
        </Text>
      </View>
      {hasAny ? (
        <>
          <View style={[styles.search, { backgroundColor: c.card, borderColor: c.border }]}>
            <Feather name="search" size={18} color={c.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('mobile.history.searchPlaceholder')}
              placeholderTextColor={c.subtle}
              accessibilityLabel={t('mobile.history.searchPlaceholder')}
              returnKeyType="search"
              style={{ flex: 1, color: c.foreground, fontFamily: fonts.regular, fontSize: 15 }}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={t('mobile.common.cancel')}>
                <Feather name="x" size={16} color={c.mutedForeground} />
              </Pressable>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((f) => (
              <Chip
                key={f}
                testID={`history-filter-${f}`}
                label={f === 'all' ? t('mobile.history.filterAll') : kindLabel(f)}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={c.accent} />}
        contentContainerStyle={{ paddingTop: topPad, paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + insets.bottom }}
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: c.subtle }]}>{section.title}</Text>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingVertical: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={c.accent} />
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 60, alignItems: 'center', gap: 10 }}>
              <Feather name="alert-circle" size={28} color={c.destructive} />
              <Text style={{ color: c.mutedForeground, fontFamily: fonts.regular }}>{t('mobile.history.loadError')}</Text>
              <Pressable onPress={() => refetch()} accessibilityRole="button" style={{ padding: 8 }}>
                <Text style={{ color: c.accent, fontFamily: fonts.semibold }}>{t('mobile.common.retry')}</Text>
              </Pressable>
            </View>
          ) : hasAny ? (
            <Text style={{ paddingVertical: 40, textAlign: 'center', color: c.mutedForeground, fontFamily: fonts.regular }}>
              {t('mobile.history.noResults')}
            </Text>
          ) : (
            <View style={{ paddingVertical: 50, alignItems: 'center', gap: 14 }}>
              <StarMark size={64} halo />
              <Text style={{ color: c.mutedForeground, fontFamily: fonts.regular, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
                {t('mobile.history.empty')}
              </Text>
              <Pressable
                onPress={() => router.push('/')}
                accessibilityRole="button"
                style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, backgroundColor: c.primaryFill }}
              >
                <Text style={{ color: c.primaryForeground, fontFamily: fonts.semibold }}>{t('mobile.home.startReading')}</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            testID={`reading-${item.id}`}
            onPress={() => router.push(`/reading/${item.id}` as never)}
            style={({ pressed }) => [styles.row, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
          >
            <KindTile kind={item.kind} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: c.foreground, fontFamily: fonts.semibold, fontSize: 15 }} numberOfLines={1}>
                {item.archetype}
              </Text>
              <Text style={{ color: c.mutedForeground, fontFamily: fonts.regular, fontSize: 13 }} numberOfLines={1}>
                {kindLabel(item.kind)} ·{' '}
                {new Date(item.createdAt).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={c.subtle} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
