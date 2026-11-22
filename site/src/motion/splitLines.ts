/* ==========================================================================
   Divisão em linhas reais, preservando <em>, <strong>…
   Port de splitLines() do atelier.js, sem mexer no DOM gerido pelo React:
     1. tokeniza os children em palavras, guardando a cadeia de elementos ancestrais;
     2. renderiza palavra a palavra (passe de medida) e agrupa pela posição vertical;
     3. renderiza .at-line > span(--i) com clones rasos dos ancestrais.
   ========================================================================== */
import {
  Children,
  Fragment,
  createElement,
  isValidElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cssVars } from '../lib/cx';

interface Ancestor {
  type: ElementType;
  props: Record<string, unknown>;
}

export interface Word {
  text: string;
  chain: readonly Ancestor[];
  /** havia espaço antes desta palavra */
  space: boolean;
}

export function tokenize(children: ReactNode): Word[] {
  const out: Word[] = [];
  let space = false;
  const walk = (node: ReactNode, chain: readonly Ancestor[]): void => {
    Children.forEach(node, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        for (const part of String(child).split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) space = true;
          else {
            out.push({ text: part, chain, space });
            space = false;
          }
        }
        return;
      }
      if (!isValidElement(child)) return;
      const el = child as ReactElement<{ children?: ReactNode }>;
      if (el.type === 'br') {
        space = true;
        return;
      }
      if (el.type === Fragment) {
        walk(el.props.children, chain);
        return;
      }
      const { children: inner, ...rest } = el.props;
      walk(inner, [...chain, { type: el.type as ElementType, props: rest }]);
    });
  };
  walk(children, []);
  return out;
}

/** Assinatura estável do conteúdo (re-medir só quando o texto muda). */
export function signature(words: readonly Word[]): string {
  return words.map((w) => (w.space ? ' ' : '') + w.text + '/' + String(w.chain.length)).join('');
}

function wrap(chain: readonly Ancestor[], inner: ReactNode): ReactNode {
  let node = inner;
  for (let i = chain.length - 1; i >= 0; i--) {
    const a = chain[i];
    if (a) node = createElement(a.type, a.props, node);
  }
  return node;
}

/** Passe de medida: cada palavra num .at-w, com seus ancestrais. */
export function renderWords(words: readonly Word[]): ReactNode {
  const parts: ReactNode[] = [];
  words.forEach((w, i) => {
    if (i > 0 && w.space) parts.push(' ');
    parts.push(wrap(w.chain, createElement('span', { className: 'at-w' }, w.text)));
  });
  return createElement(Fragment, null, ...parts);
}

/** Agrupa as palavras medidas por posição vertical (tolerância de 3px, como o vanilla). */
export function measureLines(container: Element): number[][] {
  const lines: number[][] = [];
  let lastTop: number | null = null;
  container.querySelectorAll('.at-w').forEach((w, i) => {
    const t = Math.round(w.getBoundingClientRect().top);
    if (lastTop === null || Math.abs(t - lastTop) > 3) {
      lines.push([]);
      lastTop = t;
    }
    lines[lines.length - 1]?.push(i);
  });
  return lines;
}

interface OpenNode {
  ancestor: Ancestor;
  children: ReactNode[];
}

function build(node: OpenNode): ReactNode {
  return createElement(node.ancestor.type, node.ancestor.props, ...node.children.map(materialize));
}
function materialize(n: ReactNode | OpenNode): ReactNode {
  return n !== null && typeof n === 'object' && 'ancestor' in n ? build(n) : (n as ReactNode);
}

/** Linhas reais: .at-line > span(--i) > (clones dos ancestrais) > texto. */
export function renderLines(words: readonly Word[], groups: readonly number[][]): ReactNode {
  const lines = groups.map((idx, i) => {
    const root: (ReactNode | OpenNode)[] = [];
    const open: OpenNode[] = [];
    idx.forEach((wi, j) => {
      const w = words[wi];
      if (!w) return;
      let k = 0;
      while (k < w.chain.length && k < open.length && open[k]?.ancestor === w.chain[k]) k++;
      open.length = k;
      let parent = k ? (open[k - 1]?.children ?? root) : root;
      if (j > 0 && w.space) parent.push(' ');
      for (let c = k; c < w.chain.length; c++) {
        const ancestor = w.chain[c];
        if (!ancestor) continue;
        const node: OpenNode = { ancestor, children: [] };
        parent.push(node);
        open.push(node);
        parent = node.children;
      }
      parent.push(w.text);
    });
    return createElement(
      'span',
      { className: 'at-line', key: i },
      createElement('span', { style: cssVars({ '--i': i }) }, ...root.map(materialize)),
    );
  });
  return createElement(Fragment, null, ...lines);
}
