/* Base de movimento compartilhada por todas as seções.
 * Os scripts do design system (ícones, lótus, seda) entram primeiro: o lótus
 * é montado de forma síncrona e precisa existir antes de o GSAP animá-lo. */
import '../../andreia-ribeiro-design-system/assets/icons.js';
import '../../andreia-ribeiro-design-system/assets/lotus.js';
import '../../andreia-ribeiro-design-system/assets/silk.js';
import '../../andreia-ribeiro-design-system/assets/croquis.js';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* Ajustes finos (mesmos valores do overview do design system) */
export const CONFIG = {
	scrollLerp: 0.1,
	ease: 'power3.out',
	loaderDuration: 2.2,
};

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

/* Lenis ↔ ScrollTrigger */
export const lenis = new Lenis({ lerp: CONFIG.scrollLerp });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger, SplitText };
