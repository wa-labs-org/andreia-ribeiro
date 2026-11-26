/* ═══════════════════════════════════════════════════════════════
   CALENDÁRIO DO DESIGN SYSTEM — escolha de data por cima de um <input>
   O <input type="date"> nativo abre o calendário do sistema, sem estilo
   possível. Aqui o <input> continua no formulário (escondido, com o valor
   em dd/mm/aaaa) e um botão + diálogo com a grade do mês fazem a interface
   no estilo do design system (.ar-date em ar.css).

   enhanceDate(input, { min }) → { destroy() }
     min: primeiro dia escolhível (padrão: hoje). Datas antes dele ficam
     desabilitadas.
     Teclado no calendário: setas (dias), Page Up/Down (meses),
     Home/End (início/fim da semana), Enter/Espaço escolhem, Esc fecha.
   ═══════════════════════════════════════════════════════════════ */

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const SEMANA = [
	['D', 'domingo'],
	['S', 'segunda-feira'],
	['T', 'terça-feira'],
	['Q', 'quarta-feira'],
	['Q', 'quinta-feira'],
	['S', 'sexta-feira'],
	['S', 'sábado'],
];

const semHora = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const mesmoDia = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMeses = (d, n) => {
	const alvo = new Date(d.getFullYear(), d.getMonth() + n, 1);
	const ultimo = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
	return new Date(alvo.getFullYear(), alvo.getMonth(), Math.min(d.getDate(), ultimo));
};
const curta = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
const extenso = (d) => `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

let uid = 0;

export function enhanceDate(input, options = {}) {
	const field = input.closest('.field');
	const label = field?.querySelector(`label[for="${input.id}"]`);
	const id = `ard-${++uid}`;
	const hoje = semHora(new Date());
	const min = semHora(options.min ?? hoje);

	field?.classList.add('ar-date');

	/* botão que mostra a data */
	const trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.id = `${id}-btn`;
	trigger.className = 'ar-date__trigger';
	trigger.setAttribute('aria-haspopup', 'dialog');
	trigger.setAttribute('aria-expanded', 'false');
	trigger.setAttribute('aria-controls', `${id}-cal`);
	if (label) {
		label.id ||= `${id}-label`;
		label.htmlFor = trigger.id;
		trigger.setAttribute('aria-labelledby', `${label.id} ${trigger.id}`);
	}
	const valueEl = document.createElement('span');
	valueEl.className = 'ar-date__value';
	trigger.append(valueEl);

	/* calendário */
	const cal = document.createElement('div');
	cal.id = `${id}-cal`;
	cal.className = 'ar-date__cal';
	cal.setAttribute('role', 'dialog');
	cal.setAttribute('aria-modal', 'false');
	cal.setAttribute('aria-label', 'Escolher a data do evento');
	cal.innerHTML = `
		<div class="ar-date__head">
			<button type="button" class="ar-date__nav" data-nav="-1" aria-label="Mês anterior"><ar-icon name="arrow-left"></ar-icon></button>
			<p class="ar-date__month" id="${id}-mes" aria-live="polite"></p>
			<button type="button" class="ar-date__nav" data-nav="1" aria-label="Próximo mês"><ar-icon name="arrow-right"></ar-icon></button>
		</div>
		<table class="ar-date__grid" role="grid" aria-labelledby="${id}-mes">
			<thead><tr>${SEMANA.map(([l, n]) => `<th scope="col" abbr="${n}"><span aria-hidden="true">${l}</span></th>`).join('')}</tr></thead>
			<tbody></tbody>
		</table>`;
	const mesEl = cal.querySelector('.ar-date__month');
	const tbody = cal.querySelector('tbody');
	const navPrev = cal.querySelector('[data-nav="-1"]');

	/* o <input> fica no formulário, fora da vista e fora do Tab */
	input.type = 'text';
	input.classList.add('ar-date__native');
	input.tabIndex = -1;
	input.readOnly = true;
	input.setAttribute('aria-hidden', 'true');
	input.after(trigger, cal);

	let aberto = false;
	let escolhido = null;
	let foco = min;

	/* lê um valor já existente (dd/mm/aaaa ou aaaa-mm-dd) */
	const ler = (v) => {
		let m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
		if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
		m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
		if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
		return null;
	};
	const sync = () => {
		escolhido = ler(input.value);
		valueEl.textContent = escolhido ? extenso(escolhido) : '';
		field?.classList.toggle('is-filled', !!escolhido);
	};

	const desenhar = () => {
		const ano = foco.getFullYear();
		const mes = foco.getMonth();
		mesEl.textContent = `${MESES[mes]} de ${ano}`;
		navPrev.disabled = ano < min.getFullYear() || (ano === min.getFullYear() && mes <= min.getMonth());
		const inicio = new Date(ano, mes, 1).getDay();
		const dias = new Date(ano, mes + 1, 0).getDate();
		let html = '';
		let dia = 1 - inicio;
		for (let semana = 0; semana < 6 && dia <= dias; semana++) {
			html += '<tr>';
			for (let c = 0; c < 7; c++, dia++) {
				if (dia < 1 || dia > dias) {
					html += '<td></td>';
					continue;
				}
				const d = new Date(ano, mes, dia);
				const passado = d < min;
				const atual = mesmoDia(d, foco);
				html += `<td><button type="button" class="ar-date__day" data-dia="${dia}"
					tabindex="${atual ? 0 : -1}"
					aria-label="${extenso(d)}"
					${mesmoDia(d, escolhido) ? 'aria-pressed="true"' : 'aria-pressed="false"'}
					${mesmoDia(d, hoje) ? 'aria-current="date"' : ''}
					${passado ? 'disabled' : ''}>${dia}</button></td>`;
			}
			html += '</tr>';
		}
		tbody.innerHTML = html;
	};
	const focarDia = () => tbody.querySelector('[tabindex="0"]')?.focus();
	const mover = (alvo) => {
		if (alvo < min) alvo = min;
		const trocouMes = alvo.getMonth() !== foco.getMonth() || alvo.getFullYear() !== foco.getFullYear();
		foco = alvo;
		if (trocouMes) desenhar();
		else
			tbody.querySelectorAll('.ar-date__day').forEach((b) => {
				b.tabIndex = +b.dataset.dia === foco.getDate() ? 0 : -1;
			});
		focarDia();
	};

	const escolher = (d) => {
		input.value = curta(d);
		input.dispatchEvent(new Event('change', { bubbles: true }));
		sync();
		fechar(true);
	};
	const abrir = () => {
		if (aberto) return;
		aberto = true;
		sync();
		foco = escolhido && escolhido >= min ? escolhido : min;
		desenhar();
		field?.classList.add('is-open');
		trigger.setAttribute('aria-expanded', 'true');
		document.addEventListener('pointerdown', fora, true);
		requestAnimationFrame(focarDia);
	};
	const fechar = (devolverFoco = false) => {
		if (!aberto) return;
		aberto = false;
		field?.classList.remove('is-open');
		trigger.setAttribute('aria-expanded', 'false');
		document.removeEventListener('pointerdown', fora, true);
		if (devolverFoco) trigger.focus();
	};
	const fora = (e) => {
		if (!field?.contains(e.target)) fechar();
	};

	trigger.addEventListener('click', () => (aberto ? fechar() : abrir()));
	trigger.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			abrir();
		}
	});
	cal.addEventListener('click', (e) => {
		const nav = e.target.closest('.ar-date__nav');
		if (nav) {
			foco = addMeses(foco, +nav.dataset.nav);
			if (foco < min) foco = min;
			desenhar();
			return;
		}
		const dia = e.target.closest('.ar-date__day');
		if (dia && !dia.disabled) escolher(new Date(foco.getFullYear(), foco.getMonth(), +dia.dataset.dia));
	});
	cal.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			fechar(true);
			return;
		}
		if (!e.target.classList?.contains('ar-date__day')) return;
		const passos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
		if (e.key in passos) mover(addDias(foco, passos[e.key]));
		else if (e.key === 'PageUp') mover(addMeses(foco, -1));
		else if (e.key === 'PageDown') mover(addMeses(foco, 1));
		else if (e.key === 'Home') mover(addDias(foco, -foco.getDay()));
		else if (e.key === 'End') mover(addDias(foco, 6 - foco.getDay()));
		else if (e.key === 'Enter' || e.key === ' ') {
			if (foco >= min) escolher(foco);
		} else return;
		e.preventDefault();
	});
	/* Tab saindo do calendário fecha */
	cal.addEventListener('focusout', (e) => {
		if (aberto && !cal.contains(e.relatedTarget) && e.relatedTarget !== trigger) fechar();
	});
	input.form?.addEventListener('reset', () => setTimeout(sync));
	sync();

	return {
		destroy() {
			fechar();
			trigger.remove();
			cal.remove();
			input.classList.remove('ar-date__native');
			input.removeAttribute('aria-hidden');
			input.removeAttribute('tabindex');
			input.readOnly = false;
			if (label) label.htmlFor = input.id;
			field?.classList.remove('ar-date', 'is-filled', 'is-open');
		},
	};
}
