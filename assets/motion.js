/* Coruja Criativa Tech · camada de movimento (v1, 31/10/2026). Sem bibliotecas. */
(function () {
  var raiz = document.documentElement;
  var reduz = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || raiz.classList.contains('ax-parado');
  function parado() { return raiz.classList.contains('ax-parado'); }
  if (!('IntersectionObserver' in window)) return;

  // ---------- revelar ao rolar ----------
  var alvos = [];
  document.querySelectorAll('main section:not(.hero)').forEach(function (sec) {
    sec.querySelectorAll('h2, .quote, .lead, .card, .stat, .step, .post-card, .ebook img, .chatdemo, .actions').forEach(function (el, i) {
      if (el.closest('.hero') || el.classList.contains('rv')) return;
      el.classList.add('rv');
      el.style.setProperty('--d', Math.min(i % 6, 5) * 0.08 + 's');
      alvos.push(el);
    });
    sec.querySelectorAll('img[src*="selo"], img[src*="placa"]').forEach(function (el) {
      if (el.closest('.hero')) return;
      el.classList.remove('rv'); el.classList.add('rv-zoom'); alvos.push(el);
    });
    sec.querySelectorAll('.steps').forEach(function (el) { alvos.push(el); });
  });
  if (!reduz) {
    var visto = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.matches('.stat')) conta(en.target.querySelector('b'));
        visto.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    // o que já está na tela aparece sem esperar
    var alt = window.innerHeight;
    alvos.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < alt * 0.92 && r.bottom > 0) el.classList.add('in');
      else visto.observe(el);
    });
    raiz.classList.add('js-motion');
  }

  // ---------- números que contam (ex.: −2,9% · 16% · 33%) ----------
  function conta(b) {
    if (!b || b.dataset.ok) return;
    b.dataset.ok = 1;
    var txt = b.textContent, m = txt.match(/-?−?\d+(?:,\d+)?/);
    if (!m) return;
    var alvo = parseFloat(m[0].replace('−', '-').replace(',', '.')), casas = (m[0].split(',')[1] || '').length, t0 = null;
    function passo(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200), v = alvo * (1 - Math.pow(1 - p, 3));
      b.textContent = txt.replace(m[0], (v < 0 ? '−' : '') + Math.abs(v).toFixed(casas).replace('.', ','));
      if (p < 1) requestAnimationFrame(passo); else b.textContent = txt;
    }
    requestAnimationFrame(passo);
  }

  if (reduz) return;

  // ---------- partículas no hero ----------
  document.querySelectorAll('.hero').forEach(function (hero) {
    var cv = document.createElement('canvas'); cv.className = 'fx'; cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.firstChild);
    var cx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), pts = [], ativo = true, mx = -1e4, my = -1e4;
    function tam() {
      var r = hero.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 700 ? 32 : 70; pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, r: 0.8 + Math.random() * 2.2, v: 0.15 + Math.random() * 0.45, a: 0.35 + Math.random() * 0.55, f: Math.random() * 6.28 });
    }
    tam(); window.addEventListener('resize', tam);
    hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('mouseleave', function () { mx = my = -1e4; });
    new IntersectionObserver(function (en) { ativo = en[0].isIntersecting; if (ativo) requestAnimationFrame(quadro); }).observe(hero);
    function quadro(t) {
      if (!ativo || document.hidden || parado()) return;
      cx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.y -= p.v; p.x += Math.sin(t / 1600 + p.f) * 0.25;
        var dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
        if (d < 9000) { p.x += dx * 0.02; p.y += dy * 0.02; }
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        cx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 900 + p.f));
        cx.fillStyle = i % 4 ? '#38D9F0' : '#EAF4F5';
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
      }
      // linhas finas entre partículas próximas (rede "tech")
      cx.globalAlpha = 1; cx.lineWidth = 0.6;
      for (var a = 0; a < pts.length; a++) for (var b2 = a + 1; b2 < pts.length; b2++) {
        var ex = pts[a].x - pts[b2].x, ey = pts[a].y - pts[b2].y, dd = ex * ex + ey * ey;
        if (dd < 9000) { cx.strokeStyle = 'rgba(56,217,240,' + (0.26 * (1 - dd / 9000)) + ')'; cx.beginPath(); cx.moveTo(pts[a].x, pts[a].y); cx.lineTo(pts[b2].x, pts[b2].y); cx.stroke(); }
      }
      requestAnimationFrame(quadro);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && ativo) requestAnimationFrame(quadro); });
    window.addEventListener('ax:mudou', function () { if (!parado() && ativo) requestAnimationFrame(quadro); });
    requestAnimationFrame(quadro);

    // coruja acompanha o mouse de leve
    var owl = hero.querySelector('.owl');
    if (owl && window.matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        owl.style.setProperty('--px', (x * 18).toFixed(1) + 'px'); owl.style.setProperty('--py', (y * 12).toFixed(1) + 'px');
      });
    }
  });

  // ---------- conversa animada: atender x resolver ----------
  document.querySelectorAll('.chatdemo').forEach(function (box) {
    var passos = [].slice.call(box.querySelectorAll('.cd-step')), tempos = [1500, 1300, 1300, 1500, 1500, 1800, 1600], timer = null, rodando = false;
    function roda(i) {
      if (parado()) { rodando = false; return; }
      if (i === 0) passos.forEach(function (s) { s.classList.remove('on'); });
      if (i >= passos.length) { timer = setTimeout(function () { roda(0); }, 5200); return; }
      var s = passos[i];
      if (s.classList.contains('cd-typing')) {
        s.classList.add('on');
        timer = setTimeout(function () { s.classList.remove('on'); roda(i + 1); }, tempos[i] || 1200);
        return;
      }
      s.classList.add('on');
      timer = setTimeout(function () { roda(i + 1); }, tempos[i] || 1300);
    }
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !rodando && !parado()) { rodando = true; roda(0); }
      if (!en[0].isIntersecting && rodando) { rodando = false; clearTimeout(timer); }
    }, { threshold: 0.35 }).observe(box);
  });
})();
