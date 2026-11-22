import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Reveal, RevealItem } from '../Reveal';
import './Faq.css';

export interface FaqEntrada {
  pergunta: ReactNode;
  resposta: ReactNode;
  /** começa aberta */
  aberta?: boolean;
}

export interface FaqProps {
  itens: readonly FaqEntrada[];
  /** nível do cabeçalho de cada pergunta */
  nivel?: 'h3' | 'h4';
  className?: string;
}

/**
 * Perguntas em <h3><button aria-expanded aria-controls>. Dois alfinetes giram de + para ×;
 * o painel abre por grid-template-rows 0fr → 1fr, a costura dourada se desenha e o painel fechado fica inert.
 */
export function Faq({ itens, nivel = 'h3', className }: FaqProps) {
  return (
    <Reveal tipo="pecas" className={cx('at-faq', className)}>
      {itens.map((item, i) => (
        <FaqItem key={i} {...item} nivel={nivel} />
      ))}
    </Reveal>
  );
}

function FaqItem({ pergunta, resposta, aberta = false, nivel }: FaqEntrada & { nivel: 'h3' | 'h4' }) {
  const [open, setOpen] = useState(aberta);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const panelRef = useRef<HTMLDivElement>(null);
  const H = nivel;

  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  return (
    <RevealItem className={cx('at-faq__item', open && 'is-open')}>
      <H className="at-faq__q">
        <button
          className="at-faq__btn"
          type="button"
          id={`faq-${uid}-b`}
          aria-expanded={open}
          aria-controls={`faq-${uid}`}
          onClick={() => {
            setOpen((v) => !v);
          }}
        >
          {pergunta}
          <span className="at-faq__icon" aria-hidden="true" />
        </button>
      </H>
      <div
        className="at-faq__panel"
        id={`faq-${uid}`}
        role="region"
        aria-labelledby={`faq-${uid}-b`}
        ref={panelRef}
      >
        <div>
          <div className="at-faq__seam" />
          <div className="at-faq__answer at-body at-muted">{resposta}</div>
        </div>
      </div>
    </RevealItem>
  );
}
