import type { Reading } from '@workspace/api-client-react';

/** Plain-text version of a reading for the system share sheet. */
export function readingShareText(reading: Reading, nextMovesLabel: string): string {
  const lines = [reading.archetype, reading.title, '', reading.summary];
  const tips = reading.interactionTips ?? [];
  if (tips.length > 0) {
    lines.push('', nextMovesLabel, ...tips.map((tip, i) => `${i + 1}. ${tip}`));
  }
  lines.push('', '— Guru 2 u');
  return lines.join('\n');
}
