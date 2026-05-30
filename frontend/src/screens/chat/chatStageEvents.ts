import type { PipelineStage } from '../../components/activity/PipelineStepper';

type StageListener = (stage: PipelineStage) => void;

const listeners = new Map<string, Set<StageListener>>();

export function emitChatStage(referralId: string, stage: PipelineStage): void {
  listeners.get(referralId)?.forEach((listener) => listener(stage));
}

export function subscribeChatStage(
  referralId: string,
  listener: StageListener,
): () => void {
  const current = listeners.get(referralId) ?? new Set<StageListener>();
  current.add(listener);
  listeners.set(referralId, current);

  return () => {
    current.delete(listener);
    if (current.size === 0) listeners.delete(referralId);
  };
}
