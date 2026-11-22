import type { CSSProperties } from 'react';

/** Junta classes ignorando valores falsos. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Custom properties tipadas para o atributo style (`--i`, `--at-delay`, `--at-ratio`…). */
export function cssVars(
  vars: Record<`--${string}`, string | number | undefined>,
  base?: CSSProperties,
): CSSProperties {
  const out: Record<string, string | number> = { ...(base as Record<string, string | number> | undefined) };
  for (const [k, v] of Object.entries(vars)) if (v !== undefined) out[k] = v;
  return out;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** "05 / 08" */
export function contador(n: number, total: number): string {
  return `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

export function session(key: string, value?: string | null): string | null {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* modo privado / storage bloqueado */
  }
  return null;
}
