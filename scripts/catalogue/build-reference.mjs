import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const referenceRoot = join(root, 'design-reference');

const shared = [
  ['launch-seeker', 'Launch — seeker', '/', 'launch', '0.png', 1,
    'LaunchArtwork|BrandWordmark|PrimaryButton'],
  ['launch-endorser', 'Launch — endorser', '/', 'launch', '0.png', 1,
    'LaunchArtwork|BrandWordmark|PrimaryButton'],
];

const seeker = [
  ['01-entry', '1.png', 'entry', [
    ['intent-choice', 'Choose participation', '/auth/participation',
      'AppHeader|HeroPortrait|ChoiceCard|PrimaryButton'],
    ['phone', 'Phone entry', '/auth/phone', 'AppHeader|PhoneInput|PrivacyNote|PrimaryButton'],
    ['otp', 'Verify phone number', '/auth/otp', 'AppHeader|OtpInput|PasteCodeCard|PrimaryButton'],
    ['welcome', 'Welcome', '/discover?state=welcome',
      'AppHeader|ProfilePortrait|VerificationBenefitList|BottomNavigation|PrimaryButton'],
  ]],
  ['02-identity', '2.png', 'identity', [
    ['basics', 'Profile basics', '/onboarding/basics',
      'ProgressStepper|AvatarPicker|Input|SelectField|PrimaryButton'],
    ['current-role', 'Current role', '/onboarding/current-role',
      'ProgressStepper|CompanyCard|Input|SelectField|VerificationCard|PrimaryButton'],
    ['career-history', 'Career history', '/onboarding/career-history',
      'ProgressStepper|CareerHistoryCard|SecondaryButton|PrimaryButton'],
    ['education', 'Education', '/onboarding/education',
      'ProgressStepper|EducationCard|Input|SelectField|VerificationCard|PrimaryButton'],
  ]],
  ['03-intent', '3.png', 'intent', [
    ['skills', 'Skills', '/onboarding/skills', 'SelectableList|VerificationBadge|PrimaryButton'],
    ['impact', 'Impact highlights', '/onboarding/impact',
      'ProgressStepper|AchievementCard|SecondaryButton|PrimaryButton'],
    ['target-role', 'Target role', '/onboarding/target-role',
      'ProgressStepper|RoleChoiceCard|DisclosureField|PrimaryButton'],
    ['preferences', 'Work preferences', '/onboarding/preferences',
      'ProgressStepper|PreferenceRow|ChoiceCard|PrimaryButton'],
  ]],
  ['04-profile-ready', '4.png', 'profile-ready', [
    ['resume-upload', 'Resume upload', '/onboarding/resume',
      'UploadCard|ProgressBar|PrivacyCard|SecondaryButton'],
    ['verification-status', 'Verification status', '/onboarding/verification',
      'VerificationList|PrivacyCard'],
    ['visibility', 'Visibility controls', '/onboarding/visibility',
      'PrivacyTable|Switch|PrivacyCard'],
    ['profile-ready', 'Profile ready', '/discover',
      'ProfileHero|SkillChip|VerificationGrid|BottomNavigation|PrimaryButton'],
  ]],
  ['05-discover', '5.png', 'discover', [
    ['tutorial', 'Discover tutorial', '/discover?state=tutorial',
      'SwipeDeckTutorial|BottomNavigation|PrimaryButton'],
    ['role-card', 'Discover role card', '/discover',
      'OpportunityCard|FitSummary|EndorserAvailabilityRow|BottomNavigation|PrimaryButton'],
    ['fit-sheet', 'Fit explained sheet', '/discover?sheet=fit',
      'OpportunityCard|FitExplanationSheet|BottomNavigation'],
    ['saved', 'Saved opportunity', '/discover?state=saved',
      'Toast|SavedOpportunityCard|OpportunityCard|BottomNavigation'],
  ]],
  ['06-opportunity', '6.png', 'opportunity', [
    ['overview', 'Opportunity overview', '/opportunity/razorpay-spm',
      'AppHeader|FitSummary|AvailabilityCard|PrimaryButton|BottomNavigation'],
    ['responsibilities', 'Opportunity responsibilities', '/opportunity/razorpay-spm?tab=role',
      'AppHeader|CheckList|RequirementProgress|SkillChip|BottomNavigation'],
    ['company', 'Company context', '/opportunity/razorpay-spm?tab=company',
      'AppHeader|ValueList|CompanyImage|BottomNavigation'],
    ['endorsers', 'Eligible endorsers', '/opportunity/razorpay-spm?tab=endorsers',
      'AppHeader|EndorserCard|EligibilityNotice|BottomNavigation|PrimaryButton'],
  ]],
  ['07-request', '7.png', 'request', [
    ['endorser-profile', 'Endorser profile', '/endorser/arjun-menon',
      'AppHeader|ProfileHero|VerificationCard|StatRow|PrimaryButton|SecondaryButton'],
    ['question', 'Ask endorser a question', '/endorser/arjun-menon/question',
      'AppHeader|ReferenceCard|MultilineInput|PrivacyNote|PrimaryButton'],
    ['intro-form', 'Request introduction', '/endorser/arjun-menon/request',
      'AppHeader|RecipientRow|MultilineInput|FitChecklist|PrimaryButton'],
    ['sent', 'Request sent', '/request/razorpay-spm/sent',
      'SuccessIllustration|ProfilePortrait|SecondaryButton|PrimaryButton'],
  ]],
  ['08-connect', '8.png', 'connect', [
    ['confirmed', 'Connection confirmed', '/connection/arjun-menon',
      'ConnectionIllustration|OpportunityCard|BottomNavigation|PrimaryButton'],
    ['inbox', 'Inbox', '/inbox',
      'AppHeader|ConnectionCarousel|ConversationList|BottomNavigation'],
    ['filter', 'Inbox filter', '/inbox?sheet=filter',
      'FilterSheet|FilterOption|PrimaryButton|SecondaryButton'],
    ['chat', 'Conversation', '/chat?referralId=razorpay-spm',
      'AppHeader|ConversationHeader|ChatMessages|ChatComposer|BottomNavigation'],
  ]],
  ['09-handoff', '9.png', 'handoff', [
    ['conversation', 'Referral details request', '/chat?referralId=razorpay-spm',
      'ConversationHeader|ChatMessages|ChatComposer|BottomNavigation'],
    ['details-request', 'Requested referral details', '/handoff/razorpay-spm',
      'HandoffCard|VerificationList|ChatComposer|BottomNavigation|PrimaryButton'],
    ['share-details', 'Share secure details', '/handoff/razorpay-spm/share',
      'VerificationList|DisabledButton|ConsentNotice|BottomNavigation'],
    ['review-consent', 'Review and confirm', '/handoff/razorpay-spm/confirm',
      'RecipientRow|SharedDetailTable|ConsentCheckbox|PrimaryButton'],
  ]],
  ['10-track', '10.png', 'track', [
    ['package-shared', 'Secure package shared', '/handoff/razorpay-spm/shared',
      'SuccessPanel|PrivacyNote|BottomNavigation|PrimaryButton'],
    ['submitted', 'Referral submitted', '/application/razorpay-spm/submitted',
      'SuccessIllustration|ApplicationSummary|BottomNavigation|PrimaryButton'],
    ['overview', 'Activity overview', '/activity', 'AppHeader|ApplicationCard|BottomNavigation'],
    ['timeline', 'Application timeline', '/application/razorpay-spm',
      'AppHeader|Timeline|OwnerRow|Switch|BottomNavigation'],
  ]],
  ['11-interview', '11.png', 'interview', [
    ['review', 'Recruiter review', '/application/razorpay-spm',
      'AppHeader|Timeline|StatusPanel|BottomNavigation'],
    ['invitation', 'Interview invitation', '/application/razorpay-spm/interview',
      'AppHeader|InterviewDetailsCard|CalloutCard|PrimaryButton|TextButton'],
    ['time', 'Choose interview time', '/application/razorpay-spm/interview/time',
      'AppHeader|RadioList|WarningCard|PrimaryButton'],
    ['preparation', 'Interview preparation', '/application/razorpay-spm/interview/prep',
      'AppHeader|AdviceCard|Checklist|PrimaryButton'],
  ]],
  ['12-offer', '12.png', 'offer', [
    ['pending', 'Interview completed', '/application/razorpay-spm/decision',
      'AppHeader|StatusPanel|MessageCard|InfoCard|BottomNavigation'],
    ['received', 'Offer received', '/application/razorpay-spm/offer',
      'OfferIllustration|OfferSummary|PrimaryButton'],
    ['review', 'Review offer', '/application/razorpay-spm/offer/review',
      'OfferDetailsCard|ConsentCheckbox|ConfirmationSheet|PrimaryButton'],
    ['accepted', 'Offer accepted', '/application/razorpay-spm/offer/accepted',
      'CelebrationPortrait|ThankYouCard|ChecklistRow|PrimaryButton'],
  ]],
  ['13-profile', '13.png', 'profile', [
    ['overview', 'Profile overview', '/profile',
      'ProfileHero|FitList|PrimaryButton|DisclosureRow|BottomNavigation'],
    ['documents', 'Documents and verification', '/profile/documents',
      'AppHeader|DocumentList|VerificationBadge|PrivacyCard|BottomNavigation'],
    ['preferences', 'Career preferences', '/profile/preferences',
      'AppHeader|DisclosureList|SwitchList|BottomNavigation'],
    ['privacy', 'Privacy and account', '/profile/privacy',
      'AppHeader|SettingsList|DestructiveActionRow|BottomNavigation'],
  ]],
];

