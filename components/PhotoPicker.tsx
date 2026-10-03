import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

export interface PickedImage {
  base64: string;
  mimeType: string;
  uri: string;
}

/**
 * Nebula capture frame: a framing guide (face oval or hand outline),
 * a gold shutter that opens the camera and a library shortcut.
 */
export function PhotoPicker({
  label,
  image,
  onPicked,
  onClear,
  guide = 'face',
  compact = false,
}: {
  label: string;
  image: PickedImage | null;
  onPicked: (img: PickedImage) => void;
  onClear?: () => void;
  guide?: 'face' | 'palm';
  compact?: boolean;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const frameHeight = compact ? 220 : 320;

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
        cameraType: guide === 'face' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      });
      handleResult(result);
    } finally {
      setBusy(false);
    }
  };

  if (image) {
    return (
      <View style={{ gap: 12 }}>
        <View style={[styles.frame, { height: frameHeight, borderColor: c.border }]}>
          <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        </View>
        {onClear ? (
          <Pressable
            testID="photo-clear"
            onPress={onClear}
            accessibilityRole="button"
            style={({ pressed }) => [styles.retake, { borderColor: c.borderStrong, opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="refresh-ccw" size={15} color={c.foreground} />
            <Text style={{ color: c.foreground, fontFamily: fonts.medium, fontSize: 14 }}>
              {t('mobile.photoPicker.retake')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: 18 }}>
      <View style={[styles.frame, { height: frameHeight, backgroundColor: '#15101C', borderColor: c.border }]}>
        {guide === 'face' ? (
          <View
            style={{
              width: frameHeight * 0.58,
              height: frameHeight * 0.78,
              borderRadius: frameHeight,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: c.accent,
            }}
          />
        ) : (
          <MaterialCommunityIcons name="hand-back-left-outline" size={frameHeight * 0.6} color={c.accent} style={{ opacity: 0.8 }} />
        )}
        <View style={[styles.hint, { backgroundColor: 'rgba(14,8,18,0.8)' }]}>
          <Text style={{ color: c.foreground, fontFamily: fonts.regular, fontSize: 13, textAlign: 'center' }}>{label}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <Pressable
          testID="photo-library"
          disabled={busy}
          onPress={pickFromLibrary}
          accessibilityRole="button"
          accessibilityLabel={t('mobile.photoPicker.photoLibrary')}
          style={({ pressed }) => [
            styles.side,
            { backgroundColor: c.card, borderColor: c.border, opacity: busy ? 0.5 : pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="image" size={22} color={c.foreground} />
        </Pressable>
        <Pressable
          testID="photo-camera"
          disabled={busy}
          onPress={takePhoto}
          accessibilityRole="button"
          accessibilityLabel={t('mobile.photoPicker.camera')}
          style={({ pressed }) => [styles.shutter, { borderColor: c.accent, opacity: busy ? 0.5 : pressed ? 0.85 : 1 }]}
        >
          <View style={[styles.shutterInner, { backgroundColor: c.foreground }]} />
        </Pressable>
        <View style={{ width: 52 }} />
      </View>
      <Text style={{ textAlign: 'center', color: c.subtle, fontFamily: fonts.regular, fontSize: 12 }}>
        {t('mobile.photoPicker.privacyNote')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: colors.radiusLg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  side: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  retake: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
  },
});
