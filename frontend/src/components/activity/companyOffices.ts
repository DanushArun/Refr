/**
 * Per-company office imagery for cards that show a hero image.
 *
 * Honesty note: these are curated stock workplace photos from Unsplash, NOT
 * real photographs of each company's actual office. We can't license real
 * corporate photography here. To avoid the previous "random duplicates"
 * problem we now enforce two rules:
 *
 *   1. **Every mapped company has its own unique photo ID** — no two
 *      companies share a URL.
 *   2. **Companies without a known good photo return null** — the consumer
 *      falls back to the pure brand-color gradient. Better to render no
 *      photo than the wrong photo.
 *
 * If you want to add a new company, find a photo that visually fits and
 * confirm the ID isn't already in use elsewhere in this map. If you can't,
 * leave it unmapped and let the brand gradient stand alone.
 */

const U = (id: string): string =>
  `https://images.unsplash.com/${id}?w=900&q=70&auto=format&fit=crop`;

/**
 * Hand-curated Unsplash IDs, one per company. Each ID appears at most once.
 * Comments name the visual mood we picked for that company.
 */
const COMPANY_OFFICE: Record<string, string> = {
  // ── Bangalore-native fintech / commerce / quick-commerce ─────────────
  razorpay:  U('photo-1556761175-5973dc0f32e7'),       // fintech open desk
  cred:      U('photo-1497366811353-6870744d04b2'),    // design-forward minimal
  phonepe:   U('photo-1497032628192-86f99bcd76bc'),    // payments calm office
  paytm:     U('photo-1521737604893-d14cc237f11d'),    // collab meeting room
  groww:     U('photo-1497032205916-ac775f0649ae'),    // bright fintech corner
  swiggy:    U('photo-1499951360447-b19be8fe80f5'),    // bustling creative studio
  zomato:    U('photo-1542744173-8e7e53415bb0'),       // food-tech ops
  zepto:     U('photo-1565843708714-52ecf69ab81f'),    // warehouse-adjacent
  flipkart:  U('photo-1604328698692-f76ea9498e76'),    // big commerce floor
  meesho:    U('photo-1486406146926-c627a92ad1ab'),    // marketplace working space
  ola:       U('photo-1497366754035-f200968a6e72'),    // mobility loft
  uber:      U('photo-1431540015161-0bf868a2d407'),    // corporate desk

  // ── Big-tech Bangalore offices ────────────────────────────────────────
  google:    U('photo-1497366216548-37526070297c'),    // open campus warmth
  microsoft: U('photo-1497215842964-222b430dc094'),    // corporate floor
  amazon:    U('photo-1531973576160-7125cd663d86'),    // corporate hall
  apple:     U('photo-1524758631624-e2822e304c36'),    // premium minimal
  atlassian: U('photo-1518709268805-4e9042af2176'),    // developer workspace
  coinbase:  U('photo-1554224155-6726b3ff858f'),       // crypto trading desk
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

/** Returns a curated office image for the company, or null if unmapped.
 *  Consumers should fall back to the brand-color gradient when null. */
export function officeImageFor(companyName: string): string | null {
  const key = normalizeCompany(companyName);
  if (!key) return null;
  return COMPANY_OFFICE[key] ?? null;
}
