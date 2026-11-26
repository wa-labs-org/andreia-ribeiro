/* ═══════════════════════════════════════════════════════════════
   SELECT DO DESIGN SYSTEM — lista de opções própria por cima do <select>
   A lista nativa usa o visual do sistema operacional e não aceita estilo;
   aqui o <select> continua no formulário (valor, FormData, eventos) mas
   fica escondido, e um botão + lista (role combobox/listbox) fazem a
   interface no estilo do design system (.ar-select em ar.css).

   enhanceSelect(select) → { destroy() }
     Teclado: ↓/↑ (ou Enter/Espaço) abrem e navegam, Enter/Espaço escolhem,
     Esc fecha, Home/End vão às pontas, letras pulam para a opção.
   ═══════════════════════════════════════════════════════════════ */

let uid = 0;

export function enhanceSelect(select) {
	const field = select.closest('.field');
	const label = field?.querySelector(`label[for="${select.id}"]`);
	const id = `ars-${++uid}`;
	const options = Array.from(select.options).filter((o) => !o.hidden && !o.disabled);

	field?.classList.add('ar-select');

	/* botão que mostra o valor (é o que recebe foco e o rótulo) */
	const trigger = document.createElement('button');
	trigger.type = 'button';
	trigger.id = `${id}-btn`;
	trigger.className = 'ar-select__trigger';
	trigger.setAttribute('role', 'combobox');
	trigger.setAttribute('aria-haspopup', 'listbox');
	trigger.setAttribute('aria-expanded', 'false');
	trigger.setAttribute('aria-controls', `${id}-list`);
	if (label) {
		label.id ||= `${id}-label`;
		label.htmlFor = trigger.id;
		trigger.setAttribute('aria-labelledby', `${label.id} ${trigger.id}`);
	}
	const valueEl = document.createElement('span');
	valueEl.className = 'ar-select__value';
	trigger.append(valueEl);

	/* lista de opções */
	const list = document.createElement('ul');
	list.id = `${id}-list`;
	list.className = 'ar-select__list';
	list.setAttribute('role', 'listbox');
	list.setAttribute('data-lenis-prevent', '');
	list.tabIndex = -1;
	if (label) list.setAttribute('aria-labelledby', label.id);
	const items = options.map((o, i) => {
		const li = document.createElement('li');
		li.id = `${id}-opt-${i}`;
		li.className = 'ar-select__option';
		li.setAttribute('role', 'option');
		li.textContent = o.textContent;
		li.addEventListener('mousedown', (e) => e.preventDefault()); // não tira o foco do botão
		li.addEventListener('click', () => {
			choose(i);
			close();
		});
		li.addEventListener('mousemove', () => highlight(i));
		list.append(li);
		return li;
	});

	/* o <select> fica no formulário, fora da vista e fora do Tab */
	select.classList.add('ar-select__native');
	select.tabIndex = -1;
	select.setAttribute('aria-hidden', 'true');
	select.after(trigger, list);

	let open = false;
	let active = -1;

	const sync = () => {
		const i = options.indexOf(select.selectedOptions[0]);
		valueEl.textContent = i >= 0 ? options[i].textContent : '';
		field?.classList.toggle('is-filled', i >= 0);
		select.classList.toggle('has-value', i >= 0);
		items.forEach((li, k) => li.setAttribute('aria-selected', String(k === i)));
		return i;
	};
	const highlight = (i) => {
		active = Math.max(0, Math.min(items.length - 1, i));
		items.forEach((li, k) => li.classList.toggle('is-active', k === active));
		trigger.setAttribute('aria-activedescendant', items[active].id);
		items[active].scrollIntoView({ block: 'nearest' });
	};
	const choose = (i) => {
		if (options[i].selected) return;
		options[i].selected = true;
		select.dispatchEvent(new Event('change', { bubbles: true }));
		sync();
	};
	const openList = () => {
		if (open) return;
		open = true;
		field?.classList.add('is-open');
		trigger.setAttribute('aria-expanded', 'true');
		const i = sync();
		highlight(i >= 0 ? i : 0);
		document.addEventListener('pointerdown', onOutside, true);
	};
	const close = () => {
		if (!open) return;
		open = false;
		field?.classList.remove('is-open');
		trigger.setAttribute('aria-expanded', 'false');
		trigger.removeAttribute('aria-activedescendant');
		document.removeEventListener('pointerdown', onOutside, true);
	};
	const onOutside = (e) => {
		if (!field?.contains(e.target)) close();
	};

	trigger.addEventListener('click', () => (open ? close() : openList()));
	trigger.addEventListener('blur', close);
	trigger.addEventListener('keydown', (e) => {
		const k = e.key;
		if (!open) {
			if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(k)) {
				e.preventDefault();
				openList();
			}
			return;
		}
		if (k === 'ArrowDown') highlight(active + 1);
		else if (k === 'ArrowUp') highlight(active - 1);
		else if (k === 'Home') highlight(0);
		else if (k === 'End') highlight(items.length - 1);
		else if (k === 'Enter' || k === ' ') {
			choose(active);
			close();
		} else if (k === 'Escape') close();
		else if (k === 'Tab') {
			close();
			return;
		} else if (k.length === 1) {
			/* pula para a próxima opção que começa com a letra */
			const letra = k.toLocaleLowerCase('pt-BR');
			const n = items.length;
			for (let s = 1; s <= n; s++) {
				const j = (active + s) % n;
				if (options[j].textContent.trim().toLocaleLowerCase('pt-BR').startsWith(letra)) {
					highlight(j);
					break;
				}
			}
		} else return;
		e.preventDefault();
	});
	/* se o formulário for limpo (reset), o botão acompanha */
	select.form?.addEventListener('reset', () => setTimeout(sync));
	select.addEventListener('change', sync);
	sync();

	return {
		destroy() {
			close();
			trigger.remove();
			list.remove();
			select.classList.remove('ar-select__native');
			select.removeAttribute('aria-hidden');
			select.removeAttribute('tabindex');
			if (label) label.htmlFor = select.id;
			field?.classList.remove('ar-select', 'is-filled', 'is-open');
		},
	};
}
