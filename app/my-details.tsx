import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Check, Hand, MapPin, ScanFace } from 'lucide-react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Card, ErrorBox, PrimaryButton, Segmented, SectionLabel } from '@/components/ui';
import { StarMark } from '@/components/nebula';
import { useAuth } from '@/lib/authContext';
import {
  PROFILE_QUERY_KEY,
  markSetupSkipped,
  saveMyPhoto,
  saveMyProfile,
  useMyProfile,
  type MyProfile,
} from '@/lib/profile';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

type PhotoKind = 'face' | 'palm';

/**
 * The user's own details: birth date, time and place, plus optional photos of
 * their own face and palm. Shown once after sign-in (`?setup=1`) and from
 * Profile to edit.
 */
export default function MyDetailsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { setup } = useLocalSearchParams<{ setup?: string }>();
  const isSetup = setup === '1';
  const { data: profile } = useMyProfile();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
  const [place, setPlace] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState<PhotoKind | null>(null);

  // Fill the form once from the saved profile.
  useEffect(() => {
    if (prefilled || !profile) return;
    if (profile.birthDate) {
      const [y, m, d] = profile.birthDate.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    }
    if (profile.birthTime) {
      const [h, mi] = profile.birthTime.split(':').map(Number);
      setHour(String(h % 12 === 0 ? 12 : h % 12));
      setMinute(String(mi).padStart(2, '0'));
      setAmpm(h >= 12 ? 'PM' : 'AM');
    }
    if (profile.birthPlace) setPlace(profile.birthPlace);
    setPrefilled(true);
  }, [profile, prefilled]);

  const done = () => {
    if (isSetup) router.replace('/(tabs)');
    else router.back();
  };

  const save = async () => {
    setError(null);
    const y = Number(year);
    const mo = Number(month);
    const d = Number(day);
    if (!y || !mo || !d || year.length !== 4 || mo < 1 || mo > 12 || d < 1 || d > 31) {
      setError(t('mobile.astro.invalidDate'));
      return;
    }
    if (!place.trim()) {
      setError(t('mobile.astro.missingPlace'));
      return;
    }
    let birthTime: string | null = null;
    if (hour !== '') {
      const h12 = Number(hour);
      const min = minute === '' ? 0 : Number(minute);
      if (!(h12 >= 1 && h12 <= 12) || !(min >= 0 && min <= 59)) {
        setError(t('mobile.astro.invalidTime'));
        return;
      }
      const h24 = (h12 % 12) + (ampm === 'PM' ? 12 : 0);
      birthTime = `${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    setSaving(true);
    try {
      const birthDate = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const saved = await saveMyProfile({ birthDate, birthTime, birthPlace: place.trim() });
      queryClient.setQueryData(PROFILE_QUERY_KEY, saved);
      done();
    } catch (e) {
      const msg = (e as { data?: { error?: string } })?.data?.error;
      setError(msg ?? t('mobile.myDetails.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    if (user) await markSetupSkipped(user.uid);
    done();
  };

  const pickPhoto = (kind: PhotoKind) => {
    const run = async (source: 'camera' | 'library') => {
      let result: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(t('mobile.photoPicker.cameraNeededTitle'), t('mobile.photoPicker.cameraNeededDesc'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          quality: 0.7,
          base64: true,
          cameraType: kind === 'face' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, base64: true });
      }
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.base64) {
        setError(t('mobile.myDetails.photoError'));
        return;
      }
      setError(null);
      setPhotoBusy(kind);
      try {
        const saved = await saveMyPhoto(kind, asset.base64, asset.mimeType ?? 'image/jpeg');
        queryClient.setQueryData(PROFILE_QUERY_KEY, (old: MyProfile | undefined) => ({ ...old, ...saved }));
      } catch {
        setError(t('mobile.myDetails.photoError'));
      } finally {
        setPhotoBusy(null);
      }
    };
    Alert.alert(kind === 'face' ? t('mobile.myDetails.yourFace') : t('mobile.myDetails.yourPalm'), undefined, [
      { text: t('mobile.photoPicker.camera'), onPress: () => run('camera') },
      { text: t('mobile.photoPicker.photoLibrary'), onPress: () => run('library') },
      { text: t('mobile.common.cancel'), style: 'cancel' },
    ]);
  };

  const inputStyle = [styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.foreground }];

  const photoRow = (kind: PhotoKind) => {
    const has = kind === 'face' ? profile?.hasFace : profile?.hasPalm;
    const Icon = kind === 'face' ? ScanFace : Hand;
    const busy = photoBusy === kind;
    return (
      <Pressable
        testID={`my-${kind}`}
        onPress={() => pickPhoto(kind)}
        disabled={!!photoBusy}
        accessibilityRole="button"
        style={({ pressed }) => [styles.photoRow, { borderColor: c.border, opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={[styles.photoIcon, { backgroundColor: kind === 'face' ? c.tintFace : c.tintPalm }]}>
          <Icon size={20} color={kind === 'face' ? c.tintFaceInk : c.tintPalmInk} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.foreground }}>
            {kind === 'face' ? t('mobile.myDetails.yourFace') : t('mobile.myDetails.yourPalm')}
          </Text>
          {busy ? (
            <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, color: c.mutedForeground }}>
              {t('mobile.myDetails.readingPhoto')}
            </Text>
          ) : has ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Check size={13} color={c.success} />
              <Text style={{ fontFamily: fonts.semibold, fontSize: 12.5, color: c.success }}>{t('mobile.myDetails.photoSaved')}</Text>
            </View>
          ) : null}
        </View>
        {busy ? (
          <ActivityIndicator color={c.accent} />
        ) : (
          <Text style={{ fontFamily: fonts.bold, fontSize: 13.5, color: c.accentInk }}>
            {has ? t('mobile.myDetails.replacePhoto') : t('mobile.myDetails.addPhoto')}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: isSetup ? insets.top + 20 : 16,
        paddingBottom: insets.bottom + 40,
        gap: 16,
      }}
      bottomOffset={40}
      keyboardShouldPersistTaps="handled"
    >
      {/* First-time setup is a full screen with no way back to the tabs. */}
      <Stack.Screen options={{ headerShown: !isSetup, gestureEnabled: !isSetup }} />
      {isSetup ? (
        <View style={{ gap: 10, marginBottom: 4 }}>
          <StarMark size={48} />
          <Text style={{ fontFamily: fonts.display, fontSize: 28, letterSpacing: -0.6, color: c.foreground }}>
            {t('mobile.myDetails.setupTitle')}
          </Text>
          <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: c.mutedForeground }}>
            {t('mobile.myDetails.setupSubtitle')}
          </Text>
        </View>
      ) : null}

      <Card>
        <SectionLabel>{t('mobile.myDetails.birthDate')}</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            testID="my-day"
            style={[...inputStyle, { flex: 1 }]}
            placeholder="DD"
            placeholderTextColor={c.subtle}
            keyboardType="number-pad"
            maxLength={2}
            value={day}
            onChangeText={setDay}
            accessibilityLabel="Day"
          />
          <TextInput
            testID="my-month"
            style={[...inputStyle, { flex: 1 }]}
            placeholder="MM"
            placeholderTextColor={c.subtle}
            keyboardType="number-pad"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
            accessibilityLabel="Month"
          />
          <TextInput
            testID="my-year"
            style={[...inputStyle, { flex: 1.4 }]}
            placeholder="YYYY"
            placeholderTextColor={c.subtle}
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={setYear}
            accessibilityLabel="Year"
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>{t('mobile.myDetails.birthTime')}</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            testID="my-hour"
            style={[...inputStyle, { flex: 1 }]}
            placeholder="HH"
            placeholderTextColor={c.subtle}
            keyboardType="number-pad"
            maxLength={2}
            value={hour}
            onChangeText={setHour}
            accessibilityLabel="Hour"
          />
          <Text style={{ color: c.mutedForeground, fontSize: 18, fontFamily: fonts.semibold }}>:</Text>
          <TextInput
            testID="my-minute"
            style={[...inputStyle, { flex: 1 }]}
            placeholder="MM"
            placeholderTextColor={c.subtle}
            keyboardType="number-pad"
            maxLength={2}
            value={minute}
            onChangeText={setMinute}
            accessibilityLabel="Minute"
          />
          {/* Fixed width: the segmented control otherwise grows past the card edge. */}
          <View style={{ width: 120 }}>
            <Segmented
              value={ampm}
              onChange={setAmpm}
              options={[
                { value: 'AM', label: 'AM' },
                { value: 'PM', label: 'PM' },
              ]}
            />
          </View>
        </View>
      </Card>

      <Card>
        <SectionLabel>{t('mobile.myDetails.birthPlace')}</SectionLabel>
        <View style={[styles.placeRow, { backgroundColor: c.background, borderColor: c.border }]}>
          <MapPin size={18} color={c.mutedForeground} />
          <TextInput
            testID="my-place"
            style={{ flex: 1, minWidth: 0, color: c.foreground, fontFamily: fonts.regular, fontSize: 16 }}
            placeholder={t('mobile.myDetails.placePlaceholder')}
            placeholderTextColor={c.subtle}
            value={place}
            onChangeText={setPlace}
            accessibilityLabel={t('mobile.myDetails.birthPlace')}
          />
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <SectionLabel>{t('mobile.myDetails.photosTitle')}</SectionLabel>
        {photoRow('face')}
        {photoRow('palm')}
        <Text style={{ fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: c.mutedForeground }}>
          {t('mobile.myDetails.photosHint')}
        </Text>
      </Card>

      {error ? <ErrorBox message={error} /> : null}

      <PrimaryButton testID="my-save" title={t('mobile.myDetails.save')} onPress={save} loading={saving} />
      {isSetup ? (
        <Pressable onPress={skip} accessibilityRole="button" style={{ alignItems: 'center', padding: 10 }}>
          <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: c.mutedForeground }}>{t('mobile.myDetails.skip')}</Text>
        </Pressable>
      ) : null}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  input: {
    minWidth: 0,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  photoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
