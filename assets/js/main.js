/* =====================================================================
   Site — page behaviour
   Nothing here normally needs editing. Settings live in config.js.
   ===================================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var EMAIL_PLACEHOLDER = /REPLACE-WITH-YOUR-EMAIL/i;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------
     GOOGLE ANALYTICS 4 — only loaded when an ID is configured
  --------------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  (function initGA() {
    var id = (CFG.ga4MeasurementId || '').trim();
    if (!id) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', id);
  })();

  function track(name, params) {
    try { window.gtag('event', name, params || {}); } catch (e) {}
  }

  /* ---------------------------------------------------------------
     YEAR
  --------------------------------------------------------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     MOBILE MENU
  --------------------------------------------------------------- */
  var burger = $('#burger');
  var menu   = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------------------
     SOCIAL LINKS — anything left empty in config.js is removed
  --------------------------------------------------------------- */
  (function socials() {
    var s = CFG.social || {};
    $$('[data-social]').forEach(function (a) {
      var url = (s[a.dataset.social] || '').trim();
      if (!url) {                       // no URL yet: keep the icon, make it inert
        a.setAttribute('aria-disabled', 'true');
        a.removeAttribute('href');
        return;
      }
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  })();

  /* ---------------------------------------------------------------
     REVEAL ON SCROLL
  --------------------------------------------------------------- */
  var reveals = $$('.rv');
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
    requestAnimationFrame(function () {
      $$('.hero .rv').forEach(function (el) { el.classList.add('in'); });
    });
  }

  /* ---------------------------------------------------------------
     THE TEAM FILM
     The poster is a plain image until it is clicked — no YouTube or
     Vimeo request is made before that, so the page stays fast and
     nothing is loaded from a third party on arrival.
  --------------------------------------------------------------- */
  (function video() {
    var fig      = $('#player');
    var btn      = $('#playBtn');
    var note     = $('#playerNote');
    var timeEl   = $('#playerTime');
    if (!fig || !btn) return;

    var v = CFG.video || {};
    var type = (v.type || '').toLowerCase().trim();

    if (v.duration && timeEl) timeEl.textContent = '0:00 / ' + v.duration;

    if (v.poster) {
      var img = btn.querySelector('img');
      if (img) {
        img.src = v.poster;
        img.removeAttribute('srcset');
        var src = btn.querySelector('source');
        if (src) src.remove();
      }
    }

    if (!type) {
      note.textContent = 'Film not set yet — add it in assets/js/config.js.';
    }

    btn.addEventListener('click', function () {
      if (!type) {
        note.textContent = 'The team film goes here. Send it over and it drops straight in.';
        return;
      }
      track('video_play', { video_type: type });

      var el;
      if (type === 'mp4') {
        el = document.createElement('video');
        el.src = v.src;
        el.controls = true;
        el.autoplay = true;
        el.playsInline = true;
        el.setAttribute('preload', 'metadata');
      } else {
        el = document.createElement('iframe');
        el.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
        el.allowFullscreen = true;
        el.title = 'Site team film';
        el.src = (type === 'vimeo')
          ? 'https://player.vimeo.com/video/' + encodeURIComponent(v.id) + '?autoplay=1'
          : 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?autoplay=1&rel=0';
      }
      btn.replaceWith(el);
      note.textContent = '';
    });
  })();

  /* ---------------------------------------------------------------
     "APPLY NOW" / "JOIN THE STAFF" / "BECOME A PARTNER"
     preselect the matching option on the form
  --------------------------------------------------------------- */
  $$('a[data-role]').forEach(function (a) {
    a.addEventListener('click', function () {
      var want = a.dataset.role;
      var radio = $$('input[name="Role"]').filter(function (r) { return r.value === want; })[0];
      if (radio) { radio.checked = true; track('apply_intent', { role: want }); }
    });
  });

  /* ---------------------------------------------------------------
     SHARED FORM PLUMBING
  --------------------------------------------------------------- */
  var useServer = CFG.useServerScript === true;
  var demoMode  = !useServer && EMAIL_PLACEHOLDER.test(CFG.applicationsEmail || '');
  var endpoint  = useServer
    ? 'send.php'
    : 'https://formsubmit.co/' + encodeURIComponent((CFG.applicationsEmail || '').trim());

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var PHONE_RE = /^[+()\d][\d\s().-]{6,}$/;

  var TXT = {
    demo:     'Demo mode — add your email address in assets/js/config.js and these go to your inbox.',
    demoOk:   'Form is valid. With an email address configured, this application and the attached CV would have been sent.',
    demoSub:  'Demo mode — no address configured yet, so nothing was sent.',
    sending:  'Sending…',
    tooBig:   'That file is too heavy (5 MB max).',
    badType:  'Format not accepted — PDF, DOC or DOCX only.',
    fixErrors:'A few fields need fixing.',
    badEmail: 'That email address doesn\'t look right.'
  };

  /* ---------------------------------------------------------------
     APPLICATION FORM
  --------------------------------------------------------------- */
  (function applyForm() {
    var form = $('#applyForm');
    if (!form) return;

    var MAX_BYTES = 5 * 1024 * 1024;      // FormSubmit's attachment ceiling
    var note      = $('#formNote');
    var fileInput = $('#f-cv');
    var drop      = $('#drop');
    var submitBtn = $('#submitBtn');
    var ALLOWED   = ['pdf', 'doc', 'docx'];

    form.action = endpoint;
    $('#formNext').value = new URL('thanks.html', window.location.href).href;

    function setNote(msg, kind) {
      note.textContent = msg || '';
      note.className = 'form__note' + (kind ? ' is-' + kind : '');
    }
    if (demoMode) setNote(TXT.demo);

    function describeFile(f) {
      var kb = f.size / 1024;
      return f.name + '  ·  ' + (kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB');
    }

    function handleFile() {
      var f = fileInput.files && fileInput.files[0];
      var field = fileInput.closest('.field');
      var txt = $('.drop__txt', drop);
      if (!f) { drop.classList.remove('has-file'); return; }

      var ext = (f.name.split('.').pop() || '').toLowerCase();
      if (ALLOWED.indexOf(ext) === -1) {
        fileInput.value = ''; drop.classList.remove('has-file');
        field.classList.add('is-bad'); $('.err', field).textContent = TXT.badType;
        return;
      }
      if (f.size > MAX_BYTES) {
        fileInput.value = ''; drop.classList.remove('has-file');
        field.classList.add('is-bad'); $('.err', field).textContent = TXT.tooBig;
        return;
      }
      field.classList.remove('is-bad');
      drop.classList.add('has-file');
      txt.textContent = describeFile(f);
      track('cv_attached');
    }

    fileInput.addEventListener('change', handleFile);
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFile();
      }
    });

    function fieldOf(el) { return el.closest('.field'); }

    function validate(el) {
      var field = fieldOf(el);
      var ok;
      if (el === fileInput)            ok = !!(fileInput.files && fileInput.files[0]);
      else if (el.type === 'checkbox') ok = el.checked;
      else if (el.type === 'email')    ok = EMAIL_RE.test(el.value.trim());
      else if (el.type === 'tel')      ok = PHONE_RE.test(el.value.trim());
      else                             ok = el.value.trim().length > 0;
      if (field) field.classList.toggle('is-bad', !ok);
      return ok;
    }

    var required = [$('#f-name'), $('#f-email'), $('#f-phone'), fileInput, $('#f-consent')];
    required.forEach(function (el) {
      var ev = (el.type === 'checkbox') ? 'change' : 'blur';
      el.addEventListener(ev, function () { validate(el); });
      el.addEventListener('input', function () {
        if (fieldOf(el) && fieldOf(el).classList.contains('is-bad')) validate(el);
      });
    });

    var started = false;
    form.addEventListener('focusin', function () {
      if (started) return;
      started = true;
      track('apply_start');
    });

    form.addEventListener('submit', function (e) {
      var firstBad = null;
      required.forEach(function (el) { if (!validate(el) && !firstBad) firstBad = el; });

      if (firstBad) {
        e.preventDefault();
        setNote(TXT.fixErrors, 'bad');
        (fieldOf(firstBad) || firstBad).scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (firstBad !== fileInput) firstBad.focus({ preventScroll: true });
        return;
      }

      var role = ($$('input[name="Role"]').filter(function (r) { return r.checked; })[0] || {}).value;
      track('generate_lead', { role: role });

      if (demoMode) { e.preventDefault(); setNote(TXT.demoOk, 'ok'); return; }

      submitBtn.disabled = true;
      setNote(TXT.sending);
    });
  })();

  /* ---------------------------------------------------------------
     SUBSCRIBE STRIP
  --------------------------------------------------------------- */
  (function subForm() {
    var form  = $('#subForm');
    if (!form) return;
    var input = $('#sub-email');
    var note  = $('#subNote');

    form.action = endpoint;
    $('#subNext').value = new URL('thanks.html', window.location.href).href;

    function setNote(msg, kind) {
      note.textContent = msg || '';
      note.className = 'sub__note' + (kind ? ' is-' + kind : '');
    }

    input.addEventListener('input', function () {
      if (form.classList.contains('is-bad')) {
        form.classList.toggle('is-bad', !EMAIL_RE.test(input.value.trim()));
      }
    });

    form.addEventListener('submit', function (e) {
      if (!EMAIL_RE.test(input.value.trim())) {
        e.preventDefault();
        form.classList.add('is-bad');
        setNote(TXT.badEmail, 'bad');
        input.focus({ preventScroll: true });
        return;
      }
      form.classList.remove('is-bad');
      track('newsletter_signup');

      if (demoMode) { e.preventDefault(); setNote(TXT.demoSub, 'ok'); return; }
      setNote(TXT.sending);
    });
  })();

})();
