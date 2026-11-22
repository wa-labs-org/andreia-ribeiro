import type { SVGProps } from 'react';
import { cx } from '../../lib/cx';
import { ICONS, type IconName } from './icons';
import './Icon.css';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  name: IconName;
  /** s 16px · m 20px · l 28px */
  size?: 's' | 'm' | 'l';
  /** Ícone com significado próprio: vira role="img" com este rótulo. Sem título, é decorativo (aria-hidden). */
  title?: string;
}

export function Icon({ name, size = 'm', title, className, ...rest }: IconProps) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };
  return (
    <svg
      className={cx('at-icon', size !== 'm' && `at-icon--${size}`, className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      focusable="false"
      {...a11y}
      {...rest}
    >
      {ICONS[name]}
    </svg>
  );
}
