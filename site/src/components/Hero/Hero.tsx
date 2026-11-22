import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { IntroContext } from '../../motion/context';
import { Reveal } from '../Reveal';
import { Stitch } from '../Stitch';
import { HeroControlsContext } from './heroControls';
import './Hero.css';

/** Alinhavo que atravessa o hero de lado a lado (viewBox 1440 × 900). */
export const HERO_ALINHAVO = 'M-20 700C300 780 560 560 860 640S1220 820 1460 700';

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** linhas manuais do título (Display XL), uma palavra em <em> */
  titulo: readonly ReactNode[];
  eyebrow?: ReactNode;
  lead?: ReactNode;
  /** versão curta do lead, mostrada no lugar dele em telas baixas e em paisagem (tela cheia) */
  leadCurto?: ReactNode;
  /** CTAs: um Button primário + um linha */
  acoes?: ReactNode;
  /** <Photo reveal="tule" …> com imagem ou <HeroSequence> dentro */
  media: ReactNode;
  /**
   * tela-cheia (padrão): a seção tem exatamente a altura da tela (100svh), com fundo claro e texto
   * café. Paisagem: a foto cobre a seção e o texto fica à esquerda sobre véu marfim. Retrato: texto
   * em cima, foto inteira embaixo. Celular deitado e telas muito largas: texto à esquerda, foto à direita.
   * coluna: layout do doc 06 — título sobre a imagem nas colunas 8–12 (3:4; 4:5 no mobile).
   */
  mediaMode?: 'tela-cheia' | 'coluna';
  /** traço do alinhavo; false para não desenhar */
  alinhavo?: string | false;
  /** rótulo do indicador "fio do tecido" (desktop); false para esconder */
  cue?: string | false;
  /** entrada coreografada: espera o loader/cortina e entra inteira (data-intro) */
  intro?: boolean;
  /** o cursor puxa uma linha dourada sobre o hero */
  cursorThread?: boolean;
}

/**
 * Hero com a partitura do doc 07: tule 0ms → título 150 → eyebrow 500 → lead 600 → alinhavo 700 → CTAs 850.
 */
export function Hero({
  titulo,
  eyebrow,
  lead,
  leadCurto,
  acoes,
  media,
  mediaMode = 'tela-cheia',
  alinhavo = HERO_ALINHAVO,
  cue = 'Fio do tecido',
  intro = true,
  cursorThread = true,
  className,
  ...rest
}: HeroProps) {
  const titleId = `hero-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const cheia = mediaMode === 'tela-cheia';
  const [controls, setControls] = useState<HTMLDivElement | null>(null);

  return (
    <IntroContext.Provider value={intro}>
      <HeroControlsContext.Provider value={controls}>
        <section
          {...rest}
          className={cx('at-hero', cheia && 'at-hero--tela-cheia', className)}
          data-intro={intro ? '' : undefined}
          data-cursor-thread={cursorThread ? '' : undefined}
          aria-labelledby={titleId}
        >
          {cheia ? <div className="at-hero__media at-hero__backdrop">{media}</div> : null}
          {alinhavo ? (
            <Stitch
              className="at-hero__thread"
              viewBox="0 0 1440 900"
              preserveAspectRatio="none"
              d={alinhavo}
              delay={700}
              style={{ inset: 0, width: '100%', height: '100%' }}
            />
          ) : null}
          <div className="at-container">
            <div className="at-grid at-hero__grid">
              <Reveal
                as="h1"
                tipo="linhas"
                className="at-hero__title at-display-xl"
                id={titleId}
                delay={150}
                linhas={titulo}
              />
              {cheia ? null : <div className="at-hero__media">{media}</div>}
              <div className="at-hero__aside">
                {eyebrow ? (
                  <Reveal as="p" tipo="fade" className="at-eyebrow at-label" delay={500}>
                    {eyebrow}
                  </Reveal>
                ) : null}
                {lead ? (
                  <Reveal
                    as="p"
                    tipo="linhas"
                    className={cx('at-lead at-measure-narrow', leadCurto ? 'at-hero__lead' : undefined)}
                    delay={600}
                  >
                    {lead}
                  </Reveal>
                ) : null}
                {leadCurto ? (
                  <Reveal
                    as="p"
                    tipo="linhas"
                    className="at-lead at-measure-narrow at-hero__lead--curto"
                    delay={600}
                  >
                    {leadCurto}
                  </Reveal>
                ) : null}
                {acoes ? (
                  <Reveal tipo="fade" className="at-hero__actions" delay={850}>
                    {acoes}
                  </Reveal>
                ) : null}
              </div>
            </div>
          </div>
          {cue ? (
            <div className="at-hero__cue at-grain" aria-hidden="true">
              <span className="at-note">{cue}</span>
              <span className="at-grain__line" />
            </div>
          ) : null}
          <div className="at-hero__controls" ref={setControls} />
        </section>
      </HeroControlsContext.Provider>
    </IntroContext.Provider>
  );
}
