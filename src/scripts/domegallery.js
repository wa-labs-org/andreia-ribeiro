/* ═══════════════════════════════════════════════════════════════
   CÚPULA DE FOTOS (DomeGallery) — porta em JS puro do componente React
   "DomeGallery" (sem React e sem @use-gesture). Mantém o comportamento:
   as fotos forram o lado de dentro de uma esfera; arrastar gira a cúpula
   com inércia; clicar amplia a foto a partir do lugar dela (FLIP) sobre
   um véu desfocado; Esc, clique no véu ou o botão fecham.

   createDomeGallery(root, {
     fit, fitBasis, minRadius, maxRadius,   // raio a partir do tamanho da área
     segments,                              // colunas na volta completa
     maxVerticalRotationDeg,                // 0 = só gira na horizontal
     dragSensitivity, dragDampening,        // px por grau; 0–1 (mais = desliza mais)
     enlargeMs, reduced,
     onActive(item | null),                 // peça sob o cursor (data-item)
     onOpen(tile), onClose(tile)
   }) → { close(), destroy() }

   Marcação: .dg-root > .dg-main > .dg-stage > .dg-sphere > .dg-item > .dg-tile
             .dg-root > .dg-viewer > .dg-scrim + .dg-card > .dg-card-media > img
   Cada .dg-item traz data-x / data-y (posição na grade) e cada .dg-tile
   traz data-item (peça), data-photo e data-large (foto grande).
   ═══════════════════════════════════════════════════════════════ */

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const wrapSigned = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

