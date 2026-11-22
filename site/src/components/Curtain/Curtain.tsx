import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { clamp, cx, session } from '../../lib/cx';
import { setIntroReady } from '../../motion/introStore';
import { isReduced } from '../../motion/motionStore';
import { tokenMs } from '../../motion/tokens';
import { LoaderContext } from '../Loader/LoaderContext';
import './Curtain.css';

export interface CurtainHandle {
  /**
   * Cobre a tela: a cortina cai do topo (720ms) e a costura atravessa o centro.
   * Resolve quando é hora de trocar de página (~1080ms; 180ms no modo reduzido).
   * `persistir`: marca a sessão para a próxima página já nascer coberta (navegação completa).
   */
  cover: (opts?: { persistir?: boolean }) => Promise<void>;
  /** Revela: a cortina sobe (900ms). Aos 35%, libera a entrada do hero. */
  lift: () => void;
}

export interface CurtainProps {
  /** rótulo no centro da cortina, ex.: "Andreia Ribeiro · Atelier" */
  rotulo: ReactNode;
  /** loader da primeira visita (html[data-loader] sem "at-visited" na sessão) */
  loader?: ReactNode;
  className?: string;
}

type Phase = 'idle' | 'cover' | 'covered' | 'lift';

/**
 * Cortina de transição isolada (sem router). Na chegada coberta (classe at-arriving ou
 * at-loading aplicada no <head>), ela sobe sozinha; cover()/lift() ficam disponíveis por ref
 * para ligar num router depois.
 */
export const Curtain = forwardRef<CurtainHandle, CurtainProps>(function Curtain(
  { rotulo, loader, className },
  ref,
) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const lift = useCallback(() => {
    const dur = tokenMs('--at-dur-cerimonia', 1200);
    setPhase('covered');
    document.documentElement.classList.remove('at-arriving', 'at-loading');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('lift');
        later(setIntroReady, dur * 0.35);
        later(() => {
          setPhase('idle');
          setLoading(false);
        }, dur);
      });
    });
  }, [later]);

  const cover = useCallback<CurtainHandle['cover']>(
    ({ persistir = false } = {}) => {
      if (persistir) session('at-curtain', '1');
      setPhase('cover');
      const wait = isReduced() ? 180 : tokenMs('--at-dur-cerimonia', 1200) * 0.9;
      return new Promise((resolve) => {
        later(resolve, wait);
      });
    },
    [later],
  );

  useImperativeHandle(ref, () => ({ cover, lift }), [cover, lift]);

  // chegada: loader da 1ª visita, ou cortina vinda da página anterior
  useEffect(() => {
    const html = document.documentElement;
    const arriving = html.classList.contains('at-arriving');
    const isLoading = html.classList.contains('at-loading') && loader !== undefined;
    session('at-curtain', null);
    let raf = 0;
    if (isLoading) {
      setLoading(true);
      const t0 = performance.now();
      const minT = isReduced() ? 200 : 1400;
      let fontsDone = false;
      void document.fonts.ready.then(() => {
        fontsDone = true;
      });
      const tick = (now: number): void => {
        const p = clamp((now - t0) / minT, 0, fontsDone ? 1 : 0.9);
        setProgress(p);
        if (p >= 1 || now - t0 > 3000) {
          session('at-visited', '1');
          lift();
        } else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else if (arriving || html.classList.contains('at-loading')) {
      later(lift, 60);
    }
    const onShow = (e: PageTransitionEvent): void => {
      if (!e.persisted) return;
      setPhase('idle');
      setLoading(false);
      html.classList.remove('at-arriving', 'at-loading');
      setIntroReady();
    };
    window.addEventListener('pageshow', onShow);
    const pending = timers.current;
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pageshow', onShow);
      pending.forEach((t) => {
        window.clearTimeout(t);
      });
    };
    // a chegada acontece uma vez, na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cx(
        'at-curtain',
        phase === 'cover' && 'is-cover',
        phase === 'covered' && 'is-covered',
        phase === 'lift' && 'is-lift',
        loading && 'is-loading',
        className,
      )}
      aria-hidden="true"
    >
      <div className="at-curtain__inner">
        <span className="at-label">{rotulo}</span>
        <span className="at-curtain__seam" />
      </div>
      {loader ? <LoaderContext.Provider value={progress}>{loader}</LoaderContext.Provider> : null}
    </div>
  );
});
