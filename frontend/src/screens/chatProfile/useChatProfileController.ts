import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import type { PipelineStage } from '../../components/activity/PipelineStepper';
import { chatApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
  actionFor,
  confirmOutcome,
  confirmStageAdvance,
} from '../chat/chatActions';
import type { HeaderAction } from '../chat/useChatController';
import type { Message, ViewerRole } from '../chat/chatLogic';
import {
  buildReadiness,
  submitDisabledReason,
  type ReadinessSummary,
} from '../chat/chatReadiness';
import { subscribeChatStage } from '../chat/chatStageEvents';

export type ProfileActionIcon = React.ComponentProps<typeof Ionicons>['name'];

export interface ProfileParams {
  companyName: string;
  initialStage: PipelineStage;
  participantAvatar?: string;
  participantName: string;
  participantSubtitle?: string;
  referralId: string;
  targetRole?: string;
}

export interface ProfileState {
  loading: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setStage: (stage: PipelineStage) => void;
  setStagePending: (pending: boolean) => void;
  stage: PipelineStage;
  stagePending: boolean;
}

export interface ChatProfileController {
  action: HeaderAction | null;
  actionDisabled: boolean;
  actionIcon: ProfileActionIcon;
  actionLabel: string;
  handlePrimaryAction: () => void;
  params: ProfileParams;
  state: ProfileState;
  summary: ReadinessSummary;
  viewerRole: ViewerRole;
}

export function useChatProfileController(): ChatProfileController {
  const params = useProfileParams();
  const { user } = useAuth();
  const viewerRole: ViewerRole = user?.role === 'seeker' ? 'seeker' : 'endorser';
  const state = useProfileState(params);
  const summary = useMemo(
    () => buildReadiness({
      messages: state.messages,
      stage: state.stage,
      targetRole: params.targetRole,
    }),
    [params.targetRole, state.messages, state.stage],
  );
  const action = useMemo(
    () => actionFor(state.stage, viewerRole, params.participantName),
    [params.participantName, state.stage, viewerRole],
  );
  const reason = action?.label === 'Submit to HR' ? submitDisabledReason(summary) : null;

  return {
    action,
    actionDisabled: state.loading || state.stagePending || Boolean(reason) || !action,
    actionIcon: primaryActionIcon(action),
    actionLabel: primaryActionLabel(action, reason, state.loading),
    handlePrimaryAction: usePrimaryAction({ action, params, state }),
    params,
    state,
    summary,
    viewerRole,
  };
}

export function profileSubtitle(params: ProfileParams): string {
  if (params.participantSubtitle) return params.participantSubtitle;
  if (params.targetRole) return `${params.targetRole} · ${params.companyName}`;
  return params.companyName;
}

export function roleText(params: ProfileParams): string {
  return params.targetRole || 'Target role not confirmed';
}

export function nextActionText(action: HeaderAction | null): string {
  return action?.label ?? 'No endorsement action needed right now';
}

function useProfileParams(): ProfileParams {
  const params = useLocalSearchParams();
  return {
    companyName: paramValue(params.companyName, 'Endorsly'),
    initialStage: paramValue(params.stage, 'matched') as PipelineStage,
    participantAvatar: paramValue(params.participantAvatar, ''),
    participantName: paramValue(params.participantName, 'Match'),
    participantSubtitle: paramValue(params.participantSubtitle, ''),
    referralId: paramValue(params.referralId, ''),
    targetRole: paramValue(params.targetRole, ''),
  };
}

function useProfileState(params: ProfileParams): ProfileState {
  const [stage, setStage] = useState<PipelineStage>(params.initialStage);
  const [stagePending, setStagePending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeChatStage(params.referralId, setStage), [params.referralId]);
  useEffect(() => {
    setLoading(true);
    chatApi.getConversation(params.referralId)
      .then((conversation) => setMessages(conversation.messages ?? []))
      .catch((err) => Alert.alert('Could not load chat context', errorText(err)))
      .finally(() => setLoading(false));
  }, [params.referralId]);

  return { loading, messages, setMessages, setStage, setStagePending, stage, stagePending };
}

function usePrimaryAction(args: {
  action: HeaderAction | null;
  params: ProfileParams;
  state: ProfileState;
}): () => void {
  return useCallback(() => {
    if (!args.action) return;
    const base = {
      referralId: args.params.referralId,
      setMessages: args.state.setMessages,
      setStage: args.state.setStage,
      setStagePending: args.state.setStagePending,
    };
    if (args.state.stage === 'interviewing') {
      confirmOutcome({ ...base, ...args.params, participantName: args.params.participantName });
      return;
    }
    confirmStageAdvance(base, args.action);
  }, [args]);
}

function primaryActionLabel(
  action: HeaderAction | null,
  reason: string | null,
  loading: boolean,
): string {
  if (loading) return 'Loading';
  if (reason) return reason.replace(' first', '');
  return action?.label ?? 'No action';
}

function primaryActionIcon(action: HeaderAction | null): ProfileActionIcon {
  if (action?.label === 'Record outcome') return 'flag-outline';
  if (action?.label === 'Mark interviewing') return 'people-outline';
  if (action?.label === 'Submit to HR') return 'send-outline';
  return 'checkmark-circle-outline';
}

function paramValue(value: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function errorText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return 'Please reopen this chat and try again.';
}
