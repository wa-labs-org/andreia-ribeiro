import { useRef, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react';
import { cssVars, cx } from '../../lib/cx';
import { useParallax } from '../../motion/useParallax';
import { Reveal, type RevealTipo } from '../Reveal';
import './Photo.css';

export interface PhotoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  /** Descreva peça, tecido e detalhe. Use "" para imagem decorativa. */
  alt?: string;
  /** fig: croqui (contain, com respiro) · img: fotografia (cover) */
  modo?: 'fig' | 'img';
  /** molde: papel manteiga · noite: fundo café para peças Casimira */
  variante?: 'molde' | 'noite';
  /** proporção (--at-ratio): "3 / 4" peça · "4 / 5" hero mobile · "2 / 3" manequim · "1 / 1" detalhe · "21 / 9" abertura */
  ratio?: string;
  textura?: 'molde' | 'tule' | 'risca';
  caption?: ReactNode;
  /** paralaxe: true (0.12, o token) ou fator 0.08–0.12 */
  parallax?: boolean | number;
  /** revelação de entrada (tule para a 1ª imagem da página, queda, corte…) */
  reveal?: RevealTipo;
  /** atraso da revelação em ms */
  delay?: number;
  /** atributos repassados ao <img> (width, height, srcSet, sizes, loading…) */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>;
  /** imagem do primeiro viewport: carrega já, com fetchpriority="high" */
  priority?: boolean;
  /**
   * Fontes alternativas (<picture>): formatos (AVIF/WebP) e direção de arte por `media`.
   * A primeira que casar vence; o <img> (src/srcSet de imgProps) é o fallback.
   */
  sources?: readonly PhotoSource[];
  /** camadas extras dentro da moldura (ex.: HeroSequence) */
  children?: ReactNode;
}

export interface PhotoSource {
  srcSet: string;
  type?: string;
  media?: string;
  sizes?: string;
  /** dimensões intrínsecas desta fonte (evitam layout shift com direção de arte) */
  width?: number;
  height?: number;
}

export function Photo({
  src,
  alt = '',
  modo = 'fig',
  variante,
  ratio,
  textura,
  caption,
  parallax,
  reveal,
  delay,
  imgProps,
  sources,
  priority = false,
  className,
  style,
  children,
  ...rest
}: PhotoProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const k = typeof parallax === 'number' ? parallax : 0.12;
  useParallax(innerRef, k, parallax !== undefined && parallax !== false);

  // React 18 ainda não conhece fetchPriority: o atributo vai em minúsculas.
  const loadingAttrs = priority
    ? { loading: 'eager' as const, decoding: 'async' as const, ...{ fetchpriority: 'high' } }
    : { loading: 'lazy' as const, decoding: 'async' as const };

  const tag = src ? (
    <img {...loadingAttrs} {...imgProps} className={`at-photo__${modo}`} src={src} alt={alt} />
  ) : null;
  const img =
    tag && sources?.length ? (
      <picture>
        {sources.map((s) => (
          <source
            key={`${s.media ?? ''}${s.type ?? ''}`}
            srcSet={s.srcSet}
            type={s.type}
            media={s.media}
            sizes={s.sizes}
            width={s.width}
            height={s.height}
          />
        ))}
        {tag}
      </picture>
    ) : (
      tag
    );

  const media =
    parallax !== undefined && parallax !== false ? (
      <div className="at-photo__inner" data-parallax={k} ref={innerRef}>
        {img}
        {children}
      </div>
    ) : (
      <>
        {img}
        {children}
      </>
    );

  const props = {
    ...rest,
    className: cx('at-photo', variante && `at-photo--${variante}`, textura && `at-tex-${textura}`, className),
    style: cssVars({ '--at-ratio': ratio }, style),
  };
  const body = (
    <>
      {media}
      {caption ? <span className="at-photo__caption at-note">{caption}</span> : null}
    </>
  );

  return reveal ? (
    <Reveal tipo={reveal} {...(delay === undefined ? {} : { delay })} {...props}>
      {body}
    </Reveal>
  ) : (
    <div {...props}>{body}</div>
  );
}
