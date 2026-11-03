window.__IP='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';window.__IA='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
(function(){
var b=document.querySelector('.burger'),n=document.querySelector('nav');
if(b)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
var h=document.querySelector('.hero');if(!h)return;
var im=[].slice.call(h.querySelectorAll('.bg img')),s=[].slice.call(h.querySelectorAll('.sl')),d=[].slice.call(h.querySelectorAll('.d')),pb=h.querySelector('.pp'),fill=h.querySelector('.tr i'),num=h.querySelector('.cur'),i=0,t=null,start=0,D=7000;
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,play=!rm;
function go(k){i=(k+s.length)%s.length;s.forEach(function(e,j){e.classList.toggle('on',j===i)});d.forEach(function(e,j){e.classList.toggle('on',j===i)});h.dataset.s=i;im.forEach(function(e,k){e.classList.toggle('on',k===i)});num.textContent='0'+(i+1);start=performance.now()}
function tick(now){if(play){var p=Math.min(1,(now-start)/D);fill.style.width=(p*100)+'%';if(p>=1)go(i+1)}requestAnimationFrame(tick)}
d.forEach(function(e,j){e.addEventListener('click',function(){go(j)})});
pb.addEventListener('click',function(){play=!play;pb.innerHTML=play?window.__IP:window.__IA;pb.setAttribute('aria-label',play?'Pozastavit':'Přehrát');start=performance.now()});
pb.innerHTML=play?window.__IP:window.__IA;go(0);requestAnimationFrame(tick);
})();
(function(){var f=document.getElementById('filters');if(!f)return;var t=[].slice.call(document.querySelectorAll('.tile[data-cat]'));[].forEach.call(f.children,function(b){b.addEventListener('click',function(){[].forEach.call(f.children,function(x){x.setAttribute('aria-pressed',x===b)});t.forEach(function(e){e.hidden=!!b.dataset.cat&&e.dataset.cat!==b.dataset.cat})})})})();
(function(){var f=document.querySelector('.cf');if(!f)return;
var m=f.querySelector('.cf-msg'),t=f.querySelector('[name=t]'),q=location.search;t.value=Date.now();
if(q.indexOf('odeslano')>-1)m.textContent='Děkujeme, zpráva byla odeslána.';
if(q.indexOf('chyba')>-1)m.textContent='Zprávu se nepodařilo odeslat. Zkontrolujte údaje nebo napište na bres@bres.cz.';
f.addEventListener('submit',function(e){e.preventDefault();var b=f.querySelector('button');b.disabled=true;m.textContent='Odesílám…';
fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}}).then(function(r){return r.json()}).then(function(j){m.textContent=j.msg;if(j.ok){f.reset();t.value=Date.now()}b.disabled=false}).catch(function(){m.textContent='Odeslání se nepodařilo. Napište prosím na bres@bres.cz nebo zavolejte.';b.disabled=false})});})();
(function(){var m=document.querySelector('.map');if(!m)return;var b=m.querySelector('button'),f=m.querySelector('iframe');
b.addEventListener('click',function(){f.src=f.dataset.src;m.querySelector('.map-ph').remove()});})();
(function(){var i=document.querySelectorAll('.bg img[data-src]');if(!i.length)return;function l(){[].forEach.call(i,function(e){if(e.dataset.srcset)e.srcset=e.dataset.srcset;e.src=e.dataset.src})}if(document.readyState==='complete')l();else addEventListener('load',l);})();
(function(){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var els=document.querySelectorAll('.svc li,.svcards .ph,.card,.rc,.tile,.kids a,.sec h2,.sec .lab,.cta .in');
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
[].forEach.call(els,function(e,i){if(e.getBoundingClientRect().top>innerHeight){e.classList.add('rv');e.style.setProperty('--i',i%4);io.observe(e)}});})();
