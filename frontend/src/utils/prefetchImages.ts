import { Image } from 'react-native';

/**
 * Fire-and-forget prefetch of a list of image URLs. RN's Image cache will
 * keep them warm so the next time a `<Image source={{ uri }}>` mounts the
 * pixels are already on disk and there's no first-frame flash.
 *
 * Returns immediately — failures are silently dropped (offline, 4xx, etc.).
 * Pass only string URLs; local `require(...)` images are bundled and don't
 * need prefetching.
 *
 * Use this from list screens that know upcoming card images ahead of time:
 *   useEffect(() => { prefetchImages(items.map(i => officeImageFor(i.name))) },
 *     [items]);
 */
export function prefetchImages(urls: Array<string | null | undefined>): void {
  for (const u of urls) {
    if (!u) continue;
    Image.prefetch(u).catch(() => {});
  }
}
