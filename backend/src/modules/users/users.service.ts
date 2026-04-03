import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../shared/middleware/error-handler.js';
import type {
  CreateSeekerProfile,
  CreateReferrerProfile,
  UpdateProfile,
  UserProfile,
  SeekerProfile,
  ReferrerProfile,
} from '@refr/shared';
import type { SignupPayload } from './users.types.js';

// ─── Selects ──────────────────────────────────────────────────────────────────
// Centralising Prisma select shapes prevents drift between read paths.

const SEEKER_PROFILE_SELECT = {
  id: true,
  headline: true,
  careerStory: true,
  skills: true,
  yearsOfExperience: true,
  currentCompany: true,
  targetCompanies: true,
  targetRoles: true,
  resumeUrl: true,
  isOpenToWork: true,
} as const;

const REFERRER_PROFILE_SELECT = {
  id: true,
  department: true,
  jobTitle: true,
  yearsAtCompany: true,
  canReferTo: true,
  kingmakerScore: true,
  totalReferrals: true,
  successfulHires: true,
  verificationStatus: true,
  isAnonymousPostingEnabled: true,
  companyId: true,
  company: { select: { name: true, logoUrl: true } },
} as const;

const BASE_USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  role: true,
  displayName: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function toUserProfile(raw: {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  seekerProfile: {
    headline: string;
    careerStory: string;
    skills: string[];
    yearsOfExperience: number;
    currentCompany: string | null;
    targetCompanies: string[];
    targetRoles: string[];
    resumeUrl: string | null;
    isOpenToWork: boolean;
  } | null;
  referrerProfile: {
    department: string;
    jobTitle: string;
    yearsAtCompany: number;
    canReferTo: string[];
    kingmakerScore: number;
    totalReferrals: number;
    successfulHires: number;
    verificationStatus: string;
    isAnonymousPostingEnabled: boolean;
    companyId: string;
    company: { name: string; logoUrl: string | null };
  } | null;
}): UserProfile {
  const base = {
    id: raw.id,
    email: raw.email,
    phone: raw.phone ?? undefined,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl ?? undefined,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  if (raw.role === 'seeker' && raw.seekerProfile) {
    const sp = raw.seekerProfile;
    const seekerProfile: SeekerProfile = {
      ...base,
      role: 'seeker',
      headline: sp.headline,
      careerStory: sp.careerStory,
      skills: sp.skills,
      yearsOfExperience: sp.yearsOfExperience,
      currentCompany: sp.currentCompany ?? undefined,
      targetCompanies: sp.targetCompanies,
      targetRoles: sp.targetRoles,
      resumeUrl: sp.resumeUrl ?? undefined,
      isOpenToWork: sp.isOpenToWork,
    };
    return seekerProfile;
  }

  if (raw.role === 'referrer' && raw.referrerProfile) {
    const rp = raw.referrerProfile;
    const referrerProfile: ReferrerProfile = {
      ...base,
      role: 'referrer',
      company: rp.company.name,
      companyId: rp.companyId,
      department: rp.department,
      jobTitle: rp.jobTitle,
      yearsAtCompany: rp.yearsAtCompany,
      canReferTo: rp.canReferTo,
      kingmakerScore: rp.kingmakerScore,
      totalReferrals: rp.totalReferrals,
      successfulHires: rp.successfulHires,
      verificationStatus: rp.verificationStatus as ReferrerProfile['verificationStatus'],
      isAnonymousPostingEnabled: rp.isAnonymousPostingEnabled,
    };
    return referrerProfile;
  }

  // Role exists but profile sub-table not yet created — partial state during onboarding
  throw new AppError(
    'Profile setup incomplete. Finish onboarding first.',
    422,
    'PROFILE_INCOMPLETE',
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const UsersService = {
  /**
   * Create a new User row immediately after Supabase Auth signup.
   * Called by POST /signup — the client sends the Supabase authId along with
   * the role they selected on the role-choice screen.
   */
  async createUser(payload: SignupPayload): Promise<{ id: string; role: string }> {
    const existing = await prisma.user.findUnique({ where: { authId: payload.authId } });
    if (existing) {
      return { id: existing.id, role: existing.role };
    }

    const user = await prisma.user.create({
      data: {
        authId: payload.authId,
        email: payload.email,
        phone: payload.phone ?? null,
        role: payload.role,
        displayName: payload.displayName,
      },
      select: { id: true, role: true },
    });

    return user;
  },

  /**
   * Return the full profile for a given user ID.
   * Throws 404 if the user doesn't exist.
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const raw = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...BASE_USER_SELECT,
        seekerProfile: { select: SEEKER_PROFILE_SELECT },
        referrerProfile: {
          select: REFERRER_PROFILE_SELECT,
        },
      },
    });

    if (!raw) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    return toUserProfile(raw);
  },

  /**
   * Create a seeker profile sub-record (called after createUser during onboarding).
   * The careerStory is assembled server-side from the three guided prompts.
   * In Phase 1 this is a simple concatenation; Phase 3 will call the Claude API.
   */
  async createSeekerProfile(userId: string, data: CreateSeekerProfile): Promise<UserProfile> {
    // Build career story from guided prompts (Phase 1: rule-based assembly)
    const careerStory = [
      `Why I'm looking: ${data.storyPrompts.whyLooking}`,
      `What I'm most proud of: ${data.storyPrompts.proudestWork}`,
      `My ideal next role: ${data.storyPrompts.idealRole}`,
    ].join('\n\n');

    await prisma.seekerProfile.upsert({
      where: { userId },
      create: {
        userId,
        headline: data.headline,
        careerStory,
        skills: data.skills,
        yearsOfExperience: data.yearsOfExperience,
        currentCompany: data.currentCompany ?? null,
        targetCompanies: data.targetCompanies,
        targetRoles: data.targetRoles,
        isOpenToWork: data.isOpenToWork,
      },
      update: {
        headline: data.headline,
        careerStory,
        skills: data.skills,
        yearsOfExperience: data.yearsOfExperience,
        currentCompany: data.currentCompany ?? null,
        targetCompanies: data.targetCompanies,
        targetRoles: data.targetRoles,
        isOpenToWork: data.isOpenToWork,
      },
    });

    return UsersService.getProfile(userId);
  },

  /**
   * Create or update a referrer profile.
   * companyName is resolved to a Company row (upserted by name).
   */
  async createReferrerProfile(
    userId: string,
    data: CreateReferrerProfile,
  ): Promise<UserProfile> {
    // Upsert company by name — in production this should be driven by a verified
    // company list to prevent typo fragmentation
    const company = await prisma.company.upsert({
      where: { name: data.company },
      create: { name: data.company },
      update: {},
      select: { id: true },
    });

    await prisma.referrerProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyId: company.id,
        department: data.department,
        jobTitle: data.jobTitle,
        yearsAtCompany: data.yearsAtCompany,
        canReferTo: data.canReferTo,
        isAnonymousPostingEnabled: data.isAnonymousPostingEnabled,
      },
      update: {
        companyId: company.id,
        department: data.department,
        jobTitle: data.jobTitle,
        yearsAtCompany: data.yearsAtCompany,
        canReferTo: data.canReferTo,
        isAnonymousPostingEnabled: data.isAnonymousPostingEnabled,
      },
    });

    return UsersService.getProfile(userId);
  },

  /**
   * Partial update of shared user fields (displayName, avatarUrl) and
   * role-specific profile fields (headline, skills, etc.).
   */
  async updateProfile(userId: string, data: UpdateProfile): Promise<UserProfile> {
    await prisma.$transaction(async (tx) => {
      if (data.displayName) {
        await tx.user.update({
          where: { id: userId },
          data: { displayName: data.displayName },
        });
      }

      const seekerUpdates: Record<string, unknown> = {};
      if (data.headline !== undefined) seekerUpdates.headline = data.headline;
      if (data.skills !== undefined) seekerUpdates.skills = data.skills;
      if (data.targetCompanies !== undefined) seekerUpdates.targetCompanies = data.targetCompanies;
      if (data.targetRoles !== undefined) seekerUpdates.targetRoles = data.targetRoles;
      if (data.isOpenToWork !== undefined) seekerUpdates.isOpenToWork = data.isOpenToWork;

      if (Object.keys(seekerUpdates).length > 0) {
        await tx.seekerProfile.updateMany({
          where: { userId },
          data: seekerUpdates,
        });
      }
    });

    return UsersService.getProfile(userId);
  },
};
