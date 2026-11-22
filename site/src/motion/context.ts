import { createContext } from 'react';
import type { MotionMode } from './motionStore';

export interface MotionContextValue {
  /** modo efetivo (o que está em html[data-motion]) */
  mode: MotionMode;
  reduced: boolean;
  /** modo forçado, ou null quando segue prefers-reduced-motion */
  override: MotionMode | null;
  setMotion: (mode: MotionMode | null) => void;
}

export const MotionContext = createContext<MotionContextValue | null>(null);

/** true dentro de uma entrada coreografada ([data-intro]): revelações esperam o loader/cortina. */
export const IntroContext = createContext(false);
