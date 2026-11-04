window.__IP='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>';window.__IA='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
(function(){var p=document.getElementById('pre');if(!p)return;
var d=document.documentElement,c=p.querySelector('canvas'),t0=performance.now(),done=false,raf=0,gl=null;
/* Oheň a kouř: celoobrazovkový shader (WebGL) z šumu. Plameny šlehají ze spodu i z náhodných míst, kouř je prosvícený ohněm. */
var FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,G;uniform vec4 P[12];
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
void main(){
float Ae=max(R.x/R.y,1.1);vec2 u=vec2(gl_FragCoord.x/R.x*Ae,gl_FragCoord.y/R.y);float t=T;
float wx=(fb(vec2(u.y*2.4-t*1.2,u.x*1.8+t*.1))-.5)*.34;
vec2 q=vec2(u.x+wx,u.y);
float gh=min(.95,.2+1.4*pow(fb(vec2(q.x*2.6+t*.15,t*.45)),2.));
float heat=clamp(1.-q.y/gh,0.,1.)*G;
for(int i=0;i<12;i++){vec4 s=P[i];float w=sin(t*(1.5+fract(s.w*7.3)*1.7)+s.w*6.283);w=smoothstep(-.1,.6,w)*G;
float dx=(q.x-s.x)/s.z,dy=(q.y-s.y)/(s.z*2.6);
float k=max(0.,1.-abs(dx)*(1.2+max(dy,0.)*2.))*clamp(1.-dy,0.,1.)*smoothstep(-.12,.04,dy);heat=max(heat,k*w);}
float tu=fb(vec2(q.x*9.,q.y*1.4-t*2.8));
float f=heat*.98-tu*.8*(.3+q.y*1.3);
float body=smoothstep(.02,.34,f);
vec3 fc=mix(vec3(.5,.12,.03),vec3(1.,.42,.08),smoothstep(.1,.4,f));
fc=mix(fc,vec3(1.,.66,.3),smoothstep(.45,.75,f));fc=mix(fc,vec3(1.,.9,.74),smoothstep(.85,1.05,f));fc*=.78+.4*fb(vec2(q.x*12.,q.y*3.-t*3.5));
vec2 sp=vec2(u.x*1.15,u.y*.95-t*.28);
vec2 w2=vec2(fb(sp*1.3+vec2(t*.1,0.)),fb(sp*1.3+vec2(5.2,t*.12)))-.5;
vec2 sq=sp*1.6+w2*1.1;float sm=fb(sq);
float sd=smoothstep(.26,.72,sm)*(.6+.4*smoothstep(.05,.6,u.y));
float lit=clamp(.5+(fb(sq-vec2(0.,.06))-sm)*7.,0.,1.);
vec3 sc=mix(vec3(.06,.08,.16),vec3(.6,.65,.79),lit*.7+sm*.3);
float gl2=clamp(heat,0.,1.);
sc+=vec3(1.,.4,.1)*(smoothstep(.7,0.,u.y)*.35+gl2*.4);
vec3 col=mix(vec3(.04,.075,.17),vec3(.15,.27,.6),smoothstep(0.,1.,u.y)*.8);
col=mix(col,sc,sd*.88);
col+=vec3(1.,.38,.08)*pow(gl2,1.6)*.5;
col=mix(col,fc,body);
col+=smoothstep(.6,1.,f)*vec3(1.,.8,.5)*.2;
float s2=smoothstep(.45,.85,fb(sq*.8+vec2(7.,3.)));
col=mix(col,sc*1.05,s2*.35*(1.-u.y*.3));
col+=(h(gl_FragCoord.xy+t)-.5)/255.;
gl_FragColor=vec4(col,1.);}`;
function sh(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s}
try{gl=c.getContext('webgl',{alpha:false,antialias:false})||c.getContext('experimental-webgl')}catch(e){}
if(gl){try{
var K=innerWidth<700?.42:.55,A=Math.max(innerWidth/innerHeight,1.1),PA=[],i,pr=gl.createProgram(),b=gl.createBuffer(),a;
c.width=Math.ceil(innerWidth*K);c.height=Math.ceil(innerHeight*K);
for(i=0;i<12;i++)PA.push(A*(.05+Math.random()*.9),.12+Math.random()*.7,.17+Math.random()*.17,Math.random());
gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw gl.getProgramInfoLog(pr);
gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
a=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
gl.viewport(0,0,c.width,c.height);gl.uniform2f(gl.getUniformLocation(pr,'R'),c.width,c.height);gl.uniform4fv(gl.getUniformLocation(pr,'P'),new Float32Array(PA));
var uT=gl.getUniformLocation(pr,'T'),uG=gl.getUniformLocation(pr,'G');
function frame(n){var s=(n-t0)/1000,g=Math.min(1,s/.8);gl.uniform1f(uT,s+7);gl.uniform1f(uG,g*g*(3-2*g));gl.drawArrays(gl.TRIANGLES,0,3);raf=requestAnimationFrame(frame)}
raf=requestAnimationFrame(frame)}catch(e){gl=null}}
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
