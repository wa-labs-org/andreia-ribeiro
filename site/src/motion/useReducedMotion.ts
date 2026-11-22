import { useSyncExternalStore } from 'react';
import { isReduced, subscribeMotion } from './motionStore';

/** true quando html[data-motion="reduce"] (media query ou modo forçado). */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, isReduced);
}
