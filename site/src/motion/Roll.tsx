import { cssVars } from '../lib/cx';
import { useRoll } from './useRoll';

/**
 * Rolagem de letras: o texto real fica em .at-sr; as duas cópias animadas têm aria-hidden.
 * Precisa ser filho direto do <a>/<button> (o CSS usa `:is(a, button):hover > .at-roll`).
 */
export function Roll({ children }: { children: string }) {
  const chars = useRoll(children);
  const copy = (cls: string) => (
    <span className={cls} aria-hidden="true">
      {chars.map((ch, i) => (
        // a posição é a identidade da letra
        <span key={i} className="at-char" style={cssVars({ '--i': i })}>
          {ch}
        </span>
      ))}
    </span>
  );
  return (
    <span className="at-roll">
      <span className="at-sr">{children.trim()}</span>
      {copy('at-roll__a')}
      {copy('at-roll__b')}
    </span>
  );
}
