import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';
import './MenuToggle.css';

export interface MenuToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  open: boolean;
  /** id do Menu controlado */
  'aria-controls': string;
  /** rótulo (nome acessível) */
  rotulo?: string;
  /** rótulo visível quando aberto (decorativo: o estado vai em aria-expanded) */
  rotuloFechar?: string;
}

/** "Menu" ↔ "Fechar" + duas linhas (uma em pesponto) que se cruzam como alfinetes. */
export const MenuToggle = forwardRef<HTMLButtonElement, MenuToggleProps>(function MenuToggle(
  { open, rotulo = 'Menu', rotuloFechar = 'Fechar', className, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={cx('at-menu-toggle', className)}
      aria-expanded={open}
    >
      <span className="at-menu-toggle__label">
        <span>{rotulo}</span>
        <span aria-hidden="true">{rotuloFechar}</span>
      </span>
      <span className="at-menu-toggle__icon" aria-hidden="true">
        <i />
        <i />
      </span>
    </button>
  );
});
