import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

type LoadTabData = () => Promise<void> | void;

export function useWarmTabData(load: LoadTabData): void {
  const loadRef = useRef(load);
  const warmedRef = useRef(false);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const runWarmLoad = useCallback(() => {
    warmedRef.current = true;
    void loadRef.current();
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (!warmedRef.current) runWarmLoad();
    });
    return () => task.cancel();
  }, [runWarmLoad]);

  useFocusEffect(
    useCallback(() => {
      if (!warmedRef.current) {
        runWarmLoad();
        return;
      }
      const task = InteractionManager.runAfterInteractions(() => {
        void loadRef.current();
      });
      return () => task.cancel();
    }, [runWarmLoad]),
  );
}