const endorser = [
  ['01-verify', '1.png', 'verify', [
    ['participation', 'Participation choice', '/auth/participation',
      'AppHeader|HeroPortrait|ChoiceCard|PrimaryButton'],
    ['work-identity', 'Verify work identity', '/endorser-onboarding/work',
      'AppHeader|Input|VerificationCard|PrimaryButton'],
    ['checking', 'Verifying work identity', '/endorser-onboarding/work?state=checking',
      'AppHeader|VerificationTimeline|PrivacyCard'],
    ['verified', 'Endorser verified', '/endorser-onboarding/verified',
      'AppHeader|CelebrationPortrait|VerificationCard|PrimaryButton'],
  ]],
  ['02-setup', '2.png', 'setup', [
    ['roles', 'Referral roles', '/endorser-onboarding/roles', 'RoleChoiceList|PrimaryButton'],
    ['scope', 'Referral scope', '/endorser-onboarding/scope', 'ChoiceList|PrimaryButton'],
    ['capacity', 'Capacity and availability', '/endorser-onboarding/capacity',
      'StepperRow|SwitchRow|RadioList|PrimaryButton'],
    ['ready', 'Referral desk ready', '/endorser/discover',
      'ProfilePortrait|SummaryList|PrimaryButton'],
  ]],
  ['03-discover', '3.png', 'discover', [
    ['tutorial', 'Candidate discovery tutorial', '/endorser/discover?state=tutorial',
      'SwipeDeckTutorial|BottomNavigation|PrimaryButton'],
    ['candidate', 'Candidate card', '/endorser/discover',
      'CandidateCard|VerificationChip|PrimaryButton|SecondaryButton|BottomNavigation'],
    ['fit', 'Candidate fit explanation', '/endorser/discover?sheet=fit',
      'FitExplanationSheet|BottomNavigation|PrimaryButton'],
    ['passed', 'Candidate passed', '/endorser/discover?state=passed',
      'Toast|CandidateCard|BottomNavigation'],
  ]],
  ['04-evidence', '4.png', 'evidence', [
    ['profile', 'Candidate profile', '/candidate/priya-nair',
      'ProfileHero|FitSummary|VerificationList|PrimaryButton|BottomNavigation'],
    ['impact', 'Candidate impact', '/candidate/priya-nair?tab=impact',
      'MetricList|CareerTimeline|SkillChip|BottomNavigation'],
    ['resume', 'Candidate resume', '/candidate/priya-nair/resume',
      'DocumentPreview|VerificationList|PrivacyCard|SecondaryButton'],
    ['trust', 'Trust and context', '/candidate/priya-nair/trust',
      'AvatarStack|VerificationList|PrimaryButton|SecondaryButton'],
  ]],
  ['05-match', '5.png', 'match', [
    ['message', 'Send connection', '/candidate/priya-nair/connect',
      'CandidateSummary|MultilineInput|QuestionList|PrimaryButton'],
    ['sent', 'Connection sent', '/candidate/priya-nair/connect/sent',
      'SuccessIllustration|CandidateSummary|WaitCard|PrimaryButton'],
    ['mutual', 'Mutual connection', '/connection/priya-nair',
      'ConnectionIllustration|OpportunityCard|PrimaryButton'],
    ['inbox', 'Endorser inbox', '/endorser/inbox',
      'AppHeader|ConnectionList|ConversationList|BottomNavigation'],
  ]],
  ['06-chat-handoff', '6.png', 'chat-handoff', [
    ['chat', 'Candidate conversation', '/chat?referralId=priya-razo',
      'ConversationHeader|ChatMessages|ChatComposer|BottomNavigation'],
    ['details', 'Request vetted details', '/endorser/handoff/priya-razo',
      'HandoffCard|DetailList|DisabledButton|BottomNavigation'],
    ['received', 'Secure package received', '/endorser/handoff/priya-razo/received',
      'VerificationList|VisibilityCard|PrivacyNote|BottomNavigation'],
    ['ready', 'Referral ready', '/endorser/referral/priya-razo',
      'SuccessIllustration|ReferralSummary|PrimaryButton'],
  ]],
  ['07-refer', '7.png', 'refer', [
    ['role', 'Confirm role', '/endorser/referral/priya-razo',
      'CandidateSummary|RoleSummary|FitSummary|PrimaryButton'],
    ['consent', 'Review candidate consent', '/endorser/referral/priya-razo/consent',
      'CandidateSummary|ConsentCard|PrimaryButton'],
    ['note', 'Add endorsement note', '/endorser/referral/priya-razo/note',
      'MultilineInput|SubmissionSummary|PrimaryButton'],
    ['submitted', 'Referral submitted', '/endorser/referral/priya-razo/submitted',
      'SuccessIllustration|ReferralSummary|NextStepCard|PrimaryButton'],
  ]],
  ['08-pipeline', '8.png', 'pipeline', [
    ['list', 'Candidate pipeline', '/endorser/candidates',
      'StatRow|FilterBar|CandidateList|BottomNavigation'],
    ['review', 'Recruiter review', '/endorser/candidates/priya-razo',
      'CandidateHeader|Timeline|OwnerRow|InfoCard'],
    ['interview', 'Interview scheduled', '/endorser/candidates/priya-razo?stage=interview',
      'CandidateHeader|Timeline|PrimaryButton'],
    ['decision', 'Interview complete', '/endorser/candidates/priya-razo?stage=decision',
      'CandidateHeader|Timeline|MessageRow'],
  ]],
  ['09-join', '9.png', 'join', [
    ['offer', 'Candidate offer received', '/endorser/candidates/priya-razo?stage=offer',
      'CandidateIllustration|StatusCard|PrimaryButton'],
    ['accepted', 'Candidate offer accepted', '/endorser/candidates/priya-razo?stage=accepted',
      'CelebrationIllustration|StatusCard|PrimaryButton'],
    ['joined', 'Candidate joined', '/endorser/candidates/priya-razo?stage=joined',
      'CandidateIllustration|RewardCard|PrimaryButton'],
    ['verification', '60-day verification',
      '/endorser/candidates/priya-razo?stage=verification',
      'ProgressCard|EligibilityList|PayoutCard|PrimaryButton'],
  ]],
  ['10-reward', '10.png', 'reward', [
    ['earnings', 'Earnings', '/endorser/earnings',
      'AppHeader|RewardStatCard|PayoutList|BottomNavigation'],
    ['detail', 'Reward detail', '/endorser/earnings/priya-razo',
      'CandidateSummary|Timeline|TermsCard|BottomNavigation'],
    ['scheduled', 'Payout scheduled', '/endorser/earnings/priya-razo/payout',
      'PayoutCard|Timeline|HelpRow|BottomNavigation'],
    ['paid', 'Payout paid', '/endorser/earnings/priya-razo/paid',
      'SuccessIllustration|PaymentReceipt|ThankYouCard|PrimaryButton'],
  ]],
  ['11-profile', '11.png', 'profile', [
    ['overview', 'Endorser profile', '/endorser/profile',
      'ProfileHero|VerificationCard|StatRow|QuoteCard|PrimaryButton'],
    ['preferences', 'Referral preferences', '/endorser/profile/preferences',
      'AppHeader|DisclosureList|SwitchRow|PrimaryButton'],
    ['payouts', 'Payouts and tax', '/endorser/profile/payouts',
      'AppHeader|SettingsList|PrivacyCard|PrimaryButton'],
    ['privacy', 'Privacy, security, and help', '/endorser/profile/privacy',
      'AppHeader|SettingsList|DestructiveActionRow|BottomNavigation'],
  ]],
];

