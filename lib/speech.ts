import { useSyncExternalStore } from 'react';
import * as Speech from 'expo-speech';
import { getReadingLanguage, readingLanguageInfo } from '@/lib/readingLanguage';

/**
 * One shared speaker for the whole app: starting to read something stops
 * whatever was being read, and every Listen control can show whether it is
 * the one currently speaking.
 */
let speakingId: string | null = null;
let missingVoiceId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setSpeaking(id: string | null) {
  speakingId = id;
  emit();
}

// Android's TTS engine rejects long inputs, so speak in sentence chunks.
function chunk(text: string, max = 3000): string[] {
  const parts: string[] = [];
  let current = '';
  const sentences = text.match(/[^.!?।۔。！？\n]+[.!?।۔。！？\n]*/g) ?? [text];
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if ((current + ' ' + sentence).length > max && current) {
      parts.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** Stops speaking only if `id` is the one speaking (used when a control unmounts). */
export function stopIfSpeaking(id: string): void {
  if (speakingId === id) void stopSpeaking();
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
  setSpeaking(null);
}

/** Reads `text` aloud in the reading language, or stops if `id` is already speaking. */
export async function toggleSpeak(id: string, text: string): Promise<void> {
  if (speakingId === id) {
    await stopSpeaking();
    return;
  }
  await Speech.stop();
  const lang = readingLanguageInfo(getReadingLanguage());
  let voiceAvailable = true;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    voiceAvailable = voices.length === 0 || voices.some((v) => v.language?.toLowerCase().startsWith(lang.code));
  } catch {
    // Unknown: try anyway.
  }
  missingVoiceId = voiceAvailable ? null : id;
  setSpeaking(id);
  const finish = () => {
    if (speakingId === id) setSpeaking(null);
  };
  const parts = chunk(text);
  parts.forEach((part, i) => {
    const last = i === parts.length - 1;
    Speech.speak(part, {
      language: lang.speech,
      rate: 0.95,
      onDone: last ? finish : undefined,
      onStopped: finish,
      onError: finish,
    });
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Whether the control with this id is the one speaking right now. */
export function useIsSpeaking(id: string): boolean {
  return useSyncExternalStore(subscribe, () => speakingId === id, () => false);
}

/** Whether the last attempt by this id found no voice for the language. */
export function useMissingVoice(id: string): boolean {
  return useSyncExternalStore(subscribe, () => missingVoiceId === id, () => false);
}
