export type RequestKind = 'advice' | 'introduction' | 'referral_review';

export type SharedProfileField =
  | 'headline'
  | 'careerStory'
  | 'skills'
  | 'yearsOfExperience'
  | 'currentCompany'
  | 'location'
  | 'education';

interface RequestIntentCopy {
  title: string;
  detail: string;
}

const INTENT_COPY: Record<RequestKind, RequestIntentCopy> = {
  advice: {
    title: 'Ask for perspective',
    detail: 'Start with a focused question. No referral is implied.',
  },
  introduction: {
    title: 'Request an introduction',
    detail: 'Ask whether they are comfortable connecting you with the right person.',
  },
  referral_review: {
    title: 'Request a referral review',
    detail: 'Ask them to review your fit before deciding whether to refer you.',
  },
};

const DEFAULT_FIELDS: Record<RequestKind, SharedProfileField[]> = {
  advice: ['headline', 'skills', 'yearsOfExperience'],
  introduction: [
    'headline',
    'skills',
    'yearsOfExperience',
    'currentCompany',
    'location',
  ],
  referral_review: [
    'headline',
    'careerStory',
    'skills',
    'yearsOfExperience',
    'currentCompany',
    'location',
    'education',
  ],
};

export function defaultSharedFields(kind: RequestKind): SharedProfileField[] {
  return [...DEFAULT_FIELDS[kind]];
}

export function toggleSharedField(
  fields: SharedProfileField[],
  field: SharedProfileField,
): SharedProfileField[] {
  if (fields.includes(field)) return fields.filter((item) => item !== field);
  return [...fields, field];
}

export function requestIntentCopy(kind: RequestKind): RequestIntentCopy {
  return INTENT_COPY[kind];
}
