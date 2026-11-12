/* MarthyIAM — interacciones del sitio público (sin dependencias). */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  /* ── Tema claro / oscuro ───────────────────────────────────────────── */
  var themeBtn = $('#themeToggle');
  function isLight() { return root.getAttribute('data-theme') === 'light'; }
  function saveTheme(v) { try { localStorage.setItem('marthyiam-theme', v); } catch (e) {} }
  function syncThemeLabel() {
    themeBtn.setAttribute('aria-label', isLight() ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  }
  themeBtn.addEventListener('click', function () {
    if (isLight()) { root.removeAttribute('data-theme'); saveTheme('dark'); }
    else { root.setAttribute('data-theme', 'light'); saveTheme('light'); }
    syncThemeLabel();
  });
  syncThemeLabel();

  /* ── Menú móvil ────────────────────────────────────────────────────── */
  var navMenu = $('#navMenu');
  var navBtn = $('#navToggle');
  function setNav(open) {
    navMenu.classList.toggle('open', open);
    navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    navBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  navBtn.addEventListener('click', function () { setNav(!navMenu.classList.contains('open')); });
  $$('a', navMenu).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) setNav(false); });

  /* ── Pestañas de "Desarrollos" ─────────────────────────────────────── */
  var tabs = $$('[role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    var list = tab.parentNode;
    // desplaza solo la barra de pestañas (no la página)
    var target = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    if (list.scrollTo) list.scrollTo({ left: target, behavior: 'smooth' }); else list.scrollLeft = target;
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ── Modal de contacto (abre el correo del visitante con el mensaje armado) ── */
  var overlay = $('#contactModal');
  var form = $('#leadForm');
  var lastFocus = null;
  var CONTACT_EMAIL = 'hola@marthyiam.com';

  function openModal(need) {
    lastFocus = document.activeElement;
    if (need) { var sel = $('#need'); if (sel) sel.value = need; }
    $('#formState').style.display = '';
    $('#successState').style.display = 'none';
    $('#formError').textContent = '';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var f = $('#fname'); if (f) f.focus(); }, 60);
  }
  function closeModal() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-open-modal]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      setNav(false);
      openModal(el.getAttribute('data-open-modal'));
    });
  });
  $('#modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); setNav(false); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fname').value.trim();
    var company = $('#company').value.trim();
    var email = $('#email').value.trim();
    var need = $('#need').value;
    var notes = $('#notes').value.trim();
    var err = $('#formError');

    if (!name) { err.textContent = 'Cuéntanos tu nombre para poder responderte.'; $('#fname').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Revisa tu correo: parece que falta algo.'; $('#email').focus(); return; }
    err.textContent = '';

    var subject = 'Cotización: ' + (need || 'Proyecto de software') + (company ? ' — ' + company : '');
    var body = [
      'Hola, me gustaría conversar sobre un proyecto.',
      '',
      'Nombre: ' + name,
      'Empresa: ' + (company || '(no indicada)'),
      'Correo: ' + email,
      'Necesito: ' + (need || '(por definir)'),
      '',
      notes || '(Sin detalles adicionales)'
    ].join('\n');

    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    $('#formState').style.display = 'none';
    $('#successState').style.display = 'block';
  });

  /* ── Animación de entrada al hacer scroll ──────────────────────────── */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }
})();
