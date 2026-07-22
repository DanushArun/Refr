# Damus performance review

Checked: 2026-07-15

## Scope

Reviewed public Damus source for transferable runtime patterns. Damus is a Swift/C iOS and macOS
Nostr client under GPL-3.0. Do not copy code, architecture, UI, or product behavior into Endorsly.

## Primary sources

- `Core/Storage/DamusCacheManager.swift`
- `Models/VideoCache.swift`
- `Core/Networking/NostrNetworkManager/ProfilesManager.swift`
- `Features/Timeline/Models/HomeModel.swift`
- `Features/Timeline/Views/InnerTimelineView.swift`

## Verified patterns

### Local-first profile rendering

Damus yields a cached profile before beginning its network update stream. Endorsly must keep known
avatar, name, and row data mounted while fresh data loads; it must not flash generic placeholders.

### Subscription ownership

Damus coalesces subscription changes, restarts one listener, and cancels tasks on teardown. Each
Expo subscription or poller needs one owner, an abort/unsubscribe path, and debounced parameter
updates.

### Bounded viewport prefetch

A visible Damus timeline item preloads the next five events. After measuring the golden slice, use
`FlatList` viewability to prefetch only the next small data/image window.

### Stale-while-revalidate media

The video cache returns a usable URL, refreshes expired content in the background, and purges it on
a bounded TTL. Endorsly should cache immutable remote media only when the catalogue needs it, and
must establish a size and TTL budget before adding disk storage.

### Work suppression

Damus debounces initial noisy updates and avoids unnecessary resubscriptions. Endorsly must
deduplicate page items, block concurrent fetches, cancel stale requests, and batch analytics.

## Existing Expo code to preserve

- `frontend/src/hooks/useFeed.ts` prevents concurrent fetches and deduplicates appended cards.
- `PipelineScreen`, `ActiveScreen`, `OpportunityFeedScreen`, and chat use `FlatList` where list
  virtualization matters.
- Chat already owns its polling teardown. Any replacement must retain that lifecycle behavior.

## Rejected transfers

- Damus Nostr relays, NostrDB, Kingfisher, and its Swift task model are unrelated to Endorsly's
  Django HTTP API and Expo runtime.
- A disk cache library, global state rewrite, or native Swift port is not justified until a profile
  identifies a real p95 scroll, image, or network bottleneck.

## Confidence and impact

Confidence is high because the listed patterns are directly visible in the source. Its future
implementation impact is limited to lifecycle ownership, list windowing, cache-first reads, and
measured prefetch in the golden vertical slice. No dependency or production code changed here.
