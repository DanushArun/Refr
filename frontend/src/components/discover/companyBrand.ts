/**
 * Company brand registry.
 *
 * Each entry provides:
 *   - mark: a single emoji/glyph used as the brand mark in the card hero
 *           (designer-replaceable with SVG logos in a future pass)
 *   - tint: an OPAQUE brand-color background applied to the brand zone of
 *           the card. Opaque so contrast vs. white text is predictable.
 *   - accent: the brand-color line used for chips, dividers, and CTAs
 *   - text:  high-contrast text color used over the brand zone
 *
 * Unknown companies fall back to navy. The UI never breaks on a company
 * we don't yet have art for.
 */

export interface CompanyBrand {
  mark: string;
  tint: string;
  accent: string;
  text: string;
}

const REGISTRY: Record<string, CompanyBrand> = {
  razorpay: {
    mark: '◇',
    tint: '#0D2748',           // Razorpay navy
    accent: '#3D7BFF',
    text: '#FFFFFF',
  },
  zepto: {
    mark: 'Z',
    tint: '#4C1D95',           // Zepto deep purple
    accent: '#C4B5FD',
    text: '#FFFFFF',
  },
  google: {
    mark: 'G',
    tint: '#1E3A8A',           // navy stand-in for Google
    accent: '#93C5FD',
    text: '#FFFFFF',
  },
  flipkart: {
    mark: 'F',
    tint: '#1A3F8B',           // Flipkart blue
    accent: '#FFC857',
    text: '#FFFFFF',
  },
  swiggy: {
    mark: 'S',
    tint: '#7C2D12',           // Swiggy warm orange-brown
    accent: '#FB923C',
    text: '#FFFFFF',
  },
};

const FALLBACK: CompanyBrand = {
  mark: '◉',
  tint: '#0A1F44',             // nautical navy (matches app palette)
  accent: '#D4A744',           // sailor gold
  text: '#FFFFFF',
};

export function getCompanyBrand(companyId: string): CompanyBrand {
  const key = companyId.toLowerCase();
  return REGISTRY[key] ?? FALLBACK;
}

/** Lookup helper for a company id resolved from a free-form name. */
export function brandForName(companyName: string): CompanyBrand {
  return getCompanyBrand(companyName.toLowerCase().replace(/\s+/g, ''));
}
