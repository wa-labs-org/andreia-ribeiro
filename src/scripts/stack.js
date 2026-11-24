/* ═══════════════════════════════════════════════════════════════
   MONTE DE FOTOS (Stack) — porta em JS puro do componente React
   "Stack" (sem React e sem Motion). Mantém o comportamento:
   cartas em leque, arrastar/“peteleco” a de cima para mandá-la ao
   fim do monte, inclinação 3D ao arrastar, teclado (Enter, espaço,
   setas) e física de molas — aqui num animador de molas próprio.

   createStack(root, { layout, visible, spread, depth, tilt,
                       threshold, speed, sendToBackOnClick, onChange })
     root: elemento com filhos .stack-card > .stack-card-face
           (> .stack-card-content e .stack-card-shade)
   → { start(), next(), destroy() }
     start(): abre o leque (a entrada); chame quando entrar na tela.
   ═══════════════════════════════════════════════════════════════ */

const ORIGINS = { fan: [0.9, 0.9], cascade: [0.5, 0.5], deck: [0.5, 0], pile: [0.5, 0.5] };
const EXITS = { fan: [1, -0.3], cascade: [0.8, 0.6], deck: [0, 1] };
const CLICK_SLOP = 6;
const FLICK_SPEED = 650;
const LEAN_SPEED = 1300;
const LEAN_REACH = 260;
const PRESS_SCALE = 1.035;
const SPRINGS = {
	place: [260, 24],
	settle: [320, 34],
	tuck: [240, 28],
	face: [240, 30],
	lean: [240, 28],
	press: [420, 34],
	fling: [650, 42],
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const mix = (a, b, t) => a + (b - a) * t;
const noise = (seed) => {
	const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
	return v - Math.floor(v);
};

const placement = (layout, position, card, spread, depth) => {
	if (layout === 'cascade')
		return { x: -position * spread * 28, y: -position * spread * 28, rotate: 0, scale: 1 - position * depth * 0.07 };
	if (layout === 'deck') return { x: 0, y: -position * spread * 32, rotate: 0, scale: 1 - position * depth * 0.1 };
	if (layout === 'pile')
		return {
			x: (noise(card + 1) - 0.5) * spread * 56,
			y: (noise(card + 2) - 0.5) * spread * 44,
			rotate: (noise(card + 3) - 0.5) * spread * 40,
			scale: 1 - position * depth * 0.03,
		};
	return { x: 0, y: 0, rotate: position * spread * 8, scale: 1 - position * depth * 0.12 };
};

const releaseVelocity = (samples, time) => {
	const recent = samples.filter((s) => time - s[2] <= 100);
	if (recent.length < 2) return [0, 0];
	const first = recent[0];
	const last = recent[recent.length - 1];
	const elapsed = Math.max((last[2] - first[2]) / 1000, 0.008);
	return [(last[0] - first[0]) / elapsed, (last[1] - first[1]) / elapsed];
};

/* ── animador de molas: valores animáveis com uma única rAF ── */
function createAnimator(onFrame) {
	const active = new Set();
	let raf = 0;
	let last = 0;
	let dirty = false;

	const tick = (now) => {
		raf = 0;
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
		last = now;
		for (const val of active) {
			const a = val.anim;
			if (now < a.startAt) continue;
			if (a.kind === 'tween') {
				if (a.from === null) a.from = val.v;
				const p = a.dur > 0 ? Math.min(1, (now - a.startAt) / a.dur) : 1;
				const prev = val.v;
				val.v = a.from + (a.to - a.from) * (1 - (1 - p) * (1 - p)); // easeOut
				val.vel = (val.v - prev) / dt;
				if (p >= 1) finish(val);
			} else {
				const steps = Math.max(1, Math.ceil(dt * 240));
				const h = dt / steps;
				for (let i = 0; i < steps; i++) {
					const acc = -a.k * (val.v - a.to) - a.c * val.vel;
					val.vel += acc * h;
					val.v += val.vel * h;
				}
				if (Math.abs(val.vel) < a.restSpeed && Math.abs(val.v - a.to) < a.restDelta) finish(val);
			}
		}
		dirty = false;
		onFrame();
		if (active.size || dirty) raf = requestAnimationFrame(tick);
		else last = 0;
	};
	const finish = (val) => {
		val.v = val.anim.to;
		val.vel = 0;
		val.anim = null;
		active.delete(val);
	};
	const kick = () => {
		dirty = true;
		if (!raf) raf = requestAnimationFrame(tick);
	};

	const value = (initial) => {
		const val = {
			v: initial,
			vel: 0,
			anim: null,
			get: () => val.v,
			getVelocity: () => val.vel,
			set: (v) => {
				val.stop();
				val.v = v;
				kick();
			},
			stop: () => {
				if (val.anim) {
					val.anim = null;
					active.delete(val);
				}
			},
		};
		return val;
	};

	const animate = (val, to, t) => {
		const startAt = performance.now() + (t.delay || 0) * 1000;
		if (t.type === 'spring') {
			val.anim = { kind: 'spring', to, k: t.stiffness, c: t.damping, restDelta: t.restDelta ?? 0.01, restSpeed: t.restSpeed ?? 0.5, startAt };
			if (t.velocity != null) val.vel = t.velocity;
		} else {
			val.anim = { kind: 'tween', from: null, to, dur: (t.duration || 0) * 1000, startAt };
		}
		active.add(val);
		kick();
	};

	const stopAll = () => {
		active.clear();
		cancelAnimationFrame(raf);
		raf = 0;
	};

	return { value, animate, kick, stopAll };
}

export function createStack(root, options = {}) {
	const cardEls = Array.from(root.querySelectorAll(':scope > .stack-card'));
	const count = cardEls.length;
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const layout = ORIGINS[options.layout] ? options.layout : 'fan';
	const s = {
		layout,
		visible: clamp(Math.round(options.visible ?? 4), 1, Math.max(count, 1)),
		spread: clamp(options.spread ?? 0.5, 0, 2),
		depth: clamp(options.depth ?? 0.5, 0, 1),
		tilt: clamp(options.tilt ?? 30, 0, 89),
		threshold: Math.max(options.threshold ?? 90, 0),
		speed: clamp(options.speed ?? 1, 0.2, 4),
		sendToBackOnClick: !!options.sendToBackOnClick,
		count,
		reduceMotion,
	};
	const onChange = options.onChange;

	let order = Array.from({ length: count }, (_, i) => i);
	let started = false;
	let alive = true;
	let drag = null;
	const flying = new Map();
	const [originX, originY] = ORIGINS[layout];

	const cards = cardEls.map((el) => ({
		el,
		face: el.querySelector('.stack-card-face'),
		shadeEl: el.querySelector('.stack-card-shade'),
	}));

	const render = () => {
		cards.forEach((c, i) => {
			const v = values[i];
			c.el.style.transform = `translateX(${v.x.get()}px) translateY(${v.y.get()}px) scale(${v.scale.get()}) rotate(${v.rotate.get()}deg)`;
			c.el.style.zIndex = String(Math.round(v.z.get()));
			c.el.style.opacity = String(v.opacity.get());
			c.face.style.transformOrigin = `${v.grabX.get() * 100}% ${v.grabY.get() * 100}%`;
			c.face.style.transform = `perspective(800px) scale(${v.lift.get()}) rotate(${v.spin.get()}deg) rotateX(${v.tiltX.get()}deg) rotateY(${v.tiltY.get()}deg)`;
			if (c.shadeEl) c.shadeEl.style.opacity = String(v.shade.get());
		});
	};

	const anim = createAnimator(render);
	const { animate } = anim;

	/* posição inicial: tudo empilhado na posição 0 até o leque abrir (ou já no lugar, sem movimento) */
	const values = cards.map((_, index) => {
		const position = order.indexOf(index);
		const start = placement(layout, reduceMotion ? Math.min(position, s.visible - 1) : 0, index, s.spread, s.depth);
		return {
			x: anim.value(start.x),
			y: anim.value(start.y),
			rotate: anim.value(start.rotate),
			scale: anim.value(start.scale),
			tiltX: anim.value(0),
			tiltY: anim.value(0),
			spin: anim.value(0),
			lift: anim.value(1),
			grabX: anim.value(0.5),
			grabY: anim.value(0.5),
			z: anim.value(count - position),
			opacity: anim.value(position < s.visible ? 1 : 0),
			shade: anim.value(0),
		};
	});

	cards.forEach((c) => {
		c.el.style.transformOrigin = `${originX * 100}% ${originY * 100}%`;
	});

	const springFor = (kind, extra = {}) => {
		if (s.reduceMotion) return { duration: 0.2, delay: extra.delay || 0 };
		const [stiffness, damping] = SPRINGS[kind];
		return { type: 'spring', stiffness: stiffness * s.speed * s.speed, damping: damping * s.speed, restDelta: 0.01, restSpeed: 0.5, ...extra };
	};

	const settleFace = (v, delay = 0) => {
		const t = springFor('face', { delay });
		animate(v.tiltX, 0, t);
		animate(v.tiltY, 0, t);
		animate(v.spin, 0, t);
		animate(v.lift, 1, t);
	};

	const placeCard = (index, position, { delay = 0, lift = 0, kind = 'place', velocity = null, keepZ = false } = {}) => {
		const v = values[index];
		const shown = Math.min(position, s.visible - 1);
		const target = placement(layout, shown, index, s.spread, s.depth);
		if (lift > 0 && shown > 0) {
			const ahead = placement(layout, shown - 1, index, s.spread, s.depth);
			target.x = mix(target.x, ahead.x, lift);
			target.y = mix(target.y, ahead.y, lift);
			target.rotate = mix(target.rotate, ahead.rotate, lift);
			target.scale = mix(target.scale, ahead.scale, lift);
		}
		const spring = springFor(kind, { delay });
		const fade = { duration: s.reduceMotion ? 0.2 : 0.35 / s.speed, delay };
		if (!keepZ) v.z.set(count - position);
		animate(v.x, target.x, velocity ? { ...spring, velocity: velocity[0] } : spring);
		animate(v.y, target.y, velocity ? { ...spring, velocity: velocity[1] } : spring);
		animate(v.rotate, target.rotate, spring);
		animate(v.scale, target.scale, spring);
		settleFace(v, delay);
		animate(v.opacity, position < s.visible ? 1 : 0, fade);
		animate(v.shade, Math.min(0.6, shown * s.depth * 0.14 * (1 - lift)), fade);
	};

	const placeAll = ({ stagger = 0, lift = 0, released = -1, velocity = null, kind = 'place' } = {}) => {
		order.forEach((index, position) => {
			const flight = flying.get(index);
			if (flight && !flight.turned) return;
			if (drag && drag.moved && drag.card === index) return;
			const isReleased = index === released;
			placeCard(index, position, {
				delay: position * stagger,
				lift: position > 0 ? lift : 0,
				kind: flight ? 'tuck' : isReleased ? 'settle' : kind,
				velocity: isReleased ? velocity : null,
				keepZ: !!flight,
			});
		});
	};

	const syncTop = () => {
		cards.forEach((c, i) => {
			const isTop = order[0] === i;
			c.el.toggleAttribute('data-top', isTop);
			if (isTop) c.el.removeAttribute('aria-hidden');
			else c.el.setAttribute('aria-hidden', 'true');
			c.el.style.touchAction = isTop ? 'pan-y' : 'auto';
		});
	};

	const commit = (next) => {
		const prevTop = order[0];
		order = next;
		syncTop();
		if (started) placeAll();
		if (order[0] !== prevTop) onChange?.(order[0]);
	};

	const sendToBack = (direction, velocity = null) => {
		if (order.length < 2) return;
		const top = order[0];
		if (flying.has(top)) return;
		const next = [...order.slice(1), top];
		if (s.reduceMotion) {
			commit(next);
			return;
		}
		let [dx, dy] = direction || EXITS[layout] || [Math.cos(noise(top + 9) * 6.283), Math.sin(noise(top + 9) * 6.283)];
		const length = Math.hypot(dx, dy) || 1;
		dx /= length;
		dy /= length;
		const bounds = root.getBoundingClientRect();
		const width = bounds.width || 240;
		const height = bounds.height || 240;
		const clearance = Math.min(width / Math.max(Math.abs(dx), 0.01), height / Math.max(Math.abs(dy), 0.01));
		const home = placement(layout, 0, top, s.spread, s.depth);
		const travel = clearance * 1.12 + 40;
		const out = [home.x + dx * travel, home.y + dy * travel];
		const v = values[top];
		const launch = springFor('fling');
		const flight = { turned: false };
		flying.set(top, flight);
		v.z.set(count + 1);
		animate(v.x, out[0], velocity ? { ...launch, velocity: velocity[0] } : launch);
		animate(v.y, out[1], velocity ? { ...launch, velocity: velocity[1] } : launch);
		settleFace(v);
		commit(next);
		const span = Math.max(Math.hypot(out[0] - v.x.get(), out[1] - v.y.get()), 1);
		let landed = false;
		const turn = () => {
			flight.turned = true;
			const position = order.indexOf(top);
			if (position >= 0) placeCard(top, position, { kind: 'tuck', keepZ: !landed });
		};
		const land = () => {
			landed = true;
			if (flying.get(top) === flight) flying.delete(top);
			const position = order.indexOf(top);
			if (position >= 0) v.z.set(count - position);
		};
		const fallback = setTimeout(() => {
			if (!flight.turned) turn();
			if (!landed) land();
		}, 1500 / s.speed);
		const clearOfPile = () => {
			const mine = cards[top].el.getBoundingClientRect();
			for (let i = 0; i < count; i++) {
				if (i === top || flying.has(i) || values[i].opacity.get() < 0.5) continue;
				const box = cards[i].el.getBoundingClientRect();
				if (mine.left < box.right && mine.right > box.left && mine.top < box.bottom && mine.bottom > box.top) return false;
			}
			return true;
		};
		const watch = () => {
			if (!alive || (flight.turned && landed)) {
				clearTimeout(fallback);
				return;
			}
			const x = v.x.get();
			const y = v.y.get();
			const outward = v.x.getVelocity() * dx + v.y.getVelocity() * dy;
			if (!flight.turned && (Math.hypot(out[0] - x, out[1] - y) <= span * 0.06 || outward < 0)) turn();
			if (!landed && (clearOfPile() || (flight.turned && outward < 0))) land();
			requestAnimationFrame(watch);
		};
		requestAnimationFrame(watch);
	};

	/* inclinação 3D enquanto arrasta */
	const lean = (d) => {
		if (s.reduceMotion) return;
		const v = values[d.card];
		const offsetX = v.x.get() - d.homeX;
		const offsetY = v.y.get() - d.homeY;
		const sideways = clamp(d.vx / LEAN_SPEED, -1, 1) * 0.7 + clamp(offsetX / LEAN_REACH, -1, 1) * 0.3;
		const upward = clamp(-d.vy / LEAN_SPEED, -1, 1) * 0.7 + clamp(-offsetY / LEAN_REACH, -1, 1) * 0.3;
		const follow = springFor('lean');
		animate(v.tiltY, sideways * s.tilt, follow);
		animate(v.tiltX, upward * s.tilt, follow);
		animate(v.spin, clamp(offsetX / LEAN_REACH, -1, 1) * 6, follow);
	};

	const onMove = (event) => {
		const d = drag;
		if (!d || event.pointerId !== d.id) return;
		const dx = event.clientX - d.startX;
		const dy = event.clientY - d.startY;
		const v = values[d.card];
		if (!d.moved) {
			if (Math.hypot(dx, dy) < CLICK_SLOP) return;
			d.moved = true;
			v.x.stop();
			v.y.stop();
			d.originX = v.x.get() - dx;
			d.originY = v.y.get() - dy;
			try {
				d.element.setPointerCapture(d.id);
			} catch {
				/* sem captura */
			}
			root.classList.add('is-dragging');
		}
		v.x.set(d.originX + dx);
		v.y.set(d.originY + dy);
		d.samples.push([event.clientX, event.clientY, event.timeStamp]);
		if (d.samples.length > 12) d.samples.shift();
		[d.vx, d.vy] = releaseVelocity(d.samples, event.timeStamp);
		lean(d);
		clearTimeout(d.idle);
		d.idle = setTimeout(() => {
			if (drag !== d) return;
			d.vx = 0;
			d.vy = 0;
			lean(d);
		}, 70);
		const progress = clamp(Math.hypot(dx, dy) / Math.max(s.threshold, 1), 0, 1);
		if (Math.abs(progress - d.progress) > 0.02) {
			d.progress = progress;
			placeAll({ lift: progress * 0.4, kind: 'settle' });
		}
	};

	const onUp = (event) => {
		const d = drag;
		if (!d || event.pointerId !== d.id) return;
		drag = null;
		clearTimeout(d.idle);
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', onUp);
		window.removeEventListener('pointercancel', onUp);
		try {
			d.element.releasePointerCapture(d.id);
		} catch {
			/* sem captura */
		}
		if (!d.moved) {
			if (event.type === 'pointerup' && s.sendToBackOnClick) sendToBack(null);
			else settleFace(values[d.card]);
			return;
		}
		root.classList.remove('is-dragging');
		const dx = event.clientX - d.startX;
		const dy = event.clientY - d.startY;
		const [vx, vy] = releaseVelocity(d.samples, event.timeStamp);
		const distance = Math.hypot(dx, dy);
		const pace = Math.hypot(vx, vy);
		const flick = pace > FLICK_SPEED && distance > 16 && vx * dx + vy * dy > 0;
		if (event.type === 'pointerup' && count > 1 && (distance > s.threshold || flick)) {
			sendToBack(pace > 300 ? [vx, vy] : [dx, dy], [vx, vy]);
		} else {
			placeAll({ released: d.card, velocity: [clamp(vx, -3000, 3000), clamp(vy, -3000, 3000)] });
		}
	};

	const onDown = (event, index) => {
		if (event.button !== 0 || drag) return;
		if (order[0] !== index || flying.has(index)) return;
		const v = values[index];
		const home = placement(layout, 0, index, s.spread, s.depth);
		const bounds = event.currentTarget.getBoundingClientRect();
		v.grabX.set(clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1), 0, 1));
		v.grabY.set(clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1), 0, 1));
		if (!s.reduceMotion) animate(v.lift, PRESS_SCALE, springFor('press'));
		drag = {
			card: index,
			id: event.pointerId,
			element: event.currentTarget,
			startX: event.clientX,
			startY: event.clientY,
			originX: 0,
			originY: 0,
			homeX: home.x,
			homeY: home.y,
			vx: 0,
			vy: 0,
			idle: 0,
			moved: false,
			progress: 0,
			samples: [[event.clientX, event.clientY, event.timeStamp]],
		};
		if (event.pointerType === 'mouse') event.preventDefault();
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
	};

	const onKeyDown = (event) => {
		if (event.target !== root) return;
		if (['ArrowRight', 'ArrowDown', 'Enter', ' '].includes(event.key)) {
			event.preventDefault();
			sendToBack(null);
		}
	};

	const downHandlers = cards.map((c, i) => {
		const h = (e) => onDown(e, i);
		c.el.addEventListener('pointerdown', h);
		return h;
	});
	root.addEventListener('keydown', onKeyDown);
	syncTop();
	render();

	return {
		/* abre o leque: as cartas saem da posição 0 em sequência */
		start() {
			if (started) return;
			started = true;
			placeAll({ stagger: s.reduceMotion ? 0 : 0.06 });
		},
		next: () => sendToBack(null),
		destroy() {
			alive = false;
			anim.stopAll();
			cards.forEach((c, i) => c.el.removeEventListener('pointerdown', downHandlers[i]));
			root.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		},
	};
}
