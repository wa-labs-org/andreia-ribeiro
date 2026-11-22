import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from 'react';
import { cssVars, cx } from '../../lib/cx';
import './Menu.css';

export interface MenuItem {
  href: string;
  /** texto do item; um <em> por item no máximo */
  label: ReactNode;
  /** número em mono, ex.: "01" */
  numero?: string;
  current?: boolean;
  /** devolva false para não fechar o menu (ex.: o link vai disparar a cortina) */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => boolean | undefined;
}

export interface MenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
  itens: readonly MenuItem[];
  /** botão que abre o menu: entra no ciclo de foco e recebe o foco ao fechar */
  toggleRef: RefObject<HTMLButtonElement | null>;
  /** linha de rodapé (endereço, horário) */
  rodape?: ReactNode;
  /** nome do diálogo */
  'aria-label'?: string;
  /** nome da navegação interna */
  navLabel?: string;
  className?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tela cheia em marfim que cai do topo como cortina. role="dialog", aria-modal, foco preso
 * (inclui o alternador), Esc fecha e devolve o foco, inert quando fechado, body travado.
 */
export function Menu({
  id,
  open,
  onClose,
  itens,
  toggleRef,
  rodape,
  'aria-label': ariaLabel = 'Menu',
  navLabel = 'Principal',
  className,
}: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.toggleAttribute('inert', !open);
    document.body.classList.toggle('at-menu-open', open);
    let t = 0;
    if (open) {
      t = window.setTimeout(() => {
        el.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
      }, 80);
    } else if (wasOpen.current) {
      toggleRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
    return () => {
      window.clearTimeout(t);
    };
  }, [open, toggleRef]);

  useEffect(
    () => () => {
      document.body.classList.remove('at-menu-open');
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const list = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (toggleRef.current) list.push(toggleRef.current);
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, toggleRef]);

  return (
    <div
      ref={ref}
      id={id}
      className={cx('at-menu', open && 'is-open', className)}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <nav className="at-menu__list" aria-label={navLabel}>
        {itens.map((item, i) => (
          <div className="at-menu__item" key={item.href + String(i)}>
            <a
              className="at-menu__link"
              href={item.href}
              style={cssVars({ '--i': i })}
              aria-current={item.current ? 'page' : undefined}
              onClick={(e) => {
                if (item.onClick?.(e) !== false) onClose();
              }}
            >
              {item.numero ? <span className="at-note">{item.numero}</span> : null}
              {item.label}
            </a>
          </div>
        ))}
      </nav>
      {rodape ? <div className="at-menu__foot">{rodape}</div> : null}
    </div>
  );
}
