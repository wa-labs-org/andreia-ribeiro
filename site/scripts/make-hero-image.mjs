// Gera as versões da foto do hero em public/hero/ a partir de HERO_IMAGEM (src/content/hero.ts):
// AVIF + WebP, desktop (1280/1920/2560) e o recorte mobile (828/1229), sem nunca ampliar.
// Uso: npm run hero:image   (Node ≥ 22.18 / 24: importa o .ts direto, sem build)
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { HERO_IMAGEM, heroArquivo } from '../src/content/hero.ts';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const fonte = here(`../${HERO_IMAGEM.fonte}`);
const out = here('../public/hero/');
mkdirSync(out, { recursive: true });

// remove versões antigas desta foto (outros nomes/larguras)
for (const f of readdirSync(out)) if (f.startsWith(`${HERO_IMAGEM.nome}-`)) rmSync(out + f);

const meta = await sharp(fonte).metadata();
if (meta.width !== HERO_IMAGEM.original.largura || meta.height !== HERO_IMAGEM.original.altura) {
  console.warn(
    `Atenção: o original tem ${meta.width}×${meta.height}, mas HERO_IMAGEM.original diz ` +
      `${HERO_IMAGEM.original.largura}×${HERO_IMAGEM.original.altura}. Revise recortes e posições.`,
  );
}

let total = 0;
const linhas = [];
for (const res of ['desktop', 'mobile']) {
  const v = HERO_IMAGEM[res];
  const r = v.recorte ?? { left: 0, top: 0, width: meta.width, height: meta.height };
  for (const largura of v.larguras) {
    if (largura > r.width) throw new Error(`${res} ${largura}px ampliaria o recorte de ${r.width}px`);
    for (const formato of HERO_IMAGEM.formatos) {
      const arquivo = heroArquivo(res, formato, largura);
      let img = sharp(fonte).rotate().extract(r).resize({ width: largura }); // sem withMetadata: EXIF/GPS do original não vão para o público
      img =
        formato === 'avif'
          ? img.avif({ quality: HERO_IMAGEM.qualidade.avif, effort: 6, chromaSubsampling: '4:2:0' })
          : img.webp({ quality: HERO_IMAGEM.qualidade.webp, effort: 6 });
      const info = await img.toFile(out + arquivo);
      const kb = statSync(out + arquivo).size / 1024;
      total += kb;
      linhas.push(`${arquivo.padEnd(34)} ${info.width}×${info.height}  ${kb.toFixed(0).padStart(4)} KB`);
    }
  }
}
console.log(linhas.join('\n'));
console.log(`total ${(total / 1024).toFixed(2)} MB (o navegador baixa só uma versão)`);
