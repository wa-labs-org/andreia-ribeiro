// Gera frames placeholder do hero em public/hero/frame-0001.svg … (sem dependências).
// Croqui da noiva sobre morim, com a luz da janela atravessando devagar: um "vídeo" de 2s a 24 fps.
// Quando os frames reais chegarem (WebP/AVIF), apague estes e ajuste a prop `src` do <HeroSequence>.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const TOTAL = Number(process.argv[2] ?? 48);
const out = here('../public/hero/');
mkdirSync(out, { recursive: true });

// tokens (mesmos valores de tokens.css)
const MARFIM = '#FDF7E7';
const MANTEIGA = '#F9F1D8';
const ROSE = '#F3DFD2';
const DOURADO = '#B99847';

const croqui = readFileSync(here('../src/assets/figurinos/noiva.svg'), 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '');

for (let i = 1; i <= TOTAL; i++) {
  const t = (i - 1) / TOTAL; // 0 → 1
  const ease = 0.5 - Math.cos(t * Math.PI * 2) / 2; // vai e volta: o último frame encontra o primeiro
  const lx = (18 + ease * 46).toFixed(2);
  const ly = (14 + ease * 8).toFixed(2);
  const sway = (Math.sin(t * Math.PI * 2) * 0.6).toFixed(3);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MANTEIGA}"/><stop offset="1" stop-color="${ROSE}"/></linearGradient>
    <radialGradient id="l" cx="${lx}%" cy="${ly}%" r="70%"><stop offset="0" stop-color="${MARFIM}" stop-opacity=".85"/><stop offset=".6" stop-color="${MARFIM}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#g)"/>
  <rect width="1600" height="1000" fill="url(#l)"/>
  <path d="M0 ${(820 + ease * 20).toFixed(1)}C400 ${(780 - ease * 30).toFixed(1)} 900 ${(880 + ease * 10).toFixed(1)} 1600 ${(800 - ease * 20).toFixed(1)}" fill="none" stroke="${DOURADO}" stroke-width="1.5" stroke-dasharray="14 8" opacity=".5"/>
  <g transform="translate(980 90) scale(2.35) rotate(${sway} 120 14)">${croqui}</g>
  <text x="64" y="940" font-family="IBM Plex Mono, monospace" font-size="18" letter-spacing="1" fill="#7A6230">PLACEHOLDER · FRAME ${String(i).padStart(4, '0')}</text>
</svg>
`;
  writeFileSync(`${out}frame-${String(i).padStart(4, '0')}.svg`, svg);
}
console.log(`${TOTAL} frames em public/hero/`);
