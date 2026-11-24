/* ═══════════════════════════════════════════════════════════════
   ANDRÉIA RIBEIRO — ICONS
   A small line set (24 grid · 1.5 stroke · round caps), drawn in
   the Solar Linear manner the references used, shipped locally so
   the system works offline and under strict CSP.

   <ar-icon name="arrow-right"></ar-icon>   size = font-size, colour = currentColor
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var P = {
    'arrow-right': '<path d="M4 12h16M14 6l6 6-6 6"/>',
    'arrow-left': '<path d="M20 12H4M10 6l-6 6 6 6"/>',
    'arrow-down': '<path d="M12 4v16M6 14l6 6 6-6"/>',
    'arrow-right-up': '<path d="M7 17 17 7M8.5 7H17v8.5"/>',
    'alt-arrow-down': '<path d="m6 9.5 6 5.5 6-5.5"/>',
    'hamburger-menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'close-circle': '<circle cx="12" cy="12" r="9.25"/><path d="m9.5 9.5 5 5m0-5-5 5"/>',
    'calendar': '<rect x="3.75" y="5.25" width="16.5" height="15" rx="2"/><path d="M3.75 10h16.5M8 3v4M16 3v4"/>',
    'needle': '<path d="M19 5 7.5 16.5M17 4.5l2.5 2.5M6 18l-2 2"/><path d="M15 9c-3 0-6 1.5-6 4.5S12 18 15 15.5"/>',
    'hanger': '<path d="M12 7.5a2 2 0 1 1 2-2M12 7.5v1.2L3.5 15a1.2 1.2 0 0 0 .7 2.2h15.6a1.2 1.2 0 0 0 .7-2.2L12 8.7"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || '') + '</svg>';
  }
  if (!customElements.get('ar-icon')) {
    customElements.define('ar-icon', class extends HTMLElement {
      static get observedAttributes() { return ['name']; }
      connectedCallback() { this.render(); }
      attributeChangedCallback() { this.render(); }
      render() { this.innerHTML = svg(this.getAttribute('name')); }
    });
  }
  window.ARIcons = { names: Object.keys(P), svg: svg };
})();
