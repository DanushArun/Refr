import { fontFamilies, typography } from './typography';

type TextToken = {
  fontFamily?: string;
  letterSpacing?: number;
};

const productTokens = typography as unknown as Record<string, TextToken>;

test('test_fontFamilies_whenProductTextRenders_usesTikTokSansAsPrimaryUiVoice', () => {
  const families = fontFamilies as Record<string, string>;

  expect(families.heading).toBe('CabinetGrotesk-Regular');
  expect(families.headingMedium).toBe('CabinetGrotesk-Medium');
  expect(families.body).toBe('TikTokSans-Regular');
  expect(families.bodyMedium).toBe('TikTokSans-Medium');
  expect(families.bodySemiBold).toBe('TikTokSans-Semibold');
  expect(families.bodyBold).toBe('TikTokSans-Semibold');
});

test('test_typography_whenScreenChromeRenders_usesDisplayWithoutBoldUi', () => {
  expect(productTokens.screenTitle.fontFamily).toBe('CabinetGrotesk-Medium');
  expect(productTokens.screenTitle.letterSpacing ?? 0).toBe(0);
});

test('test_typography_whenOperationalUiRenders_usesMediumWeightSans', () => {
  const operationalTokens = [
    'screenSubtitle',
    'sectionTitle',
    'rowTitle',
    'rowMeta',
    'chipLabel',
    'buttonLabel',
  ];

  for (const token of operationalTokens) {
    expect(productTokens[token]?.fontFamily).toMatch(/^TikTokSans-/);
    expect(productTokens[token]?.fontFamily).not.toContain('Bold');
    expect(productTokens[token]?.letterSpacing ?? 0).toBe(0);
  }
});

test('test_typography_whenTrustDataRenders_usesMonoForNumbersAndScores', () => {
  expect(productTokens.statLarge.fontFamily).toBe('GeistMono-Regular');
  expect(productTokens.statMedium.fontFamily).toBe('GeistMono-Medium');
});

test('test_typography_whenAfterHoursMomentRenders_usesSerifDisplayVoice', () => {
  expect(fontFamilies.serif).toBe('IBMPlexSerif-Regular');
  expect(fontFamilies.serifMedium).toBe('IBMPlexSerif-Medium');
  expect(productTokens.detonationDisplay.fontFamily).toBe('IBMPlexSerif-Medium');
});
