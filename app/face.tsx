import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateFaceReading,
  getListReadingsQueryKey,
  getGetReadingStatsQueryKey,
  type Reading,
} from '@workspace/api-client-react';
import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ReadingResult, ResultActions } from '@/components/ReadingResult';
import { MysticLoading, PrimaryButton } from '@/components/ui';
import { ReadingCreateError } from '@/components/ReadingCreateError';
import { useColors } from '@/hooks/useColors';

export default function FaceReadingScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [image, setImage] = useState<PickedImage | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const create = useCreateFaceReading();

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
          <ResultActions
            reading={reading}
            newLabel={t('mobile.face.newReading')}
            onNew={() => {
              setReading(null);
              setImage(null);
            }}
          />
        </>
      ) : create.isPending ? (
        <MysticLoading label={t('mobile.face.loading')} />
      ) : (
        <>
          <PhotoPicker
            label={t('mobile.face.pickerLabel')}
            image={image}
            onPicked={setImage}
            onClear={() => setImage(null)}
          />
          {create.isError ? (
            <ReadingCreateError error={create.error} fallbackMessage={t('mobile.face.photoError')} />
          ) : null}
          <PrimaryButton
            testID="face-submit"
            title={t('mobile.face.reveal')}
            icon="star"
            onPress={submit}
            disabled={!image}
          />
        </>
      )}
    </ScrollView>
  );
}
