// Garante que src/styles/tokens.css é cópia fiel da fonte da verdade do design system.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const fonte = readFileSync(here('../../atelier-design-system/assets/tokens/tokens.css'), 'utf8');
const copia = readFileSync(here('../src/styles/tokens.css'), 'utf8');

if (fonte !== copia) {
  console.error(
    'tokens.css divergiu do design system. Copie de atelier-design-system/assets/tokens/tokens.css.',
  );
  process.exit(1);
}
console.log('tokens.css idêntico ao design system.');
