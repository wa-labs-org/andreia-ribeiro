import { createContext } from 'react';

/** Progresso do loader (0–1), fornecido pela Curtain enquanto ela carrega. */
export const LoaderContext = createContext<number | null>(null);
