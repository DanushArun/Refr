export interface FullProfile {
  id: number;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  headline?: string;
  endorsementScore?: number;
  jobTitle?: string;
  companyName?: string;
  seekerProfile?: {
    headline: string;
    career_story: string;
    skills: string[];
    years_of_experience: number;
    target_companies: string[];
    target_roles: string[];
    is_open_to_work: boolean;
  };
  referrerProfile?: {
    company: { id: number; name: string };
    department: string;
    job_title: string;
    endorsement_score: number;
    total_referrals: number;
    successful_hires: number;
    verification_status: string;
  };
}

export type ReferrerProfile = NonNullable<FullProfile['referrerProfile']>;
export type SeekerProfile = NonNullable<FullProfile['seekerProfile']>;
