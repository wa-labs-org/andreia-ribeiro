/* ═══════════════════════════════════════════════════════════════
   ANDRÉIA RIBEIRO — CROQUIS
   Fashion-sketch line drawings of the atelier's silhouettes, used
   as art-directed stand-ins inside photo slots until the real
   photography is placed (and as an editorial motif afterwards).
   Every stroke has pathLength=100 → draw with stroke-dashoffset.

   <span data-croqui="princesa|sereia|coluna|noiva|smoking"></span>
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var HANGER = 'M60 40 L60 30 C60 22 69 22 69 28';
  var D = {
    princesa: [
      HANGER,
      'M48 52 Q54 45 60 54 Q66 45 72 52',
      'M48 52 L50 96', 'M72 52 L70 96', 'M50 96 Q60 101 70 96',
      'M50 96 C30 150 12 230 8 280 Q60 297 112 280 C108 230 90 150 70 96',
      'M56 100 C50 170 40 230 34 289', 'M64 100 C70 170 80 230 86 289', 'M60 101 L60 293',
      'M53 74 Q60 78 67 74'
    ],
    sereia: [
      HANGER,
      'M44 56 Q60 63 76 56',
      'M44 56 C46 80 48 100 50 120', 'M76 56 C74 80 72 100 70 120',
      'M50 120 C47 150 50 180 54 205', 'M70 120 C73 150 70 180 66 205',
      'M54 205 C40 240 22 270 10 292 Q60 301 110 292 C98 270 80 240 66 205',
      'M58 210 C52 245 44 270 38 295', 'M62 210 C68 245 76 270 82 295',
      'M50 118 Q60 124 70 118', 'M54 204 Q60 208 66 204'
    ],
    coluna: [
      HANGER,
      'M46 50 L74 58',
      'M46 50 C46 90 48 120 46 160 L42 292', 'M74 58 C72 90 70 120 72 160 L78 292',
      'M42 292 Q60 296 78 292',
      'M46 70 C58 88 66 100 72 122', 'M47 92 C56 104 62 114 70 140',
      'M68 196 L64 292'
    ],
    noiva: [
      HANGER,
      'M60 32 C34 60 22 160 6 272',
      'M60 32 C70 70 80 120 90 170',
      'M49 54 Q60 62 71 54',
      'M49 54 L51 96', 'M71 54 L69 96', 'M51 96 Q60 101 69 96',
      'M51 96 C33 160 22 240 18 284 Q72 302 118 294 C110 260 92 160 69 96',
      'M57 100 C51 170 42 240 38 292', 'M63 100 C72 170 88 240 100 296',
      'M55 70 Q60 73 65 70', 'M54 80 Q60 84 66 80'
    ],
    smoking: [
      HANGER,
      'M36 60 Q60 50 84 60',
      'M36 60 L40 160', 'M84 60 L80 160', 'M40 160 L60 172 L80 160',
      'M52 56 L60 120 L68 56',
      'M52 56 L46 90 L60 120', 'M68 56 L74 90 L60 120',
      'M55 59 L65 64 M55 64 L65 59',
      'M44 166 L46 292', 'M76 166 L74 292', 'M60 172 L60 292',
      'M36 60 L30 150', 'M84 60 L90 150'
    ]
  };

  function build(kind) {
    var paths = D[kind] || D.princesa;
    return '<svg class="croqui-svg" viewBox="0 0 120 304" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round">' +
      paths.map(function (d) { return '<path pathLength="100" d="' + d + '"/>'; }).join('') + '</svg>';
  }
  function mount(root) {
    (root || document).querySelectorAll('[data-croqui]:not([data-croqui-ready])').forEach(function (el) {
      el.innerHTML = build(el.getAttribute('data-croqui'));
      el.setAttribute('data-croqui-ready', '');
    });
  }
  window.ARCroqui = { mount: mount, svg: build, kinds: Object.keys(D) };
  mount();
})();
