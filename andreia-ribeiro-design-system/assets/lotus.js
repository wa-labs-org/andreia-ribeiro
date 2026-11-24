/* ═══════════════════════════════════════════════════════════════
   ANDRÉIA RIBEIRO — LOTUS MARK
   Vector redraw of the brand lotus: eight pointed petals, each
   outlined three times (outer / mid / inner), around a rosé
   flame at the core. Every stroke uses pathLength=100 so any
   petal can be "drawn" with stroke-dashoffset 100 → 0
   (the Soma lotus-intro technique).

   Usage:  <span data-lotus></span>
           <span data-lotus="solid"></span>   (filled petals, for small sizes)
   Runs synchronously — include before any script that animates it.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var uid = 0;
  var ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

  // petal with its base at (0,0) and its tip at (0,-len)
  function petal(len, w) {
    return 'M0 0 C ' + (-w * 0.95) + ' ' + (-len * 0.32) + ', ' + (-w * 0.62) + ' ' + (-len * 0.74) + ', 0 ' + (-len) +
           ' C ' + (w * 0.62) + ' ' + (-len * 0.74) + ', ' + (w * 0.95) + ' ' + (-len * 0.32) + ', 0 0 Z';
  }

  function build(mode) {
    var id = 'arg' + (++uid);
    var solid = mode === 'solid';
    var layers = [
      { cls: 'lp-outer', len: 94, w: 35, sw: 1.6 },
      { cls: 'lp-mid',   len: 72, w: 26, sw: 1.3 },
      { cls: 'lp-inner', len: 50, w: 17, sw: 1.1 }
    ];
    var out = '';
    out += '<svg class="lotus-svg" viewBox="-104 -104 208 208" aria-hidden="true" focusable="false">';
    out += '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
           '<stop offset="0" stop-color="var(--ouro-claro,#C6AF6C)"/>' +
           '<stop offset=".55" stop-color="var(--ouro,#B99847)"/>' +
           '<stop offset="1" stop-color="var(--bronze,#7A6230)"/></linearGradient></defs>';
    out += '<g class="lotus-petals" fill="' + (solid ? 'url(#' + id + ')' : 'none') + '" stroke="url(#' + id + ')" stroke-linejoin="round" stroke-linecap="round">';
    layers.forEach(function (L, li) {
      if (solid && li > 0) return;
      ANGLES.forEach(function (a) {
        // diagonal petals sit slightly behind: a touch shorter, as in the logo
        var k = (a % 90 === 0) ? 1 : 0.86;
        out += '<path class="lp ' + L.cls + '" pathLength="100" stroke-width="' + L.sw + '" transform="rotate(' + a + ')" d="' + petal(L.len * k, L.w * k) + '"/>';
      });
    });
    out += '</g>';
    // the core: a rosé flame/drop cupped by the inner petals
    out += '<path class="lp lp-core" pathLength="100" d="M0 -30 C 9 -17, 12 -4, 0 9 C -12 -4, -9 -17, 0 -30 Z" ' +
           'fill="var(--rose,#F3DFD2)" stroke="url(#' + id + ')" stroke-width="1.3"/>';
    out += '<path class="lp lp-core-inner" pathLength="100" d="M0 -19 C 4 -11, 6 -3, 0 4 C -6 -3, -4 -11, 0 -19 Z" fill="none" stroke="url(#' + id + ')" stroke-width=".9"/>';
    out += '</svg>';
    return out;
  }

  function mount(root) {
    (root || document).querySelectorAll('[data-lotus]:not([data-lotus-ready])').forEach(function (el) {
      el.innerHTML = build(el.getAttribute('data-lotus'));
      el.setAttribute('data-lotus-ready', '');
    });
  }
  window.ARLotus = { mount: mount, svg: build };
  mount();
})();
