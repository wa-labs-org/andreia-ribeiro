import { useMemo } from 'react';

/** Letras para a rolagem (18ms por letra via --at-stagger-letra). */
export function useRoll(text: string): string[] {
  return useMemo(() => Array.from(text.trim()), [text]);
}
