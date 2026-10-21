import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { Briefcase, Heart, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react-native';
import type { ReadingJudgment } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';

const SCORES = [
  { key: 'trust', labelKey: 'mobile.result.scoreTrust', color: '#F0567A' },
  { key: 'honesty', labelKey: 'mobile.result.scoreHonesty', color: '#22B39B' },
  { key: 'kindness', labelKey: 'mobile.result.scoreKindness', color: '#F2B233' },
  { key: 'communication', labelKey: 'mobile.result.scoreCommunication', color: '#8B5CF6' },
  { key: 'business', labelKey: 'mobile.result.scoreBusiness', color: '#3B82F6' },
  { key: 'relationship', labelKey: 'mobile.result.scoreRelationship', color: '#E2559C' },
] as const;

/** Round 1-100% score with a coloured progress ring. */
function ScoreRing({ value, color }: { value: number; color: string }) {
  const c = useColors();
  const r = 30;
  const circumference = 2 * Math.PI * r;
  return (
    <View style={{ width: 76, height: 76, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={76} height={76} viewBox="0 0 76 76" style={StyleSheet.absoluteFill}>
        <Circle cx={38} cy={38} r={r} stroke={c.border} strokeWidth={7} fill="none" />
        <Circle
          cx={38}
          cy={38}
          r={r}
          stroke={color}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * value) / 100} ${circumference}`}
          transform="rotate(-90 38 38)"
        />
      </Svg>
      <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.foreground, fontVariant: ['tabular-nums'] }}>{value}%</Text>
    </View>
  );
}

/**
 * Good-or-bad judgment of the person read: an overall score with a verdict,
 * six 1-100% bars, and how business and a relationship with them will go.
 */
export function JudgmentCard({ judgment }: { judgment: ReadingJudgment }) {
  const c = useColors();
  const { t } = useTranslation();

  const verdict = {
    good: { label: t('mobile.result.verdictGood'), color: c.success, soft: c.successSoft, Icon: ShieldCheck },
    mixed: { label: t('mobile.result.verdictMixed'), color: '#C27A0E', soft: '#FFF0DC', Icon: ShieldQuestion },
    careful: { label: t('mobile.result.verdictCareful'), color: c.destructive, soft: c.accentSoft, Icon: ShieldAlert },
  }[judgment.verdict];

  return (
    <View testID="result-judgment" style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.3, color: c.foreground }}>
          {t('mobile.result.judgmentTitle')}
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: c.mutedForeground }}>
          {t('mobile.result.judgmentSubtitle')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <ScoreRing value={judgment.overall} color={verdict.color} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={[styles.verdictPill, { backgroundColor: verdict.soft }]}>
            <verdict.Icon size={15} color={verdict.color} />
            <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: verdict.color }}>{verdict.label}</Text>
          </View>
          {judgment.verdictText ? (
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14.5, lineHeight: 20, color: c.foreground }}>
              {judgment.verdictText}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {SCORES.map((s) => {
          const value = judgment.scores[s.key];
          return (
            <View key={s.key} style={styles.scoreRow}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text style={[styles.scoreLabel, { color: c.foreground }]} numberOfLines={1}>
                {t(s.labelKey)}
              </Text>
              <View style={[styles.track, { backgroundColor: c.muted }]}>
                <View style={{ width: `${value}%`, height: '100%', borderRadius: 5, backgroundColor: s.color }} />
              </View>
              <Text style={[styles.scoreValue, { color: c.foreground }]}>{value}%</Text>
            </View>
          );
        })}
      </View>

      {judgment.business ? (
        <View style={styles.lineRow}>
          <View style={[styles.lineIcon, { backgroundColor: '#E5EEFF' }]}>
            <Briefcase size={18} color="#3B82F6" />
          </View>
          <Text style={[styles.lineText, { color: c.secondaryForeground }]}>
            <Text style={{ fontFamily: fonts.bold, color: '#3B82F6' }}>{t('mobile.result.inBusiness')}: </Text>
            {judgment.business}
          </Text>
        </View>
      ) : null}
      {judgment.relationship ? (
        <View style={styles.lineRow}>
          <View style={[styles.lineIcon, { backgroundColor: c.accentSoft }]}>
            <Heart size={18} color={c.accent} />
          </View>
          <Text style={[styles.lineText, { color: c.secondaryForeground }]}>
            <Text style={{ fontFamily: fonts.bold, color: c.accentInk }}>{t('mobile.result.inRelationship')}: </Text>
            {judgment.relationship}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: colors.radiusLg,
    borderWidth: 1,
    padding: 18,
    gap: 18,
  },
  verdictPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  scoreLabel: {
    width: 112,
    fontFamily: fonts.medium,
    fontSize: 14.5,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreValue: {
    width: 44,
    textAlign: 'right',
    fontFamily: fonts.bold,
    fontSize: 14.5,
    fontVariant: ['tabular-nums'],
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  lineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
  },
});
