/* ═══════════════════════════════════════════════════════════════
   ANDRÉIA RIBEIRO — SILK (WebGL drapery)
   Atmosphere only, never content (ØDE: "type leads, shader is
   atmosphere"). Domain-warped fbm folds a cloth; a sharpened sine
   across the warp gives satin highlights that pick up gold.

   ARSilk(canvas, {
     colors: ['#FDF7E7', '#F9F1D8', '#C6AF6C', '#B19F6E'],  // base, fold, sheen, shadow
     speed: 1, sheen: .55, scale: 1.4, shadow: .14
   })
   • renders at ½ resolution, pauses off-screen
   • prefers-reduced-motion → a single still frame
   • no WebGL → CSS gradient fallback on the canvas' parent
   ═══════════════════════════════════════════════════════════════ */
(function () {
  function hex(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 r;uniform float t;uniform vec3 c0,c1,c2,c3;uniform float sh,sc,sd;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r.y*sc;',
    ' vec2 q=vec2(fbm(uv*.8+t*.030),fbm(uv*.8+vec2(5.2,1.3)-t*.022));',
    ' float f=fbm(uv*1.1+1.2*q+t*.012);',
    ' float w=uv.x*2.3+uv.y*.38+1.15*q.x+.55*q.y;',
    ' float fold=sin(w*3.7699)+.38*sin((uv.x*5.2-uv.y*.25+1.7*q.y)*3.14159+t*.05);',
    ' float lit=smoothstep(-.55,1.25,fold);',
    ' vec3 col=mix(c0,c1,smoothstep(.3,.8,f));',
    ' col=mix(col,c2,pow(lit,5.)*sh);',
    ' col=mix(col,c3,smoothstep(.35,1.,1.-lit)*sd);',
    ' col+=(h(gl_FragCoord.xy+t)-.5)*.012;',          // fine weave grain
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function ARSilk(canvas, o) {
    o = o || {};
    var cols = (o.colors || ['#FDF7E7', '#F9F1D8', '#C6AF6C', '#B19F6E']).map(hex);
    var gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      canvas.style.display = 'none';
      if (canvas.parentElement) canvas.parentElement.style.background =
        'linear-gradient(115deg,' + (o.colors || [])[0] + ' 0%,' + (o.colors || [])[1] + ' 45%,' + (o.colors || [])[2] + ' 52%,' + (o.colors || [])[1] + ' 60%,' + (o.colors || [])[0] + ' 100%)';
      return null;
    }
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['r', 't', 'c0', 'c1', 'c2', 'c3', 'sh', 'sc', 'sd'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k); });
    gl.uniform3fv(U.c0, cols[0]); gl.uniform3fv(U.c1, cols[1]); gl.uniform3fv(U.c2, cols[2]); gl.uniform3fv(U.c3, cols[3]);
    gl.uniform1f(U.sh, o.sheen == null ? .55 : o.sheen);
    gl.uniform1f(U.sc, o.scale || 1.4);
    gl.uniform1f(U.sd, o.shadow == null ? .14 : o.shadow);

    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var speed = o.speed == null ? 1 : o.speed, visible = true, raf = 0, t0 = performance.now(), offset = Math.random() * 40;

    function size() {
      var w = Math.max(1, canvas.clientWidth * 0.5 | 0), h = Math.max(1, canvas.clientHeight * 0.5 | 0);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(U.r, w, h);
    }
    function draw(now) {
      size();
      gl.uniform1f(U.t, offset + (now - t0) / 1000 * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) { draw(now); if (visible && !still) raf = requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(loop);
      }).observe(canvas);
    }
    window.addEventListener('resize', function () { draw(performance.now()); });
    raf = requestAnimationFrame(loop);
    return { setSpeed: function (s) { speed = s; } };
  }

  window.ARSilk = ARSilk;
  // auto-mount: <canvas data-silk='{"colors":[...]}'></canvas>
  document.querySelectorAll('canvas[data-silk]').forEach(function (c) {
    var cfg = {}; try { cfg = JSON.parse(c.getAttribute('data-silk') || '{}'); } catch (e) { /* defaults */ }
    ARSilk(c, cfg);
  });
})();
