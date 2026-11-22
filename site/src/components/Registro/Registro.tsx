import {
  useCallback,
  useEffect,
  useRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react';
import { registerCasimira } from '../../motion/registroRegistry';

export type RegistroTipo = 'seda' | 'casimira';

/** Registra um elemento Casimira para a troca de tecido do header. */
export function useRegistro(ref: RefObject<Element | null>, tipo: RegistroTipo | undefined): void {
  useEffect(() => {
    if (tipo !== 'casimira' || !ref.current) return;
    return registerCasimira(ref.current);
  }, [ref, tipo]);
}

export interface RegistroProps extends HTMLAttributes<HTMLElement> {
  /**
   * seda: noivas e madrinhas (padrão do sistema) ·
   * casimira: noivos e padrinhos — troca o fundo, o eixo SOFT (100 → 0) e a curva (caimento → corte, ×0.85).
   */
  tipo: RegistroTipo;
  as?: 'section' | 'div' | 'article' | 'aside' | 'header' | 'footer';
  children?: ReactNode;
}

export function Registro({ tipo, as = 'section', children, ...rest }: RegistroProps) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);
  useRegistro(ref, tipo);
  const Tag: ElementType = as;
  return (
    <Tag {...rest} ref={setRef} data-registro={tipo}>
      {children}
    </Tag>
  );
}
