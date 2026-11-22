/* Seções no registro Casimira registradas para a troca de tecido do header
   (substitui o querySelectorAll('[data-registro="casimira"]') do vanilla). */
const elements = new Set<Element>();

export function registerCasimira(el: Element): () => void {
  elements.add(el);
  return () => elements.delete(el);
}

export function casimiraElements(): ReadonlySet<Element> {
  return elements;
}
