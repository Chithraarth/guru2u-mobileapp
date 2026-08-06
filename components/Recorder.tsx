import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AudioModule,
  IOSOutputFormat,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

const MAX_MS = 30 * 60 * 1000; // 30 minutes
// Server rejects payloads over ~24MB; keep uploads safely below that.
const MAX_BYTES = 22 * 1024 * 1024;

// Speech-optimized: mono AAC at 64 kbps ≈ 14 MB for a full 30-minute recording,
// well under the server's upload limit.
const SPEECH_PRESET: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  numberOfChannels: 1,
  bitRate: 64000,
  sampleRate: 44100,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
  },
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    outputFormat: IOSOutputFormat.MPEG4AAC,
  },
};

function fmt(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Recorder({
  hint,
  disabled,
  onRecorded,
}: {
  hint: string;
  disabled?: boolean;
  onRecorded: (audioBase64: string) => void;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const recorder = useAudioRecorder(SPEECH_PRESET);
  const state = useAudioRecorderState(recorder, 500);
  const [phase, setPhase] = useState<'idle' | 'recording' | 'paused' | 'processing'>('idle');

  // Auto-stop at 30 minutes
  useEffect(() => {
    if (phase === 'recording' && state.durationMillis >= MAX_MS) {
      void stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.durationMillis, phase]);

  const start = async () => {
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('mobile.recorder.micNeededTitle'), t('mobile.recorder.micNeededDesc'));
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('recording');
  };

  const pause = () => {
    recorder.pause();
    setPhase('paused');
  };

  const resume = () => {
    recorder.record();
    setPhase('recording');
  };

  const stop = async () => {
    setPhase('processing');
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const uri = recorder.uri;
      if (!uri) {
        Alert.alert(t('mobile.common.sorry'), t('mobile.recorder.noRecordingDesc'));
        setPhase('idle');
        return;
      }
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists && info.size > MAX_BYTES) {
        Alert.alert(
          t('mobile.recorder.tooLongTitle'),
          t('mobile.recorder.tooLongDesc'),
        );
        setPhase('idle');
        return;
      }
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setPhase('idle');
      onRecorded(base64);
    } catch (err) {
      setPhase('idle');
      Alert.alert(t('mobile.common.sorry'), t('mobile.recorder.errorDesc'));
    }
  };

  const recording = phase === 'recording' || phase === 'paused';

  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      {!recording ? (
        <>
          <Text
            style={{
              color: c.mutedForeground,
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {hint}
          </Text>
          <Pressable
            testID="record-start"
            disabled={disabled || phase === 'processing'}
            onPress={start}
            style={({ pressed }) => [
              styles.bigBtn,
              {
                backgroundColor: c.primary,
                opacity: disabled || phase === 'processing' ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="mic" size={28} color={c.primaryForeground} />
          </Pressable>
          <Text style={{ color: c.mutedForeground, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
            {t('mobile.recorder.tapToRecord')}
          </Text>
        </>
      ) : (
        <>
          <Text
            style={{
              color: c.foreground,
              fontFamily: 'Inter_700Bold',
              fontSize: 34,
              fontVariant: ['tabular-nums'],
            }}
          >
            {fmt(state.durationMillis)}
          </Text>
          <Text style={{ color: phase === 'paused' ? c.accent : c.destructive, fontFamily: 'Inter_500Medium', fontSize: 13 }}>
            {phase === 'paused' ? t('mobile.recorder.paused') : t('mobile.recorder.recording')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable
              testID="record-pause-resume"
              onPress={phase === 'paused' ? resume : pause}
              style={({ pressed }) => [
                styles.midBtn,
                { backgroundColor: c.secondary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather
                name={phase === 'paused' ? 'play' : 'pause'}
                size={22}
                color={c.secondaryForeground}
              />
            </Pressable>
            <Pressable
              testID="record-stop"
              onPress={stop}
              style={({ pressed }) => [
                styles.midBtn,
                { backgroundColor: c.destructive, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="square" size={22} color={c.destructiveForeground} />
            </Pressable>
          </View>
          <Text style={{ color: c.mutedForeground, fontSize: 12, fontFamily: 'Inter_400Regular' }}>
            {t('mobile.recorder.tapToFinish')}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bigBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  midBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
