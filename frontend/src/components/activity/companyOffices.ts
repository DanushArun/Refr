/**
 * Per-company office imagery for the seeker Activity cards.
 *
 * The image is the FIRST thing a seeker sees on each card, so it has to feel
 * specific to the company, not generic stock. We resolve in three tiers:
 *
 *   1. Hand-picked Unsplash photo per known Bangalore-tech company that
 *      visually approximates that company's actual office (open-plan tech
 *      floor, fintech minimalism, warehouse-adjacent quick-commerce, etc.).
 *   2. Workplace-genre fallbacks chosen deterministically by company-name hash
 *      so an unknown company always renders the same image across renders.
 *
 * Images are sourced from Unsplash with explicit `?w=900&q=70` to keep
 * payload manageable on cellular.
 */

const U = (id: string): string =>
  `https://images.unsplash.com/${id}?w=900&q=70&auto=format&fit=crop`;

/**
 * Hand-picked office photographs per company. Keys are normalized to lowercase
 * with common suffixes ("india", "technologies", "inc", etc.) stripped before
 * lookup — see `normalizeCompany`.
 */
const COMPANY_OFFICE: Record<string, string> = {
  // Google India — Googleplex-flavored open campus
  google: U('photo-1497366216548-37526070297c'),
  // Microsoft — large corporate open floor
  microsoft: U('photo-1531973576160-7125cd663d86'),
  // Amazon — corporate tech office
  amazon: U('photo-1604328698692-f76ea9498e76'),
  // Meta / Facebook — modern collaboration loft
  meta: U('photo-1497366754035-f200968a6e72'),
  facebook: U('photo-1497366754035-f200968a6e72'),
  // Apple — premium minimal workspace
  apple: U('photo-1524758631624-e2822e304c36'),
  // Netflix — media-house edit bay vibe
  netflix: U('photo-1542744173-8e7e53415bb0'),
  // Adobe — creative studio aesthetic
  adobe: U('photo-1499951360447-b19be8fe80f5'),
  // LinkedIn — corporate but warm
  linkedin: U('photo-1497215842964-222b430dc094'),
  // Oracle — classic corporate floor
  oracle: U('photo-1431540015161-0bf868a2d407'),

  // Bangalore-native fintech / commerce / quick-commerce
  razorpay: U('photo-1556761175-5973dc0f32e7'),       // fintech open plan
  cred: U('photo-1497366811353-6870744d04b2'),         // design-forward minimal
  phonepe: U('photo-1497366216548-37526070297c'),
  paytm: U('photo-1521737604893-d14cc237f11d'),
  zerodha: U('photo-1497366811353-6870744d04b2'),     // calm minimal trading floor
  groww: U('photo-1556761175-5973dc0f32e7'),
  swiggy: U('photo-1604328698692-f76ea9498e76'),       // bustling food-tech
  zomato: U('photo-1604328698692-f76ea9498e76'),
  zepto: U('photo-1565843708714-52ecf69ab81f'),        // warehouse-adjacent ops
  blinkit: U('photo-1565843708714-52ecf69ab81f'),
  dunzo: U('photo-1565843708714-52ecf69ab81f'),
  flipkart: U('photo-1604328698692-f76ea9498e76'),
  myntra: U('photo-1497366754035-f200968a6e72'),
  meesho: U('photo-1604328698692-f76ea9498e76'),
  ola: U('photo-1497366754035-f200968a6e72'),
  uber: U('photo-1497366754035-f200968a6e72'),
  rapido: U('photo-1556761175-5973dc0f32e7'),

  // SaaS-native Bangalore
  freshworks: U('photo-1497366811353-6870744d04b2'),
  zoho: U('photo-1497366216548-37526070297c'),
  postman: U('photo-1497366754035-f200968a6e72'),
  hasura: U('photo-1497366811353-6870744d04b2'),
  atlassian: U('photo-1556761175-5973dc0f32e7'),
  stripe: U('photo-1497366811353-6870744d04b2'),
  twilio: U('photo-1556761175-5973dc0f32e7'),
  // Other B'lore tech
  inmobi: U('photo-1604328698692-f76ea9498e76'),
  gojek: U('photo-1497366754035-f200968a6e72'),
  intuit: U('photo-1497215842964-222b430dc094'),
  walmart: U('photo-1604328698692-f76ea9498e76'),
  flipkartlabs: U('photo-1604328698692-f76ea9498e76'),
  nykaa: U('photo-1497366754035-f200968a6e72'),
  unacademy: U('photo-1497366216548-37526070297c'),
  byjus: U('photo-1497366216548-37526070297c'),
  vedantu: U('photo-1497366216548-37526070297c'),
};

/** Generic workplace photos used when company isn't mapped above. */
const GENERIC_OFFICES: string[] = [
  U('photo-1497366216548-37526070297c'),
  U('photo-1497366811353-6870744d04b2'),
  U('photo-1556761175-5973dc0f32e7'),
  U('photo-1604328698692-f76ea9498e76'),
  U('photo-1521737604893-d14cc237f11d'),
  U('photo-1497366754035-f200968a6e72'),
];

/**
 * Strip common corporate suffixes and whitespace, lowercase. We do this so
 * "Google India", "Google Inc.", and "GOOGLE" all key to the same entry.
 */
function normalizeCompany(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(india|inc|inc\.|ltd|limited|llp|pvt|private|technologies|technology|labs|systems|services|software|corp|corporation)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function officeImageFor(companyName: string): string {
  const key = normalizeCompany(companyName);
  if (key && COMPANY_OFFICE[key]) return COMPANY_OFFICE[key];
  const seed = key || companyName;
  return GENERIC_OFFICES[hashString(seed) % GENERIC_OFFICES.length];
}
