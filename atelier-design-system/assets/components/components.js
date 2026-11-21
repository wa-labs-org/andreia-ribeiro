/* Alinhavo — comportamento do catálogo (design-system.html)
 * Abas Overview/Componentes, barra lateral, alternador de movimento, palcos de demonstração.
 * As animações em si são as do sistema (../js/atelier.js). */
(function () {
  'use strict';
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var html = document.documentElement;

  // ------------------------------------------------------------------ abas
  var frame = document.querySelector('#overview iframe');
  function route() {
    var name = location.hash === '#componentes' || location.hash.indexOf('#c-') === 0 ? 'componentes' : 'overview';
    $$('[data-ds-view]').forEach(function (v) { v.hidden = v.getAttribute('data-ds-view') !== name; });
    $$('[data-ds-tab]').forEach(function (t) {
      var on = t.getAttribute('data-ds-tab') === name;
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    document.body.classList.toggle('is-overview', name === 'overview');
    if (name === 'componentes') {
      if (!frame.dataset.loaded) { /* nada: o iframe só carrega quando o Overview abre */ }
      var target = location.hash.indexOf('#c-') === 0 && document.querySelector(location.hash);
      if (target) setTimeout(function () { target.scrollIntoView(); }, 0);
      setCurrent();
    } else if (!frame.getAttribute('src')) {
      frame.setAttribute('src', frame.getAttribute('data-src'));
    }
  }
  window.addEventListener('hashchange', route);

  // ------------------------------------------------------------------ barra lateral
  var links = $$('.ds-side a'), groups = $$('.ds-group');
  function setCurrent() {
    var y = window.innerHeight * .3, cur = groups[0];
    groups.forEach(function (g) { if (g.getBoundingClientRect().top <= y) cur = g; });
    links.forEach(function (a) {
      var on = cur && a.getAttribute('href') === '#' + cur.id;
      a.classList.toggle('is-current', !!on);
      if (on && window.innerWidth < 1024) { var nav = a.parentElement; nav.scrollLeft = a.offsetLeft - 20; }
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; setCurrent(); }); } }, { passive: true });

  // ------------------------------------------------------------------ movimento: completo / reduzido
  var toggle = document.querySelector('[data-ds-motion]');
  function syncToggle() {
    var reduced = html.getAttribute('data-motion') === 'reduce';
    toggle.setAttribute('aria-pressed', String(reduced));
    toggle.querySelector('b').textContent = reduced ? 'Movimento reduzido' : 'Movimento completo';
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = html.getAttribute('data-motion') === 'reduce' ? 'full' : 'reduce';
      if (window.Atelier) window.Atelier.setMotion(next);
      if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'at-motion', value: next }, '*');
      syncToggle();
    });
    document.addEventListener('at:motion', syncToggle);
  }
  if (frame) frame.addEventListener('load', function () {
    frame.contentWindow.postMessage({ type: 'at-motion', value: html.getAttribute('data-motion') }, '*');
  });

  // ------------------------------------------------------------------ replays
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ds-replay]'); if (!b) return;
    var sel = b.getAttribute('data-ds-replay');
    var stage = sel ? document.querySelector(sel) : b.closest('.ds-anim__stage, .ds-stage');
    if (stage && window.Atelier) window.Atelier.replay(stage);
  });

  // ------------------------------------------------------------------ curvas de easing
  $$('[data-ease]').forEach(function (box) {
    var v = box.getAttribute('data-ease'), svg = box.querySelector('svg');
    var d;
    if (v.indexOf('linear(') === 0) {
      var stops = v.slice(7, -1).split(',').map(function (s) { return s.trim().split(/\s+/); });
      var n = stops.length;
      d = stops.map(function (s, i) {
        var y = parseFloat(s[0]), x = s[1] ? parseFloat(s[1]) / 100 : (i === 0 ? 0 : i === n - 1 ? 1 : i / (n - 1));
        return (i ? 'L' : 'M') + (x * 100).toFixed(1) + ' ' + (100 - y * 100).toFixed(1);
      }).join(' ');
    } else {
      var p = v.split(',').map(parseFloat);
      d = 'M0 100C' + p[0] * 100 + ' ' + (100 - p[1] * 100) + ' ' + p[2] * 100 + ' ' + (100 - p[3] * 100) + ' 100 0';
      v = 'cubic-bezier(' + v + ')';
    }
    svg.innerHTML = '<path class="grid" d="M0 0H100M0 100H100M0 0V100M100 0V100" fill="none" stroke-width=".5" vector-effect="non-scaling-stroke"/>' +
      '<path class="curve" d="' + d + '" vector-effect="non-scaling-stroke"/>';
    box.style.setProperty('--e', v);
    var run = box.querySelector('.ds-ease__run');
    function w() { box.style.setProperty('--w', run.clientWidth + 'px'); }
    w(); window.addEventListener('resize', w);
  });

  // ------------------------------------------------------------------ durações
  var durBtn = document.querySelector('[data-ds-durations]');
  if (durBtn) durBtn.addEventListener('click', function () {
    $$('.ds-dur__track').forEach(function (t) {
      t.style.setProperty('--w', t.clientWidth + 'px');
      t.classList.remove('is-go'); void t.offsetWidth; t.classList.add('is-go');
    });
  });

  // ------------------------------------------------------------------ ícones
  var iconsBox = document.querySelector('[data-ds-icons]');
  function drawIcons() {
    if (!iconsBox || !window.AT_ICONS) return;
    iconsBox.innerHTML = window.AT_ICONS.map(function (k) {
      return '<div class="ds-icon"><svg aria-hidden="true"><use href="#i-' + k + '"/></svg><span class="at-note">' + k + '</span></div>';
    }).join('');
  }

  // ------------------------------------------------------------------ copiar HEX
  document.addEventListener('click', function (e) {
    var sw = e.target.closest('[data-copy]'); if (!sw) return;
    var v = sw.getAttribute('data-copy');
    var done = function () { var s = sw.querySelector('small'); if (s) { var o = s.textContent; s.textContent = 'copiado'; setTimeout(function () { s.textContent = o; }, 1200); } };
    if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {}); else done();
  });

  // ------------------------------------------------------------------ eixo SOFT da Fraunces
  $$('[data-ds-soft]').forEach(function (input) {
    var target = document.querySelector(input.getAttribute('data-ds-soft'));
    var out = input.parentElement.querySelector('output');
    input.addEventListener('input', function () {
      target.style.setProperty('--at-soft', input.value);
      if (out) out.textContent = 'SOFT ' + input.value + (input.value > 60 ? ' · Seda' : input.value < 30 ? ' · Casimira' : '');
    });
  });

  // ------------------------------------------------------------------ simulador de rolagem (linha + marcas)
  $$('[data-ds-scrub]').forEach(function (input) {
    var stage = document.querySelector(input.getAttribute('data-ds-scrub'));
    function upd() {
      var p = input.value / 100;
      $$('path', stage).forEach(function (path) { if (path.__atMask) path.__atMask.style.strokeDashoffset = (1 - p).toFixed(3); });
      $$('[data-mark]', stage).forEach(function (m) { m.classList.toggle('is-on', p >= (+m.getAttribute('data-mark') + 1) / 4 - .01); });
      var o = input.parentElement.querySelector('output'); if (o) o.textContent = Math.round(p * 100) + '%';
    }
    input.addEventListener('input', upd);
    setTimeout(upd, 300);
  });

  // ------------------------------------------------------------------ transição de página (sem navegar)
  var tBtn = document.querySelector('[data-ds-transition]');
  if (tBtn) tBtn.addEventListener('click', function () {
    var c = document.querySelector('.at-curtain:not([data-demo])'); if (!c) return;
    c.className = 'at-curtain is-cover';
    setTimeout(function () {
      c.className = 'at-curtain is-covered';
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        c.className = 'at-curtain is-lift';
        setTimeout(function () { c.className = 'at-curtain'; }, 1300);
      }); });
    }, 1400);
  });

  // ------------------------------------------------------------------ loader (reinicia a linha)
  $$('[data-ds-loader]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = document.querySelector(b.getAttribute('data-ds-loader'));
      t.classList.remove('is-loading'); void t.offsetWidth; t.classList.add('is-loading');
    });
  });

  // ------------------------------------------------------------------ início
  function start() { drawIcons(); route(); if (toggle) syncToggle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
})();
