import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import COUNTRY_NAMES from '@/lib/countryNames';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

// Shown first in the list; most Guru 2 u users are in India.
const PINNED: CountryCode[] = ['IN'];

export interface Country {
  code: CountryCode;
  dialCode: string;
  name: string;
  flag: string;
}

/** Regional-indicator emoji for an ISO country code, e.g. IN → 🇮🇳. */
function flagOf(code: string): string {
  return String.fromCodePoint(...[...code.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

function countryName(code: string, language: string): string {
  return COUNTRY_NAMES[language]?.[code] ?? COUNTRY_NAMES.en[code] ?? code;
}

export function useCountries(): Country[] {
  const { i18n } = useTranslation();
  return useMemo(() => {
    const language = (i18n.language || 'en').split('-')[0];
    const all = getCountries()
      .map((code) => ({
        code,
        dialCode: `+${getCountryCallingCode(code)}`,
        name: countryName(code, language),
        flag: flagOf(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, language));
    return [
      ...PINNED.map((code) => all.find((x) => x.code === code)!),
      ...all.filter((x) => !PINNED.includes(x.code)),
    ];
  }, [i18n.language]);
}

/** The device's region if it has a calling code, otherwise India. */
export function defaultCountryCode(): CountryCode {
  const region = getLocales()[0]?.regionCode?.toUpperCase();
  return region && (getCountries() as string[]).includes(region) ? (region as CountryCode) : 'IN';
}

/** Compact "🇮🇳 +91 ▾" button that opens a searchable list of countries. */
export function CountryCodePicker({
  value,
  onChange,
}: {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const countries = useCountries();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = countries.find((x) => x.code === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return countries;
    return countries.filter(
      (x) => x.name.toLowerCase().includes(q) || x.code.toLowerCase() === q || x.dialCode.slice(1).startsWith(q),
    );
  }, [countries, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <Pressable
        testID="phone-country"
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${t('mobile.auth.phoneCountry')}: ${selected?.name ?? value} ${selected?.dialCode ?? ''}`}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={{ fontSize: 20 }}>{selected?.flag}</Text>
        <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: c.foreground }}>{selected?.dialCode}</Text>
        <Feather name="chevron-down" size={16} color={c.mutedForeground} />
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <View style={{ flex: 1, backgroundColor: c.background, paddingTop: 16 }}>
          <View style={styles.header}>
            <Text style={{ flex: 1, fontFamily: fonts.display, fontSize: 24, color: c.foreground }}>
              {t('mobile.auth.phoneCountry')}
            </Text>
            <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('mobile.common.cancel')}>
              <Feather name="x" size={24} color={c.foreground} />
            </Pressable>
          </View>
          <View style={[styles.search, { backgroundColor: c.card, borderColor: c.border }]}>
            <Feather name="search" size={18} color={c.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('mobile.auth.phoneCountrySearch')}
              placeholderTextColor={c.subtle}
              autoCorrect={false}
              autoCapitalize="none"
              style={{ flex: 1, color: c.foreground, fontFamily: fonts.regular, fontSize: 15 }}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(x) => x.code}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            initialNumToRender={20}
            renderItem={({ item }) => {
              const isSelected = item.code === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.code);
                    close();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [styles.row, { backgroundColor: pressed ? c.muted : 'transparent' }]}
                >
                  <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: isSelected ? fonts.semibold : fonts.regular,
                      fontSize: 15,
                      color: isSelected ? c.accent : c.foreground,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 15, color: c.mutedForeground }}>{item.dialCode}</Text>
                  {isSelected ? <Feather name="check" size={18} color={c.accent} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    minHeight: 52,
  },
});
