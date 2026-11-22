import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { HERO_IMAGEM, heroMime, heroSrcset } from './src/content/hero';

/**
 * Preload do LCP (a foto do hero): só AVIF — pré-carregar AVIF e WebP faria o navegador baixar os dois.
 * Um link por resolução, com `media`, para baixar só o recorte certo.
 */
function heroPreload(): Plugin {
  const tags: HtmlTagDescriptor[] = (
    [
      ['desktop', HERO_IMAGEM.desktopQuery],
      ['mobile', HERO_IMAGEM.mobileQuery],
    ] as const
  ).map(([res, media]) => ({
    tag: 'link',
    attrs: {
      rel: 'preload',
      as: 'image',
      type: heroMime('avif'),
      imagesrcset: heroSrcset(res, 'avif'),
      imagesizes: '100vw',
      media,
      fetchpriority: 'high',
    },
    injectTo: 'head' as const,
  }));
  return { name: 'hero-preload', transformIndexHtml: () => tags };
}

export default defineConfig({
  plugins: [react(), heroPreload()],
});
