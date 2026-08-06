import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

export interface PickedImage {
  base64: string;
  mimeType: string;
  uri: string;
}

export function PhotoPicker({
  label,
  image,
  onPicked,
  onClear,
}: {
  label: string;
  image: PickedImage | null;
  onPicked: (img: PickedImage) => void;
  onClear?: () => void;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.base64) {
      Alert.alert(t('mobile.common.sorry'), t('mobile.photoPicker.readError'));
      return;
    }
    onPicked({
      base64: asset.base64,
      mimeType: asset.mimeType ?? 'image/jpeg',
      uri: asset.uri,
    });
  };

  const pickFromLibrary = async () => {
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
      });
      handleResult(result);
    } finally {
      setBusy(false);
    }
  };

  const takePhoto = async () => {
    setBusy(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('mobile.photoPicker.cameraNeededTitle'), t('mobile.photoPicker.cameraNeededDesc'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
      });
      handleResult(result);
    } finally {
      setBusy(false);
    }
  };

  if (image) {
    return (
      <View style={{ gap: 10 }}>
        <Image
          source={{ uri: image.uri }}
          style={{ width: '100%', height: 240, borderRadius: colors.radius }}
          resizeMode="cover"
        />
        {onClear ? (
          <Pressable
            testID="photo-clear"
            onPress={onClear}
            style={({ pressed }) => [
              styles.smallBtn,
              { backgroundColor: c.secondary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="x" size={16} color={c.secondaryForeground} />
            <Text style={{ color: c.secondaryForeground, fontFamily: 'Inter_500Medium' }}>
              {t('mobile.photoPicker.removePhoto')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          testID="photo-camera"
          disabled={busy}
          onPress={takePhoto}
          style={({ pressed }) => [
            styles.pickBtn,
            {
              backgroundColor: c.secondary,
              borderColor: c.border,
              opacity: busy ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="camera" size={22} color={c.primary} />
          <Text style={{ color: c.foreground, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
            {t('mobile.photoPicker.camera')}
          </Text>
        </Pressable>
        <Pressable
          testID="photo-library"
          disabled={busy}
          onPress={pickFromLibrary}
          style={({ pressed }) => [
            styles.pickBtn,
            {
              backgroundColor: c.secondary,
              borderColor: c.border,
              opacity: busy ? 0.5 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="image" size={22} color={c.primary} />
          <Text style={{ color: c.foreground, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
            {t('mobile.photoPicker.photoLibrary')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickBtn: {
    flex: 1,
    borderRadius: colors.radius,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 22,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    paddingVertical: 10,
  },
});
