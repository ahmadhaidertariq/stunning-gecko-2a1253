(function(){
  document.documentElement.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // line lengths
  document.querySelectorAll('.line-p').forEach(function(p){ try{ p.style.setProperty('--len', Math.ceil(p.getTotalLength())); }catch(e){} });

  // count up
  function countUp(el){
    if (reduce || el.dataset.done) return; el.dataset.done = 1;
    var fin = el.textContent, m = fin.match(/-?[\d,.]+/); if (!m) return;
    var to = parseFloat(m[0].replace(/,/g,'')), dec = (m[0].split('.')[1]||'').length, st = null;
    function step(t){ if(!st) st=t; var p=Math.min((t-st)/1300,1), e=1-Math.pow(1-p,3);
      el.textContent = fin.replace(m[0], (to*e).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}));
      if(p<1) requestAnimationFrame(step); else el.textContent = fin; }
    requestAnimationFrame(step);
  }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return;
    e.target.classList.add('in'); e.target.querySelectorAll('.kpi b, .fc b, .cu').forEach(countUp); io.unobserve(e.target); }); }, {threshold:.12});
  document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });

  // toc + progress
  var links = [].slice.call(document.querySelectorAll('.toc a')), prog = document.querySelector('.sbar .prog');
  var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  function onScroll(){
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (prog) prog.style.width = (p*100).toFixed(1) + '%';
    var cur = 0; secs.forEach(function(s,i){ if (s && s.getBoundingClientRect().top < 160) cur = i; });
    links.forEach(function(a,i){ a.classList.toggle('on', i===cur); });
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // sortable tables
  document.querySelectorAll('table.sort').forEach(function(t){
    t.querySelectorAll('th').forEach(function(th, ci){
      th.style.cursor = 'pointer'; th.title = 'Sort';
      th.addEventListener('click', function(){
        var tb = t.tBodies[0], rows = [].slice.call(tb.rows), asc = th.dataset.asc !== '1';
        t.querySelectorAll('th').forEach(function(x){ delete x.dataset.asc; }); th.dataset.asc = asc ? '1' : '0';
        rows.sort(function(a,b){
          var x = a.cells[ci].dataset.v || a.cells[ci].textContent, y = b.cells[ci].dataset.v || b.cells[ci].textContent;
          var nx = parseFloat(String(x).replace(/[$,%]/g,'')), ny = parseFloat(String(y).replace(/[$,%]/g,''));
          var r = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : String(x).localeCompare(String(y));
          return asc ? r : -r; });
        rows.forEach(function(r){ tb.appendChild(r); });
      });
    });
  });

  // filter inputs
  document.querySelectorAll('[data-filter]').forEach(function(inp){
    var t = document.getElementById(inp.dataset.filter), cnt = document.querySelector('[data-count-for="' + inp.dataset.filter + '"]');
    inp.addEventListener('input', function(){
      var q = inp.value.toLowerCase(), n = 0;
      [].forEach.call(t.tBodies[0].rows, function(r){ var ok = r.textContent.toLowerCase().indexOf(q) > -1; r.hidden = !ok; if(ok) n++; });
      if (cnt) cnt.textContent = n;
    });
  });

  // sheet tabs
  document.querySelectorAll('.stabs').forEach(function(list){
    var bs = [].slice.call(list.querySelectorAll('button'));
    bs.forEach(function(b){ b.addEventListener('click', function(){
      bs.forEach(function(x){ var on = x===b; x.setAttribute('aria-selected', on); var p = document.getElementById(x.getAttribute('aria-controls')); p.hidden = !on;
        if (on) p.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); el.querySelectorAll('.kpi b').forEach(countUp); }); });
      history.replaceState(null,'','#'+b.getAttribute('aria-controls'));
    }); });
    var h = location.hash.slice(1); bs.forEach(function(b){ if (b.getAttribute('aria-controls') === h) b.click(); });
  });

  // slide deck
  var deck = document.querySelector('.deck');
  if (deck){
    var slides = [].slice.call(deck.querySelectorAll('.dslide')), i = 0, cnt = document.querySelector('.dcount'), bar = document.querySelector('.dprog i');
    function go(n){
      i = Math.max(0, Math.min(slides.length-1, n));
      slides.forEach(function(s,k){ s.classList.toggle('on', k===i); s.classList.toggle('past', k<i); });
      slides[i].querySelectorAll('.kpi b, .cu').forEach(function(el){ delete el.dataset.done; countUp(el); });
      if (cnt) cnt.textContent = (i+1) + ' / ' + slides.length;
      if (bar) bar.style.width = ((i+1)/slides.length*100) + '%';
      document.querySelectorAll('.dthumbs button').forEach(function(b,k){ b.classList.toggle('on', k===i); });
      history.replaceState(null,'','#s'+(i+1));
    }
    document.querySelector('.dprev').addEventListener('click', function(){ go(i-1); });
    document.querySelector('.dnext').addEventListener('click', function(){ go(i+1); });
    addEventListener('keydown', function(e){ if (e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){ e.preventDefault(); go(i+1); } if (e.key==='ArrowLeft'||e.key==='PageUp'){ e.preventDefault(); go(i-1); } });
    var sx = null; deck.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
    deck.addEventListener('touchend', function(e){ if (sx===null) return; var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) go(i + (d<0?1:-1)); sx = null; });
    document.querySelectorAll('.dthumbs button').forEach(function(b,k){ b.addEventListener('click', function(){ go(k); }); });
    var m = location.hash.match(/^#s(\d+)/); go(m ? parseInt(m[1],10)-1 : 0);
  }
})();
