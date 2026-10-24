(function () {
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var header = document.getElementById('top');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Legal pages: highlight the section being read in the contents list.
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove('on'); });
        var link = byId[e.target.id];
        if (link) link.classList.add('on');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) {
      var h = document.getElementById(id);
      if (h) spy.observe(h);
    });
  }

  // Privacy choices: report whether the browser is sending Global Privacy Control.
  var gpc = document.getElementById('gpc-status');
  if (gpc) {
    gpc.textContent = navigator.globalPrivacyControl
      ? 'Global Privacy Control detected in your browser: honoured as an opt-out'
      : 'No Global Privacy Control signal detected in your browser';
  }

  // Privacy request form. It's a static site, so it prepares an email rather than posting anywhere.
  var form = document.getElementById('privacy-request');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = form.querySelector('.err');
      var f = form.elements;
      if (!f.name.value.trim() || !/^\S+@\S+\.\S+$/.test(f.email.value.trim()) || !f.confirm.checked) {
        err.hidden = false;
        return;
      }
      err.hidden = true;
      var type = f.type.options[f.type.selectedIndex].text;
      var body = [
        'Request: ' + type,
        'Name: ' + f.name.value.trim(),
        'Email: ' + f.email.value.trim(),
        'Country / state of residence: ' + (f.region.value.trim() || 'not given'),
        f.agent.checked ? 'I am an authorised agent making this request on someone else\'s behalf.' : '',
        '',
        'Details:',
        f.details.value.trim() || '(none)',
        '',
        'I confirm the information above is accurate and that I am the person it concerns or their authorised agent.'
      ].filter(function (l, i, a) { return l !== '' || a[i - 1] !== ''; }).join('\n');
      location.href = 'mailto:' + form.getAttribute('data-to') +
        '?subject=' + encodeURIComponent('Privacy request: ' + type) +
        '&body=' + encodeURIComponent(body);
    });
  }
})();
