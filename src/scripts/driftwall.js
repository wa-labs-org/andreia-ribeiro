/* ═══════════════════════════════════════════════════════════════
   PAREDE À DERIVA (DriftWall) — porta em JS puro do componente React
   "DriftWall" (sem React). Mantém o comportamento: colunas de fotos
   num plano inclinado em 3D, cada coluna deslizando em sentido
   alternado e com velocidade própria; a coluna sob o cursor freia e a
   foto ativa sobe (translateZ) e ganha cor; o plano acompanha o cursor
   (paralaxe) com amortecimento.

   createDriftWall(root, {
     tilt, turn, roll, depth,          // inclinação do plano (graus) e recuo (px)
     speed, direction, variance,       // px/s, 'up' | 'down', variação entre colunas
     parallax, gap, aspect,            // força da paralaxe, espaço entre fotos, altura/largura
     reduced,                          // sem deriva e sem paralaxe
     onActive(item | null)             // índice (data-item) da peça ativa
   }) → { destroy() }

   root: .dw-wall > .dw-plane > .dw-col > .dw-track > .dw-tile[data-item]
   Os tiles do HTML são a cópia original (focável); as demais cópias são
   clonadas aqui, ocultas de leitores de tela e fora da ordem de tabulação.
   ═══════════════════════════════════════════════════════════════ */

const columnFactor = (index, variance) => {
	const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
	return 1 + variance * pseudo;
};

