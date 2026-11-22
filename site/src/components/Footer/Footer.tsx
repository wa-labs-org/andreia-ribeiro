import { useRef, type ReactNode } from 'react';
import { cssVars, cx } from '../../lib/cx';
import { useReveal } from '../../motion/useReveal';
import { NavLink } from '../Link';
import { Reveal } from '../Reveal';
import './Footer.css';

export interface FooterLink {
  href: string;
  label: ReactNode;
  current?: boolean;
}

export interface FooterColuna {
  /** título em mono, ex.: "Coleções" */
  titulo: ReactNode;
  /** com links, a coluna vira <nav> com este rótulo */
  links?: readonly FooterLink[];
  'aria-label'?: string;
  /** conteúdo livre (endereço, horário) */
  conteudo?: ReactNode;
}

export interface FooterProps {
  /** frase-assinatura (lead), uma palavra em <em> */
  frase?: ReactNode;
  /** ação ao lado da frase (Button linha) */
  acao?: ReactNode;
  colunas: readonly FooterColuna[];
  /** assinatura gigante, letras sobem uma a uma */
  assinatura: string;
  /** linha legal em mono (itens separados) */
  legal?: readonly ReactNode[];
  className?: string;
}

/** Rodapé: borda overlock, 4 colunas (≥1024), assinatura gigante e costura final. */
export function Footer({ frase, acao, colunas, assinatura, legal = [], className }: FooterProps) {
  const markRef = useRef<HTMLParagraphElement>(null);
  const markIn = useReveal(markRef);
  return (
    <footer className={cx('at-footer', 'at-section--molde', className)}>
      <div
        className="at-overlock"
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
      />
      <div className="at-container">
        <div className="at-footer__top">
          {frase || acao ? (
            <div className="at-footer__col">
              {frase ? <p className="at-lead at-measure-narrow">{frase}</p> : null}
              {acao}
            </div>
          ) : null}
          {colunas.map((c, i) =>
            c.links ? (
              <nav key={i} className="at-footer__col" aria-label={c['aria-label']}>
                <span className="at-note">{c.titulo}</span>
                <ul role="list">
                  {c.links.map((l, j) => (
                    <li key={j}>
                      <NavLink href={l.href} current={l.current}>
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
                {c.conteudo}
              </nav>
            ) : (
              <div key={i} className="at-footer__col">
                <span className="at-note">{c.titulo}</span>
                {c.conteudo}
              </div>
            ),
          )}
        </div>
        <p ref={markRef} className={cx('at-footer__mark', markIn && 'is-in')}>
          <span className="at-sr">{assinatura}</span>
          {Array.from(assinatura).map((ch, i) => (
            <span key={i} className="at-char" aria-hidden="true" style={cssVars({ '--i': i })}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </p>
        <Reveal as="hr" tipo="costura" className="at-stitch" />
        {legal.length ? (
          <div className="at-footer__legal">
            {legal.map((item, i) => (
              <span key={i} className="at-note">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
