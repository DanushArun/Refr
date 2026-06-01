# Font Assets

- `CabinetGrotesk-*.ttf`: Awwwards-listed accent typeface for titles and
  identity moments. Source: Fontshare, free for personal and commercial use.
- `TikTokSans-*.ttf`: primary app UI typeface.
- `GeistMono-*.ttf`: numeric/data typeface for scores, ranks, and payouts.

The app keeps legacy `Outfit-*`, `InstrumentSerif-*`, and `JetBrainsMono-*`
aliases in `app/_layout.tsx` so existing components inherit this direction
without a brittle repo-wide rename. Legacy bold aliases resolve to semibold.
