import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreatePalmReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
} from '@workspace/api-client-react';
import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ReadingResult } from '@/components/ReadingResult';
import { MysticLoading, PrimaryButton } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';

export default function PalmReadingScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<PickedImage | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const create = useCreatePalmReading();

  const submit = () => {
    if (!image) return;
    create.mutate(
      { data: { imageBase64: image.base64, mimeType: image.mimeType } },
      {
        onSuccess: (r) => {
          setReading(r);
          queryClient.invalidateQueries({ queryKey: getListReadingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingStatsQueryKey() });
        },
      },
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 16 }}
    >
      {reading ? (
        <>
          <ReadingResult reading={reading} />
          <PrimaryButton
            title={t('mobile.palm.newReading')}
            onPress={() => {
              setReading(null);
              setImage(null);
            }}
          />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.palm.loading')} />
      ) : (
        <>
          <PhotoPicker
            label={t('mobile.palm.pickerLabel')}
            image={image}
            onPicked={setImage}
            onClear={() => setImage(null)}
          />
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.palm.photoError')} />
          ) : null}
          <PrimaryButton
            testID="palm-submit"
            title={t('mobile.palm.reveal')}
            onPress={submit}
            disabled={!image}
          />
        </>
      )}
    </ScrollView>
  );
}
