import { useEffect, useRef } from 'react';
import { subscribeScroll, type ScrollFrame } from './rafLoop';

/** Inscreve um callback no loop único de rolagem. O callback mais recente é sempre usado. */
export function useScrollFrame(fn: (frame: ScrollFrame) => void, enabled = true): void {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  useEffect(() => {
    if (!enabled) return;
    return subscribeScroll((f) => {
      fnRef.current(f);
    });
  }, [enabled]);
}
