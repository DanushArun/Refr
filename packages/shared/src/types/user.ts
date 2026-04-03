import type { UserRole } from '../constants/roles';
import type { VerificationStatus } from '../constants/status';

export interface BaseUser {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SeekerProfile extends BaseUser {
  role: 'seeker';
  headline: string;            // "Senior Backend Engineer | Ex-Amazon"
  careerStory: string;         // The narrative -- AI-assisted from guided prompts
  skills: string[];
  yearsOfExperience: number;
  currentCompany?: string;     // May be unemployed
  targetCompanies: string[];   // Companies they want referrals to
  targetRoles: string[];       // "Backend Engineer", "Engineering Manager"
  resumeUrl?: string;
  isOpenToWork: boolean;
}

export interface ReferrerProfile extends BaseUser {
  role: 'referrer';
  company: string;
  companyId: string;
  department: string;
  jobTitle: string;
  yearsAtCompany: number;
  canReferTo: string[];        // Departments/roles they can refer to
  kingmakerScore: number;      // 0-100, earned through referral outcomes
  totalReferrals: number;
  successfulHires: number;
  verificationStatus: VerificationStatus;
  isAnonymousPostingEnabled: boolean; // Can post company intel anonymously
}

export type UserProfile = SeekerProfile | ReferrerProfile;
