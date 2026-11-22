import { useCallback, useState, type ReactNode } from 'react';
import { Button, Hero, HERO_ALINHAVO, HeroSequence, Photo } from '../../components';
import {
  HERO_FRAME_ESTATICO,
  HERO_FRAMES,
  heroFrameUrl,
  heroHome,
  type HeroResolucao,
  type Linha,
} from '../../content/hero';
import { useMediaQuery } from '../../motion';

/** Trechos → texto com o <em> do "ponto à mão". */
export function renderLinha(linha: Linha): ReactNode {
  return linha.map((t, i) => (typeof t === 'string' ? t : <em key={i}>{t.em}</em>));
}

/**
 * Hero da home: a sequência de imagens cobre a seção como um vídeo (tela cheia), sob o tule da
 * entrada e com a paralaxe de 8% do hero. Partitura do doc 07, esperando o loader na 1ª visita.
 */
export function HeroHome() {
  // resolução escolhida na montagem; não troca no meio da reprodução (só no próximo carregamento)
  const mobile = useMediaQuery(HERO_FRAMES.mobileQuery);
  const [resolucao] = useState<HeroResolucao>(() => (mobile ? 'mobile' : 'desktop'));
  const src = useCallback((i: number) => heroFrameUrl(resolucao, i), [resolucao]);
  const { titulo, eyebrow, lead, acoes, cue, alt } = heroHome;

  return (
    <Hero
      mediaMode="tela-cheia"
      titulo={titulo.map(renderLinha)}
      eyebrow={eyebrow}
      lead={renderLinha(lead)}
      acoes={
        <>
          <Button as="a" href={acoes.primaria.href} botao magnet roll>
            {acoes.primaria.label}
          </Button>
          <Button as="a" href={acoes.secundaria.href} variante="linha" seta="direita">
            {acoes.secundaria.label}
          </Button>
        </>
      }
      cue={cue}
      alinhavo={HERO_ALINHAVO}
      intro
      cursorThread
      media={
        <Photo reveal="tule" modo="img" parallax={0.08}>
          <HeroSequence
            frames={HERO_FRAMES.quantidade}
            src={src}
            fps={HERO_FRAMES.fps}
            loop={HERO_FRAMES.loop}
            frameEstatico={HERO_FRAME_ESTATICO}
            {...(alt ? { alt } : {})}
          />
        </Photo>
      }
    />
  );
}