function expand(role, groups) {
  return groups.flatMap(([group, sourceImage, state, panels]) => panels.map(
    ([panel, title, route, components], index) => ({
      id: `${role}-${group}-${panel}`,
      role,
      title,
      route,
      state: `${state}-${panel}`,
      sourceImage,
      sourcePanel: index + 1,
      components: components.split('|'),
      referenceStatus: 'source-export-required',
    }),
  ));
}

function sourceFor(screen) {
  const sourceRole = screen.role === 'shared'
    ? (screen.id.endsWith('seeker') ? 'seeker' : 'endorser')
    : screen.role;
  return `_incoming/${sourceRole}/${screen.sourceImage}`;
}

function specificationFor(screen) {
  const components = screen.components.map((component) => `- ${component}`).join('\n');
  return `---\nid: ${screen.id}\nrole: ${screen.role}\nstate: ${screen.state}\n` +
    `sourceComposite: ${sourceFor(screen)}\nsourcePanel: ${screen.sourcePanel}\n` +
    'referenceStatus: source-export-required\nreferenceViewport: 390x844\n' +
    'visualThreshold: pending-first-approved-flat-reference\n' +
    'fixture: deterministic-local\n---\n\n' +
    `# Screen: ${screen.title}\n\n## Route\n${screen.route}\n\n` +
    '## Purpose\nImplement the visible catalogue state with no unapproved visual additions.\n\n' +
    '## Layout\n- Flat bezel-free export required before geometry approval.\n' +
    '- Respect device safe areas and fixed navigation/action positions.\n\n' +
    '## Typography\n- Use supplied catalogue font files and weights only.\n' +
    '- Do not synthesize bold or substitute a typeface.\n\n' +
    `## Components\n${components}\n\n` +
    '## Interactions\n- Implement only states visible in the source or approved product rules.\n' +
    '- Keep targets at least 44pt on iOS and 48dp on Android.\n\n' +
    '## Motion\n- Source motion notes required. Respect reduced-motion preferences.\n\n' +
    '## Responsive behaviour\n- Canonical comparison canvas: 390 × 844 logical points.\n' +
    '- Verify 360, 375, 393, and 430 widths for no clipping or overlap.\n\n' +
    '## Acceptance criteria\n' +
    '- Use supplied assets only; no emoji, generic artwork, or default controls.\n' +
    '- Begin screenshot comparison only after a flat `reference.png` is supplied.\n' +
    '- Resolve all P0 and P1 issues before P2 polish.\n';
}

