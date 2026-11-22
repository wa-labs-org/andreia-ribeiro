import { useContext, useEffect, useState, type RefObject } from 'react';
import { IntroContext } from './context';
import { observeOnce } from './observe';
import { useIntro } from './useIntro';

export interface UseRevealOptions {
  /** Observar o pai: para revelações que recortam o próprio elemento (queda, corte, costura),
   *  cuja área visível começa em zero e o IntersectionObserver não enxergaria. */
  observeParent?: boolean;
  /** Desliga a observação (ex.: conteúdo que já nasce revelado). */
  disabled?: boolean;
}

/**
 * Devolve true quando o elemento entra na viewport (uma vez só).
 * Dentro de uma entrada coreografada (IntroContext), espera o loader/cortina e revela
 * tudo de uma vez, mesmo o que nasce abaixo da dobra.
 */
export function useReveal(ref: RefObject<Element | null>, opts: UseRevealOptions = {}): boolean {
  const { observeParent = false, disabled = false } = opts;
  const intro = useContext(IntroContext);
  const ready = useIntro();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (intro || disabled) return;
    const el = ref.current;
    if (!el) return;
    const target = observeParent ? (el.parentElement ?? el) : el;
    return observeOnce(target, () => {
      setSeen(true);
    });
  }, [intro, disabled, observeParent, ref]);

  if (disabled) return true;
  return intro ? ready : seen;
}
