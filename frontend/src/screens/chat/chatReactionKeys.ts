export interface KeyedReaction {
  emoji: string;
  key: string;
}

export function keyReactions(reactions: string[]): KeyedReaction[] {
  const seen = new Map<string, number>();

  return reactions.map((emoji) => {
    const nextCount = (seen.get(emoji) ?? 0) + 1;
    seen.set(emoji, nextCount);

    return {
      emoji,
      key: `${emoji}-${nextCount}`,
    };
  });
}
