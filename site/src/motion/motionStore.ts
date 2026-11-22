/* Modo de movimento: html[data-motion] é definido no <head> antes do primeiro paint
   (index.html). Este módulo mantém o atributo sincronizado com a media query e com
   uma escolha forçada (sessionStorage "at-motion", mesma chave do design system). */
import { session } from '../lib/cx';

export type MotionMode = 'full' | 'reduce';

const html = document.documentElement;
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set<() => void>();

function readOverride(): MotionMode | null {
  const v = session('at-motion');
  return v === 'reduce' || v === 'full' ? v : null;
}

let override: MotionMode | null = readOverride();
let started = false;

function apply(): void {
  const v: MotionMode = override ?? (mq.matches ? 'reduce' : 'full');
  if (html.getAttribute('data-motion') !== v) html.setAttribute('data-motion', v);
  listeners.forEach((fn) => {
    fn();
  });
  document.dispatchEvent(new CustomEvent('at:motion', { detail: v }));
}

function start(): void {
  if (started) return;
  started = true;
  mq.addEventListener('change', apply);
  apply();
}

export function getMotion(): MotionMode {
  return html.getAttribute('data-motion') === 'reduce' ? 'reduce' : 'full';
}

export function isReduced(): boolean {
  return getMotion() === 'reduce';
}

export function getMotionOverride(): MotionMode | null {
  return override;
}

/** Força um modo ('reduce' | 'full') ou devolve o controle à media query (null). */
export function setMotion(v: MotionMode | null): void {
  override = v;
  session('at-motion', v);
  start();
  apply();
}

export function subscribeMotion(fn: () => void): () => void {
  start();
  listeners.add(fn);
  return () => listeners.delete(fn);
}
