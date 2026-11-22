import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { fontsReady, subscribeResize } from './rafLoop';
import { measureLines, renderLines, renderWords, signature, tokenize } from './splitLines';

interface Layout {
  sig: string;
  groups: number[][];
}

/**
 * Divide children em linhas reais medidas no layout. Refaz a divisão quando as fontes
 * carregam e quando a largura muda mais de 40px (debounce de 200ms).
 */
export function useLines(children: ReactNode, ref: RefObject<HTMLElement | null>, enabled = true): ReactNode {
  const words = useMemo(() => tokenize(children), [children]);
  const sig = signature(words);
  const [layout, setLayout] = useState<Layout | null>(null);
  const valid = layout?.sig === sig;

  useLayoutEffect(() => {
    if (!enabled || valid || !ref.current) return;
    const groups = measureLines(ref.current);
    setLayout({ sig, groups });
  }, [enabled, valid, sig, ref]);

  const lastW = useRef(window.innerWidth);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    void fontsReady.then(() => {
      if (alive) setLayout(null);
    });
    const unsub = subscribeResize((vw) => {
      if (Math.abs(vw - lastW.current) <= 40) return;
      lastW.current = vw;
      setLayout(null);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, [enabled]);

  if (!enabled) return children;
  return valid ? renderLines(words, layout.groups) : renderWords(words);
}
