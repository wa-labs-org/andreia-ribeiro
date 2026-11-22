import { useContext, useSyncExternalStore } from 'react';
import { MotionContext, type MotionContextValue } from './context';
import { getMotion, getMotionOverride, setMotion, subscribeMotion } from './motionStore';

/** Estado de movimento + alternador. Funciona também fora do MotionProvider. */
export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  const mode = useSyncExternalStore(subscribeMotion, getMotion);
  const override = useSyncExternalStore(subscribeMotion, getMotionOverride);
  return ctx ?? { mode, reduced: mode === 'reduce', override, setMotion };
}
