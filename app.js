window.__IP='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';window.__IA='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
(function(){var p=document.getElementById('pre');if(!p)return;
var d=document.documentElement,c=p.querySelector('canvas'),x=c.getContext('2d'),t0=performance.now(),done=false,raf=0,last=0,tt=0,W,H,U,K=innerWidth<700?.45:.6,S=[],E=[],T=[],B=[];
function R(a,b){return a+Math.random()*(b-a)}
function lg(s){var g=x.createLinearGradient(0,0,0,-340);for(var i=0;i<s.length;i+=2)g.addColorStop(s[i],s[i+1]);return g}
function puff(r,g,b,a){var o=document.createElement('canvas');o.width=o.height=128;var q=o.getContext('2d');for(var i=0;i<8;i++){var cx=64+R(-22,22),cy=64+R(-22,22),rd=R(26,44),gr=q.createRadialGradient(cx,cy,0,cx,cy,rd);gr.addColorStop(0,'rgba('+r+','+g+','+b+','+a+')');gr.addColorStop(.5,'rgba('+r+','+g+','+b+','+a*.45+')');gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');q.fillStyle=gr;q.fillRect(0,0,128,128)}return o}
function glow(){var o=document.createElement('canvas');o.width=o.height=64;var q=o.getContext('2d'),g=q.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,150,70,.8)');g.addColorStop(1,'rgba(255,107,20,0)');q.fillStyle=g;q.fillRect(0,0,64,64);return o}
if(x){c.width=W=Math.ceil(innerWidth*K);c.height=H=Math.ceil(innerHeight*K);U=H/900;if(K<.5)U*=.75;
/* Plameny: vektorové jazyky kreslené do canvasu, každý se kymácí a vzplane; kouř jsou texturované obláčky */
var PL=new Path2D('M-55 0C-62-70-34-120-22-170-18-140-4-128 2-150 8-176-2-214-8-270 30-222 62-140 56-60 54-24 34 0 0 0z'),
PS=new Path2D('M-34 0C-44-80-18-150-26-230-28-250-24-270-18-290-6-250 4-230 0-190 12-230 26-290 12-340 46-270 54-150 36-60 30-24 16 0 0 0z'),
GB=lg([0,'#d4520a',1,'#6a2205']),GM=lg([0,'#ff9a4a',.6,'#FF6B14',1,'#a73c00']),GF=lg([0,'#ffe3bd',.55,'#ffa04d',1,'#FF6B14']),GL=glow(),
PU=[puff(178,186,208,.3),puff(152,162,192,.28),puff(28,32,54,.3),puff(36,42,68,.28)],
GG=x.createLinearGradient(0,H-34*U,0,H);GG.addColorStop(0,'#ffa04d');GG.addColorStop(1,'#d9500a');
function lay(g,n,w,sl,L){for(var i=0;i<n;i++){var sm=Math.random()<.45;T.push({g:g,L:L,x:(-.06+1.12*(i+R(.2,.8))/n)*W,k:sm?PS:PL,s:sm?R(sl[0],sl[1]):R(w[0],w[1]),ph:R(0,6.28),f:R(1.1,2.2)*(L?1:.65)})}}
lay(GB,Math.round(W/(U*150))+1,[1.5,2.9],[1.2,2.4],0);lay(GM,Math.round(W/(U*105))+1,[.9,1.9],[.8,1.5],1);lay(GF,Math.round(W/(U*90))+1,[.5,1.1],[.45,.9],2);
for(var i=0,n=Math.max(16,Math.min(40,Math.round(34*innerWidth*innerHeight/1152000)));i<n;i++)B.push({x:R(0,W),y:R(.15,.98)*H,a:Math.random()<.8?R(-.4,.4):(Math.random()<.5?-1:1)*R(.6,1.2),s:R(.3,.85),d:R(1.3,2.4),o:R(0,2.4)});
function rs(e){e.x=R(-.05,1.05)*W;e.y=e.g?H*R(.35,1):R(.12,1)*H;e.t=R(.5,1.4)}
for(i=0;i<20;i++){var e={g:i<8,c:0};rs(e);E.push(e)}
function smoke(px,py){if(S.length>(K<.5?300:760))return;S.push({x:px,y:py,vx:R(-.3,.7)*H*.08,vy:R(.18,.4)*H,l:R(1.6,3),a:0,s:R(90,150)*K,w:R(0,6.28),v:Math.random()<.8?(Math.random()<.5?0:1):(Math.random()<.5?2:3),z:Math.random()<.4})}
function step(dt){var i,e,m;for(i=0;i<E.length;i++){e=E[i];e.t-=dt;if(e.t<=0)rs(e);e.c+=(e.g?15:9)*(K<.5?.65:1)*dt;while(e.c>=1){e.c--;smoke(e.x+R(-1,1)*30*K,e.y)}}
for(i=S.length-1;i>=0;i--){m=S[i];m.a+=dt;if(m.a>=m.l){S.splice(i,1);continue}m.x+=(m.vx+Math.sin(m.a*2.2+m.w)*H*.07)*dt;m.y-=m.vy*dt*(1-.35*m.a/m.l)}}
function ds(z){var i,m,r,D;for(i=0;i<S.length;i++){m=S[i];if(m.z!==z)continue;r=m.a/m.l;D=m.s*(1+2.8*r);x.globalAlpha=(r<.12?r/.12:(1-r)/.88)*(z?.5:1);x.drawImage(PU[m.v],m.x-D/2,m.y-D/2,D,D)}}
function lit(){var i,m,r,D;x.globalCompositeOperation='lighter';for(i=0;i<S.length;i++){m=S[i];r=m.a/m.l;if(m.z||r>.28)continue;D=m.s*(1+2.8*r)*.9;x.globalAlpha=(1-r/.28)*.2;x.drawImage(GL,m.x-D/2,m.y-D/2,D,D)}x.globalCompositeOperation='source-over'}
function bd(b){var q=((tt+b.o)%b.d)/b.d,sx,sy,sk=0,al,u;
if(q<.35){u=q/.35;sx=.2+.8*u;sy=u;al=Math.min(1,q/.12)*.9}else if(q<.6){u=(q-.35)/.25;sx=1-.08*u;sy=1+.15*u;sk=.09*u;al=.9}else{u=(q-.6)/.4;sx=.92-.32*u;sy=1.15-.75*u;sk=.09-.19*u;al=.9*(1-u)}
if(sy<.02)return;x.globalAlpha=al;x.setTransform(1,0,0,1,0,0);x.translate(b.x,b.y);x.rotate(b.a);x.scale(U*b.s*sx,U*b.s*sy);x.transform(1,0,sk,1,0,0);
x.drawImage(GL,-60,-120,120,120);x.fillStyle=GB;x.save();x.scale(1.15,1.15);x.fill(PS);x.restore();x.fillStyle=GM;x.fill(PS);x.fillStyle=GF;x.save();x.scale(.65,.65);x.fill(PL);x.restore();x.fillStyle='#fff1dc';x.save();x.scale(.35,.35);x.fill(PL);x.restore()}
function draw(){var i,o,g,m,sx,sy;x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.clearRect(0,0,W,H);ds(false);lit();x.globalAlpha=1;
for(i=0;i<T.length;i++){o=T[i];g=Math.min(1,Math.max(0,(tt-o.L*.08)/.6));g=1-Math.pow(1-g,3);m=1+.13*Math.sin(tt*o.f*3+o.ph)+.07*Math.sin(tt*o.f*7.3+o.ph*2);sy=U*o.s*m*(.8+.22*Math.sin(tt*o.f*.9+o.ph*1.7))*g;sx=U*o.s*(1-.07*Math.sin(tt*o.f*3+o.ph));
if(sy<.01)continue;x.setTransform(sx,0,.1*Math.sin(tt*o.f*4+o.ph)*sy,sy,o.x,H);x.fillStyle=o.g;x.fill(o.k)}
x.setTransform(1,0,0,1,0,0);x.fillStyle=GG;x.fillRect(0,H-34*U,W,34*U+1);
for(i=0;i<B.length;i++)bd(B[i]);x.setTransform(1,0,0,1,0,0);ds(true);x.globalAlpha=1}
function frame(n){var dt=Math.min(.05,(n-last)/1000||.016);last=n;tt+=dt;step(dt);draw();raf=requestAnimationFrame(frame)}
for(var k=0;k<80;k++)step(1/30);draw();raf=requestAnimationFrame(frame)}
function out(){if(done)return;done=true;p.classList.add('full');setTimeout(function(){p.classList.add('out');setTimeout(function(){cancelAnimationFrame(raf);d.classList.add('no-pre');p.remove()},600)},250)}
function ready(){setTimeout(out,Math.max(0,1400-(performance.now()-t0)))}
if(document.readyState==='complete')ready();else addEventListener('load',ready);
setTimeout(out,3500)})();
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
