import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { usePin } from '../../motion/usePin';
import { Photo } from '../Photo';
import { Reveal } from '../Reveal';
import './ProvaManequim.css';

export interface ProvaPasso {
  /** número em mono, ex.: "01" */
  numero?: string;
  titulo: ReactNode;
  texto: ReactNode;
}

export interface ProvaMarca {
  /** anotação, ex.: "Busto 88" */
  label: ReactNode;
  /** posição do ponto sobre o manequim, em % da imagem */
  top: string;
  left: string;
  /** passo (base 0) em que a marca acende */
  passo: number;
}

export interface ProvaManequimProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: ReactNode;
  titulo: ReactNode;
  passos: readonly ProvaPasso[];
  marcas: readonly ProvaMarca[];
  /** croqui limpo do manequim (noiva-prova.svg) */
  src: string;
  alt: string;
  /** id do título (aria-labelledby) */
  tituloId?: string;
}

/**
 * Prova no manequim: seção fixada de 360vh no desktop; cada passo acende uma marcação de ajuste
 * (passo = ⌊progresso × nº de passos⌋). Mobile e modo reduzido: fluxo normal com tudo visível.
 * Use uma vez por página.
 */
export function ProvaManequim({
  eyebrow,
  titulo,
  passos,
  marcas,
  src,
  alt,
  tituloId = 'prova-titulo',
  className,
  ...rest
}: ProvaManequimProps) {
  const ref = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(passos.length - 1);
  const active = usePin(ref, (p) => {
    const next = Math.floor(Math.min(p, 0.999) * passos.length);
    if (next !== idx) setIdx(next);
  });
  const atual = active ? idx : passos.length - 1;

  return (
    <section {...rest} ref={ref} className={cx('at-prova', className)} aria-labelledby={tituloId}>
      <div className="at-prova__sticky">
        <div className="at-prova__intro at-container" style={{ padding: 0 }}>
          {eyebrow ? (
            <Reveal as="p" tipo="fade" className="at-eyebrow at-label">
              {eyebrow}
            </Reveal>
          ) : null}
          <Reveal
            as="h2"
            tipo="linhas"
            className="at-h1"
            id={tituloId}
            style={{ marginTop: 'var(--at-space-5)' }}
          >
            {titulo}
          </Reveal>
        </div>
        <div className="at-prova__stage">
          <Photo
            src={src}
            alt={alt}
            textura="molde"
            style={{ backgroundColor: 'var(--at-color-manteiga)' }}
          />
          {marcas.map((m, i) => (
            <span
              // a ordem das marcas é estável
              key={i}
              className={cx('at-prova__mark at-note', m.passo <= atual && 'is-on')}
              data-mark={m.passo}
              style={{ top: m.top, left: m.left }}
            >
              <i />
              {m.label}
            </span>
          ))}
        </div>
        <ol className="at-prova__steps at-container" role="list" style={{ padding: 0 }}>
          {passos.map((p, i) => (
            <li
              key={i}
              className={cx('at-prova__step', (!active || i === atual) && 'is-on')}
              data-step=""
              aria-current={active && i === atual ? 'step' : undefined}
            >
              {p.numero ? <span className="at-note">{p.numero}</span> : null}
              <h3 className="at-h4">{p.titulo}</h3>
              <p className="at-body-s at-muted">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