function auditFor(screen) {
  const components = screen.components.map((component) => `- ${component}`).join('\n');
  return `# Screen audit: ${screen.title}\n\n` +
    '## Source reviewed\n' +
    `- Composite: \`${sourceFor(screen)}\`\n- Phone panel: ${screen.sourcePanel}\n` +
    '- Review status: visually inventoried on 2026-07-15\n\n' +
    `## Visible inventory\n${components}\n\n` +
    '## Fidelity constraints\n' +
    '- The composite establishes hierarchy, copy, visible state, and component presence.\n' +
    '- Perspective and device chrome prevent geometry approval from this source alone.\n' +
    '- Await flat export, font, icon, artwork, and crop manifest ' +
    'before implementation approval.\n' +
    '\n' +
    '## State provenance\n' +
    '- Reference: visible static state in the identified panel.\n' +
    '- Design-pending: loading, error, offline, keyboard, and unspecified motion states.\n';
}

async function writeFileAt(filePath, content) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

async function writeScreen(screen) {
  const folder = screen.id.replace(/^(shared|seeker|endorser)-/, '');
  const directory = join(referenceRoot, screen.role, folder);
  await writeFileAt(join(directory, 'specification.md'), specificationFor(screen));
  await writeFileAt(join(directory, 'screen-audit.md'), auditFor(screen));
}

async function main() {
  const screens = [
    ...shared.map(([
      id,
      title,
      route,
      state,
      sourceImage,
      sourcePanel,
      components,
    ]) => ({
      id: `shared-${id}`,
      role: 'shared',
      title,
      route,
      state,
      sourceImage,
      sourcePanel,
      components: components.split('|'),
      referenceStatus: 'source-export-required',
    })),
    ...expand('seeker', seeker),
    ...expand('endorser', endorser),
  ];
  const registry = { version: 1, generatedAt: '2026-07-15', screenCount: screens.length, screens };
  await Promise.all(screens.map(writeScreen));
  const registryPath = join(referenceRoot, 'screen-registry.json');
  const registryContent = `${JSON.stringify(registry, null, 2)}\n`;
  await writeFileAt(registryPath, registryContent);
}

await main();
