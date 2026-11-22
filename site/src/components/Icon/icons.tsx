/* Sprite de assets/js/icons.js convertido em JSX (24×24, traço 1.25, cantos vivos, currentColor). */
import type { ReactElement } from 'react';

export const ICONS = {
  agulha: (
    <>
      <path d="M4 20 18 6" />
      <path d="M16.6 5.2a1.9 1.9 0 0 1 2.7 2.7l-1.1 1.1-2.7-2.7z" />
      <path d="M18.6 7.2c1.6 3.2-.4 6.6-4 7.6-3 .8-5.6 1.6-6.8 4.2" strokeDasharray="2 2" />
    </>
  ),
  alfinete: (
    <>
      <circle cx="16.5" cy="7.5" r="3" />
      <path d="M14.4 9.6 4 20" />
    </>
  ),
  tesoura: (
    <>
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
      <path d="M8.3 15.7 19 4M15.7 15.7 5 4" />
    </>
  ),
  fita: (
    <>
      <path d="M3 8.5h13.5a4 4 0 0 1 0 8H9" />
      <path d="M3 8.5v4h13.5" />
      <path d="M6 8.5V10.5M9 8.5v2.5M12 8.5v2" />
    </>
  ),
  botao: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="6" strokeDasharray="1.6 1.6" />
      <circle cx="10.2" cy="10.2" r=".9" />
      <circle cx="13.8" cy="10.2" r=".9" />
      <circle cx="10.2" cy="13.8" r=".9" />
      <circle cx="13.8" cy="13.8" r=".9" />
    </>
  ),
  cabide: <path d="M10 5.5a2 2 0 1 1 2 2V9l8.4 6.1a1 1 0 0 1-.6 1.9H4.2a1 1 0 0 1-.6-1.9L12 9" />,
  manequim: (
    <>
      <path d="M10 3h4M12 3v2" />
      <path d="M8 5.5c1.3.7 2.6 1 4 1s2.7-.3 4-1c.6 2.5.3 4.5-.8 6.5.9 1.7 1.3 3.5 1.3 5.5h-9c0-2 .4-3.8 1.3-5.5C7.7 10 7.4 8 8 5.5z" />
      <path d="M12 17.5V21M9 21h6" />
    </>
  ),
  carretel: (
    <>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M8.5 3.5v17M15.5 3.5v17" />
      <path d="M8.5 8h7M8.5 11h7M8.5 14h7M8.5 17h7" strokeDasharray="1.5 1" />
    </>
  ),
  calendario: (
    <>
      <path d="M3.5 5.5h17v15h-17z" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <path d="M7 13.5h2M11 13.5h2M15 13.5h2M7 17h2M11 17h2" />
    </>
  ),
  seta: (
    <>
      <path d="M4 12h15" />
      <path d="m14 7 5 5-5 5" />
    </>
  ),
  'seta-esq': (
    <>
      <path d="M20 12H5" />
      <path d="m10 7-5 5 5 5" />
    </>
  ),
  fio: (
    <>
      <path d="M12 3v18" />
      <path d="M8.5 6.5 12 3l3.5 3.5M8.5 17.5 12 21l3.5-3.5" />
    </>
  ),
  mais: <path d="M12 5v14M5 12h14" />,
  fechar: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerta: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V13M12 15.8v.7" />
    </>
  ),
  local: (
    <>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  relogio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  menu: (
    <>
      <path d="M4 9h16" strokeDasharray="3 2" />
      <path d="M4 15h16" />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
