/* Trimedia Studios — shared behaviour.
   Three real WhatsApp lines, one per booking route. All three were confirmed
   as WhatsApp-capable before they went in here. */

var BRANCHES = {
  eldoret: {
    label: 'Trimedia Studios Eldoret',
    where: 'Eden Center, 1st Floor Room F15 — Eldoret town',
    wa: '254711449002',
    tel: '+254711449002',
    pretty: '+254 711 449 002',
    accent: 'eld'
  },
  nairobi: {
    label: 'Trimedia Studios Nairobi',
    where: 'Utawala, Nairobi',
    wa: '254790723047',
    tel: '+254790723047',
    pretty: '+254 790 723 047',
    accent: ''
  },
  events: {
    label: 'Trimedia Weddings & Events',
    where: 'Countrywide coverage',
    wa: '254714760450',
    tel: '+254714760450',
    pretty: '+254 714 760 450',
    accent: ''
  }
};

(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* splash — only ever shown because there is a real logo to show */
  window.addEventListener('load', function () {
    var s = document.getElementById('splash');
    if (!s) return;
    setTimeout(function () {
      s.classList.add('gone');
      setTimeout(function () { s.remove(); }, 650);
    }, reduce ? 0 : 420);
  });

  /* smart sticky header: hides going down, comes back the moment you scroll up */
  var hdr = document.querySelector('.hdr');
  var last = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (hdr && !document.querySelector('.nav.open')) {
      if (y > last && y > 240) hdr.classList.add('up');
      else hdr.classList.remove('up');
    }
    last = y; ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* mobile nav */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) hdr.classList.remove('up');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* scroll reveal */
  var rvs = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(rvs, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    Array.prototype.forEach.call(rvs, function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lb');
  if (lb) {
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var lbCount = document.getElementById('lbCount');
    var shots = [], idx = 0;

    function visible() {
      return Array.prototype.filter.call(
        document.querySelectorAll('.tile[data-full]'),
        function (t) { return !t.classList.contains('hide'); }
      );
    }
    function paint() {
      var t = shots[idx];
      if (!t) return;
      lbImg.src = t.getAttribute('data-full');
      lbImg.alt = t.getAttribute('data-cap') || 'Trimedia Studios photograph';
      lbCap.textContent = t.getAttribute('data-cap') || '';
      lbCount.textContent = (idx + 1) + ' of ' + shots.length;
    }
    function open(t) {
      shots = visible();
      idx = shots.indexOf(t);
      if (idx < 0) idx = 0;
      paint();
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
      document.getElementById('lbClose').focus();
    }
    function close() {
      lb.classList.remove('on');
      document.body.style.overflow = '';
      lbImg.removeAttribute('src');
    }
    function step(n) {
      idx = (idx + n + shots.length) % shots.length;
      paint();
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('.tile[data-full]');
      if (t) { e.preventDefault(); open(t); }
    });
    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
    document.getElementById('lbNext').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    /* swipe */
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 48) step(dx > 0 ? -1 : 1);
      x0 = null;
    }, { passive: true });
  }

  /* ---------- gallery filters ---------- */
  var filters = document.querySelector('.filters');
  if (filters) {
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cat]');
      if (!b) return;
      var cat = b.getAttribute('data-cat');
      Array.prototype.forEach.call(filters.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      Array.prototype.forEach.call(document.querySelectorAll('.tile[data-cat]'), function (t) {
        var show = cat === 'all' || t.getAttribute('data-cat').indexOf(cat) > -1;
        t.classList.toggle('hide', !show);
      });
    });
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById('bookForm');
  if (form) {
    var sel = document.getElementById('branch');
    var route = document.getElementById('route');

    function showRoute() {
      var b = BRANCHES[sel.value];
      if (!b) {
        route.className = 'route';
        route.innerHTML = '<span>Where this goes</span>Pick a studio above and we’ll show you exactly which team receives your request.';
        return;
      }
      route.className = 'route' + (b.accent ? ' ' + b.accent : '');
      route.innerHTML = '<span>Where this goes</span>Straight to <b>' + b.label +
        '</b> on WhatsApp, <b>' + b.pretty + '</b>. ' + b.where + '.';
    }
    sel.addEventListener('change', showRoute);
    showRoute();

    function bad(id, on) {
      document.getElementById(id).closest('.field').classList.toggle('bad', on);
    }
    form.addEventListener('input', function (e) {
      if (e.target.id) bad(e.target.id, false);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var branch = sel.value;
      var service = document.getElementById('service').value;
      var when = document.getElementById('when').value;
      var people = document.getElementById('people').value.trim();
      var notes = document.getElementById('notes').value.trim();

      var ok = true;
      if (!name) { bad('name', true); ok = false; }
      if (!phone || phone.replace(/\D/g, '').length < 9) { bad('phone', true); ok = false; }
      if (!branch) { bad('branch', true); ok = false; }
      if (!service) { bad('service', true); ok = false; }
      if (!ok) {
        var first = form.querySelector('.field.bad input, .field.bad select');
        if (first) first.focus();
        return;
      }

      var b = BRANCHES[branch];
      var lines = [
        'Hi Trimedia Studios — I’d like to book a session.',
        '',
        'Studio: ' + b.label,
        'Name: ' + name,
        'Phone: ' + phone,
        'Session: ' + service
      ];
      if (when) lines.push('Preferred date: ' + when);
      if (people) lines.push('People in the shoot: ' + people);
      if (notes) lines.push('Notes: ' + notes);
      lines.push('', 'Sent from the Trimedia Studios website');

      window.open('https://wa.me/' + b.wa + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  /* floating CTA follows the branch picked on the booking page, main line elsewhere */
  var float = document.querySelector('.float');
  if (float && form) {
    document.getElementById('branch').addEventListener('change', function (e) {
      var b = BRANCHES[e.target.value];
      if (b) float.href = 'https://wa.me/' + b.wa + '?text=' +
        encodeURIComponent('Hi Trimedia Studios — I’d like to ask about a shoot.');
    });
  }
})();
