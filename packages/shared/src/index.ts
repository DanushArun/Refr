// Constants
export { UserRole, SEEKER_TABS, REFERRER_TABS } from './constants/roles';
export { ReferralStatus, ContentType, VerificationStatus } from './constants/status';

// Types
export type {
  BaseUser,
  SeekerProfile,
  ReferrerProfile,
  UserProfile,
} from './types/user';

export type {
  ContentCard,
  CareerStoryCard,
  CompanyIntelCard,
  ReferralEventCard,
  MilestoneCard,
  EditorialCard,
  FeedCard,
} from './types/content';

export type {
  Referral,
  SeekerPipelineItem,
  ReferrerInboxItem,
} from './types/referral';

export type {
  FeedResponse,
  FeedRequest,
  BehaviorEvent,
  BehaviorEventType,
} from './types/feed';

// Zod Schemas (for runtime validation)
export {
  createSeekerProfileSchema,
  createReferrerProfileSchema,
  updateProfileSchema,
} from './schemas/user.schema';

export {
  createCompanyIntelSchema,
  feedRequestSchema,
  behaviorEventSchema,
  createReferralRequestSchema,
} from './schemas/content.schema';
