import type { ImageSourcePropType } from 'react-native';

/**
 * Per-company office imagery, with a two-layer resolution chain:
 *
 *   1. **Local bundled photo** (preferred) — a real photograph of the
 *      company's actual office, dropped into `frontend/assets/offices/`
 *      and registered in `LOCAL_OFFICES` below. Always wins.
 *   2. **Curated stock URL** (fallback) — a generic but office-shaped
 *      Unsplash photo. Each ID appears at most once across the registry,
 *      and is meant to read as a workplace, not an ambient lifestyle
 *      shot.
 *   3. **null** — no photo. Consumer falls back to the navy plate.
 *
 * Why two layers: stock photos can never be the *real* company office —
 * Unsplash is user-uploaded generic content. For genuine accuracy
 * (e.g. the actual Apple Park, the real Razorpay floor), the only honest
 * answer is licensed/owned photography shipped as a repo asset. The
 * `LOCAL_OFFICES` map is the upgrade path.
 *
 * Adding a real office photo:
 *
 *   1. Drop `frontend/assets/offices/{key}.jpg` (where {key} matches the
 *      normalised company name — e.g. `amazon.jpg`, `razorpay.jpg`).
 *      Use a 16:9-ish landscape crop, ~1600 px wide is plenty.
 *   2. Add the entry to `LOCAL_OFFICES` below.
 *   3. Commit the asset.
 *
 *   That single edit upgrades the card across every screen that calls
 *   officeImageFor — Activity, Discovery, Matches' future placements.
 */

const U = (id: string): string =>
  `https://images.unsplash.com/${id}?w=900&q=70&auto=format&fit=crop`;

/**
 * Real office photographs bundled with the app. Drop in
 * `frontend/assets/offices/{key}.jpg` and register here. Wins over stock.
 *
 * Empty today. Each `require()` you uncomment ships an extra ~100-300 KB
 * with the JS bundle — keep crops tight.
 */
const LOCAL_OFFICES: Record<string, ImageSourcePropType> = {
  // Example (uncomment after dropping the file):
  // amazon: require('../../../assets/offices/amazon.jpg'),
  // apple: require('../../../assets/offices/apple.jpg'),
  // google: require('../../../assets/offices/google.jpg'),
  // microsoft: require('../../../assets/offices/microsoft.jpg'),
  // razorpay: require('../../../assets/offices/razorpay.jpg'),
};

/**
 * Stock fallback photos. Best-effort office shots. If you load the app and
 * any of these renders as a coffee shot or a desk-by-window glamour photo,
 * swap that one specific entry — don't accept it.
 */
const STOCK_OFFICE: Record<string, string> = {
  // ── India-based fintech / commerce / quick-commerce ─────────────
  razorpay: U('photo-1556761175-5973dc0f32e7'),    // fintech open desks
  cred:     U('photo-1497366811353-6870744d04b2'), // minimal design floor
  phonepe:  U('photo-1497032628192-86f99bcd76bc'), // fintech corporate building
  paytm:    U('photo-1521737604893-d14cc237f11d'), // collab meeting room
  groww:    U('photo-1486325212027-8081e485255e'), // bright open office
  swiggy:   U('photo-1499951360447-b19be8fe80f5'), // creative team floor
  zomato:   U('photo-1542744173-8e7e53415bb0'),    // food-tech ops desks
  zepto:    U('photo-1565843708714-52ecf69ab81f'), // warehouse-adjacent ops
  flipkart: U('photo-1604328698692-f76ea9498e76'), // busy commerce floor
  meesho:   U('photo-1577412647305-991150c7d163'), // modern open office
  ola:      U('photo-1497366754035-f200968a6e72'), // mobility loft office
  uber:     U('photo-1431540015161-0bf868a2d407'), // corporate workspace

  // ── Big-tech / SaaS India offices ────────────────────────────────
  google:    U('photo-1497366216548-37526070297c'), // open campus floor
  microsoft: U('photo-1497215842964-222b430dc094'), // corporate workspace
  amazon:    U('photo-1531973576160-7125cd663d86'), // corporate hall
  apple:     U('photo-1524758631624-e2822e304c36'), // premium minimal floor
  atlassian: U('photo-1497436072909-60f360e1d4b1'), // corporate lobby
  coinbase:  U('photo-1551434678-e076c223a692'),    // collaboration space
};

/**
 * Strip common corporate suffixes and whitespace, lowercase. So "Google
 * India", "Google Inc.", and "GOOGLE" all key to the same entry.
 */
function normalizeCompany(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /\b(india|inc|inc\.|ltd|limited|llp|pvt|private|technologies|technology|labs|systems|services|software|corp|corporation)\b/g,
      '',
    )
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Resolves a company name to a React Native `<Image source={...}>` value.
 * Prefers a bundled local photo, falls back to a stock URL, returns null
 * when neither exists so the consumer can render its neutral plate.
 */
export function officeImageFor(
  companyName: string,
): ImageSourcePropType | null {
  const key = normalizeCompany(companyName);
  if (!key) return null;
  const local = LOCAL_OFFICES[key];
  if (local) return local;
  const stock = STOCK_OFFICE[key];
  if (stock) return { uri: stock };
  return null;
}

/**
 * Returns just the prefetchable URL for the company's office image — null if
 * the resolution would be a local require (already in the JS bundle, no
 * prefetch needed) or no image is mapped. Use with `Image.prefetch()` to
 * warm the cache before the card mounts.
 */
export function officeImageUrlFor(companyName: string): string | null {
  const key = normalizeCompany(companyName);
  if (!key) return null;
  if (LOCAL_OFFICES[key]) return null; // bundled — no prefetch needed
  return STOCK_OFFICE[key] ?? null;
}
