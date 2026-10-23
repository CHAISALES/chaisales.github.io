/* Coruja Criativa Tech · medição do site
   - Repassa a origem da visita (UTM) para o checkout da Kiwify, mesmo sem nenhuma ferramenta ligada.
   - GA4, Meta Pixel e Microsoft Clarity só ligam quando o ID estiver preenchido abaixo.
   - LGPD: GA4 roda em modo de consentimento (sem cookies até a pessoa aceitar); Pixel e Clarity só depois do aceite. */
(function () {
  var C = {
    ga4: '',      // ex.: 'G-XXXXXXXXXX'  (Google Analytics 4)
    pixel: '',    // ex.: '123456789012345' (Meta Pixel)
    clarity: ''   // ex.: 'abcd1234ef'      (Microsoft Clarity)
  };
  var RAIOX = { currency: 'BRL', value: 97, items: [{ item_id: 'raio-x-digital', item_name: 'Raio-X Digital', price: 97 }] };

  var w = window, d = document, KEY = 'coruja-consent', UKEY = 'coruja-utm';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var path = location.pathname;

  /* ---------- 1. Origem da visita (UTM) ---------- */
  var P = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'];
  var q = new URLSearchParams(location.search), got = {};
  P.forEach(function (k) { var v = q.get(k); if (v) got[k] = v.slice(0, 100); });
  if (q.get('fbclid') && !got.utm_source) { got.utm_source = 'meta'; got.utm_medium = 'paid'; }
  if (q.get('gclid') && !got.utm_source) { got.utm_source = 'google'; got.utm_medium = 'cpc'; }
  if (!got.utm_source && d.referrer) {
    var host = ''; try { host = new URL(d.referrer).hostname.replace(/^www\./, ''); } catch (e) {}
    if (host && host !== location.hostname.replace(/^www\./, '')) {
      if (/instagram/.test(host)) { got.utm_source = 'instagram'; got.utm_medium = 'social'; }
      else if (/facebook/.test(host)) { got.utm_source = 'facebook'; got.utm_medium = 'social'; }
      else if (/linkedin|lnkd/.test(host)) { got.utm_source = 'linkedin'; got.utm_medium = 'social'; }
      else if (/google\./.test(host)) { got.utm_source = 'google'; got.utm_medium = 'organic'; }
      else if (/bing\./.test(host)) { got.utm_source = 'bing'; got.utm_medium = 'organic'; }
      else { got.utm_source = host; got.utm_medium = 'referral'; }
    }
  }
  var utm = null;
  if (got.utm_source) { got.ts = Date.now(); set(UKEY, JSON.stringify(got)); utm = got; }
  else { try { utm = JSON.parse(get(UKEY) || 'null'); } catch (e) {} if (utm && Date.now() - utm.ts > 30 * 864e5) utm = null; }

  function decorate(a) {
    if (!utm || !a.href || a.href.indexOf('pay.kiwify.com.br') < 0) return;
    try {
      var u = new URL(a.href);
      P.forEach(function (k) { if (utm[k] && !u.searchParams.get(k)) u.searchParams.set(k, utm[k]); });
      if (!u.searchParams.get('src')) u.searchParams.set('src', utm.utm_source);
      a.href = u.toString();
    } catch (e) {}
  }

  /* ---------- 2. Ferramentas (só com ID) ---------- */
  var anyTool = C.ga4 || C.pixel || C.clarity;
  var consent = get(KEY); // 'all' | 'essential' | null
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };

  function loadScript(src) { var s = d.createElement('script'); s.async = true; s.src = src; d.head.appendChild(s); }

  if (C.ga4) {
    var g = consent === 'all' ? 'granted' : 'denied';
    gtag('consent', 'default', { ad_storage: g, analytics_storage: g, ad_user_data: g, ad_personalization: g, wait_for_update: 500 });
    gtag('js', new Date());
    gtag('config', C.ga4, utm ? { campaign_source: utm.utm_source, campaign_medium: utm.utm_medium, campaign_name: utm.utm_campaign } : {});
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + C.ga4);
  }

  var marketingOn = false;
  function startMarketing() {
    if (marketingOn) return; marketingOn = true;
    if (C.pixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', C.pixel); fbq('track', 'PageView');
    }
    if (C.clarity) {
      (function (c, l, a, r, i, t, y) { c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); }; t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i; y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y); })(w, d, 'clarity', 'script', C.clarity);
    }
    pageEvents(true);
  }

  /* ---------- 3. Eventos do funil ---------- */
  function track(ga, gaParams, meta, metaParams) {
    if (C.ga4 && ga) gtag('event', ga, gaParams || {});
    if (w.fbq && meta) fbq(meta.custom ? 'trackCustom' : 'track', meta.name, metaParams || {});
  }
  var M = function (n) { return { name: n }; }, MC = function (n) { return { name: n, custom: true }; };

  function pageEvents(metaOnly) {
    var ga = !metaOnly;
    if (path === '/raio-x/' || path === '/raio-x/index.html')
      track(ga && 'view_item', RAIOX, M('ViewContent'), { content_name: 'Raio-X Digital', content_ids: ['raio-x-digital'], value: 97, currency: 'BRL' });
    else if (path.indexOf('/raio-x/questionario') === 0)
      track(ga && 'raiox_questionario_aberto', {}, MC('QuestionarioAberto'));
    else if (path.indexOf('/servicos') === 0)
      track(ga && 'view_servicos', {}, M('ViewContent'), { content_name: 'Serviços' });
  }

  d.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a,[data-track]');
    if (!a) return;
    if (a.getAttribute('data-track')) track(a.getAttribute('data-track'), { link_url: a.href || '' });
    var h = a.href || '';
    if (h.indexOf('pay.kiwify.com.br') >= 0) { decorate(a); track('begin_checkout', RAIOX, M('InitiateCheckout'), { content_name: 'Raio-X Digital', value: 97, currency: 'BRL' }); }
    else if (h.indexOf('wa.me/') >= 0) track('contato_whatsapp', { page: path }, M('Contact'), { content_name: 'WhatsApp' });
    else if (h.indexOf('mailto:') === 0) track('contato_email', { page: path }, M('Contact'), { content_name: 'E-mail' });
    else if (/\/ebook\/?/.test(h)) track('clique_ebook', { page: path }, MC('CliqueEbook'));
  }, true);

  w.addEventListener('rx:enviado', function () {
    track('generate_lead', { currency: 'BRL', value: 97, lead_source: 'raio-x' }, M('CompleteRegistration'), { content_name: 'Raio-X Digital', value: 97, currency: 'BRL' });
  });

  /* ---------- 4. Banner de consentimento (só aparece se houver ferramenta ligada) ---------- */
  function choose(v) {
    set(KEY, v); var b = d.getElementById('cc-banner'); if (b) b.remove();
    if (C.ga4) { var g = v === 'all' ? 'granted' : 'denied'; gtag('consent', 'update', { ad_storage: g, analytics_storage: g, ad_user_data: g, ad_personalization: g }); }
    if (v === 'all') startMarketing();
  }
  function banner() {
    if (d.getElementById('cc-banner')) return;
    var b = d.createElement('div'); b.id = 'cc-banner'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Preferências de cookies');
    b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;margin:0 auto;background:#071C24;color:#E6F2F4;border:1px solid #19B5C9;border-radius:14px;padding:16px 18px;font:14px/1.5 Inter,Arial,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.35)';
    b.innerHTML = '<p style="margin:0 0 12px">Usamos cookies para entender como o site é usado e medir nossos anúncios. Você escolhe. <a href="/privacidade/" style="color:#19B5C9">Política de privacidade</a></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-v="all" style="background:#19B5C9;color:#071C24;border:0;border-radius:8px;padding:10px 16px;font-weight:700;cursor:pointer">Aceitar</button>' +
      '<button type="button" data-v="essential" style="background:transparent;color:#E6F2F4;border:1px solid #5B7078;border-radius:8px;padding:10px 16px;cursor:pointer">Só os essenciais</button></div>';
    b.addEventListener('click', function (e) { var v = e.target.getAttribute && e.target.getAttribute('data-v'); if (v) choose(v); });
    d.body.appendChild(b);
  }
  w.corujaCookies = function () { if (anyTool) banner(); };

  function ready() {
    Array.prototype.forEach.call(d.querySelectorAll('a[href*="pay.kiwify.com.br"]'), decorate);
    if (!anyTool) return;
    pageEvents(false);
    if (consent === 'all') startMarketing();
    else if (!consent) banner();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', ready); else ready();
})();
