// Gera os frames placeholder do hero (sem dependências), nas duas resoluções:
//   public/hero/desktop/frame-0001.svg … (1600 × 900, 16:9)
//   public/hero/mobile/frame-0001.svg  … (828 × 1472, 9:16)
// Croqui da noiva sobre morim, com a luz da janela entrando e assentando: o último frame é o estado
// parado da cena (fundo atrás do texto e frame do modo reduzido).
// Quantidade e fps vêm de src/content/hero.ts (HERO_FRAMES); passe um número para sobrescrever.
// Quando os frames reais chegarem (WebP), apague estes e troque `extensao` em HERO_FRAMES.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const conf = readFileSync(here('../src/content/hero.ts'), 'utf8');
const TOTAL = Number(process.argv[2] ?? /quantidade:\s*(\d+)/.exec(conf)?.[1] ?? 40);

// tokens (mesmos valores de tokens.css)
const MARFIM = '#FDF7E7';
const MANTEIGA = '#F9F1D8';
const ROSE = '#F3DFD2';
const BRONZE = '#7A6230';

// o conteúdo do croqui sem a tag <svg> externa; os atributos dela (fill="none", pontas e junções)
// passam para um <g>, senão os traços viram manchas preenchidas de preto
const fonte = readFileSync(here('../src/assets/figurinos/noiva.svg'), 'utf8');
const raiz = /<svg([^>]*)>/.exec(fonte)?.[1] ?? '';
const herdados = (raiz.match(/\s(fill|stroke-linecap|stroke-linejoin)="[^"]*"/g) ?? []).join('');
const croqui = `<g${herdados}>${fonte.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</g>`;

// croqui 240 × 360: desktop à direita (a partir de ~62% da largura), mobile no alto
const LAYOUT = {
  desktop: {
    w: 1600,
    h: 900,
    fig: 'translate(1010 70) scale(2.1)',
    label: [1180, 40],
    lx: [70, 22],
    ly: [18, 12],
  },
  mobile: { w: 828, h: 1472, fig: 'translate(234 70) scale(1.5)', label: [40, 50], lx: [80, 45], ly: [8, 6] },
};

for (const [nome, L] of Object.entries(LAYOUT)) {
  const out = here(`../public/hero/${nome}/`);
  mkdirSync(out, { recursive: true });
  for (let i = 1; i <= TOTAL; i++) {
    const t = TOTAL > 1 ? (i - 1) / (TOTAL - 1) : 1; // 0 → 1, o último frame é t = 1
    const p = 1 - (1 - t) ** 3; // entra rápido, assenta devagar (caimento)
    const lx = (L.lx[0] + (L.lx[1] - L.lx[0]) * p).toFixed(2);
    const ly = (L.ly[0] + (L.ly[1] - L.ly[0]) * p).toFixed(2);
    const sway = ((1 - p) * 1.2).toFixed(3); // o manequim balança e para
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L.w} ${L.h}" width="${L.w}" height="${L.h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MANTEIGA}"/><stop offset="1" stop-color="${ROSE}"/></linearGradient>
    <radialGradient id="l" cx="${lx}%" cy="${ly}%" r="75%"><stop offset="0" stop-color="${MARFIM}" stop-opacity=".9"/><stop offset=".6" stop-color="${MARFIM}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${L.w}" height="${L.h}" fill="url(#g)"/>
  <rect width="${L.w}" height="${L.h}" fill="url(#l)"/>
  <g transform="${L.fig} rotate(${sway} 120 14)">${croqui}</g>
  <text x="${L.label[0]}" y="${L.label[1]}" font-family="IBM Plex Mono, monospace" font-size="16" letter-spacing="1" fill="${BRONZE}">PLACEHOLDER · ${nome.toUpperCase()} · ${String(i).padStart(4, '0')}</text>
</svg>
`;
    writeFileSync(`${out}frame-${String(i).padStart(4, '0')}.svg`, svg);
  }
}
console.log(`${TOTAL} frames em public/hero/desktop e public/hero/mobile`);
