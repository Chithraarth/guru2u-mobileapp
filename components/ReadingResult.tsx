import React from 'react';
import { Image, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Reading } from '@workspace/api-client-react';
import { Card, PrimaryButton, SectionLabel } from '@/components/ui';
import { readingShareText } from '@/lib/readings';
import { KindIcon } from '@/components/nebula';
import { useColors } from '@/hooks/useColors';
import fonts from '@/constants/fonts';

const KIND_LABEL_KEY: Record<string, string> = {
  face: 'mobile.result.kindFace',
  palm: 'mobile.result.kindPalm',
  voice: 'mobile.result.kindVoice',
  astro: 'mobile.result.kindAstro',
  combo: 'mobile.result.kindCombo',
};

function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  const c = useColors();
  return <Text style={[styles.body, { color: muted ? c.mutedForeground : c.secondaryForeground }]}>{children}</Text>;
}

export function ReadingResult({ reading }: { reading: Reading }) {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <View style={{ gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <View style={[styles.kindPill, { backgroundColor: c.secondary }]}>
          <KindIcon kind={reading.kind} size={13} color={c.accent} />
          <Text style={{ color: c.secondaryForeground, fontFamily: fonts.medium, fontSize: 12 }}>
            {KIND_LABEL_KEY[reading.kind] ? t(KIND_LABEL_KEY[reading.kind]) : t('mobile.result.kindDefault')}
          </Text>
        </View>
        {reading.portraitImage ? (
          <View style={[styles.portraitRing, { borderColor: c.accent }]}>
            <Image source={{ uri: reading.portraitImage }} style={styles.portrait} resizeMode="cover" />
          </View>
        ) : null}
        <Text style={{ color: c.violetSoft, fontFamily: fonts.display, fontSize: 30, lineHeight: 36, textAlign: 'center' }}>
          {reading.archetype}
        </Text>
        <Text style={{ color: c.secondaryForeground, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>
          {reading.title}
        </Text>
      </View>

      {reading.traits.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {reading.traits.map((trait) => (
            <View key={trait} style={[styles.trait, { borderColor: c.borderStrong }]}>
              <Text style={{ color: c.foreground, fontFamily: fonts.medium, fontSize: 13 }}>{trait}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {reading.interactionTips && reading.interactionTips.length > 0 ? (
        <View style={[styles.moves, { backgroundColor: c.primaryFill }]}>
          <Text style={{ color: c.primaryForeground, fontFamily: fonts.bold, fontSize: 16 }}>{t('mobile.result.nextMoves')}</Text>
          {reading.interactionTips.map((tip, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.moveNum}>
                <Text style={{ color: c.primaryForeground, fontFamily: fonts.bold, fontSize: 12 }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, color: c.primaryForeground, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 }}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {reading.kind === 'astro' && (reading.zodiacSign || reading.luckyColor || reading.luckyNumber) ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(
            [
              ['mobile.result.sign', reading.zodiacSign],
              ['mobile.result.luckyColor', reading.luckyColor],
              ['mobile.result.luckyNumber', reading.luckyNumber],
            ] as const
          )
            .filter(([, v]) => !!v)
            .map(([key, value]) => (
              <Card key={key} style={styles.astroCard}>
                <Text style={[styles.astroLabel, { color: c.mutedForeground }]}>{t(key)}</Text>
                <Text style={[styles.astroValue, { color: c.foreground }]}>{value}</Text>
              </Card>
            ))}
        </View>
      ) : null}

      {reading.dailyHoroscope ? (
        <Card>
          <SectionLabel>{t('mobile.result.todaysHoroscope')}</SectionLabel>
          <Body>{reading.dailyHoroscope}</Body>
        </Card>
      ) : null}

      <Card>
        <SectionLabel>{t('mobile.result.summary')}</SectionLabel>
        <Body>{reading.summary}</Body>
      </Card>

      {reading.strengths.length > 0 ? (
        <Card>
          <SectionLabel>{t('mobile.result.strengths')}</SectionLabel>
          <View style={{ gap: 8 }}>
            {reading.strengths.map((s) => (
              <View key={s} style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={{ color: c.accent, fontSize: 12, marginTop: 4 }}>◆</Text>
                <View style={{ flex: 1 }}>
                  <Body>{s}</Body>
                </View>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {reading.details ? (
        <Card>
          <SectionLabel>{t('mobile.result.deeperAnalysis')}</SectionLabel>
          <Body>{reading.details}</Body>
        </Card>
      ) : null}

      <Card style={{ borderColor: c.primary }}>
        <SectionLabel>{t('mobile.result.guidance')}</SectionLabel>
        <Body>{reading.guidance}</Body>
      </Card>

      {reading.transcript ? (
        <Card>
          <SectionLabel>{t('mobile.result.transcript')}</SectionLabel>
          <Body muted>{reading.transcript}</Body>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  kindPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  portraitRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    padding: 4,
  },
  portrait: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  trait: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moves: {
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  moveNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginTop: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  astroLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  astroValue: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    textAlign: 'center',
  },
});

/** Share + "new reading" buttons shown under a freshly created reading. */
export function ResultActions({
  reading,
  newLabel,
  onNew,
}: {
  reading: Reading;
  newLabel: string;
  onNew: () => void;
}) {
  const { t } = useTranslation();
  const share = () => {
    Share.share({ message: readingShareText(reading, t('mobile.result.nextMoves')) }).catch(() => {});
  };
  return (
    <View style={{ gap: 10 }}>
      <PrimaryButton title={newLabel} onPress={onNew} />
      <PrimaryButton title={t('mobile.reading.share')} variant="outline" icon="share" onPress={share} />
    </View>
  );
}
