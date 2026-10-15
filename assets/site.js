(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  var desktop = window.matchMedia('(min-width: 1081px)');
  if (G && ST) G.registerPlugin(ST);

  // ---------- smooth scroll ----------
  var lenis = null;
  if (!reduce && window.Lenis){
    lenis = new Lenis({lerp: .1, smoothWheel: true});
    if (G && ST){ lenis.on('scroll', ST.update); G.ticker.add(function(t){ lenis.raf(t * 1000); }); G.ticker.lagSmoothing(0); }
    else { (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0); }
  }

  // ---------- page transition curtain ----------
  var cur = document.createElement('div'); cur.className = 'curtain'; document.body.appendChild(cur);
  try { if (sessionStorage.getItem('curtain') && G && !reduce){ sessionStorage.removeItem('curtain'); G.set(cur,{scaleY:1,transformOrigin:'top'}); G.to(cur,{scaleY:0,duration:.6,ease:'power3.inOut',delay:.05}); } } catch(e){}
  document.addEventListener('click', function(e){
    var a = e.target.closest('a'); if (!a || reduce || !G) return;
    var h = a.getAttribute('href') || '';
    if (a.target || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || /^(#|mailto:|tel:|https?:)/.test(h) || !/\.html(#.*)?$/.test(h)) return;
    e.preventDefault();
    try { sessionStorage.setItem('curtain','1'); } catch(_){}
    G.set(cur,{transformOrigin:'bottom'}); G.to(cur,{scaleY:1,duration:.45,ease:'power3.in',onComplete:function(){ location.href = h; }});
  });
  window.addEventListener('pageshow', function(ev){ if (ev.persisted && G) G.set(cur,{scaleY:0}); });

  // ---------- old page-hero word split ----------
  document.querySelectorAll('.hero h1').forEach(function(h){
    var i = 0;
    h.querySelectorAll('[data-split]').forEach(function(part){
      part.innerHTML = part.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w" style="--i:' + (i++) + '">' + w + '</span>'; }).join(' ');
    });
  });

  // ---------- count up ----------
  function countUp(el){
    if (reduce || el.dataset.done) return;
    el.dataset.done = 1;
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10);
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', fin = el.textContent, st = null, dur = 1600;
    function step(t){ if (!st) st = t; var p = Math.min((t - st) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + (to * e).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}) + suf;
      if (p < 1) requestAnimationFrame(step); else el.textContent = fin; }
    requestAnimationFrame(step);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(en){ if (!en.isIntersecting) return; en.target.classList.add('in');
      en.target.querySelectorAll('[data-count]').forEach(countUp); if (en.target.matches('[data-count]')) countUp(en.target); io.unobserve(en.target); });
  }, {threshold:.16, rootMargin:'0px 0px -40px 0px'}) : null;
  document.querySelectorAll('.reveal').forEach(function(el){ io ? io.observe(el) : el.classList.add('in'); });
  document.querySelectorAll('.draw').forEach(function(p){ try{ p.style.setProperty('--len', Math.ceil(p.getTotalLength())); }catch(e){} });

  // ---------- split headings ----------
  document.querySelectorAll('.split-h').forEach(function(h){
    h.innerHTML = h.innerHTML.split(/(<[^>]+>|\s+)/).map(function(t){ return (!t || /^\s+$/.test(t) || t[0] === '<') ? t : '<span class="w">' + t + '</span>'; }).join('');
    if (G && ST && !reduce){ G.from(h.querySelectorAll('.w'), {yPercent:60, opacity:0, rotate:4, duration:.8, ease:'power3.out', stagger:.035, scrollTrigger:{trigger:h, start:'top 85%'}}); }
  });

  // ---------- hero v4 ----------
  var hero = document.querySelector('.hero4');
  if (hero){
    var acosEl = hero.querySelector('.acos'), arc = hero.querySelector('.arc'), sl = hero.querySelector('.sl');
    function runAcos(){
      if (!acosEl) return; var from = 52.0, to = 47.5, st = null;
      if (arc) arc.style.strokeDashoffset = 138 - 138 * (to / 60);
      if (reduce){ acosEl.textContent = to.toFixed(1) + '%'; return; }
      (function step(t){ if (!st) st = t; var p = Math.min((t - st) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
        acosEl.textContent = (from + (to - from) * e).toFixed(1) + '%'; if (p < 1) requestAnimationFrame(step); })(performance.now());
    }
    if (G && !reduce){
      var tl = G.timeline({defaults:{ease:'power4.out'}});
      tl.from('.hero4 .kick', {y:20, opacity:0, duration:.6})
        .from('.hero4 h1 .ln>span', {yPercent:110, duration:1, stagger:.12}, '-=.3')
        .to('.hero4 h1 .hl path', {strokeDashoffset:0, duration:.9, ease:'power2.inOut'}, '-=.4')
        .from('.hero4 .lede, .hero4 .cta, .hero4 .trust', {y:24, opacity:0, duration:.8, stagger:.1}, '-=.7')
        .from('.stage .blob', {clipPath:'inset(100% 0 0 0 round 999px 999px 34px 34px)', duration:1.1, ease:'power3.inOut'}, .2)
        .from('.stage .me', {y:80, opacity:0, duration:1.1}, .6)
        .from('.ring', {scale:0, rotate:-90, opacity:0, duration:.9, ease:'back.out(1.6)'}, 1)
        .from('.kc', {y:30, scale:.85, opacity:0, duration:.8, stagger:.15, ease:'back.out(1.7)'}, 1.1)
        .add(runAcos, 1.4)
        .to(sl, {strokeDashoffset:0, duration:1.6, ease:'power2.inOut'}, 1.4)
        .from('.scroll-cue', {opacity:0, duration:.6}, 2);
      // parallax on mouse
      var depth = [['.kc.k1', 26], ['.kc.k2', -22], ['.kc.k3', 16], ['.ring', -12], ['.stage .me', 8]];
      hero.addEventListener('mousemove', function(e){
        var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        hero.style.setProperty('--mx', (x + .5) * 100 + '%'); hero.style.setProperty('--my', (y + .5) * 100 + '%');
        depth.forEach(function(d){ G.to(d[0], {x: x * d[1], y: y * d[1], duration: .9, ease: 'power3.out', overwrite: 'auto'}); });
      });
      if (ST){
        G.to('.stage .me', {yPercent:-6, ease:'none', scrollTrigger:{trigger:hero, start:'top top', end:'bottom top', scrub:true}});
        G.to('.hero4 .copy', {yPercent:-10, opacity:.3, ease:'none', scrollTrigger:{trigger:hero, start:'top top', end:'bottom top', scrub:true}});
      }
    } else { if (sl) sl.style.strokeDashoffset = 0; hero.querySelectorAll('.hl path').forEach(function(p){ p.style.strokeDashoffset = 0; }); runAcos(); }
    // notification toast cycle
    var msgs = [['✓','Brand approved','Home &amp; kitchen brand · Store A'],['$','Price list received','Items matched to Amazon ASINs'],['%','ACOS under target','Exact campaign this week'],['✓','PO ready for your OK','Invoice requested from supplier']];
    var box = hero.querySelector('.kc.k3'), mi = 0;
    if (box && !reduce) setInterval(function(){
      var m = box.querySelector('.msg'); m.classList.add('out');
      setTimeout(function(){ mi = (mi + 1) % msgs.length; box.querySelector('i').innerHTML = msgs[mi][0]; m.innerHTML = '<b>' + msgs[mi][1] + '</b><span>' + msgs[mi][2] + '</span>'; m.classList.remove('out'); }, 380);
    }, 3200);
  }

  // ---------- audit story ----------
  var story = document.querySelector('.story');
  if (story){
    var steps = [].slice.call(story.querySelectorAll('.ssteps li')), imgs = [].slice.call(story.querySelectorAll('.screen .view img')),
        url = story.querySelector('.screen .chrome span'), bar = story.querySelector('.sbarline i'), tag = story.querySelector('.tagx'), cur = -1;
    function setStep(i){
      if (i === cur) return; cur = i;
      steps.forEach(function(s,k){ s.classList.toggle('on', k === i); });
      imgs.forEach(function(m,k){ m.classList.toggle('on', k === i); });
      if (url) url.textContent = steps[i].dataset.url || '';
      if (tag) tag.textContent = steps[i].dataset.tag || '';
    }
    setStep(0);
    steps.forEach(function(s,k){ s.addEventListener('click', function(){ setStep(k); }); });
    if (G && ST && !reduce && desktop.matches){
      ST.create({trigger:story, start:'top top', end:'+=' + (steps.length * 70) + '%', pin:story.querySelector('.inner'), scrub:true,
        onUpdate:function(self){ var p = self.progress; if (bar) bar.style.width = (p * 100) + '%'; setStep(Math.min(steps.length - 1, Math.floor(p * steps.length))); }});
      G.from('.screen', {rotateY:-20, y:60, opacity:0, duration:1.2, ease:'power3.out', scrollTrigger:{trigger:story, start:'top 70%'}});
    } else {
      var auto = setInterval(function(){ setStep((cur + 1) % steps.length); if (bar) bar.style.width = ((cur + 1) / steps.length * 100) + '%'; }, 3600);
      if (reduce) clearInterval(auto);
    }
  }

  // ---------- horizontal work rail ----------
  var rail = document.querySelector('.rail');
  if (rail){
    var row = rail.querySelector('.row');
    if (G && ST && !reduce && desktop.matches){
      var dist = function(){ return Math.max(0, row.scrollWidth - window.innerWidth + 64); };
      G.to(row, {x:function(){ return -dist(); }, ease:'none', scrollTrigger:{trigger:rail, start:'top top', end:function(){ return '+=' + dist(); }, pin:true, scrub:1, invalidateOnRefresh:true}});
    } else { row.style.overflowX = 'auto'; row.style.width = 'auto'; row.style.scrollSnapType = 'x mandatory'; [].forEach.call(row.children, function(c){ c.style.scrollSnapAlign = 'start'; }); }
  }

  // ---------- generic scroll reveals with gsap ----------
  if (G && ST && !reduce){
    G.utils.toArray('.mcard').forEach(function(c,i){ G.from(c, {y:60, opacity:0, duration:.9, ease:'power3.out', delay:(i % 4) * .08, scrollTrigger:{trigger:c, start:'top 88%'}}); });
    G.utils.toArray('.parallax').forEach(function(el){ G.to(el, {yPercent:-12, ease:'none', scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:true}}); });
    G.utils.toArray('.ba .ln').forEach(function(p){ var L = p.getTotalLength(); G.fromTo(p, {strokeDasharray:L, strokeDashoffset:L}, {strokeDashoffset:0, duration:1.8, ease:'power2.inOut', scrollTrigger:{trigger:p, start:'top 85%'}}); });
  }

  // ---------- tilt + magnetic ----------
  if (!reduce && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.tilt').forEach(function(c){
      c.addEventListener('mousemove', function(e){ var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(900px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-6px)'; });
      c.addEventListener('mouseleave', function(){ c.style.transform = ''; });
    });
    document.querySelectorAll('.mag').forEach(function(b){
      b.addEventListener('mousemove', function(e){ var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)'; });
      b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
    });
  }

  // ---------- listing before/after ----------
  document.querySelectorAll('.lst').forEach(function(l){ if (io) io.observe(l); else l.classList.add('in');
    if (G && ST && !reduce){ G.from(l.querySelector('.after'), {x:60, opacity:0, duration:1, ease:'power3.out', delay:.5, scrollTrigger:{trigger:l, start:'top 75%'}}); } });
  // ---------- compare slider ----------
  document.querySelectorAll('.cmp').forEach(function(c){
    var r = c.querySelector('input'); function set(){ c.style.setProperty('--pos', r.value + '%'); } r.addEventListener('input', set); set();
    if (G && ST && !reduce){ var o = {v:85}; G.to(o, {v:50, duration:1.6, ease:'power3.inOut', scrollTrigger:{trigger:c, start:'top 75%'}, onUpdate:function(){ r.value = o.v; set(); }}); }
  });

  // ---------- acos / tacos toggle ----------
  document.querySelectorAll('[data-toggle-group]').forEach(function(g){
    var bs = g.querySelectorAll('button'), root = document.getElementById(g.dataset.toggleGroup);
    bs.forEach(function(b){ b.addEventListener('click', function(){
      bs.forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      root.querySelectorAll('[data-set]').forEach(function(s){ var on = s.dataset.set === b.dataset.set; s.style.display = on ? '' : 'none';
        if (on && G && !reduce) s.querySelectorAll('.ln').forEach(function(p){ var L = p.getTotalLength(); G.fromTo(p, {strokeDasharray:L, strokeDashoffset:L}, {strokeDashoffset:0, duration:1.2, ease:'power2.inOut'}); }); });
    }); });
  });

  // ---------- work filters ----------
  document.querySelectorAll('.filters').forEach(function(f){
    var bs = f.querySelectorAll('button'), cards = document.querySelectorAll('.wgrid .wcard');
    bs.forEach(function(b){ b.addEventListener('click', function(){
      bs.forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      cards.forEach(function(c){ var ok = b.dataset.f === 'all' || (c.dataset.tags || '').indexOf(b.dataset.f) > -1; c.classList.toggle('hide', !ok); });
      if (ST) ST.refresh();
    }); });
  });

  // ---------- mobile nav ----------
  var nav = document.getElementById('nav'), mb = document.querySelector('.menu-btn');
  if (mb && nav){
    mb.addEventListener('click', function(){ var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); }); });
  }

  // ---------- tabs ----------
  document.querySelectorAll('[role=tablist]').forEach(function(list){
    var tabs = [].slice.call(list.querySelectorAll('[role=tab]'));
    function select(t){ tabs.forEach(function(x){ var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); if (ST) ST.refresh(); }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ select(t); });
      t.addEventListener('keydown', function(e){ var j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1; if (j > -1){ select(tabs[j]); tabs[j].focus(); } });
    });
  });

  // ---------- lightbox ----------
  var lb = document.getElementById('lb');
  if (lb){
    var img = lb.querySelector('img'), cap = lb.querySelector('p');
    document.querySelectorAll('[data-full]').forEach(function(b){
      b.addEventListener('click', function(){ var src = b.querySelector('img'); img.src = b.dataset.full; img.alt = src ? src.alt : ''; cap.textContent = src ? src.alt : ''; lb.showModal(); if (lenis) lenis.stop(); });
    });
    lb.addEventListener('close', function(){ if (lenis) lenis.start(); });
    lb.addEventListener('click', function(e){ if (e.target === lb || e.target.classList.contains('close')) lb.close(); });
  }

  // ---------- contact form ----------
  var f = document.getElementById('mailform');
  if (f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var subject = 'Amazon help: ' + f.need.value;
      var body = 'Name: ' + f.name.value + '\nEmail: ' + f.email.value + '\nNeed: ' + f.need.value + '\n\n' + f.msg.value;
      location.href = 'mailto:ahmadhaidertariq@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
  window.addEventListener('load', function(){ if (ST) ST.refresh(); });
})();
