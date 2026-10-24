import React from 'react';
import { Image, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Reading } from '@workspace/api-client-react';
import { Card, PrimaryButton, SectionLabel } from '@/components/ui';
import { readingShareText } from '@/lib/readings';
import { KindIcon } from '@/components/nebula';
import { Flame, Heart, HeartPulse, Sun, Users } from 'lucide-react-native';
import { ListenButton, SpeakIcon } from '@/components/ListenButton';
import { AskGuru } from '@/components/AskGuru';
import { JudgmentCard } from '@/components/JudgmentCard';
import { isProfileComplete, useMyProfile } from '@/lib/profile';
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
  // Older readings can contain literal "\\n" sequences from the AI; show them as line breaks.
  const content = typeof children === 'string' ? children.replace(/\\r\\n|\\n/g, '\n') : children;
  return <Text style={[styles.body, { color: muted ? c.mutedForeground : c.secondaryForeground }]}>{content}</Text>;
}

/** Everything worth hearing in a reading, in reading order. */
function spokenText(r: Reading): string {
  const parts: (string | null | undefined)[] = [
    r.archetype,
    r.title,
    r.judgment ? `${r.judgment.overall}%. ${r.judgment.verdictText}` : null,
    r.dailyHoroscope,
    r.daily?.dayOutlook,
    r.daily?.loveLife,
    r.daily?.healthCare,
    r.daily?.temperCare,
    r.daily?.luckyOutfit,
    r.compatibility,
    r.judgment?.business,
    r.judgment?.relationship,
    r.summary,
    r.guidance,
    ...(r.interactionTips ?? []),
  ];
  return parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .map((p) => (/[.!?।۔。！？]$/.test(p.trim()) ? p.trim() : `${p.trim()}.`))
    .join(' ');
}

/** A titled text card with a tinted icon. */
function IconCard({ icon, tint, title, children }: { icon: React.ReactNode; tint: string; title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Card style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[styles.youThemIcon, { backgroundColor: tint }]}>{icon}</View>
        <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: c.foreground }}>{title}</Text>
      </View>
      <Body>{children}</Body>
      {typeof children === 'string' ? <SpeakIcon text={children} /> : null}
    </Card>
  );
}

export function ReadingResult({ reading }: { reading: Reading }) {
  const c = useColors();
  const { t } = useTranslation();
  const { data: myProfile, isSuccess: profileLoaded } = useMyProfile();
  const hasProfile = isProfileComplete(myProfile);

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
        <Text style={{ color: c.primary, fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, textAlign: 'center' }}>
          {reading.archetype}
        </Text>
        <Text style={{ color: c.secondaryForeground, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>
          {reading.title}
        </Text>
        <ListenButton text={spokenText(reading)} />
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

      {reading.judgment ? <JudgmentCard judgment={reading.judgment} /> : null}

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
          <SpeakIcon text={reading.interactionTips.map((tip, i) => `${i + 1}. ${tip}`).join(' ')} onDark />
        </View>
      ) : null}

      {reading.kind === 'astro' && (reading.zodiacSign || reading.luckyColor || reading.luckyNumber) ? (
        <View style={{ gap: 10 }}>
          {reading.daily ? <SectionLabel>{t('mobile.result.todaysLuck')}</SectionLabel> : null}
          <View style={styles.luckGrid}>
            {(
              [
                ['mobile.result.sign', reading.zodiacSign],
                ['mobile.result.luckyColor', reading.luckyColor],
                ['mobile.result.luckyNumber', reading.luckyNumber],
                ['mobile.result.luckyGemstone', reading.daily?.luckyGemstone],
                ['mobile.result.luckyDay', reading.daily?.luckyDay],
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
          {reading.daily?.luckyOutfit ? (
            <Card style={{ gap: 4 }}>
              <Text style={[styles.astroLabel, { color: c.mutedForeground, textAlign: 'left' }]}>{t('mobile.result.luckyOutfit')}</Text>
              <Text style={[styles.astroValue, { color: c.foreground, textAlign: 'left' }]}>{reading.daily.luckyOutfit}</Text>
              <SpeakIcon text={reading.daily.luckyOutfit} />
            </Card>
          ) : null}
        </View>
      ) : null}

      {reading.daily ? (
        <>
          <IconCard icon={<Sun size={18} color={c.tintPalmInk} />} tint={c.tintPalm} title={t('mobile.result.dayOutlook')}>
            {reading.daily.dayOutlook}
          </IconCard>
          {reading.daily.loveLife ? (
            <IconCard icon={<Heart size={18} color={c.accent} />} tint={c.accentSoft} title={t('mobile.result.loveLife')}>
              {reading.daily.loveLife}
            </IconCard>
          ) : null}
          <IconCard icon={<HeartPulse size={18} color={c.tintAstroInk} />} tint={c.tintAstro} title={t('mobile.result.healthCare')}>
            {reading.daily.healthCare}
          </IconCard>
          <IconCard icon={<Flame size={18} color={c.tintFaceInk} />} tint={c.tintFace} title={t('mobile.result.temperCare')}>
            {reading.daily.temperCare}
          </IconCard>
        </>
      ) : null}

      {reading.compatibility ? (
        <View testID="result-you-and-them" style={[styles.youThem, { backgroundColor: c.accentSoft }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.youThemIcon, { backgroundColor: c.accent }]}>
              <Users size={16} color={c.accentForeground} />
            </View>
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: c.foreground }}>{t('mobile.result.youAndThem')}</Text>
          </View>
          <Text style={{ fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: c.foreground }}>{reading.compatibility}</Text>
          <SpeakIcon text={reading.compatibility} />
        </View>
      ) : reading.kind !== 'astro' && profileLoaded && !hasProfile ? (
        <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Users size={18} color={c.mutedForeground} />
          <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: c.mutedForeground }}>
            {t('mobile.result.youAndThemHint')}
          </Text>
        </Card>
      ) : null}

      {reading.dailyHoroscope ? (
        <Card>
          <SectionLabel>{t('mobile.result.todaysHoroscope')}</SectionLabel>
          <Body>{reading.dailyHoroscope}</Body>
          <SpeakIcon text={reading.dailyHoroscope} />
        </Card>
      ) : null}

      <Card>
        <SectionLabel>{t('mobile.result.summary')}</SectionLabel>
        <Body>{reading.summary}</Body>
        <SpeakIcon text={reading.summary} />
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
          <SpeakIcon text={reading.strengths.join('. ')} />
        </Card>
      ) : null}

      {reading.details ? (
        <Card>
          <SectionLabel>{t('mobile.result.deeperAnalysis')}</SectionLabel>
          <Body>{reading.details}</Body>
          <SpeakIcon text={reading.details} />
        </Card>
      ) : null}

      <Card style={{ borderColor: c.primary }}>
        <SectionLabel>{t('mobile.result.guidance')}</SectionLabel>
        <Body>{reading.guidance}</Body>
        <SpeakIcon text={reading.guidance} />
      </Card>

      <AskGuru readingId={reading.id} />

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
  luckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  youThem: {
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  youThemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astroCard: {
    flexGrow: 1,
    flexBasis: '30%',
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
