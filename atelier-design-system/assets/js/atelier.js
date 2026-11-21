/* ==========================================================================
   ALINHAVO — atelier.js · motor de movimento
   Sem dependências. Uma única rAF compartilhada para tudo que depende de rolagem
   ou ponteiro. Só anima transform, opacity, clip-path e stroke-dashoffset.

   API pública (window.Atelier):
     setMotion('reduce' | 'full' | null)  — força / libera o modo de movimento
     replay(elemento)                      — reexecuta as revelações dentro de um elemento
     onReady(fn)                           — roda fn depois do loader/cortina de entrada
   ========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.add('at-js');

  // ------------------------------------------------------------------ util
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ms(token, fallback) {
    var v = getComputedStyle(html).getPropertyValue(token).trim();
    var n = parseFloat(v);
    if (isNaN(n)) return fallback;
    return v.indexOf('ms') > -1 ? n : n * 1000;
  }
  function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }

  // ------------------------------------------------------------------ modo de movimento
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionOverride = store('at-motion') || null;
  function isReduced() { return html.getAttribute('data-motion') === 'reduce'; }
  function applyMotion() {
    var v = motionOverride || (mqReduce.matches ? 'reduce' : 'full');
    html.setAttribute('data-motion', v);
    document.dispatchEvent(new CustomEvent('at:motion', { detail: v }));
  }
  applyMotion();
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', applyMotion);
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.type === 'at-motion' && (d.value === 'reduce' || d.value === 'full' || d.value === null)) {
      motionOverride = d.value; store('at-motion', d.value); applyMotion();
    }
  });

  // ------------------------------------------------------------------ intro (loader / cortina)
  var readyQueue = [], isReady = false;
  function onReady(fn) { if (isReady) fn(); else readyQueue.push(fn); }
  function setReady() { if (isReady) return; isReady = true; readyQueue.splice(0).forEach(function (f) { f(); }); }

  // ------------------------------------------------------------------ divisão em linhas
  function splitLines(el) {
    if (el.querySelector(':scope > .at-line') && !el.__atSrc) return; // linhas manuais
    if (el.__atSrc === undefined) el.__atSrc = el.innerHTML;
    el.innerHTML = el.__atSrc;

    // 1. envolve cada palavra num span, preservando <em>, <strong> etc.
    //    Guarda se havia espaço antes (para não criar "prova ." depois de um </em>).
    var spaceBefore = false;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); spaceBefore = true; }
            else { var w = document.createElement('span'); w.className = 'at-w'; w.textContent = p; w.__sp = spaceBefore; spaceBefore = false; frag.appendChild(w); }
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);

    // 2. agrupa por posição vertical
    var words = $$('.at-w', el), lines = [], lastTop = null;
    words.forEach(function (w) {
      var t = Math.round(w.getBoundingClientRect().top);
      if (lastTop === null || Math.abs(t - lastTop) > 3) { lines.push([]); lastTop = t; }
      lines[lines.length - 1].push(w);
    });

    // 3. reconstrói: .at-line > span > (clones rasos dos ancestrais) > palavras
    var out = document.createDocumentFragment();
    lines.forEach(function (ws, i) {
      var line = document.createElement('span'); line.className = 'at-line';
      var inner = document.createElement('span'); inner.style.setProperty('--i', i);
      line.appendChild(inner);
      var openChain = [], openNodes = [];
      ws.forEach(function (w, j) {
        var chain = [], a = w.parentNode;
        while (a && a !== el) { chain.unshift(a); a = a.parentNode; }
        var k = 0;
        while (k < chain.length && k < openChain.length && chain[k] === openChain[k]) k++;
        openChain.length = k; openNodes.length = k;
        var parent = k ? openNodes[k - 1] : inner;
        if (j > 0 && w.__sp) parent.appendChild(document.createTextNode(' '));
        for (var c = k; c < chain.length; c++) {
          var clone = chain[c].cloneNode(false); parent.appendChild(clone);
          openChain.push(chain[c]); openNodes.push(clone); parent = clone;
        }
        parent.appendChild(document.createTextNode(w.textContent));
      });
      out.appendChild(line);
    });
    el.innerHTML = '';
    el.appendChild(out);
  }

  function prepareLines(ctx) {
    $$('[data-reveal="linhas"]', ctx).forEach(function (el) {
      if (el.querySelector(':scope > .at-line') && el.__atSrc === undefined) {
        $$(':scope > .at-line > span', el).forEach(function (s, i) { s.style.setProperty('--i', i); });
        return;
      }
      splitLines(el);
    });
  }

  // ------------------------------------------------------------------ costuras SVG (máscara desenhável)
  var maskId = 0;
  function prepareStitches(ctx) {
    $$('svg[data-stitch]', ctx).forEach(function (svg) {
      if (svg.__atStitch) return;
      svg.__atStitch = true;
      var NS = 'http://www.w3.org/2000/svg';
      var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
      var scale = 1;
      try { var m = svg.getScreenCTM(); if (m && m.a) scale = m.a; } catch (e) { /* sem CTM antes do layout */ }
      $$('path', svg).forEach(function (p) {
        if (p.closest('mask, defs')) return;
        var id = 'at-stitch-' + (++maskId);
        var mask = document.createElementNS(NS, 'mask');
        mask.setAttribute('id', id); mask.setAttribute('maskUnits', 'userSpaceOnUse');
        mask.setAttribute('x', '-50%'); mask.setAttribute('y', '-50%'); mask.setAttribute('width', '200%'); mask.setAttribute('height', '200%');
        var mp = document.createElementNS(NS, 'path');
        mp.setAttribute('d', p.getAttribute('d'));
        mp.setAttribute('pathLength', '1');
        mp.setAttribute('fill', 'none'); mp.setAttribute('stroke', '#fff');
        mp.setAttribute('stroke-width', String(8 / (scale || 1)));
        mp.setAttribute('class', 'at-stitch-mask');
        mask.appendChild(mp); defs.appendChild(mask);
        p.setAttribute('mask', 'url(#' + id + ')');
        p.__atMask = mp;
      });
    });
  }

  // ------------------------------------------------------------------ revelações
  // Revelações que recortam o próprio elemento (clip-path com área zero) não são vistas pelo
  // IntersectionObserver; para elas observamos o pai e repassamos o .is-in.
  var proxies = new Map();
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var targets = proxies.get(e.target) || [e.target];
      targets.forEach(function (el) {
        if (el.closest('[data-intro]') && !isReady) onReady(function () { el.classList.add('is-in'); });
        else el.classList.add('is-in');
      });
      proxies.delete(e.target);
      revealIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  function watch(el) {
    if (!/^(queda|corte|costura)$/.test(el.getAttribute('data-reveal') || '')) return revealIO.observe(el);
    var host = el.parentElement, list = proxies.get(host);
    if (!list) { proxies.set(host, list = []); revealIO.observe(host); }
    list.push(el);
  }

  function indexByRow(items) {
    var rows = {};
    items.forEach(function (it) {
      var top = Math.round(it.getBoundingClientRect().top + window.scrollY);
      (rows[top] = rows[top] || []).push(it);
    });
    Object.keys(rows).forEach(function (k) {
      rows[k].sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; })
        .forEach(function (it, i) { it.style.setProperty('--i', Math.min(i, 5)); });
    });
  }

  function observeReveals(ctx) {
    $$('[data-reveal]', ctx).forEach(function (el) {
      // a entrada do hero é coreografada inteira, mesmo o que nasce abaixo da dobra
      if (el.closest('[data-intro]')) { onReady(function () { el.classList.add('is-in'); $$('[data-reveal-item]', el).forEach(function (it) { it.classList.add('is-in'); }); }); return; }
      if (el.getAttribute('data-reveal') === 'pecas') {
        var items = $$('[data-reveal-item]', el);
        indexByRow(items);
        items.forEach(function (it) { revealIO.observe(it); });
      } else watch(el);
    });
    $$('svg[data-stitch]:not([data-stitch="scrub"]), .at-footer__mark', ctx).forEach(function (el) { revealIO.observe(el); });
  }

  function replay(ctx) {
    var els = $$('[data-reveal], [data-reveal-item], svg[data-stitch], .at-footer__mark', ctx);
    if (ctx.matches && ctx.matches('[data-reveal], svg[data-stitch]')) els.push(ctx);
    els.forEach(function (el) { el.classList.remove('is-in'); });
    void ctx.offsetWidth; // reflow: reinicia as transições
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      els.forEach(function (el) { el.classList.add('is-in'); });
    }); });
  }

  // ------------------------------------------------------------------ rolagem de letras
  function prepareRoll(ctx) {
    $$('[data-roll]', ctx).forEach(function (el) {
      if (el.__atRoll) return; el.__atRoll = true;
      var text = el.textContent.trim();
      el.textContent = '';
      el.classList.add('at-roll');
      var sr = document.createElement('span'); sr.className = 'at-sr'; sr.textContent = text;
      function copy(cls) {
        var c = document.createElement('span'); c.className = cls; c.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(text, function (ch, i) {
          var s = document.createElement('span'); s.className = 'at-char'; s.style.setProperty('--i', i);
          s.textContent = ch; c.appendChild(s);
        });
        return c;
      }
      el.appendChild(sr); el.appendChild(copy('at-roll__a')); el.appendChild(copy('at-roll__b'));
    });
  }

  // letreiro do rodapé
  function prepareMark(ctx) {
    $$('.at-footer__mark', ctx).forEach(function (el) {
      if (el.__atMark) return; el.__atMark = true;
      var text = el.textContent.trim();
      el.setAttribute('aria-label', text);
      el.textContent = '';
      Array.prototype.forEach.call(text, function (ch, i) {
        var s = document.createElement('span'); s.className = 'at-char'; s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i); s.textContent = ch === ' ' ? ' ' : ch; el.appendChild(s);
      });
    });
  }

  // ------------------------------------------------------------------ loop único (rolagem)
  var vh = window.innerHeight, vw = window.innerWidth, lastY = window.scrollY, ticking = false;
  var scrollers = [];
  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY, dy = y - lastY; lastY = y;
    for (var i = 0; i < scrollers.length; i++) scrollers[i](y, dy);
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); } }
  window.addEventListener('scroll', requestFrame, { passive: true });

  // header: some ao descer, volta ao subir; tule depois de 24px; tema conforme a seção abaixo
  function initHeader() {
    var h = document.querySelector('.at-header:not([data-demo])'); if (!h) return;
    var dark = $$('[data-registro="casimira"]');
    var acc = 0;
    scrollers.push(function (y, dy) {
      h.classList.toggle('is-scrolled', y > 24);
      if (!document.body.classList.contains('at-menu-open')) {
        acc = (dy > 0) === (acc > 0) ? acc + dy : dy;
        if (y < 120 || acc < -24) h.classList.remove('is-hidden');
        else if (acc > 48) h.classList.add('is-hidden');
      }
      var mid = h.offsetHeight / 2, noite = false;
      for (var i = 0; i < dark.length; i++) {
        var r = dark[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { noite = true; break; }
      }
      if (noite) h.setAttribute('data-theme', 'noite'); else h.removeAttribute('data-theme');
    });
  }

  // fita métrica (progresso)
  function initFita() {
    var f = document.querySelector('.at-fita'); if (!f) return;
    scrollers.push(function (y) {
      var max = document.documentElement.scrollHeight - vh;
      f.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
    });
  }

  // paralaxe
  function initParallax() {
    var els = $$('[data-parallax]');
    scrollers.push(function () {
      if (isReduced()) return;
      els.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var k = parseFloat(el.getAttribute('data-parallax')) || .12;
        var off = (r.top + r.height / 2 - vh / 2) * -k;
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
    });
  }

  // linha desenhada pela rolagem
  function initScrub() {
    var svgs = $$('svg[data-stitch="scrub"]:not([data-scrub-manual])');
    scrollers.push(function () {
      svgs.forEach(function (svg) {
        var host = svg.closest('[data-scrub-host]') || svg;
        var r = host.getBoundingClientRect();
        var p = isReduced() ? 1 : clamp((vh * .85 - r.top) / (r.height * .9), 0, 1);
        $$('path', svg).forEach(function (path) { if (path.__atMask) path.__atMask.style.strokeDashoffset = (1 - p).toFixed(4); });
      });
    });
  }

  // prova no manequim (seção fixada, passos acendem com a rolagem)
  function initProva() {
    $$('.at-prova').forEach(function (sec) {
      var steps = $$('[data-step]', sec), marks = $$('[data-mark]', sec);
      var desk = window.matchMedia('(min-width: 1024px)');
      scrollers.push(function () {
        var idx;
        if (!desk.matches || isReduced()) idx = steps.length - 1;
        else {
          var r = sec.getBoundingClientRect();
          var p = clamp(-r.top / (r.height - vh), 0, .999);
          idx = Math.floor(p * steps.length);
        }
        steps.forEach(function (s, i) { s.classList.toggle('is-on', !desk.matches || isReduced() ? true : i === idx); });
        marks.forEach(function (m) { m.classList.toggle('is-on', +m.getAttribute('data-mark') <= idx); });
      });
    });
  }

  // arara: galeria horizontal fixada + balanço dos cabides pela velocidade
  function initArara() {
    $$('.at-arara').forEach(function (sec) {
      var track = sec.querySelector('.at-arara__track'); if (!track) return;
      var items = $$('.at-arara__item', track);
      var count = sec.querySelector('.at-arara__count');
      var desk = window.matchMedia('(min-width: 1024px)');
      var pinned = sec.hasAttribute('data-pin');
      var angle = 0, vel = 0, target = 0, lastX = 0, running = false;
      function size() {
        if (pinned && desk.matches && !isReduced()) {
          var dist = Math.max(0, track.scrollWidth - vw);
          sec.style.setProperty('--arara-h', (dist + vh) + 'px');
        } else { sec.style.removeProperty('--arara-h'); track.style.transform = ''; }
      }
      size(); window.addEventListener('resize', size); document.addEventListener('at:motion', size);
      function swing() {
        if (isReduced()) { items.forEach(function (it) { it.style.transform = ''; }); running = false; return; }
        vel += (target - angle) * .12; vel *= .8; angle += vel; target *= .86;
        items.forEach(function (it, i) { it.style.transform = 'rotate(' + (angle * (1 - (i % 3) * .18)).toFixed(3) + 'deg)'; });
        if (Math.abs(angle) > .01 || Math.abs(target) > .01) requestAnimationFrame(swing); else running = false;
      }
      function kick(dx) {
        target = clamp(-dx * .09, -5, 5);
        if (!running) { running = true; requestAnimationFrame(swing); }
      }
      function setCount(p) {
        if (!count) return;
        var n = clamp(Math.round(p * (items.length - 1)) + 1, 1, items.length);
        count.textContent = String(n).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
      }
      scrollers.push(function () {
        if (!(pinned && desk.matches) || isReduced()) return;
        var r = sec.getBoundingClientRect();
        var dist = Math.max(0, track.scrollWidth - vw);
        var p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
        var x = -p * dist;
        track.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        kick(x - lastX); lastX = x; setCount(p);
      });
      track.addEventListener('scroll', function () {
        var x = track.scrollLeft; kick(lastX - x); lastX = x;
        setCount(x / Math.max(1, track.scrollWidth - track.clientWidth));
      }, { passive: true });
      setCount(0);
    });
  }

  // ------------------------------------------------------------------ cursor: agulha + linha
  function initCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var c = document.createElement('div'); c.className = 'at-cursor'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<div class="at-cursor__ring"><span class="at-cursor__label"></span></div><div class="at-cursor__dot"></div>';
    document.body.appendChild(c);
    var ring = c.firstChild, dot = c.lastChild, label = ring.firstChild;
    var mx = -100, my = -100, rx = -100, ry = -100, visible = false, raf = 0;

    // linha que segue a agulha, só em zonas [data-cursor-thread]
    var cv = document.createElement('canvas'); cv.className = 'at-cursor-thread'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
    var pts = [], N = 22, threadOn = false, alpha = 0;
    function sizeCanvas() { cv.width = vw * dpr; cv.height = vh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    sizeCanvas(); window.addEventListener('resize', sizeCanvas);
    for (var i = 0; i < N; i++) pts.push({ x: -100, y: -100 });

    function loop() {
      raf = 0;
      if (isReduced()) { html.classList.remove('at-has-cursor'); return; }
      rx += (mx - rx) * .2; ry += (my - ry) * .2;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px) translate(-50%,-50%)';
      // linha
      alpha += ((threadOn ? 1 : 0) - alpha) * .08;
      ctx.clearRect(0, 0, vw, vh);
      var moving = Math.abs(mx - rx) + Math.abs(my - ry) > .3;
      if (alpha > .01) {
        pts[0].x += (mx - pts[0].x) * .5; pts[0].y += (my - pts[0].y) * .5;
        for (var k = 1; k < N; k++) { pts[k].x += (pts[k - 1].x - pts[k].x) * .38; pts[k].y += (pts[k - 1].y - pts[k].y) * .38; }
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (var j = 1; j < N - 1; j++) {
          var xc = (pts[j].x + pts[j + 1].x) / 2, yc = (pts[j].y + pts[j + 1].y) / 2;
          ctx.quadraticCurveTo(pts[j].x, pts[j].y, xc, yc);
        }
        ctx.setLineDash([6, 5]); ctx.lineWidth = 1.25;
        ctx.strokeStyle = 'rgba(185,152,71,' + (alpha * .9).toFixed(3) + ')';
        ctx.stroke();
        var tail = Math.abs(pts[0].x - pts[N - 1].x) + Math.abs(pts[0].y - pts[N - 1].y);
        moving = moving || tail > .5 || Math.abs(alpha - (threadOn ? 1 : 0)) > .01;
      } else { for (var q = 0; q < N; q++) { pts[q].x = mx; pts[q].y = my; } }
      if (moving) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || isReduced()) return;
      mx = e.clientX; my = e.clientY;
      if (!visible) { visible = true; rx = mx; ry = my; html.classList.add('at-has-cursor'); }
      kick();
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      var lab = t.closest && t.closest('[data-cursor-label]');
      var act = t.closest && t.closest('a, button, label, [role="button"], input, select, textarea');
      c.classList.toggle('is-label', !!lab);
      label.textContent = lab ? lab.getAttribute('data-cursor-label') : '';
      c.classList.toggle('is-hover', !lab && !!act);
      c.classList.toggle('is-noite', !!(t.closest && t.closest('[data-registro="casimira"], .at-header[data-theme="noite"]')));
      threadOn = !!(t.closest && t.closest('[data-cursor-thread]'));
      kick();
    });
    document.addEventListener('pointerdown', function () { c.classList.add('is-down'); });
    document.addEventListener('pointerup', function () { c.classList.remove('is-down'); });
    document.addEventListener('mouseleave', function () { visible = false; html.classList.remove('at-has-cursor'); threadOn = false; });
    document.addEventListener('at:motion', function () { if (isReduced()) html.classList.remove('at-has-cursor'); });
  }

  // magnetismo leve
  function initMagnet() {
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (isReduced() || e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = 'translate(' + (x * 8).toFixed(1) + 'px,' + (y * 8).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform var(--at-dur-alinhavo) var(--at-ease-balanco)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  }

  // ------------------------------------------------------------------ menu
  function initMenu() {
    var btn = document.querySelector('[data-menu-toggle]'), menu = document.getElementById('at-menu');
    if (!btn || !menu) return;
    function focusables() { return $$('a, button, [tabindex]:not([tabindex="-1"])', menu); }
    function set(open) {
      btn.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      menu.toggleAttribute('inert', !open);
      document.body.classList.toggle('at-menu-open', open);
      if (open) { var f = focusables()[0]; if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 80); }
      else btn.focus({ preventScroll: true });
    }
    menu.setAttribute('inert', '');
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (e.key === 'Escape') set(false);
      if (e.key === 'Tab') { // prende o foco no menu
        var f = focusables().concat([btn]), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { if (!a.hasAttribute('data-transition')) set(false); }); });
    $$('.at-menu__link', menu).forEach(function (a, i) { a.style.setProperty('--i', i); });
  }

  // ------------------------------------------------------------------ FAQ (acordeão)
  function initFaq() {
    $$('.at-faq__btn').forEach(function (b) {
      var item = b.closest('.at-faq__item'), panel = document.getElementById(b.getAttribute('aria-controls'));
      if (!item || !panel) return;
      var open = b.getAttribute('aria-expanded') === 'true';
      item.classList.toggle('is-open', open); panel.toggleAttribute('inert', !open);
      b.addEventListener('click', function () {
        var now = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', String(now));
        item.classList.toggle('is-open', now); panel.toggleAttribute('inert', !now);
      });
    });
  }

  // ------------------------------------------------------------------ depoimentos
  function initQuotes() {
    $$('[data-quotes]').forEach(function (box) {
      var slides = $$('[data-slide]', box), cur = 0;
      var count = box.querySelector('[data-quotes-count]');
      function show(n) {
        slides[cur].hidden = true;
        cur = (n + slides.length) % slides.length;
        var s = slides[cur]; s.hidden = false;
        prepareLines(s);
        replay(s);
        if (count) count.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      }
      slides.forEach(function (s, i) { s.hidden = i !== 0; });
      var prev = box.querySelector('[data-quotes-prev]'), next = box.querySelector('[data-quotes-next]');
      if (prev) prev.addEventListener('click', function () { show(cur - 1); });
      if (next) next.addEventListener('click', function () { show(cur + 1); });
      if (count) count.textContent = '01 / ' + String(slides.length).padStart(2, '0');
    });
  }

  // ------------------------------------------------------------------ agendamento de prova
  function initBooking() {
    $$('[data-booking]').forEach(function (form) {
      var panels = $$('[data-panel]', form), steps = $$('[data-steps] li', form), cur = 0;
      var dates = form.querySelector('[data-dates]');
      if (dates) buildDates(dates);
      function go(n) {
        panels[cur].hidden = true; cur = n; panels[cur].hidden = false;
        steps.forEach(function (li, i) {
          li.classList.toggle('is-done', i < cur);
          if (i === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });
        var h = panels[cur].querySelector('legend, h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        var top = form.getBoundingClientRect().top + window.scrollY - 120;
        if (form.getBoundingClientRect().top < 0) window.scrollTo({ top: top, behavior: isReduced() ? 'auto' : 'smooth' });
      }
      function validate(panel) {
        var firstBad = null;
        $$('.at-field', panel).forEach(function (f) {
          var input = f.querySelector('input, select, textarea'); if (!input) return;
          var ok = input.checkValidity();
          f.classList.toggle('is-invalid', !ok); f.classList.toggle('is-valid', ok && !!input.value);
          input.setAttribute('aria-invalid', String(!ok));
          if (!ok && !firstBad) firstBad = input;
        });
        $$('[data-required-group]', panel).forEach(function (g) {
          var ok = !!g.querySelector('input:checked');
          var err = g.querySelector('.at-field__error');
          g.classList.toggle('is-invalid', !ok);
          if (err) err.style.display = ok ? 'none' : 'flex';
          if (!ok && !firstBad) firstBad = g.querySelector('input');
        });
        if (firstBad) firstBad.focus();
        return !firstBad;
      }
      form.addEventListener('click', function (e) {
        var t = e.target.closest('[data-next], [data-back]'); if (!t) return;
        e.preventDefault();
        if (t.hasAttribute('data-back')) go(Math.max(0, cur - 1));
        else if (validate(panels[cur])) go(Math.min(panels.length - 1, cur + 1));
      });
      form.addEventListener('input', function (e) {
        var f = e.target.closest('.at-field');
        if (f && f.classList.contains('is-invalid') && e.target.checkValidity()) { f.classList.remove('is-invalid'); e.target.setAttribute('aria-invalid', 'false'); }
        var g = e.target.closest('[data-required-group]');
        if (g) { g.classList.remove('is-invalid'); var er = g.querySelector('.at-field__error'); if (er) er.style.display = 'none'; }
        if (e.target.name === 'para') updateSummary();
      });
      function updateSummary() {
        var v = form.querySelector('input[name="para"]:checked');
        var out = form.querySelector('[data-para-out]');
        if (out && v) out.textContent = v.value.toLowerCase();
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(panels[cur])) return;
        var btn = form.querySelector('[type="submit"]');
        btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true');
        setTimeout(function () {
          btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy');
          var done = form.querySelector('[data-done]');
          panels[cur].hidden = true;
          steps.forEach(function (li) { li.classList.add('is-done'); li.removeAttribute('aria-current'); });
          var nav = form.querySelector('[data-steps]'); if (nav) nav.setAttribute('aria-hidden', 'true');
          if (done) { done.hidden = false; var h = done.querySelector('h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
        }, 1400);
      });
    });
  }
  function buildDates(box) {
    var dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var d = new Date(); d.setHours(12); var n = 0, html_ = '';
    while (n < 10) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay(); if (wd !== 4 && wd !== 5 && wd !== 6) continue; // quinta, sexta, sábado
      var full = n === 2 || n === 7; // agenda cheia (exemplo)
      var iso = d.toISOString().slice(0, 10);
      html_ += '<label class="at-choice"><input type="radio" name="data" value="' + iso + '"' + (full ? ' disabled' : '') + '>' +
        '<span><small class="at-note">' + dias[wd] + '</small><b>' + d.getDate() + '</b><small class="at-note">' + (full ? 'lotado' : meses[d.getMonth()]) + '</small></span></label>';
      n++;
    }
    box.innerHTML = html_;
  }

  // ------------------------------------------------------------------ filtros da coleção (FLIP)
  function initFilters() {
    $$('[data-filters]').forEach(function (bar) {
      var grid = document.getElementById(bar.getAttribute('data-filters')); if (!grid) return;
      var cards = $$('[data-tags]', grid), out = bar.querySelector('[data-result]');
      bar.addEventListener('change', function () {
        var v = (bar.querySelector('input:checked') || {}).value || 'todas';
        var first = new Map(); cards.forEach(function (c) { if (!c.hidden) first.set(c, c.getBoundingClientRect()); });
        cards.forEach(function (c) { c.hidden = !(v === 'todas' || c.getAttribute('data-tags').split(' ').indexOf(v) > -1); });
        var shown = cards.filter(function (c) { return !c.hidden; });
        if (out) out.textContent = shown.length + (shown.length === 1 ? ' peça' : ' peças');
        if (isReduced() || !Element.prototype.animate) return;
        var dur = ms('--at-dur-caimento', 800), ease = getComputedStyle(html).getPropertyValue('--at-ease-caimento').trim() || 'ease-out';
        shown.forEach(function (c, i) {
          var b = c.getBoundingClientRect(), a = first.get(c);
          c.classList.add('is-in', 'is-filtered-in');
          if (a) c.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)' }, { transform: 'none' }], { duration: dur, easing: ease });
          else c.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: dur, easing: ease, delay: i * 60, fill: 'backwards' });
        });
      });
    });
  }

  // ------------------------------------------------------------------ transição de página + loader
  function initCurtain() {
    var cur = document.querySelector('.at-curtain:not([data-demo])');
    var arriving = html.classList.contains('at-arriving');
    var loading = html.classList.contains('at-loading');
    function lift() {
      if (!cur) return setReady();
      cur.classList.remove('is-cover');
      cur.classList.add('is-covered');
      html.classList.remove('at-arriving', 'at-loading');
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        cur.classList.remove('is-covered'); cur.classList.add('is-lift');
        setTimeout(setReady, ms('--at-dur-cerimonia', 1200) * .35);
        setTimeout(function () { cur.classList.remove('is-lift', 'is-loading'); }, ms('--at-dur-cerimonia', 1200));
      }); });
    }
    store('at-curtain', null);
    if (loading && cur) {
      cur.classList.add('is-loading');
      var cnt = cur.querySelector('.at-loader__count'), t0 = performance.now();
      var minT = isReduced() ? 200 : 1400, fontsDone = false;
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { fontsDone = true; });
      (function tick(now) {
        var p = clamp((now - t0) / minT, 0, fontsDone ? 1 : .9);
        if (cnt) cnt.textContent = String(Math.round(p * 100)).padStart(3, '0') + ' cm';
        if (p >= 1 || now - t0 > 3000) { store('at-visited', '1'); lift(); }
        else requestAnimationFrame(tick);
      })(t0);
    } else if (arriving) {
      setTimeout(lift, 60);
    } else setReady();

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-transition]');
      if (!a || !cur || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var href = a.getAttribute('href'); if (!href || href.charAt(0) === '#') return;
      e.preventDefault();
      store('at-curtain', '1');
      cur.classList.remove('is-lift'); cur.classList.add('is-cover');
      setTimeout(function () { window.location.href = href; }, isReduced() ? 180 : ms('--at-dur-cerimonia', 1200) * .9);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted && cur) { cur.className = 'at-curtain'; html.classList.remove('at-arriving', 'at-loading'); setReady(); }
    });
  }

  // ------------------------------------------------------------------ inicialização
  function init() {
    prepareRoll(document);
    prepareMark(document);
    prepareLines(document);
    prepareStitches(document);
    observeReveals(document);
    initHeader(); initFita(); initParallax(); initScrub(); initProva(); initArara();
    initCursor(); initMagnet(); initMenu(); initFaq(); initQuotes(); initBooking(); initFilters(); initCurtain();
    onScrollFrame();

    var lastW = vw, rt;
    window.addEventListener('resize', function () {
      vh = window.innerHeight; vw = window.innerWidth;
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (Math.abs(vw - lastW) > 40) { lastW = vw; $$('[data-reveal="linhas"]').forEach(function (el) { if (el.__atSrc !== undefined) splitLines(el); }); }
        requestFrame();
      }, 200);
    });
    document.addEventListener('at:motion', requestFrame);
    // as linhas medidas com a fonte de fallback mudam quando Fraunces chega
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {
      $$('[data-reveal="linhas"]').forEach(function (el) { if (el.__atSrc !== undefined) splitLines(el); });
    });
  }

  window.Atelier = {
    setMotion: function (v) { motionOverride = v; store('at-motion', v); applyMotion(); },
    replay: replay,
    onReady: onReady,
    prepare: function (ctx) { prepareRoll(ctx); prepareLines(ctx); prepareStitches(ctx); observeReveals(ctx); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
