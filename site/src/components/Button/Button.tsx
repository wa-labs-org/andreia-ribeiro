import {
  forwardRef,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';
import { mergeRefs } from '../../lib/mergeRefs';
import { Roll } from '../../motion/Roll';
import { useMagnet } from '../../motion/useMagnet';
import { Icon, type IconName } from '../Icon';
import './Button.css';

export type ButtonVariante = 'primario' | 'pesponto' | 'linha' | 'botao';

interface Shared {
  /** m: 52px (padrão) · s: 44px (header) */
  tamanho?: 'm' | 's';
  /** três pontos de costura que avançam; aria-busy="true" */
  loading?: boolean;
  /** o botão segue o cursor até 8px (só mouse, fora do modo reduzido) */
  magnet?: boolean;
  disabled?: boolean;
}

interface WithLabel extends Shared {
  /** primario: uma ação principal por vista · pesponto: alternativa · linha: navegação contextual */
  variante?: Exclude<ButtonVariante, 'botao'>;
  children: ReactNode;
  /** rolagem de letras (18ms/letra). Padrão: ligada em primario e pesponto. Exige texto simples. */
  roll?: boolean;
  /** botão de costura antes do rótulo, gira 90° no hover */
  botao?: boolean;
  /** seta: direita avança 4px no hover; esquerda vem antes do rótulo ("Voltar") */
  seta?: 'direita' | 'esquerda';
  icone?: never;
  'aria-label'?: string;
}

interface IconOnly extends Shared {
  /** botão redondo (anterior/próximo, fechar) */
  variante: 'botao';
  icone: IconName;
  /** obrigatório: o botão só tem ícone */
  'aria-label': string;
  children?: never;
  roll?: never;
  botao?: never;
  seta?: never;
}

type AsButton = { as?: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>;
type AsAnchor = { as: 'a'; href: string } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children' | 'aria-label'
>;

export type ButtonProps = (WithLabel | IconOnly) & (AsButton | AsAnchor);

export const Button = forwardRef<HTMLAnchorElement & HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variante = 'primario',
      tamanho = 'm',
      loading = false,
      magnet = false,
      disabled = false,
      roll,
      botao,
      seta,
      icone,
      children,
      className,
      ...rest
    } = props;
    const own = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
    useMagnet(own, magnet);

    const rollOn =
      (roll ?? (variante === 'primario' || variante === 'pesponto')) && typeof children === 'string';
    const classes = cx(
      'at-btn',
      variante !== 'primario' && `at-btn--${variante}`,
      tamanho === 's' && 'at-btn--s',
      loading && 'is-loading',
      className,
    );

    const content = (
      <>
        {variante === 'pesponto' ? (
          <svg className="at-btn__seam" aria-hidden="true" focusable="false">
            <rect x=".5" y=".5" width="100%" height="100%" />
          </svg>
        ) : null}
        {botao ? <Icon name="botao" className="at-btn__botao" /> : null}
        {seta === 'esquerda' ? <Icon name="seta-esq" size="s" /> : null}
        {variante === 'botao' && icone ? (
          <Icon name={icone} />
        ) : rollOn ? (
          <Roll>{children}</Roll>
        ) : (
          <span>{children}</span>
        )}
        {seta === 'direita' ? <Icon name="seta" size="s" className="at-btn__seta" /> : null}
        {loading ? (
          <span className="at-btn__loading" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : null}
      </>
    );

    const busy = loading ? { 'aria-busy': true } : {};

    if (rest.as === 'a') {
      const { as: _as, href, ...anchor } = rest;
      return (
        <a
          {...anchor}
          {...busy}
          ref={mergeRefs(ref, own)}
          className={classes}
          href={disabled ? undefined : href}
          aria-disabled={disabled ? true : undefined}
          data-magnet={magnet ? '' : undefined}
        >
          {content}
        </a>
      );
    }
    const { as: _as, type = 'button', ...button } = rest;
    return (
      <button
        {...button}
        {...busy}
        ref={mergeRefs(ref, own)}
        type={type}
        className={classes}
        disabled={disabled}
        data-magnet={magnet ? '' : undefined}
      >
        {content}
      </button>
    );
  },
);
