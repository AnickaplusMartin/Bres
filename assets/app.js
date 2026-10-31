(function(){
var b=document.querySelector('.burger'),n=document.querySelector('nav');
if(b)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
var h=document.querySelector('.hero');if(!h)return;
var im=[].slice.call(h.querySelectorAll('.bg img')),s=[].slice.call(h.querySelectorAll('.sl')),d=[].slice.call(h.querySelectorAll('.d')),pb=h.querySelector('.pp'),fill=h.querySelector('.tr i'),num=h.querySelector('.cur'),i=0,t=null,start=0,D=7000;
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,play=!rm;
function go(k){i=(k+s.length)%s.length;s.forEach(function(e,j){e.classList.toggle('on',j===i)});d.forEach(function(e,j){e.classList.toggle('on',j===i)});h.dataset.s=i;im.forEach(function(e,k){e.classList.toggle('on',k===i)});num.textContent='0'+(i+1);start=performance.now()}
function tick(now){if(play){var p=Math.min(1,(now-start)/D);fill.style.width=(p*100)+'%';if(p>=1)go(i+1)}requestAnimationFrame(tick)}
d.forEach(function(e,j){e.addEventListener('click',function(){go(j)})});
pb.addEventListener('click',function(){play=!play;pb.textContent=play?'❚❚':'▶';pb.setAttribute('aria-label',play?'Pozastavit':'Přehrát');start=performance.now()});
pb.textContent=play?'❚❚':'▶';go(0);requestAnimationFrame(tick);
})();
(function(){var f=document.getElementById('filters');if(!f)return;
var t=[].slice.call(document.querySelectorAll('.tile[data-cat]')),c=[];
t.forEach(function(e){if(c.indexOf(e.dataset.cat)<0)c.push(e.dataset.cat)});c.sort(function(a,b){return (a==='Ostatní')-(b==='Ostatní')});
['Vše'].concat(c).forEach(function(n,i){var b=document.createElement('button');b.type='button';b.textContent=n;b.setAttribute('aria-pressed',i==0);
b.onclick=function(){[].forEach.call(f.children,function(x){x.setAttribute('aria-pressed',x===b)});t.forEach(function(e){e.hidden=i>0&&e.dataset.cat!==n})};f.appendChild(b)});})();
(function(){var f=document.querySelector('.cf');if(!f)return;
var m=f.querySelector('.cf-msg'),t=f.querySelector('[name=t]'),q=location.search;t.value=Date.now();
if(q.indexOf('odeslano')>-1)m.textContent='Děkujeme, zpráva byla odeslána.';
if(q.indexOf('chyba')>-1)m.textContent='Zprávu se nepodařilo odeslat. Zkontrolujte údaje nebo napište na bres@bres.cz.';
f.addEventListener('submit',function(e){e.preventDefault();var b=f.querySelector('button');b.disabled=true;m.textContent='Odesílám…';
fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}}).then(function(r){return r.json()}).then(function(j){m.textContent=j.msg;if(j.ok){f.reset();t.value=Date.now()}b.disabled=false}).catch(function(){m.textContent='Odeslání se nepodařilo. Napište prosím na bres@bres.cz nebo zavolejte.';b.disabled=false})});})();
(function(){var m=document.querySelector('.map');if(!m)return;var b=m.querySelector('button'),f=m.querySelector('iframe');
b.addEventListener('click',function(){f.src=f.dataset.src;m.querySelector('.map-ph').remove()});})();
