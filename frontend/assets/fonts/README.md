# Font Assets

- `TikTokSans-*.ttf`: primary app UI typeface.
- `BricolageGrotesque-*.ttf`: expressive social-career display typeface.
- `GeistMono-*.ttf`: numeric/data typeface for scores, ranks, and payouts.

The app keeps legacy `Outfit-*`, `InstrumentSerif-*`, and `JetBrainsMono-*`
aliases in `app/_layout.tsx` so existing components inherit this direction
without a brittle repo-wide rename. Legacy bold aliases resolve to semibold.
