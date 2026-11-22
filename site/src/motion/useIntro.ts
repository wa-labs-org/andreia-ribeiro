import { useSyncExternalStore } from 'react';
import { isIntroReady, subscribeIntro } from './introStore';

/** true depois que o loader/cortina libera a entrada (o onReady do vanilla). */
export function useIntro(): boolean {
  return useSyncExternalStore(subscribeIntro, isIntroReady);
}
