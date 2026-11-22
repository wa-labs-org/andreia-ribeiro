/* Um IntersectionObserver compartilhado para todas as revelações.
   Cada elemento é observado uma vez e liberado (o tecido não cai duas vezes). */
type Callback = () => void;

const callbacks = new Map<Element, Set<Callback>>();
let io: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const set = callbacks.get(e.target);
        callbacks.delete(e.target);
        io?.unobserve(e.target);
        set?.forEach((fn) => {
          fn();
        });
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  );
  return io;
}

export function observeOnce(el: Element, fn: Callback): () => void {
  if (!('IntersectionObserver' in window)) {
    fn();
    return () => undefined;
  }
  let set = callbacks.get(el);
  if (!set) {
    set = new Set();
    callbacks.set(el, set);
    getObserver().observe(el);
  }
  set.add(fn);
  return () => {
    const s = callbacks.get(el);
    if (!s) return;
    s.delete(fn);
    if (s.size === 0) {
      callbacks.delete(el);
      io?.unobserve(el);
    }
  };
}
