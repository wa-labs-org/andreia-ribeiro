import { useRef } from 'react';
import { progressOf } from '../../motion/useScrollProgress';
import { useScrollFrame } from '../../motion/useScrollFrame';
import './FitaMetrica.css';

/**
 * Progresso de leitura: barra dourada de 3px com marcações de centímetro (scaleX).
 * Permanece no modo reduzido: é informação, não ornamento.
 */
export function FitaMetrica() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFrame((f) => {
    ref.current?.style.setProperty('--p', progressOf('page', null, f).toFixed(4));
  });
  return <div ref={ref} className="at-fita" aria-hidden="true" />;
}