export function createDomeGallery(root, options = {}) {
	const o = {
		fit: 0.8,
		fitBasis: 'auto',
		minRadius: 600,
		maxRadius: Infinity,
		segments: 34,
		maxVerticalRotationDeg: 0,
		dragSensitivity: 20,
		dragDampening: 2,
		enlargeMs: 520,
		reduced: false,
		onActive: () => {},
		onOpen: () => {},
		onClose: () => {},
		...options,
	};

	const main = root.querySelector('.dg-main');
	const sphere = root.querySelector('.dg-sphere');
	const viewer = root.querySelector('.dg-viewer');
	const scrim = viewer.querySelector('.dg-scrim');
	const media = viewer.querySelector('.dg-card-media');
	const cardImg = media.querySelector('img');
	const closeBtn = viewer.querySelector('[data-dg-close]');
	const unit = 360 / o.segments / 2;
	const maxV = o.maxVerticalRotationDeg;

	let rot = { x: 0, y: 0 };
	let inertia = 0;
	let opened = false;
	let current = null;
	let openedByKeyboard = false;

	const apply = () => {
		sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
	};

	/* ── raio conforme o tamanho da área ─────────────────────── */
	const ro = new ResizeObserver(([entry]) => {
		const w = Math.max(1, entry.contentRect.width);
		const h = Math.max(1, entry.contentRect.height);
		const minDim = Math.min(w, h);
		const basis =
			{ min: minDim, max: Math.max(w, h), width: w, height: h }[o.fitBasis] ?? (w / h >= 1.3 ? w : minDim);
		const radius = Math.round(clamp(Math.min(basis * o.fit, h * 1.35), o.minRadius, o.maxRadius));
		root.style.setProperty('--radius', `${radius}px`);
		apply();
	});
	ro.observe(root);
	apply();

	/* ── inércia ──────────────────────────────────────────────── */
	const stopInertia = () => {
		cancelAnimationFrame(inertia);
		inertia = 0;
	};
	function startInertia(vx, vy) {
		if (o.reduced) return;
		let vX = clamp(vx, -1.4, 1.4) * 80;
		let vY = clamp(vy, -1.4, 1.4) * 80;
		const d = clamp(o.dragDampening, 0, 1);
		const friction = 0.94 + 0.055 * d;
		const threshold = 0.015 - 0.01 * d;
		const maxFrames = Math.round(90 + 270 * d);
		let frames = 0;
		const step = () => {
			vX *= friction;
			vY *= friction;
			if ((Math.abs(vX) < threshold && Math.abs(vY) < threshold) || ++frames > maxFrames) {
				inertia = 0;
				return;
			}
			rot = { x: clamp(rot.x - vY / 200, -maxV, maxV), y: wrapSigned(rot.y + vX / 200) };
			apply();
			inertia = requestAnimationFrame(step);
		};
		stopInertia();
		inertia = requestAnimationFrame(step);
	}

	/* ── arrastar ─────────────────────────────────────────────── */
	let drag = null;
	function onDown(e) {
		if (opened || (e.pointerType === 'mouse' && e.button !== 0)) return;
		stopInertia();
		drag = {
			id: e.pointerId,
			type: e.pointerType,
			x: e.clientX,
			y: e.clientY,
			start: { ...rot },
			tile: e.target.closest('.dg-tile'),
			moved: false,
			samples: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
		};
	}
	function onMove(e) {
		if (!drag || e.pointerId !== drag.id) return;
		const dx = e.clientX - drag.x;
		const dy = e.clientY - drag.y;
		if (!drag.moved) {
			if (dx * dx + dy * dy <= 16) return;
			/* no toque, gesto vertical é rolagem da página */
			if (drag.type === 'touch' && Math.abs(dy) > Math.abs(dx)) {
				drag = null;
				return;
			}
			drag.moved = true;
			root.classList.add('is-dragging');
			o.onActive(null);
		}
		rot = {
			x: clamp(drag.start.x - dy / o.dragSensitivity, -maxV, maxV),
			y: wrapSigned(drag.start.y + dx / o.dragSensitivity),
		};
		apply();
		const now = performance.now();
		drag.samples.push({ x: e.clientX, y: e.clientY, t: now });
		while (drag.samples.length > 2 && now - drag.samples[0].t > 100) drag.samples.shift();
	}
	function onUp(e) {
		if (!drag || e.pointerId !== drag.id) return;
		const d = drag;
		drag = null;
		root.classList.remove('is-dragging');
		if (d.moved) {
			const a = d.samples[0];
			const b = d.samples[d.samples.length - 1];
			const dt = Math.max(1, b.t - a.t);
			startInertia((b.x - a.x) / dt, (b.y - a.y) / dt);
		} else if (d.tile && e.type === 'pointerup') {
			open(d.tile, false);
		}
	}
	main.addEventListener('pointerdown', onDown);
	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerup', onUp);
	window.addEventListener('pointercancel', onUp);

	/* teclado: Enter/Espaço no botão geram "click" sem ponteiro (detail 0) */
	main.addEventListener('click', (e) => {
		const tile = e.target.closest('.dg-tile');
		if (tile && e.detail === 0) open(tile, true);
	});

	/* ── peça sob o cursor ────────────────────────────────────── */
	main.addEventListener('pointerover', (e) => {
		if (drag?.moved || opened || e.pointerType === 'touch') return;
		const tile = e.target.closest('.dg-tile');
		if (tile) o.onActive(Number(tile.dataset.item));
	});
	main.addEventListener('pointerout', (e) => {
		if (!e.relatedTarget?.closest?.('.dg-tile')) o.onActive(null);
	});

	/* foco: gira a cúpula até a foto ficar de frente */
	main.addEventListener('focusin', (e) => {
		const tile = e.target.closest('.dg-tile');
		if (!tile || opened) return;
		const item = tile.parentElement;
		const x = Number(item.dataset.x);
		const y = Number(item.dataset.y);
		stopInertia();
		rot = { x: clamp(-unit * (y - 0.5), -maxV, maxV), y: wrapSigned(-unit * (x + 0.5)) };
		if (!o.reduced) {
			sphere.style.transition = 'transform .7s cubic-bezier(.16, 1, .3, 1)';
			setTimeout(() => (sphere.style.transition = ''), 720);
		}
		apply();
		o.onActive(Number(tile.dataset.item));
	});
	main.addEventListener('focusout', (e) => {
		if (!e.relatedTarget?.closest?.('.dg-tile')) o.onActive(null);
	});

	/* ── ampliar / fechar ─────────────────────────────────────── */
	function open(tile, byKeyboard) {
		if (opened) return;
		opened = true;
		openedByKeyboard = byKeyboard;
		current = tile;
		stopInertia();
		o.onActive(null);

		const thumb = tile.querySelector('img');
		cardImg.src = thumb.currentSrc || thumb.src;
		cardImg.alt = thumb.alt;
		const big = new Image();
		big.onload = () => {
			if (current === tile) cardImg.src = big.src;
		};
		big.src = tile.dataset.large;

		o.onOpen(tile);
		root.setAttribute('data-open', '');
		const from = tile.getBoundingClientRect();
		const to = media.getBoundingClientRect();
		tile.style.visibility = 'hidden';

		if (o.reduced) {
			root.setAttribute('data-shown', '');
		} else {
			media.style.transition = 'none';
			media.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
			media.getBoundingClientRect();
			requestAnimationFrame(() => {
				media.style.transition = `transform ${o.enlargeMs}ms cubic-bezier(.16, 1, .3, 1)`;
				media.style.transform = 'none';
				root.setAttribute('data-shown', '');
			});
		}
		closeBtn.focus({ preventScroll: true });
	}

	function close({ instant = false } = {}) {
		if (!opened || !current) return;
		const tile = current;
		root.removeAttribute('data-shown');
		const finish = () => {
			root.removeAttribute('data-open');
			media.style.transition = 'none';
			media.style.transform = '';
			tile.style.visibility = '';
			opened = false;
			current = null;
			o.onClose(tile);
			if (openedByKeyboard && !instant) {
				const target =
					tile.getAttribute('tabindex') === '-1'
						? root.querySelector(`.dg-tile[data-photo="${tile.dataset.photo}"]:not([tabindex="-1"])`)
						: tile;
				target?.focus({ preventScroll: true });
			}
		};
		if (o.reduced || instant) return finish();
		const from = media.getBoundingClientRect();
		const to = tile.getBoundingClientRect();
		const ms = Math.round(o.enlargeMs * 0.8);
		media.style.transition = `transform ${ms}ms cubic-bezier(.65, 0, .35, 1)`;
		media.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})`;
		setTimeout(finish, ms);
	}

	scrim.addEventListener('click', () => close());
	closeBtn.addEventListener('click', () => close());
	/* o CTA fecha na hora, antes da âncora rolar a página (fase de captura) */
	viewer.addEventListener(
		'click',
		(e) => {
			if (e.target.closest('[data-dg-cta]')) close({ instant: true });
		},
		true,
	);
	function onKey(e) {
		if (!opened) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'Tab') {
			/* mantém o foco dentro do cartão ampliado */
			const f = [...viewer.querySelectorAll('a[href], button')];
			const i = f.indexOf(document.activeElement);
			e.preventDefault();
			f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]?.focus();
		}
	}
	window.addEventListener('keydown', onKey);

	return {
		close,
		destroy() {
			stopInertia();
			ro.disconnect();
			main.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
			window.removeEventListener('keydown', onKey);
		},
	};
}
