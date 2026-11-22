import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { contador, cx } from '../../lib/cx';
import { Button } from '../Button';
import { Reveal } from '../Reveal';
import './Quotes.css';

export interface Depoimento {
  /** citação (H2 Fraunces), uma palavra em <em> */
  citacao: ReactNode;
  /** nome na etiqueta tecida */
  nome: ReactNode;
  /** ocasião · data · nº de provas */
  detalhe: ReactNode;
}

export interface QuotesProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  itens: readonly Depoimento[];
  'aria-label'?: string;
  rotuloAnterior?: string;
  rotuloProximo?: string;
}

/**
 * Depoimentos com troca manual (sem autoplay), contador "01 / 03" e aria-live="polite".
 * A cada troca, as linhas se revelam de novo.
 */
export function Quotes({
  itens,
  'aria-label': ariaLabel = 'Depoimentos',
  rotuloAnterior = 'Depoimento anterior',
  rotuloProximo = 'Próximo depoimento',
  className,
  ...rest
}: QuotesProps) {
  const [cur, setCur] = useState(0);
  const total = itens.length;
  const go = (d: number): void => {
    setCur((c) => (c + d + total) % total);
  };
  const atual = itens[cur];

  return (
    <div
      {...rest}
      className={cx('at-quotes', className)}
      role="region"
      aria-roledescription="carrossel"
      aria-label={ariaLabel}
    >
      <div aria-live="polite">
        {atual ? (
          <figure className="at-quotes__slide" key={cur} aria-roledescription="depoimento">
            <Reveal as="blockquote" tipo="linhas" className="at-quote at-h2">
              {atual.citacao}
            </Reveal>
            <figcaption className="at-label-woven" style={{ marginTop: 'var(--at-space-7)' }}>
              <span className="at-label">{atual.nome}</span>
              <span className="at-note">{atual.detalhe}</span>
            </figcaption>
          </figure>
        ) : null}
      </div>
      {total > 1 ? (
        <div className="at-quotes__nav">
          <Button
            variante="botao"
            icone="seta-esq"
            aria-label={rotuloAnterior}
            magnet
            onClick={() => {
              go(-1);
            }}
          />
          <span className="at-note at-quotes__count">{contador(cur + 1, total)}</span>
          <Button
            variante="botao"
            icone="seta"
            aria-label={rotuloProximo}
            magnet
            onClick={() => {
              go(1);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