export function createDriftWall(root, options = {}) {
	const o = {
		tilt: 16,
		turn: -14,
		roll: 0,
		depth: 120,
		speed: 42,
		direction: 'up',
		variance: 0.45,
		parallax: 0.6,
		gap: 18,
		aspect: 4 / 3,
		reduced: false,
		onActive: () => {},
		...options,
	};

	const plane = root.querySelector('.dw-plane');
	const tracks = [...root.querySelectorAll('.dw-track')];
	const originals = tracks.map((t) => [...t.children]);
	const dirSign = o.direction === 'up' ? 1 : -1;
	const baseVel = tracks.map((_, c) => o.speed * columnFactor(c, o.variance) * dirSign * (c % 2 === 0 ? 1 : -1));

	let meta = [];
	let offsets = [];
	const vel = tracks.map(() => 0);
	let hoveredCol = -1;
	let activeKey = null;
	const pointer = { x: 0, y: 0 };
	const damped = { x: 0, y: 0 };
	let raf = 0;
	let last = null;
	let visible = true;

	/* ── medidas e cópias ─────────────────────────────────────── */
	function layout() {
		const w = root.clientWidth;
		const h = root.clientHeight || 600;
		const tileW = Math.round(Math.min(220, Math.max(118, w / 5.4)));
		const tileH = Math.round(tileW * o.aspect);
		root.style.setProperty('--dw-tile-w', `${tileW}px`);
		root.style.setProperty('--dw-tile-h', `${tileH}px`);
		root.style.setProperty('--dw-gap', `${o.gap}px`);
		const unit = tileH + o.gap;

		meta = originals.map((items, c) => {
			const copyHeight = Math.max(unit, items.length * unit);
			const copies = Math.max(2, Math.ceil((h * 1.6) / copyHeight) + 1);
			tracks[c].querySelectorAll('[data-dw-clone]').forEach((n) => n.remove());
			for (let k = 1; k < copies; k++) {
				items.forEach((item) => {
					const n = item.cloneNode(true);
					n.setAttribute('data-dw-clone', '');
					n.setAttribute('aria-hidden', 'true');
					n.setAttribute('tabindex', '-1');
					n.classList.remove('is-active');
					tracks[c].appendChild(n);
				});
			}
			return { copyHeight, unit };
		});
		offsets = meta.map((m, c) => offsets[c] ?? m.copyHeight * ((c * 0.37) % 1));
		paint();
	}

	function applyPlane() {
		plane.style.transform =
			`translate(-50%, -50%) scale(1.18) ` +
			`rotateX(${o.tilt + damped.y}deg) rotateY(${o.turn + damped.x}deg) rotateZ(${o.roll}deg) ` +
			`translateZ(${-o.depth}px)`;
	}

	function paint() {
		applyPlane();
		tracks.forEach((t, c) => {
			const m = meta[c];
			if (!m) return;
			offsets[c] = ((offsets[c] % m.copyHeight) + m.copyHeight) % m.copyHeight;
			t.style.transform = `translate3d(0, ${-offsets[c]}px, 0)`;
		});
	}

	/* ── laço ─────────────────────────────────────────────────── */
	function frame(ts) {
		if (last === null) last = ts;
		const dt = Math.min(0.05, Math.max(0, ts - last) / 1000);
		last = ts;

		const maxTilt = o.parallax * 8;
		const damp = 1 - Math.exp(-dt / 0.12);
		damped.x += (pointer.x * maxTilt - damped.x) * damp;
		damped.y += (-pointer.y * maxTilt - damped.y) * damp;

		for (let c = 0; c < tracks.length; c++) {
			const target = hoveredCol === c ? 0 : baseVel[c];
			const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
			vel[c] += (target - vel[c]) * ease;
			offsets[c] += vel[c] * dt;
		}
		paint();
		raf = requestAnimationFrame(frame);
	}
	const start = () => {
		if (o.reduced || raf || !visible) return;
		last = null;
		raf = requestAnimationFrame(frame);
	};
	const stop = () => {
		cancelAnimationFrame(raf);
		raf = 0;
	};

	/* ── peça ativa ───────────────────────────────────────────── */
	function setActive(col, item, tiles) {
		const key = col < 0 ? null : `${col}:${item}`;
		if (key === activeKey) return;
		activeKey = key;
		hoveredCol = col;
		root.querySelectorAll('.dw-tile.is-active').forEach((t) => t.classList.remove('is-active'));
		tiles?.forEach((t) => t.classList.add('is-active'));
		o.onActive(col < 0 ? null : item);
	}
	const release = () => setActive(-1, null, null);

	function onPointerMove(e) {
		const r = root.getBoundingClientRect();
		if (!o.reduced && o.parallax > 0) {
			pointer.x = (e.clientX - r.left) / r.width - 0.5;
			pointer.y = (e.clientY - r.top) / r.height - 0.5;
		}
		if (e.pointerType === 'touch') return;
		const hit = document.elementFromPoint(e.clientX, e.clientY);
		const tile = hit?.closest?.('.dw-tile');
		if (!tile || !root.contains(tile)) return;
		const col = Number(tile.dataset.col);
		setActive(col, Number(tile.dataset.item), [tile]);
	}
	function onPointerLeave() {
		pointer.x = 0;
		pointer.y = 0;
		release();
	}

	/* teclado: a peça focada (cópia original, talvez fora da vista) é trazida
	   para o centro da coluna pela cópia equivalente, e todas as cópias dela
	   na coluna ficam ativas */
	function onFocusIn(e) {
		const tile = e.target.closest?.('.dw-tile');
		if (!tile) return;
		const col = Number(tile.dataset.col);
		const item = Number(tile.dataset.item);
		const m = meta[col];
		if (m) {
			const trackH = tracks[col].offsetHeight;
			offsets[col] = tile.offsetTop + m.unit / 2 - trackH / 2;
			vel[col] = 0;
		}
		root.classList.add('is-keyboard');
		setActive(col, item, tracks[col].querySelectorAll(`.dw-tile[data-item="${item}"]`));
		paint();
	}
	function onFocusOut(e) {
		if (root.contains(e.relatedTarget)) return;
		root.classList.remove('is-keyboard');
		release();
	}

	root.addEventListener('pointermove', onPointerMove);
	root.addEventListener('pointerleave', onPointerLeave);
	root.addEventListener('focusin', onFocusIn);
	root.addEventListener('focusout', onFocusOut);

	const ro = new ResizeObserver(() => layout());
	ro.observe(root);
	const io = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		visible ? start() : stop();
	});
	io.observe(root);

	layout();
	start();

	return {
		destroy() {
			stop();
			ro.disconnect();
			io.disconnect();
			root.removeEventListener('pointermove', onPointerMove);
			root.removeEventListener('pointerleave', onPointerLeave);
			root.removeEventListener('focusin', onFocusIn);
			root.removeEventListener('focusout', onFocusOut);
		},
	};
}
