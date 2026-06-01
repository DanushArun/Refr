import type { PipelineStage } from '../../components/activity/PipelineStepper';
import type { Message } from './chatLogic';

export type ReadinessState = 'complete' | 'current' | 'missing';

export interface ReadinessItem {
  key: 'intro' | 'resume' | 'role' | 'hrNote';
  label: string;
  detail: string;
  state: ReadinessState;
}

export interface ReadinessSummary {
  completedCount: number;
  hrNoteReady: boolean;
  items: ReadinessItem[];
  missingCount: number;
  readyForSubmission: boolean;
  resumeAttached: boolean;
  roleConfirmed: boolean;
  statusDetail: string;
  statusLabel: string;
}

export function buildReadiness(args: {
  messages: Message[];
  stage: PipelineStage;
  targetRole?: string;
}): ReadinessSummary {
  const resumeAttached = hasResumeSignal(args.messages);
  const roleConfirmed = Boolean(args.targetRole?.trim());
  const hrNoteReady = stageAtLeast(args.stage, 'submitted');
  const items = buildItems({
    hasIntro: args.messages.length > 0,
    hrNoteReady,
    readyForSubmission: resumeAttached && roleConfirmed,
    resumeAttached,
    roleConfirmed,
  });
  const completedCount = items.filter((item) => item.state === 'complete').length;
  const missingCount = items.filter((item) => item.state === 'missing').length;

  return {
    completedCount,
    hrNoteReady,
    items,
    missingCount,
    readyForSubmission: resumeAttached && roleConfirmed,
    resumeAttached,
    roleConfirmed,
    ...statusCopy({ hrNoteReady, resumeAttached, roleConfirmed }),
  };
}

export function hasResumeSignal(messages: Message[]): boolean {
  return messages.some((message) => messageHasResumeSignal(message.body));
}

export function submitDisabledReason(summary: ReadinessSummary): string | null {
  if (!summary.roleConfirmed) return 'Confirm target role first';
  if (!summary.resumeAttached) return 'Ask for resume before submitting';
  return null;
}

function buildItems(args: {
  hasIntro: boolean;
  hrNoteReady: boolean;
  readyForSubmission: boolean;
  resumeAttached: boolean;
  roleConfirmed: boolean;
}): ReadinessItem[] {
  return [
    item('intro', 'Intro', args.hasIntro, 'Opening context captured'),
    item('resume', 'Resume', args.resumeAttached, 'Resume link attached'),
    item('role', 'Role fit', args.roleConfirmed, 'Target role confirmed'),
    hrNoteItem(args.hrNoteReady, args.readyForSubmission),
  ];
}

function hrNoteItem(hrNoteReady: boolean, readyForSubmission: boolean): ReadinessItem {
  if (hrNoteReady) return item('hrNote', 'HR note', true, 'Submitted to company');
  return {
    key: 'hrNote',
    label: 'HR note',
    detail: readyForSubmission ? 'Ready to preview' : 'Waiting on missing context',
    state: readyForSubmission ? 'current' : 'missing',
  };
}

function item(
  key: ReadinessItem['key'],
  label: string,
  done: boolean,
  doneDetail: string,
): ReadinessItem {
  return {
    key,
    label,
    detail: done ? doneDetail : missingDetailFor(key),
    state: done ? 'complete' : 'missing',
  };
}

function missingDetailFor(key: ReadinessItem['key']): string {
  if (key === 'resume') return 'Needed before HR submission';
  if (key === 'role') return 'Ask which role they want';
  if (key === 'intro') return 'Start with candidate context';
  return 'Missing';
}

function messageHasResumeSignal(body: string): boolean {
  const normalized = body.toLowerCase();
  return normalized.includes('resume')
    || normalized.includes('cv')
    || normalized.includes('drive.google')
    || normalized.includes('docs.google')
    || normalized.includes('linkedin.com')
    || /https?:\/\//i.test(body);
}

function stageAtLeast(stage: PipelineStage, target: PipelineStage): boolean {
  return stageRank(stage) >= stageRank(target);
}

function stageRank(stage: PipelineStage): number {
  const normalized = stage === 'accepted' || stage === 'requested' ? 'matched' : stage;
  const ranks: Partial<Record<PipelineStage, number>> = {
    matched: 0,
    submitted: 1,
    interviewing: 2,
    hired: 3,
  };
  return ranks[normalized] ?? 0;
}

function statusCopy(args: {
  hrNoteReady: boolean;
  resumeAttached: boolean;
  roleConfirmed: boolean;
}): Pick<ReadinessSummary, 'statusDetail' | 'statusLabel'> {
  if (args.hrNoteReady) {
    return {
      statusDetail: 'Company submission is already logged.',
      statusLabel: 'Submitted',
    };
  }
  if (!args.roleConfirmed) {
    return {
      statusDetail: 'Ask the seeker which role they want.',
      statusLabel: 'Role needed',
    };
  }
  if (!args.resumeAttached) {
    return {
      statusDetail: 'Collect a resume link before sending an endorsement.',
      statusLabel: 'Resume needed',
    };
  }
  return {
    statusDetail: 'Everything needed for a credible submission is present.',
    statusLabel: 'Ready for HR',
  };
}
