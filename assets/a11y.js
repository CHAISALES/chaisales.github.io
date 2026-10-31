/* Coruja Criativa Tech · painel de acessibilidade (v1, 31/10/2026). Sem bibliotecas. */
(function () {
  var d = document, raiz = d.documentElement, K = 'coruja-ax';
  var est = {};
  try { est = JSON.parse(localStorage.getItem(K) || '{}') || {}; } catch (e) { est = {}; }
  function salva() { try { localStorage.setItem(K, JSON.stringify(est)); } catch (e) {} }

  var MODOS = [
    { id: 'contraste', rot: 'Alto contraste', ic: '◐' },
    { id: 'parado', rot: 'Pausar animações', ic: '❚❚' },
    { id: 'legivel', rot: 'Fonte mais legível', ic: 'Aa' },
    { id: 'espaco', rot: 'Mais espaço no texto', ic: '↔' },
    { id: 'links', rot: 'Destacar links', ic: '🔗' },
    { id: 'cursor', rot: 'Cursor grande', ic: '➚' },
    { id: 'guia-on', rot: 'Guia de leitura', ic: '▭' }
  ];
  var ZOOM = [1, 1.15, 1.3, 1.5];

  function aplica() {
    MODOS.forEach(function (m) { raiz.classList.toggle('ax-' + m.id, !!est[m.id]); });
    var z = ZOOM[est.zoom || 0] || 1;
    raiz.style.zoom = z === 1 ? '' : String(z);
    if (est.legivel && !d.getElementById('ax-font')) {
      var l = d.createElement('link'); l.id = 'ax-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap';
      d.head.appendChild(l);
    }
    try { window.dispatchEvent(new CustomEvent('ax:mudou', { detail: est })); } catch (e) {}
  }
  aplica();

  function el(tag, attrs, txt) {
    var e = d.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (txt != null) e.textContent = txt;
    return e;
  }

  var montado = false;
  d.addEventListener('DOMContentLoaded', monta);
  if (d.readyState !== 'loading') monta();

  function monta() {
    if (montado) return; montado = true;

    // guia de leitura
    var guia = el('div', { 'class': 'ax-guia', 'aria-hidden': 'true' });
    d.body.appendChild(guia);
    function moveGuia(y) { guia.style.top = y + 'px'; }
    d.addEventListener('mousemove', function (e) { if (est['guia-on']) moveGuia(e.clientY); });
    d.addEventListener('touchmove', function (e) { if (est['guia-on'] && e.touches[0]) moveGuia(e.touches[0].clientY); }, { passive: true });
    moveGuia(window.innerHeight / 2);

    // botão
    var btn = el('button', { id: 'ax-botao', 'class': 'ax-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'ax-painel', 'aria-label': 'Abrir recursos de acessibilidade', title: 'Acessibilidade' });
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M4 8.5c2.7.8 5.3 1.2 8 1.2s5.3-.4 8-1.2l.5 1.9c-2 .6-4 1-6 1.2V14l2.3 7.5-1.9.6L12.8 15h-1.6l-2.1 7.1-1.9-.6L9.5 14v-2.4c-2-.2-4-.6-6-1.2z" fill="currentColor"/></svg>';
    d.body.appendChild(btn);

    // painel
    var p = el('div', { id: 'ax-painel', 'class': 'ax-panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ax-tit', hidden: '' });
    var fechar = el('button', { type: 'button', 'class': 'ax-close', 'aria-label': 'Fechar recursos de acessibilidade' }, '✕');
    p.appendChild(fechar);
    p.appendChild(el('h2', { id: 'ax-tit' }, 'Acessibilidade'));
    p.appendChild(el('p', { 'class': 'ax-sub' }, 'Ajuste o site do jeito que fica melhor para você. As escolhas ficam salvas neste aparelho.'));

    var linha = el('div', { 'class': 'ax-row', role: 'group', 'aria-label': 'Tamanho do texto' });
    var menos = el('button', { type: 'button', 'aria-label': 'Diminuir texto' }, 'A−');
    var normal = el('button', { type: 'button', 'aria-label': 'Texto no tamanho normal' }, 'A');
    var mais = el('button', { type: 'button', 'aria-label': 'Aumentar texto' }, 'A+');
    linha.appendChild(menos); linha.appendChild(normal); linha.appendChild(mais);
    p.appendChild(el('p', { 'class': 'ax-sub', style: 'margin:0 0 6px;font-weight:700;color:#071C24' }, 'Tamanho do texto'));
    p.appendChild(linha);
    var status = el('p', { 'class': 'sr', role: 'status', 'aria-live': 'polite' });
    p.appendChild(status);
    menos.onclick = function () { est.zoom = Math.max(0, (est.zoom || 0) - 1); salva(); aplica(); status.textContent = 'Tamanho ' + Math.round(ZOOM[est.zoom] * 100) + '%'; };
    mais.onclick = function () { est.zoom = Math.min(ZOOM.length - 1, (est.zoom || 0) + 1); salva(); aplica(); status.textContent = 'Tamanho ' + Math.round(ZOOM[est.zoom] * 100) + '%'; };
    normal.onclick = function () { est.zoom = 0; salva(); aplica(); status.textContent = 'Tamanho normal'; };

    var grade = el('div', { 'class': 'ax-grid' });
    MODOS.forEach(function (m) {
      var b = el('button', { type: 'button', 'aria-pressed': est[m.id] ? 'true' : 'false' });
      b.appendChild(el('span', { 'aria-hidden': 'true' }, m.ic));
      b.appendChild(el('span', {}, m.rot));
      b.onclick = function () { est[m.id] = !est[m.id]; b.setAttribute('aria-pressed', est[m.id] ? 'true' : 'false'); salva(); aplica(); };
      grade.appendChild(b);
    });

    // ouvir a página
    var podeFalar = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    var ouvir = el('button', { type: 'button', 'aria-pressed': 'false', 'class': 'ax-wide' });
    ouvir.appendChild(el('span', { 'aria-hidden': 'true' }, '🔊'));
    var ouvirTxt = el('span', {}, 'Ouvir esta página'); ouvir.appendChild(ouvirTxt);
    if (podeFalar) grade.appendChild(ouvir);
    var restaurar = el('button', { type: 'button', 'class': 'ax-wide' });
    restaurar.appendChild(el('span', { 'aria-hidden': 'true' }, '↺'));
    restaurar.appendChild(el('span', {}, 'Voltar ao padrão'));
    grade.appendChild(restaurar);
    p.appendChild(grade);

    var ajuda = el('a', { 'class': 'ax-help', href: 'https://wa.me/5581999455944?text=' + encodeURIComponent('Olá! Estou com dificuldade para usar o site da Coruja e preciso de ajuda.'), target: '_blank', rel: 'noopener' }, 'Precisa de ajuda? Fale com uma pessoa no WhatsApp');
    p.appendChild(ajuda);
    var rod = el('div', { 'class': 'ax-foot' });
    rod.appendChild(el('a', { href: '/acessibilidade/' }, 'Sobre a acessibilidade do site'));
    rod.appendChild(el('span', {}, 'Libras: botão azul à direita'));
    p.appendChild(rod);
    d.body.appendChild(p);

    restaurar.onclick = function () {
      est = {}; salva(); aplica(); paraLeitura();
      grade.querySelectorAll('button[aria-pressed]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      status.textContent = 'Configurações restauradas';
    };

    function abre() { p.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Fechar recursos de acessibilidade'); setTimeout(function () { menos.focus(); }, 30); }
    function fecha(volta) { p.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Abrir recursos de acessibilidade'); if (volta) btn.focus(); }
    btn.onclick = function () { p.hidden ? abre() : fecha(true); };
    fechar.onclick = function () { fecha(true); };
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) fecha(true); });
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-ax-abrir]');
      if (t) { e.preventDefault(); abre(); }
    });
    if (location.hash === '#acessibilidade') abre();

    // leitura em voz alta
    var fila = [], lendo = false, atual = null;
    function blocos() {
      var m = d.querySelector('main') || d.body;
      return [].slice.call(m.querySelectorAll('h1,h2,h3,p,li,.cd-msg,.cd-tag,summary,label')).filter(function (x) {
        if (x.closest('.ax-panel') || x.closest('[hidden]') || x.closest('.sr')) return false;
        var s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false;
        if (x.closest('li') && x.tagName !== 'LI') return false;
        return (x.innerText || '').trim().length > 1;
      });
    }
    function voz() {
      var vs = speechSynthesis.getVoices();
      return vs.filter(function (v) { return /pt[-_]BR/i.test(v.lang); })[0] || vs.filter(function (v) { return /^pt/i.test(v.lang); })[0] || null;
    }
    function proximo() {
      if (atual) atual.classList.remove('ax-lendo');
      if (!lendo || !fila.length) { paraLeitura(); return; }
      atual = fila.shift(); atual.classList.add('ax-lendo');
      try { atual.scrollIntoView({ block: 'center', behavior: est.parado ? 'auto' : 'smooth' }); } catch (e) {}
      var u = new SpeechSynthesisUtterance(atual.innerText.trim());
      u.lang = 'pt-BR'; var v = voz(); if (v) u.voice = v; u.rate = 0.95;
      u.onend = proximo; u.onerror = proximo;
      speechSynthesis.speak(u);
    }
    function paraLeitura() {
      lendo = false; fila = [];
      try { speechSynthesis.cancel(); } catch (e) {}
      if (atual) atual.classList.remove('ax-lendo');
      ouvir.setAttribute('aria-pressed', 'false'); ouvirTxt.textContent = 'Ouvir esta página';
    }
    ouvir.onclick = function () {
      if (lendo) { paraLeitura(); return; }
      var sel = (window.getSelection && String(window.getSelection())).trim();
      lendo = true; ouvir.setAttribute('aria-pressed', 'true'); ouvirTxt.textContent = 'Parar leitura';
      if (sel.length > 2) {
        var u = new SpeechSynthesisUtterance(sel); u.lang = 'pt-BR'; var v = voz(); if (v) u.voice = v;
        u.onend = paraLeitura; speechSynthesis.speak(u); return;
      }
      fila = blocos(); proximo();
    };
    window.addEventListener('beforeunload', function () { try { speechSynthesis.cancel(); } catch (e) {} });
  }
})();
