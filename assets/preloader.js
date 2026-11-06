(function(){var p=document.getElementById('bpre'),d=document.documentElement;if(!p||!d.classList.contains('bpre-on'))return;
var S0=document.currentScript&&document.currentScript.src,LG=S0?new URL('img/bres-logo-bila.webp',S0).href:'assets/img/bres-logo-bila.webp';
p.innerHTML='<canvas></canvas><span class="bpre-line"><i></i></span><div class="bpre-n"><b>0</b><i>%</i><small>Kliknutím přeskočit</small></div><div class="bpre-in"><div class="bpre-logo" style="--lg:url('+LG+')"><img src="'+LG+'" alt="" width="320" height="312"></div><p><span>Váš</span> <span>partner</span> <span>v</span> <span>oblasti</span> <span>tepelné</span> <span>energie</span></p></div>';
var c=p.querySelector('canvas'),ln=p.querySelector('.bpre-line i'),nb=p.querySelector('.bpre-n b'),hint=p.querySelector('.bpre-n small'),t0=performance.now(),done=false,tF=0,vF=0,tB=0,raf=0,gl=null,uS,uT,uR,uG,uX,shown=-1,v=0,real=20,last=0,sc=1,fr=[],cnt=0,slow=false,SL=34,K=innerWidth<700?.42:.55;
/* Oheň a kouř: celoobrazovkový shader (WebGL) z šumu. Plameny šlehají ze spodu i z náhodných míst, kouř je prosvícený ohněm (oranžová) a oblohou (modrá). Při odchodu oheň preloader „vypálí“ zespodu nahoru. */
var FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,G,S,X;uniform vec4 P[12];
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
vec2 cc=vec2(Ae*.5,.5),dd=u-cc;float rr=length(dd),sa=1.1*exp(-rr*rr*4.)*(.7+.3*sin(t*.5));
vec2 us=cc+mat2(cos(sa),-sin(sa),sin(sa),cos(sa))*dd;
vec2 sp=vec2(us.x*1.15,us.y*.95-t*.28);
vec2 w2=vec2(fb(sp*1.3+vec2(t*.1,0.)),fb(sp*1.3+vec2(5.2,t*.12)))-.5;
vec2 sq=sp*1.6+w2*1.1;float sm=fb(sq);
float sd=smoothstep(.22,.68,sm)*(.65+.35*smoothstep(.05,.6,u.y));
float lit=clamp(.5+(fb(sq-vec2(0.,.06))-sm)*7.,0.,1.);
vec3 sc=mix(vec3(.06,.08,.16),vec3(.6,.65,.79),lit*.7+sm*.3);
sc=mix(sc,sc*vec3(.8,.94,1.3),smoothstep(.25,1.,u.y)*.85);
float gl2=clamp(heat,0.,1.);
sc+=vec3(1.,.4,.1)*(smoothstep(.7,0.,u.y)*.35+gl2*.4);
vec3 col=mix(vec3(.04,.075,.17),vec3(.15,.27,.6),smoothstep(0.,1.,u.y)*.8);
col=mix(col,sc,sd*.88);
float fk=1.+.07*sin(t*11.+fb(vec2(t*2.,0.))*6.);
col+=vec3(1.,.38,.08)*pow(gl2,1.6)*.5*fk;
col=mix(col,fc,body);
col+=smoothstep(.6,1.,f)*vec3(1.,.8,.5)*.2;
float s2=smoothstep(.45,.85,fb(sq*.8+vec2(7.,3.)));
col=mix(col,sc*1.05,s2*.5*(1.-u.y*.2));
vec3 em=vec3(0.);
for(int k=0;k<2;k++){float z=float(k)+1.;vec2 g=vec2(u.x*11.*z,u.y*6.*z-t*(1.1+z*.7));vec2 id=floor(g),fr=fract(g);float r=h(id+z*13.);
vec2 c=vec2(.25+.5*h(id+4.1),.25+.5*h(id+9.7));c.x+=sin(t*1.7+r*30.)*.12;
em+=vec3(1.,.6,.22)*smoothstep(.11/z,0.,length(fr-c))*step(.72,r)*(.55+.45*sin(t*6.+r*50.))*smoothstep(.95,.05,u.y)*(.4+.6*G)*1.6;}
col+=em;
col=clamp(col,0.,1.);col=mix(col,col*col*(3.-2.*col),.3);
col*=1.-.38*smoothstep(.45,1.4,length((u-vec2(Ae*.5,.5))*vec2(.75,1.)));
col*=smoothstep(0.,.45,S);
col+=(h(gl_FragCoord.xy+t)-.5)/255.;
float a=1.;
if(X>0.){float nz=fb(u*2.4+vec2(3.,9.));float e=nz*.45+u.y*.8-(X*1.45-.15);
a=smoothstep(-.004,.02,e);float g2=smoothstep(-.07,0.,e)*(1.-smoothstep(0.,.14,e));
col+=vec3(1.,.5,.1)*g2*2.2;col=mix(col,vec3(1.,.8,.5),g2*g2*.5);a=max(a,g2*.9);}
gl_FragColor=vec4(col*a,a);}`;
function sh(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s}
try{gl=c.getContext('webgl',{antialias:false})||c.getContext('experimental-webgl')}catch(e){}
if(gl){try{
var A=Math.max(innerWidth/innerHeight,1.1),PA=[],i,pr=gl.createProgram(),b=gl.createBuffer(),a;
for(i=0;i<12;i++)PA.push(A*(.05+Math.random()*.9),.12+Math.random()*.7,.17+Math.random()*.17,Math.random());
gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw gl.getProgramInfoLog(pr);
gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
a=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
uR=gl.getUniformLocation(pr,'R');gl.uniform4fv(gl.getUniformLocation(pr,'P'),new Float32Array(PA));
uT=gl.getUniformLocation(pr,'T');uG=gl.getUniformLocation(pr,'G');uS=gl.getUniformLocation(pr,'S');uX=gl.getUniformLocation(pr,'X');
rz();p.classList.add('bgl')}catch(e){gl=null}}
function rz(){c.width=Math.ceil(innerWidth*K*sc);c.height=Math.ceil(innerHeight*K*sc);if(gl){gl.viewport(0,0,c.width,c.height);gl.uniform2f(uR,c.width,c.height)}}
function rm(){cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);d.classList.remove('bpre-on');p.remove()}
function kd(e){if(e.key==='Escape'&&performance.now()-t0>500)out(true)}
function frame(n){var dt=Math.min(.1,(n-last)/1000||.016),s=Math.max(0,(n-t0)/1000),X=0,g=Math.min(1,s/.8),f,m;
if(!done){v+=(Math.min(real,94*(1-Math.exp(-s*2.2)))-v)*Math.min(1,dt*8)}
else{f=(n-tF)/1000;if(!tB){v=vF+(100-vF)*Math.min(1,f/.25);if(f>=.25){tB=n;p.classList.add('bout');if(!gl||slow){p.classList.add('bfade');setTimeout(rm,600)}}}else{v=100;X=Math.min(1,(n-tB)/950);X=X<.5?4*X*X*X:1-Math.pow(-2*X+2,3)/2}}
if(gl&&!slow&&!done&&last&&++cnt>2){fr.push(n-last);if(n-last>220||fr.length>=5){m=n-last>220?n-last:fr.reduce(function(x,y){return x+y},0)/fr.length;fr=[];if(m>SL){if(sc>.5){sc*=.7;rz()}else{slow=true;out(true)}}}}
last=n;
ln.style.transform='scaleX('+v/100+')';if(Math.round(v)!==shown){shown=Math.round(v);nb.textContent=shown}
if(gl&&!slow){gl.uniform1f(uT,s+7);gl.uniform1f(uG,g*g*(3-2*g));gl.uniform1f(uS,s);gl.uniform1f(uX,X);gl.drawArrays(gl.TRIANGLES,0,3);if(X>=1){rm();return}}
raf=requestAnimationFrame(frame)}
raf=requestAnimationFrame(frame);
function out(fast){if(done)return;done=true;tF=performance.now()-(fast?250:0);vF=v;setTimeout(rm,2800)}
function ready(){real=100;setTimeout(out,Math.max(0,1700-(performance.now()-t0)))}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){real=Math.max(real,45)});
var hi=document.querySelector('.hero img[fetchpriority="high"]');function hd(){real=Math.max(real,80)}
if(!hi||(hi.complete&&hi.naturalWidth))hd();else hi.addEventListener('load',hd);
function bl(e){e.preventDefault()}p.addEventListener('wheel',bl,{passive:false});p.addEventListener('touchmove',bl,{passive:false});
p.addEventListener('click',function(){if(performance.now()-t0>500)out(true)});document.addEventListener('keydown',kd);
if(matchMedia('(hover:none)').matches)hint.textContent='Klepnutím přeskočit';
if(document.readyState==='complete')ready();else addEventListener('load',ready);
setTimeout(out,3500)})();
