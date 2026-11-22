import { useCallback, useId, useRef, useState } from 'react';

/** Estado compartilhado entre MenuToggle e Menu. */
export function useMenu() {
  const [open, setOpen] = useState(false);
  const id = `at-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
  }, []);
  return { open, setOpen, toggle, close, id, toggleRef };
}
