import { z } from 'zod';

export const createSeekerProfileSchema = z.object({
  headline: z.string().min(10).max(120),
  skills: z.array(z.string()).min(1).max(20),
  yearsOfExperience: z.number().int().min(0).max(50),
  currentCompany: z.string().optional(),
  targetCompanies: z.array(z.string()).min(1).max(10),
  targetRoles: z.array(z.string()).min(1).max(5),
  isOpenToWork: z.boolean().default(true),
  // Guided story prompts -- AI assembles these into careerStory
  storyPrompts: z.object({
    whyLooking: z.string().min(20).max(500),     // "Why are you looking for a new role?"
    proudestWork: z.string().min(20).max(500),    // "What's the work you're most proud of?"
    idealRole: z.string().min(20).max(500),       // "Describe your ideal next role"
  }),
});

export const createReferrerProfileSchema = z.object({
  company: z.string().min(1),
  department: z.string().min(1),
  jobTitle: z.string().min(1),
  yearsAtCompany: z.number().int().min(0).max(50),
  canReferTo: z.array(z.string()).min(1).max(10),
  isAnonymousPostingEnabled: z.boolean().default(true),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  headline: z.string().min(10).max(120).optional(),
  skills: z.array(z.string()).min(1).max(20).optional(),
  targetCompanies: z.array(z.string()).min(1).max(10).optional(),
  targetRoles: z.array(z.string()).min(1).max(5).optional(),
  isOpenToWork: z.boolean().optional(),
});

export type CreateSeekerProfile = z.infer<typeof createSeekerProfileSchema>;
export type CreateReferrerProfile = z.infer<typeof createReferrerProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
