import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { MotionContext, type MotionContextValue } from './context';
import { getMotion, getMotionOverride, setMotion, subscribeMotion, type MotionMode } from './motionStore';
import { introIsCovered, isIntroReady, setIntroReady } from './introStore';

export interface MotionProviderProps {
  children: ReactNode;
  /** Força o modo na montagem (ex.: catálogo, testes). Sem valor, segue a media query ou a escolha salva. */
  force?: MotionMode;
}

/** Sem Loader nem Curtain montados, a entrada é liberada mesmo assim (nunca prende conteúdo). */
const INTRO_FALLBACK_MS = 3500;

export function MotionProvider({ children, force }: MotionProviderProps) {
  const mode = useSyncExternalStore(subscribeMotion, getMotion);
  const override = useSyncExternalStore(subscribeMotion, getMotionOverride);

  useEffect(() => {
    if (force) setMotion(force);
  }, [force]);

  useEffect(() => {
    let raf = 0;
    if (!introIsCovered()) {
      // dois quadros: o estado inicial é pintado antes de .is-in, para a transição correr
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(setIntroReady);
      });
    }
    const t = window.setTimeout(() => {
      if (isIntroReady()) return;
      document.documentElement.classList.remove('at-loading', 'at-arriving');
      setIntroReady();
    }, INTRO_FALLBACK_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, []);

  const value = useMemo<MotionContextValue>(
    () => ({ mode, reduced: mode === 'reduce', override, setMotion }),
    [mode, override],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
