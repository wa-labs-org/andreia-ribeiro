import { useState, type ReactNode } from 'react';
import { Button, Hero, HERO_ALINHAVO, Photo, type PhotoSource } from '../../components';
import {
  HERO_IMAGEM,
  heroDimensoes,
  heroMime,
  heroSrc,
  heroSrcset,
  heroHome,
  type HeroResolucao,
  type Linha,
} from '../../content/hero';
import { useMediaQuery } from '../../motion';
import { cssVars } from '../../lib/cx';

/** Trechos → texto com o <em> do "ponto à mão". */
export function renderLinha(linha: Linha): ReactNode {
  return linha.map((t, i) => (typeof t === 'string' ? t : <em key={i}>{t.em}</em>));
}

/** <source> por resolução e formato: AVIF primeiro, WebP depois; o recorte mobile vem antes. */
function fontes(): PhotoSource[] {
  const out: PhotoSource[] = [];
  for (const res of ['mobile', 'desktop'] as const satisfies readonly HeroResolucao[]) {
    const { width, height } = heroDimensoes(res);
    for (const f of HERO_IMAGEM.formatos) {
      out.push({
        srcSet: heroSrcset(res, f),
        type: heroMime(f),
        sizes: '100vw',
        width,
        height,
        ...(res === 'mobile' ? { media: HERO_IMAGEM.mobileQuery } : {}),
      });
    }
  }
  return out;
}

/**
 * Hero da home: cabe em 100svh em qualquer tela. Foto da noiva no altar (provisória: ver
 * HERO_IMAGEM), texto marfim na área escura. Partitura do doc 07, esperando o loader na 1ª visita.
 */
export function HeroHome() {
  // retrato/celular deitado: foto inteira em `contain`, sem paralaxe (a moldura cortaria a cauda).
  // Decidido na montagem, como a escolha da fonte da imagem.
  const mobile = useMediaQuery(HERO_IMAGEM.mobileQuery);
  const [paralaxe] = useState(() => !mobile);
  const { titulo, eyebrow, lead, leadCurto, acoes } = heroHome;
  const desktop = heroDimensoes('desktop');
  const fallbackWidth = HERO_IMAGEM.desktop.larguras[1] ?? desktop.width;

  return (
    <Hero
      mediaMode="tela-cheia"
      style={cssVars({
        '--hero-pos-desktop': HERO_IMAGEM.desktop.posicao,
        '--hero-pos-mobile': HERO_IMAGEM.mobile.posicao,
      })}
      titulo={titulo.map(renderLinha)}
      eyebrow={eyebrow}
      lead={renderLinha(lead)}
      leadCurto={renderLinha(leadCurto)}
      acoes={
        <>
          <Button as="a" href={acoes.primaria.href} botao magnet roll>
            {acoes.primaria.label}
          </Button>
          <Button
            as="a"
            href={acoes.secundaria.href}
            variante="linha"
            seta="direita"
            className="at-hero__acao--secundaria"
          >
            {acoes.secundaria.label}
          </Button>
        </>
      }
      cue={false /* sem cue na tela cheia: cairia sobre áreas claras da foto */}
      alinhavo={HERO_ALINHAVO}
      intro
      cursorThread
      media={
        <Photo
          reveal="tule"
          modo="img"
          src={heroSrc('desktop', 'webp', fallbackWidth)}
          alt={HERO_IMAGEM.alt}
          priority
          sources={fontes()}
          imgProps={{
            srcSet: heroSrcset('desktop', 'webp'),
            sizes: '100vw',
            width: desktop.width,
            height: desktop.height,
          }}
          {...(paralaxe ? { parallax: 0.08 } : {})}
        />
      }
    />
  );
}
