/* A entrada coreografada ([data-intro], o hero) espera o loader ou a cortina de chegada.
   Equivale ao onReady/setReady de atelier.js. */
const listeners = new Set<() => void>();
let ready = false;

export function isIntroReady(): boolean {
  return ready;
}

export function setIntroReady(): void {
  if (ready) return;
  ready = true;
  listeners.forEach((fn) => {
    fn();
  });
}

export function subscribeIntro(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Roda fn quando a entrada liberar (imediatamente se já liberou). */
export function onIntroReady(fn: () => void): () => void {
  if (ready) {
    fn();
    return () => undefined;
  }
  const once = (): void => {
    listeners.delete(once);
    fn();
  };
  listeners.add(once);
  return () => listeners.delete(once);
}

/** A página chegou coberta (loader da 1ª visita ou cortina de transição)? */
export function introIsCovered(): boolean {
  const c = document.documentElement.classList;
  return c.contains('at-loading') || c.contains('at-arriving');
}
