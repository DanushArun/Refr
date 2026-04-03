import type { UserRole } from '@refr/shared';

// Internal type representing the combined User + profile row returned from DB.
// This is NOT the public API response — see users.service.ts for the mapping.
export interface UserWithProfile {
  id: string;
  authId: string;
  email: string;
  phone: string | null;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  seekerProfile: SeekerProfileRow | null;
  referrerProfile: ReferrerProfileRow | null;
}

export interface SeekerProfileRow {
  id: string;
  userId: string;
  headline: string;
  careerStory: string;
  skills: string[];
  yearsOfExperience: number;
  currentCompany: string | null;
  targetCompanies: string[];
  targetRoles: string[];
  resumeUrl: string | null;
  isOpenToWork: boolean;
}

export interface ReferrerProfileRow {
  id: string;
  userId: string;
  companyId: string;
  department: string;
  jobTitle: string;
  yearsAtCompany: number;
  canReferTo: string[];
  kingmakerScore: number;
  totalReferrals: number;
  successfulHires: number;
  verificationStatus: string;
  isAnonymousPostingEnabled: boolean;
  company: { name: string; logoUrl: string | null };
}

// Payload accepted by POST /signup after Supabase auth is complete
export interface SignupPayload {
  authId: string;
  email: string;
  phone?: string;
  role: UserRole;
  displayName: string;
}
