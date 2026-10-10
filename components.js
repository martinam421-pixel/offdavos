/* OFF DAVOS shared chrome: header, footer, mobile tab bar, copy buttons, Box 01 form. */
(function () {
  var NAV = [
    { href: 'index.html', label: 'Live', key: 'live' },
    { href: 'index.html#map', label: 'Map', key: 'map' },
    { href: 'guide/index.html', label: 'Guide', key: 'guide' },
    { href: 'ski/index.html', label: 'Ski', key: 'ski' },
    { href: 'stories/index.html', label: 'Stories', key: 'stories' }
  ];

  function links(base, active, cls) {
    return NAV.map(function (n) {
      var cur = active === n.key ? ' aria-current="page"' : '';
      return '<a href="' + base + n.href + '"' + cur + '>' + n.label + '</a>';
    }).join('');
  }

  function renderChrome(opts) {
    var base = (opts && opts.basePath) || '';
    var active = (opts && opts.activePath) || '';

    var header = document.getElementById('site-header');
    if (header) {
      header.innerHTML =
        '<header class="site-header"><div class="wrap site-header-inner">' +
        '<a class="site-logo" href="' + base + 'index.html">OFF DAVOS</a>' +
        '<nav class="site-nav" aria-label="Main">' + links(base, active) + '</nav>' +
        '</div></header>';
    }

    var footer = document.getElementById('site-footer');
    if (footer) {
      footer.innerHTML =
        '<footer class="site-footer"><div class="wrap">' +
        '<div class="footer-grid">' +
        '<div><p class="footer-word">OFF DAVOS</p><p class="footer-tag">Same people. Different altitude.</p></div>' +
        '<div><p class="label-dim" style="margin-bottom:16px;">If it is going wrong, call first</p>' +
        '<div class="footer-sos">' +
        '<div><b>117</b><span>Police</span></div>' +
        '<div><b>144</b><span>Ambulance</span></div>' +
        '<div><b>118</b><span>Fire</span></div>' +
        '<div><b>1414</b><span>Rega air rescue</span></div>' +
        '<div><b>112</b><span>European emergency</span></div>' +
        '</div><p style="margin-top:12px;"><a href="' + base + 'sos/index.html">SOS page →</a></p></div></div>' +
        '<div class="footer-legal"><span><a href="' + base + 'about/index.html">About</a> · Independent. Not affiliated with or endorsed by the World Economic Forum.</span><span>© OFF DAVOS</span></div>' +
        '</div></footer>';
    }

    var tabbar = document.getElementById('site-tabbar');
    if (tabbar) {
      tabbar.innerHTML = '<nav class="site-tabbar" aria-label="Sections">' + links(base, active) + '</nav>';
    }

    wireCopy();
    wireBox01();
  }

  function wireCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = document.getElementById(btn.getAttribute('data-copy'));
        var status = document.getElementById(btn.getAttribute('data-status'));
        if (!src) return;
        var text = src.innerText;
        function selectIt() {
          var r = document.createRange(); r.selectNodeContents(src);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
          if (status) status.textContent = 'Text selected. Copy it with Cmd+C or Ctrl+C.';
        }
        try {
          navigator.clipboard.writeText(text).then(function () {
            if (status) status.textContent = 'Copied. Paste it into WhatsApp or email.';
          }, selectIt);
        } catch (e) { selectIt(); }
      });
    });
  }

  function wireBox01() {
    var form = document.getElementById('box01-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('box01-status');
      var story = document.getElementById('box01-story');
      if (!story.value.trim()) {
        status.textContent = 'Write your story first, then press Tell us.';
        story.focus();
        return;
      }
      status.textContent = 'Thank you. Submissions are not connected yet, so this story was not sent. Please keep a copy.';
    });
  }

  window.OffDavos = { renderChrome: renderChrome };
})();
