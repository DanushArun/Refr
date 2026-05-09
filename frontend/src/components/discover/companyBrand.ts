/**
 * Company brand registry.
 *
 * Each entry provides:
 *   - mark:    a single glyph used as the brand mark in the card hero
 *   - tint:    an OPAQUE brand-color background applied to the brand zone
 *   - tintEnd: the deeper end of the brand-zone gradient (visual depth)
 *   - accent:  the brand-color line used for chips, dividers, and CTAs
 *   - text:    high-contrast text color used over the brand zone
 *
 * Unknown companies fall back to navy. The UI never breaks on a company
 * we don't yet have art for.
 *
 * Note: we used to ship stock office photos per company, but Unsplash IDs
 * cycled across multiple companies and read as random/duplicate. The brand
 * registry is the single source of truth — a unique color + mark per company
 * is more honest than a stock photo we can't verify.
 */

export interface CompanyBrand {
  mark: string;
  tint: string;
  tintEnd: string;
  accent: string;
  text: string;
}

const REGISTRY: Record<string, CompanyBrand> = {
  // ── Bangalore-native fintech / commerce / quick-commerce ─────────────
  razorpay: { mark: '◇', tint: '#0E2D6B', tintEnd: '#06133A', accent: '#3D7BFF', text: '#FFFFFF' },
  cred:     { mark: 'C', tint: '#0E0E10', tintEnd: '#000000', accent: '#D9C29B', text: '#F5F1E8' },
  phonepe:  { mark: 'P', tint: '#5F2EEA', tintEnd: '#3A0E97', accent: '#B69CFF', text: '#FFFFFF' },
  paytm:    { mark: 'P', tint: '#012E5E', tintEnd: '#001530', accent: '#00B9F1', text: '#FFFFFF' },
  zerodha:  { mark: 'Z', tint: '#1E3A8A', tintEnd: '#0F1E4A', accent: '#FF6F00', text: '#FFFFFF' },
  groww:    { mark: 'G', tint: '#00B386', tintEnd: '#005A42', accent: '#9DF5C7', text: '#0A1F1A' },
  swiggy:   { mark: 'S', tint: '#7C2D12', tintEnd: '#3D1408', accent: '#FB923C', text: '#FFFFFF' },
  zomato:   { mark: 'Z', tint: '#9B0E2E', tintEnd: '#530518', accent: '#FF5C77', text: '#FFFFFF' },
  zepto:    { mark: 'Z', tint: '#4C1D95', tintEnd: '#240A4D', accent: '#C4B5FD', text: '#FFFFFF' },
  blinkit:  { mark: 'B', tint: '#F5C518', tintEnd: '#8E6C00', accent: '#1A1A1A', text: '#1A1A1A' },
  dunzo:    { mark: 'D', tint: '#005C5C', tintEnd: '#012A2A', accent: '#19E5C2', text: '#FFFFFF' },
  flipkart: { mark: 'F', tint: '#1A3F8B', tintEnd: '#0B1F47', accent: '#FFC857', text: '#FFFFFF' },
  myntra:   { mark: 'M', tint: '#7A1F4F', tintEnd: '#3D0E27', accent: '#FF3F6C', text: '#FFFFFF' },
  meesho:   { mark: 'M', tint: '#3D0F66', tintEnd: '#1D0734', accent: '#F43397', text: '#FFFFFF' },
  ola:      { mark: 'O', tint: '#0B6E32', tintEnd: '#053418', accent: '#A6D96A', text: '#FFFFFF' },
  uber:     { mark: 'U', tint: '#0F0F0F', tintEnd: '#000000', accent: '#FFFFFF', text: '#FFFFFF' },
  rapido:   { mark: 'R', tint: '#B59100', tintEnd: '#5C4A00', accent: '#FFE066', text: '#0A0A0A' },
  nykaa:    { mark: 'N', tint: '#A21A55', tintEnd: '#530B2A', accent: '#FFB7CE', text: '#FFFFFF' },

  // ── SaaS-native Bangalore ─────────────────────────────────────────────
  freshworks: { mark: 'F', tint: '#0F2748', tintEnd: '#08152A', accent: '#FF8B0F', text: '#FFFFFF' },
  zoho:       { mark: 'Z', tint: '#A82018', tintEnd: '#570F0B', accent: '#FFB196', text: '#FFFFFF' },
  postman:    { mark: 'P', tint: '#5C1B0A', tintEnd: '#330D04', accent: '#FF6C37', text: '#FFFFFF' },
  hasura:     { mark: 'H', tint: '#1F2D5C', tintEnd: '#0E1530', accent: '#1DA9F2', text: '#FFFFFF' },
  unacademy:  { mark: 'U', tint: '#062B59', tintEnd: '#021332', accent: '#43B5FF', text: '#FFFFFF' },
  byjus:      { mark: 'B', tint: '#3D0F66', tintEnd: '#1D0734', accent: '#A78BFA', text: '#FFFFFF' },
  vedantu:    { mark: 'V', tint: '#A0185C', tintEnd: '#530B2F', accent: '#FF8FBE', text: '#FFFFFF' },

  // ── Big-tech Bangalore offices ────────────────────────────────────────
  google:    { mark: 'G', tint: '#1A3D8F', tintEnd: '#0B1E47', accent: '#FBBC04', text: '#FFFFFF' },
  microsoft: { mark: 'M', tint: '#0F4D2A', tintEnd: '#062416', accent: '#7FBA00', text: '#FFFFFF' },
  amazon:    { mark: 'A', tint: '#0F1B2D', tintEnd: '#040912', accent: '#FF9900', text: '#FFFFFF' },
  meta:      { mark: 'M', tint: '#0866FF', tintEnd: '#053499', accent: '#A1C5FF', text: '#FFFFFF' },
  facebook:  { mark: 'F', tint: '#1877F2', tintEnd: '#0B3D80', accent: '#A1C5FF', text: '#FFFFFF' },
  apple:     { mark: 'A', tint: '#1F1F1F', tintEnd: '#0A0A0A', accent: '#D2D2D7', text: '#FFFFFF' },
  netflix:   { mark: 'N', tint: '#5C0009', tintEnd: '#2E0004', accent: '#E50914', text: '#FFFFFF' },
  adobe:     { mark: 'A', tint: '#5E0008', tintEnd: '#2C0004', accent: '#FA0F00', text: '#FFFFFF' },
  linkedin:  { mark: 'L', tint: '#0A4F8A', tintEnd: '#052744', accent: '#70B5F9', text: '#FFFFFF' },
  oracle:    { mark: 'O', tint: '#5E0000', tintEnd: '#2E0000', accent: '#F80000', text: '#FFFFFF' },
  intuit:    { mark: 'I', tint: '#10520F', tintEnd: '#062608', accent: '#9CD672', text: '#FFFFFF' },
  walmart:   { mark: 'W', tint: '#0071CE', tintEnd: '#003C6E', accent: '#FFC220', text: '#FFFFFF' },
  inmobi:    { mark: 'I', tint: '#A6093D', tintEnd: '#560420', accent: '#FF8AAD', text: '#FFFFFF' },
  gojek:     { mark: 'G', tint: '#00643E', tintEnd: '#003020', accent: '#5BD49A', text: '#FFFFFF' },
  atlassian: { mark: 'A', tint: '#0747A6', tintEnd: '#03245C', accent: '#0052CC', text: '#FFFFFF' },
  stripe:    { mark: 'S', tint: '#3A1B82', tintEnd: '#1B0D40', accent: '#9B7CFF', text: '#FFFFFF' },
  twilio:    { mark: 'T', tint: '#3A0509', tintEnd: '#1A0205', accent: '#F22F46', text: '#FFFFFF' },
};

const FALLBACK: CompanyBrand = {
  mark: '◉',
  tint: '#0A1F44',
  tintEnd: '#04102A',
  accent: '#D4A744',
  text: '#FFFFFF',
};

export function getCompanyBrand(companyId: string): CompanyBrand {
  const key = companyId.toLowerCase();
  return REGISTRY[key] ?? FALLBACK;
}

/** Lookup helper for a company id resolved from a free-form name. Strips
 *  common suffixes ("India", "Inc", "Pvt Ltd", etc.) so e.g. "Google India"
 *  and "Google Inc." both resolve to the `google` entry. */
export function brandForName(companyName: string): CompanyBrand {
  const key = companyName
    .toLowerCase()
    .replace(/\b(india|inc|inc\.|ltd|limited|llp|pvt|private|technologies|technology|labs|systems|services|software|corp|corporation)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  return getCompanyBrand(key);
}
