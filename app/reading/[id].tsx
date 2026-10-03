import React from 'react';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetReading,
  useDeleteReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
} from '@workspace/api-client-react';
import { readingShareText } from '@/lib/readings';
import { ReadingResult } from '@/components/ReadingResult';
import { ErrorBox, MysticLoading } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

export default function ReadingDetailScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const readingId = Number(id);
  const { data: reading, isLoading, error } = useGetReading(readingId);
  const deleteReading = useDeleteReading();

  const share = () => {
    if (!reading) return;
    Share.share({ message: readingShareText(reading, t('mobile.result.nextMoves')) }).catch(() => {});
  };

  const confirmDelete = () => {
    Alert.alert(t('mobile.reading.deleteTitle'), t('mobile.reading.deleteMessage'), [
      { text: t('mobile.common.cancel'), style: 'cancel' },
      {
        text: t('mobile.reading.deleteConfirm'),
        style: 'destructive',
        onPress: () =>
          deleteReading.mutate(
            { id: readingId },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
                queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
                router.back();
              },
            },
          ),
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: reading
            ? () => (
                <Pressable onPress={share} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('mobile.reading.share')}>
                  <Feather name="share" size={20} color={c.foreground} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}
      >
        {isLoading ? (
          <MysticLoading label={t('mobile.reading.loading')} />
        ) : error || !reading ? (
          <ErrorBox message={t('mobile.reading.notFound')} />
        ) : (
          <>
            <ReadingResult reading={reading} />
            <Pressable
              testID="reading-delete"
              onPress={confirmDelete}
              disabled={deleteReading.isPending}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderWidth: 1,
                borderColor: c.destructiveBorder,
                borderRadius: 26,
                minHeight: 52,
                opacity: deleteReading.isPending ? 0.5 : pressed ? 0.85 : 1,
              })}
            >
              <Feather name="trash-2" size={16} color={c.destructive} />
              <Text style={{ color: c.destructive, fontFamily: fonts.semibold, fontSize: 15 }}>
                {t('mobile.reading.deleteButton')}
              </Text>
            </Pressable>
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </>
  );
}
