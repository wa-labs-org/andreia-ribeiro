import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { HERO_FRAME_ESTATICO, HERO_FRAMES, heroFrameUrl, type HeroResolucao } from './src/content/hero';

/** Prefixa cada parte de uma lista de media queries com uma condição. */
function com(condicao: string, query: string): string {
  return query
    .split(',')
    .map((parte) => `${condicao} and ${parte.trim()}`)
    .join(', ');
}

/**
 * Preload do LCP do hero: só o primeiro frame da resolução certa (via `media`).
 * No modo reduzido o único frame exibido é o estático, então é ele que vai no preload.
 * (Um modo forçado por sessionStorage não é visto pela media query: nesse caso raro, o preload erra o frame.)
 */
function heroPreload(): Plugin {
  const res: [HeroResolucao, string][] = [
    ['desktop', HERO_FRAMES.desktopQuery],
    ['mobile', HERO_FRAMES.mobileQuery],
  ];
  const tags: HtmlTagDescriptor[] = res.flatMap(([r, q]) =>
    [
      { motion: 'no-preference', frame: 0 },
      { motion: 'reduce', frame: HERO_FRAME_ESTATICO },
    ].map(({ motion, frame }) => ({
      tag: 'link',
      attrs: {
        rel: 'preload',
        as: 'image',
        href: heroFrameUrl(r, frame),
        media: com(`(prefers-reduced-motion: ${motion})`, q),
        fetchpriority: 'high',
      },
      injectTo: 'head' as const,
    })),
  );
  return { name: 'hero-preload', transformIndexHtml: () => tags };
}

export default defineConfig({
  plugins: [react(), heroPreload()],
});
