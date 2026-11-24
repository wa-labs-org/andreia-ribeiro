/* ═══════════════════════════════════════════════════════════════
   IRIDESCÊNCIA EM CETIM — fundo WebGL2 da hero
   Porta em JS puro do componente React "Iridescence" (sem React).
   O desenho (laço de cossenos, campo de "mexer" com o cursor,
   redemoinho no clique, brilho sob o ponteiro) é o do original;
   a cor deixa de ser o arco-íris e passa a ser a paleta da seda
   do design system: base, dobra, brilho dourado e sombra.

   createIridescence(container, {
     colors: ['#FDF7E7', '#F9F1D8', '#C6AF6C', '#B19F6E'], // base, dobra, brilho, sombra
     satin: .55, shadow: .14,          // força do brilho e da sombra (como no ARSilk)
     speed, scale, detail, warp, rotation,
     mouseReact, amplitude, stir, sheen, clickSwirl, resolution
   }) → { destroy() }

   • movimento reduzido → um quadro parado, sem mexer nem redemoinho
   • sem WebGL2 → degradê em CSS no container
   • pausa fora da tela e quando nada se move
   ═══════════════════════════════════════════════════════════════ */

const VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uScale;
uniform float uRotation;
uniform int uDetail;
uniform float uWarp;
uniform sampler2D uField;
uniform float uStir;
uniform vec3 uPointer;
uniform float uSheen;
uniform vec4 uSwirls[6];
uniform vec3 uBase;
uniform vec3 uFold;
uniform vec3 uGold;
uniform vec3 uShade;
uniform float uSatin;
uniform float uShadow;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 aspect = uResolution / mr;
  vec2 st = vUv - texture(uField, vUv).rg * uStir;

  for (int k = 0; k < 6; k++) {
    vec4 swirl = uSwirls[k];
    if (swirl.w == 0.0) continue;
    vec2 delta = (st - swirl.xy) * aspect;
    float angle = swirl.w * exp(-dot(delta, delta) / (swirl.z * swirl.z));
    float ca = cos(angle);
    float sa = sin(angle);
    st = swirl.xy + vec2(ca * delta.x - sa * delta.y, sa * delta.x + ca * delta.y) / aspect;
  }

  vec2 uv = (st * 2.0 - 1.0) * aspect;
  float c = cos(uRotation);
  float s = sin(uRotation);
  uv = mat2(c, -s, s, c) * uv / uScale;
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5;
  float a = 0.0;
  for (int i = 0; i < 24; i++) {
    if (i >= uDetail) break;
    float fi = float(i);
    a += cos(fi - d - a * uv.x * uWarp);
    d += sin(uv.y * fi + a);
  }
  d += uTime * 0.5;
  vec3 irid = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  irid = cos(irid * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

  /* do arco-íris para o cetim: os canais viram corpo (dobra) e luz (brilho/sombra) */
  float body = clamp((dot(irid, vec3(0.2126, 0.7152, 0.0722)) - 0.54) / 0.46, 0.0, 1.0);
  float lit = clamp((irid.x - 0.54) / 0.46, 0.0, 1.0);
  vec3 col = mix(uBase, uFold, smoothstep(0.3, 0.8, body));
  col = mix(col, uGold, pow(lit, 5.0) * uSatin);
  col = mix(col, uShade, smoothstep(0.35, 1.0, 1.0 - lit) * uShadow);

  /* brilho dourado sob o ponteiro */
  vec2 toPointer = (vUv - uPointer.xy) * aspect;
  col = mix(col, uGold, clamp(uPointer.z * uSheen * exp(-dot(toPointer, toPointer) / 0.09), 0.0, 1.0));

  col += (hash(gl_FragCoord.xy) - 0.5) * 0.012; /* trama fina */
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const FIELD_COLUMNS = 48;
const MAX_SWIRLS = 6;
const SWIRL_LIFE = 3.2;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const hex = (h) => {
	const s = h.replace('#', '');
	return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};

const compile = (gl, type, source) => {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
	gl.deleteShader(shader);
	return null;
};

export function createIridescence(root, options = {}) {
	const o = {
		colors: ['#FDF7E7', '#F9F1D8', '#C6AF6C', '#B19F6E'],
		satin: 0.55,
		shadow: 0.14,
		speed: 1,
		scale: 1,
		detail: 8,
		warp: 1,
		rotation: 0,
		mouseReact: true,
		amplitude: 0.1,
		stir: 0.5,
		sheen: 0.3,
		clickSwirl: true,
		resolution: 1,
		...options,
	};
	o.scale = Math.max(0.05, o.scale);
	o.detail = clamp(Math.round(o.detail), 1, 24);
	o.resolution = clamp(o.resolution, 0.1, 2);
	const palette = o.colors.map(hex);

	const canvas = document.createElement('canvas');
	canvas.setAttribute('aria-hidden', 'true');
	canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%';
	root.appendChild(canvas);

	const fallback = () => {
		canvas.remove();
		const [c0, c1, c2] = o.colors;
		root.style.background = `linear-gradient(115deg, ${c0} 0%, ${c1} 45%, ${c2} 52%, ${c1} 60%, ${c0} 100%)`;
		return { destroy() {} };
	};

	const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
	if (!gl) return fallback();

	const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
	const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
	const program = gl.createProgram();
	if (!vertex || !fragment || !program) return fallback();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fallback();
	gl.useProgram(program);

	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const position = gl.getAttribLocation(program, 'aPosition');
	gl.enableVertexAttribArray(position);
	gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

	const U = {};
	[
		'uResolution', 'uTime', 'uMouse', 'uAmplitude', 'uScale', 'uRotation', 'uDetail', 'uWarp',
		'uField', 'uStir', 'uPointer', 'uSheen', 'uSwirls',
		'uBase', 'uFold', 'uGold', 'uShade', 'uSatin', 'uShadow',
	].forEach((name) => (U[name] = gl.getUniformLocation(program, name)));

	/* uniformes fixos */
	gl.uniform3fv(U.uBase, palette[0]);
	gl.uniform3fv(U.uFold, palette[1]);
	gl.uniform3fv(U.uGold, palette[2]);
	gl.uniform3fv(U.uShade, palette[3]);
	gl.uniform1f(U.uSatin, o.satin);
	gl.uniform1f(U.uShadow, o.shadow);
	gl.uniform1f(U.uAmplitude, o.amplitude);
	gl.uniform1f(U.uScale, o.scale);
	gl.uniform1f(U.uRotation, (o.rotation * Math.PI) / 180);
	gl.uniform1i(U.uDetail, o.detail);
	gl.uniform1f(U.uWarp, o.warp);
	gl.uniform1f(U.uStir, o.mouseReact ? o.stir : 0);
	gl.uniform1f(U.uSheen, o.sheen);

	const fieldTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.uniform1i(U.uField, 0);

	const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const pointer = { x: 0.5, y: 0.5, inside: false, tracked: false };
	const state = {
		width: 1,
		height: 1,
		phase: Math.random() * 40, // cada visita começa numa dobra diferente
		mouse: [0.5, 0.5],
		presence: 0,
		cols: 0,
		rows: 0,
		field: new Float32Array(0),
		scratch: new Float32Array(0),
		fieldActive: false,
		swirls: [],
	};
	const swirlData = new Float32Array(MAX_SWIRLS * 4);
	let raf = 0;
	let last = 0;
	let visible = true;
	let alive = true;

	const layoutField = () => {
		const cols = FIELD_COLUMNS;
		const rows = clamp(Math.round((cols * state.height) / state.width), 6, 96);
		if (cols === state.cols && rows === state.rows) return;
		state.cols = cols;
		state.rows = rows;
		state.field = new Float32Array(cols * rows * 2);
		state.scratch = new Float32Array(cols * rows * 2);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, cols, rows, 0, gl.RG, gl.FLOAT, state.field);
	};

	/* o cursor "mexe" o tecido: empurra um campo de deslocamento */
	const brush = (x, y, dx, dy) => {
		const { cols, rows, field } = state;
		const radius = 0.22;
		const aspect = state.width / state.height;
		const fromCol = Math.max(0, Math.floor((x - radius / aspect) * cols));
		const toCol = Math.min(cols - 1, Math.ceil((x + radius / aspect) * cols));
		const fromRow = Math.max(0, Math.floor((y - radius) * rows));
		const toRow = Math.min(rows - 1, Math.ceil((y + radius) * rows));
		for (let row = fromRow; row <= toRow; row++) {
			for (let col = fromCol; col <= toCol; col++) {
				const ox = ((col + 0.5) / cols - x) * aspect;
				const oy = (row + 0.5) / rows - y;
				const t = 1 - (ox * ox + oy * oy) / (radius * radius);
				if (t <= 0) continue;
				const i = (row * cols + col) * 2;
				const px = field[i] + dx * t * t * 3.2;
				const py = field[i + 1] + dy * t * t * 3.2;
				const length = Math.hypot(px, py);
				const limit = 0.4;
				const k = length > 0 ? (limit * Math.tanh(length / limit)) / length : 0;
				field[i] = px * k;
				field[i + 1] = py * k;
			}
		}
		state.fieldActive = true;
	};

	/* o tecido volta ao lugar aos poucos */
	const relaxField = (dt) => {
		const { cols, rows, field, scratch } = state;
		const decay = Math.exp(-dt * 1.4);
		let peak = 0;
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const i = (row * cols + col) * 2;
				const l = (row * cols + Math.max(0, col - 1)) * 2;
				const r = (row * cols + Math.min(cols - 1, col + 1)) * 2;
				const u = (Math.max(0, row - 1) * cols + col) * 2;
				const b = (Math.min(rows - 1, row + 1) * cols + col) * 2;
				for (let c = 0; c < 2; c++) {
					const value = (field[i + c] * 12 + field[l + c] + field[r + c] + field[u + c] + field[b + c]) / 16;
					scratch[i + c] = value * decay;
					peak = Math.max(peak, Math.abs(scratch[i + c]));
				}
			}
		}
		field.set(scratch);
		if (peak < 0.0004) {
			field.fill(0);
			state.fieldActive = false;
		}
	};

	const render = () => {
		layoutField();
		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, fieldTexture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, state.cols, state.rows, gl.RG, gl.FLOAT, state.field);
		swirlData.fill(0);
		state.swirls.forEach((swirl, k) => {
			const radius = 0.21 * (1 + 0.4 * swirl.age);
			const ease = Math.exp(-swirl.age * 1.35) - Math.exp(-swirl.age * 10);
			const fade = Math.min(1, (SWIRL_LIFE - swirl.age) / 0.8);
			swirlData.set([swirl.x, swirl.y, radius, 3 * ease * fade * (0.21 / radius) ** 2], k * 4);
		});
		gl.uniform2f(U.uResolution, state.width, state.height);
		gl.uniform1f(U.uTime, state.phase);
		gl.uniform2f(U.uMouse, state.mouse[0], state.mouse[1]);
		gl.uniform3f(U.uPointer, pointer.x, pointer.y, o.mouseReact ? state.presence : 0);
		gl.uniform4fv(U.uSwirls, swirlData);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	};

	const frame = (now) => {
		raf = 0;
		if (!alive || !visible) return;
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
		last = now;
		const moving = !reduce;
		if (moving) state.phase += dt * o.speed;
		const target = o.mouseReact && pointer.tracked ? [pointer.x, pointer.y] : [0.5, 0.5];
		const follow = 1 - Math.exp(-dt * 5);
		state.mouse[0] += (target[0] - state.mouse[0]) * follow;
		state.mouse[1] += (target[1] - state.mouse[1]) * follow;
		state.presence += ((pointer.inside ? 1 : 0) - state.presence) * (1 - Math.exp(-dt * 4));
		if (state.fieldActive) relaxField(dt);
		state.swirls = state.swirls.filter((swirl) => (swirl.age += dt) < SWIRL_LIFE);
		render();
		const settling =
			Math.abs(target[0] - state.mouse[0]) > 0.0005 ||
			Math.abs(target[1] - state.mouse[1]) > 0.0005 ||
			Math.abs((pointer.inside ? 1 : 0) - state.presence) > 0.002;
		if (moving || settling || state.fieldActive || state.swirls.length) raf = requestAnimationFrame(frame);
		else last = 0;
	};

	const wake = () => {
		if (raf || !alive || !visible) return;
		raf = requestAnimationFrame(frame);
	};

	const locate = (event) => {
		const rect = root.getBoundingClientRect();
		return {
			x: (event.clientX - rect.left) / Math.max(1, rect.width),
			y: 1 - (event.clientY - rect.top) / Math.max(1, rect.height),
		};
	};

	const onPointerMove = (event) => {
		const { x, y } = locate(event);
		const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
		if (inside && o.mouseReact && !reduce && pointer.inside && o.stir > 0) brush(x, y, x - pointer.x, y - pointer.y);
		pointer.x = x;
		pointer.y = y;
		pointer.inside = inside;
		if (inside) pointer.tracked = true;
		wake();
	};

	const onPointerLeave = () => {
		pointer.inside = false;
		wake();
	};

	/* clique: redemoinho no tecido */
	const onPointerDown = (event) => {
		if (!o.clickSwirl || reduce) return;
		const { x, y } = locate(event);
		if (x < 0 || x > 1 || y < 0 || y > 1) return;
		if (state.swirls.length >= MAX_SWIRLS) {
			if (state.swirls[0].age < SWIRL_LIFE - 0.4) return;
			state.swirls.shift();
		}
		state.swirls.push({ x, y, age: 0 });
		wake();
	};

	const resize = () => {
		const dpr = Math.min(window.devicePixelRatio || 1, 2) * o.resolution;
		state.width = Math.max(1, root.clientWidth);
		state.height = Math.max(1, root.clientHeight);
		canvas.width = Math.max(1, Math.round(state.width * dpr));
		canvas.height = Math.max(1, Math.round(state.height * dpr));
		render();
		wake();
	};

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(root);
	const visibility = new IntersectionObserver((entries) => {
		visible = entries.some((entry) => entry.isIntersecting);
		if (visible) {
			last = 0;
			wake();
		}
	});
	visibility.observe(root);
	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerdown', onPointerDown, { passive: true });
	document.documentElement.addEventListener('pointerleave', onPointerLeave);
	resize();

	return {
		destroy() {
			alive = false;
			cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			visibility.disconnect();
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			document.documentElement.removeEventListener('pointerleave', onPointerLeave);
			gl.deleteTexture(fieldTexture);
			gl.deleteBuffer(buffer);
			gl.deleteProgram(program);
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
			canvas.remove();
		},
	};
}
