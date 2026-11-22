import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { clamp, contador, cx } from '../../lib/cx';
import { getViewport, subscribeResize } from '../../motion/rafLoop';
import { usePin } from '../../motion/usePin';
import { useReducedMotion } from '../../motion/useReducedMotion';
import { Reveal } from '../Reveal';
import './Arara.css';

export interface AraraProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  titulo: ReactNode;
  eyebrow?: ReactNode;
  /** desktop: seção fixada, rolagem vertical → horizontal */
  pin?: boolean;
  /** rótulo da faixa focável */
  rotuloFaixa?: string;
  /** uma peça por filho (normalmente <Card>) */
  children: ReactNode;
}

const K = 0.12; // rigidez da mola
const ATRITO = 0.8;
const MAX = 5; // graus

interface Swing {
  angle: number;
  vel: number;
  target: number;
  lastX: number;
  raf: number;
}

/** Mola amortecida: roda até assentar e para sozinha. */
function startSwing(s: Swing, getItems: () => HTMLElement[]): void {
  if (s.raf) return;
  const step = (): void => {
    s.raf = 0;
    s.vel += (s.target - s.angle) * K;
    s.vel *= ATRITO;
    s.angle += s.vel;
    s.target *= 0.86;
    getItems().forEach((it, i) => {
      it.style.transform = `rotate(${(s.angle * (1 - (i % 3) * 0.18)).toFixed(3)}deg)`;
    });
    if (Math.abs(s.angle) > 0.01 || Math.abs(s.target) > 0.01) s.raf = requestAnimationFrame(step);
  };
  s.raf = requestAnimationFrame(step);
}

/**
 * Arara: barra fina com um gancho por peça. Mobile/tablet: rolagem horizontal com scroll-snap.
 * Desktop (pin): fixada, a rolagem vertical move a arara. As peças balançam no gancho com mola
 * amortecida proporcional à velocidade (k .12, atrito .8, até 5°); o loop para quando assenta.
 */
export function Arara({
  titulo,
  eyebrow,
  pin = true,
  rotuloFaixa = 'Galeria de peças, role para o lado',
  className,
  children,
  ...rest
}: AraraProps) {
  const secRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const total = Children.count(children);
  const [n, setN] = useState(1);
  const swing = useRef<Swing>({ angle: 0, vel: 0, target: 0, lastX: 0, raf: 0 });

  const items = useCallback(
    (): HTMLElement[] => Array.from(trackRef.current?.children ?? []) as HTMLElement[],
    [],
  );

  const kick = useCallback(
    (dx: number) => {
      if (reduced) return;
      swing.current.target = clamp(-dx * 0.09, -MAX, MAX);
      startSwing(swing.current, items);
    },
    [reduced, items],
  );

  const setCount = useCallback(
    (p: number) => {
      setN(clamp(Math.round(p * (total - 1)) + 1, 1, total));
    },
    [total],
  );

  const pinned = usePin(
    secRef,
    (p, { vw }) => {
      const track = trackRef.current;
      if (!track) return;
      const dist = Math.max(0, track.scrollWidth - vw);
      const x = -p * dist;
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      kick(x - swing.current.lastX);
      swing.current.lastX = x;
      setCount(p);
    },
    { enabled: pin },
  );

  // altura da seção fixada = distância horizontal + uma viewport
  useEffect(() => {
    const sec = secRef.current;
    const track = trackRef.current;
    if (!sec || !track) return;
    const size = (): void => {
      if (pinned) {
        const { vw, vh } = getViewport();
        sec.style.setProperty('--arara-h', `${Math.max(0, track.scrollWidth - vw) + vh}px`);
      } else {
        sec.style.removeProperty('--arara-h');
        track.style.transform = '';
      }
    };
    size();
    return subscribeResize(size);
  }, [pinned, total]);

  // modo reduzido: nada gira
  useEffect(() => {
    if (!reduced) return;
    cancelAnimationFrame(swing.current.raf);
    swing.current = { angle: 0, vel: 0, target: 0, lastX: 0, raf: 0 };
    items().forEach((it) => {
      it.style.transform = '';
    });
  }, [reduced, items]);

  useEffect(
    () => () => {
      cancelAnimationFrame(swing.current.raf);
    },
    [],
  );

  // rolagem nativa da faixa (mobile, tablet, modo reduzido), coalescida por quadro
  useEffect(() => {
    const track = trackRef.current;
    if (!track || pinned) return;
    let raf = 0;
    const onScroll = (): void => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const x = track.scrollLeft;
        kick(swing.current.lastX - x);
        swing.current.lastX = x;
        setCount(x / Math.max(1, track.scrollWidth - track.clientWidth));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
    };
  }, [pinned, kick, setCount]);

  /** Fixada, a faixa não rola sozinha: leva a rolagem da página até a peça. */
  const scrollToProgress = (p: number): void => {
    const sec = secRef.current;
    if (!sec) return;
    const { vh } = getViewport();
    const top = sec.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + clamp(p, 0, 1) * (sec.offsetHeight - vh),
      behavior: reduced ? 'auto' : 'smooth',
    });
  };
  const progressOfItem = (el: HTMLElement): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const dist = Math.max(1, track.scrollWidth - getViewport().vw);
    return (el.offsetLeft - track.offsetLeft) / dist;
  };

  const onFocus = (e: FocusEvent<HTMLUListElement>): void => {
    if (!pinned) return;
    const li = (e.target as HTMLElement).closest<HTMLElement>('.at-arara__item');
    if (li) scrollToProgress(progressOfItem(li));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>): void => {
    if (!pinned || e.target !== e.currentTarget) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = clamp(n - 1 + (e.key === 'ArrowRight' ? 1 : -1), 0, total - 1);
    const li = items()[idx];
    if (li) scrollToProgress(progressOfItem(li));
  };

  return (
    <section
      {...rest}
      ref={secRef}
      className={cx('at-arara', 'at-section--s', className)}
      data-pin={pin ? '' : undefined}
    >
      <div className="at-arara__sticky">
        <div className="at-arara__head">
          <div>
            {eyebrow ? (
              <Reveal as="p" tipo="fade" className="at-eyebrow at-label">
                {eyebrow}
              </Reveal>
            ) : null}
            <Reveal as="h2" tipo="linhas" className="at-h2" style={{ marginTop: 'var(--at-space-4)' }}>
              {titulo}
            </Reveal>
          </div>
          <span className="at-note at-arara__count" aria-hidden="true">
            {contador(n, total)}
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <span className="at-arara__rail" aria-hidden="true" />
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- foco e setas da faixa fixada */}
          <ul
            ref={trackRef}
            className="at-arara__track"
            role="list"
            // faixa focável e rolável com as setas (08-acessibilidade); fixada, as setas levam a página até a peça
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            aria-label={rotuloFaixa}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
          >
            {Children.map(children, (child) => (
              <li className="at-arara__item">{child}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
