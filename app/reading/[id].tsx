import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetReading,
  useDeleteReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
} from '@workspace/api-client-react';
import { ReadingResult } from '@/components/ReadingResult';
import { ErrorBox, MysticLoading } from '@/components/ui';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

export default function ReadingDetailScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const readingId = Number(id);
  const { data: reading, isLoading, error } = useGetReading(readingId);
  const deleteReading = useDeleteReading();

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
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 1,
              borderColor: c.destructive,
              borderRadius: colors.radius,
              paddingVertical: 13,
              opacity: deleteReading.isPending ? 0.5 : pressed ? 0.85 : 1,
            })}
          >
            <Feather name="trash-2" size={16} color={c.destructive} />
            <Text style={{ color: c.destructive, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>
              {t('mobile.reading.deleteButton')}
            </Text>
          </Pressable>
        </>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
