/** Lê uma duração dos tokens (já resolvida para o modo atual) em milissegundos. */
export function tokenMs(
  token: `--at-${string}`,
  fallback: number,
  el: Element = document.documentElement,
): number {
  const v = getComputedStyle(el).getPropertyValue(token).trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return v.includes('ms') ? n : n * 1000;
}

/** Lê uma curva dos tokens (para Web Animations / canvas). */
export function tokenEase(token: `--at-ease-${string}`, fallback = 'ease-out'): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback;
}
