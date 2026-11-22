import { createContext } from 'react';

/**
 * Espaço do Hero para controles da mídia (ex.: pausa do HeroSequence), acima do véu e do texto.
 * A mídia fica isolada dentro de .at-photo; sem este espaço, o controle ficaria sob o véu.
 */
export const HeroControlsContext = createContext<HTMLElement | null>(null);
