(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // headline words: split for the load animation
  document.querySelectorAll('.hero h1').forEach(function(h){
    var i = 0;
    h.querySelectorAll('[data-split]').forEach(function(part){
      var words = part.textContent.trim().split(/\s+/);
      part.innerHTML = words.map(function(w){ return '<span class="w" style="--i:' + (i++) + '">' + w + '</span>'; }).join(' ');
    });
  });

  // reveal on scroll (+ count up, bars, chart drawing)
  function countUp(el){
    if (reduce || el.dataset.done) return;
    el.dataset.done = 1;
    var to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10);
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    var final = el.textContent, start = null, dur = 1600;
    function fmt(v){ return pre + v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}) + suf; }
    function step(t){
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    }
    requestAnimationFrame(step);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      en.target.querySelectorAll('[data-count]').forEach(countUp);
      if (en.target.matches('[data-count]')) countUp(en.target);
      io.unobserve(en.target);
    });
  }, {threshold: .18, rootMargin: '0px 0px -40px 0px'}) : null;
  document.querySelectorAll('.reveal').forEach(function(el){ io ? io.observe(el) : el.classList.add('in'); });

  // measure drawable paths
  document.querySelectorAll('.draw').forEach(function(p){ try{ p.style.setProperty('--len', Math.ceil(p.getTotalLength())); }catch(e){} });

  // mobile nav
  var nav = document.getElementById('nav'), mb = document.querySelector('.menu-btn');
  if (mb && nav){
    mb.addEventListener('click', function(){ var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('open'); }); });
  }

  // tabs
  document.querySelectorAll('[role=tablist]').forEach(function(list){
    var tabs = [].slice.call(list.querySelectorAll('[role=tab]'));
    function select(t){
      tabs.forEach(function(x){
        var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ select(t); });
      t.addEventListener('keydown', function(e){
        var j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1;
        if (j > -1){ select(tabs[j]); tabs[j].focus(); }
      });
    });
  });

  // lightbox
  var lb = document.getElementById('lb');
  if (lb){
    var img = lb.querySelector('img'), cap = lb.querySelector('p');
    document.querySelectorAll('[data-full]').forEach(function(b){
      b.addEventListener('click', function(){
        var src = b.querySelector('img'); img.src = b.dataset.full; img.alt = src ? src.alt : ''; cap.textContent = src ? src.alt : ''; lb.showModal();
      });
    });
    lb.addEventListener('click', function(e){ if (e.target === lb || e.target.classList.contains('close')) lb.close(); });
  }

  // contact form -> prefilled email
  var f = document.getElementById('mailform');
  if (f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var subject = 'Amazon help: ' + f.need.value;
      var body = 'Name: ' + f.name.value + '\nEmail: ' + f.email.value + '\nNeed: ' + f.need.value + '\n\n' + f.msg.value;
      location.href = 'mailto:ahmadhaidertariq@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
})();
