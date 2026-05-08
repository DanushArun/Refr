import { buildGalaxy, type GalaxyData, type GalaxyInput } from '../../lib/constellation/buildGalaxy';

/**
 * Demo galaxy seed used by the Welcome/Onboarding screens before a user
 * has signed in. Realistic Bangalore tech persona — Danush as the user,
 * targeting top product companies, with a small set of trusted connections.
 *
 * Once authenticated, callers should pass the real user's profile to buildGalaxy().
 */
const DEMO_INPUT: GalaxyInput = {
  userId: 'demo-danush',
  userName: 'Danush Arun',
  targetCompanies: [
    { id: 'razorpay', name: 'Razorpay' },
    { id: 'zepto', name: 'Zepto' },
    { id: 'google', name: 'Google' },
    { id: 'flipkart', name: 'Flipkart' },
    { id: 'swiggy', name: 'Swiggy' },
  ],
  connections: [
    { id: 'c-nivrant', name: 'Nivrant Goswami', companyId: 'razorpay', trustScore: 88 },
    { id: 'c-anita', name: 'Anita Desai', companyId: 'swiggy', trustScore: 72 },
    { id: 'c-deepak', name: 'Deepak Nair', companyId: 'zepto', trustScore: 65 },
    { id: 'c-vikram', name: 'Vikram Rao', companyId: 'google', trustScore: 91 },
  ],
};

export function getDemoGalaxy(): GalaxyData {
  return buildGalaxy(DEMO_INPUT);
}
