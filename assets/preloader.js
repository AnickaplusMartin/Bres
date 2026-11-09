(function(){var p=document.getElementById('bpre'),d=document.documentElement;if(!p||!d.classList.contains('bpre-on'))return;
var S0=document.currentScript&&document.currentScript.src,LG=S0?new URL('img/bres-logo-bila.webp',S0).href:'assets/img/bres-logo-bila.webp';
p.innerHTML='<canvas></canvas><span class="bpre-line"><i></i></span><div class="bpre-n"><b>0</b><i>%</i><small>Kliknutím přeskočit</small></div><div class="bpre-in"><div class="bpre-logo" style="--lg:url('+LG+')"><img src="'+LG+'" alt="" width="320" height="312"></div><p><span>Váš</span> <span>partner</span> <span>v</span> <span>oblasti</span> <span>tepelné</span> <span>energie</span></p></div>';
var c=p.querySelector('canvas'),ln=p.querySelector('.bpre-line i'),nb=p.querySelector('.bpre-n b'),hint=p.querySelector('.bpre-n small'),t0=performance.now(),done=false,tF=0,vF=0,tB=0,raf=0,gl=null,uS,uT,uR,uG,uX,shown=-1,rev=0,v=0,real=20,last=0,sc=1,fr=[],cnt=0,slow=false,SL=34,K=innerWidth<700?.42:.58;
/* Oheň a kouř: celoobrazovkový shader (WebGL) z šumu. Plameny šlehají ze spodu i z náhodných míst, kouř je prosvícený ohněm (oranžová) a oblohou (modrá). Při odchodu oheň preloader „vypálí“ zespodu nahoru. */
var FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R;uniform float T,G,S,X;uniform vec4 P[12];
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
const mat2 M=mat2(.8,-.6,.6,.8);
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=M*p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
float f4(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=M*p*2.02+vec2(3.1,1.7);a*=.5;}return v*1.07;}
float f3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*n(p);p=M*p*2.02+vec2(3.1,1.7);a*=.5;}return v*1.14;}
float tg(vec2 q,float xi,float H,float w0,float ph,float t,float fi){
float yy=q.y/H;
float yc=clamp(yy,0.,1.);
float lean=(sin(t*1.9+ph+yy*3.5)*.08+(sin(t*.7+fi*3.1)+sin(t*1.3+fi*1.7))*.09+.07*sin(t*.9+ph*2.)*yc)*yy;
float dx=abs(q.x-xi-lean)/(w0*(1.-.72*pow(yc,.8))+.001);
return pow(clamp(1.-yy,0.,1.),.8)*smoothstep(1.,.15,dx);}
float flame(vec2 u,float t,float sd,float Ae,out float heat,out float top){
float gs=.5+.5*sin(t*.37+sd)*sin(t*.91);
float wd=(f4(vec2(u.y*1.7-t*.8+sd,sd*2.3+t*.1))-.5)*.55*(.7+.7*gs);
vec2 q=vec2(u.x+wd*(.08+u.y*1.2),u.y);
float bh=(.08+.3*pow(f4(vec2(q.x*3.2+sd,t*.6)),2.2))*(.75+.5*n(vec2(q.x*20.+sd,t*3.)));
heat=pow(clamp(1.-q.y/bh,0.,1.),1.3);top=.12;
for(int i=0;i<14;i++){
if(sd>.5&&i>7)break;
float fi=float(i)+sd;
float xi=(float(i)+.5+1.4*(h(vec2(fi,1.3))-.5))/14.*Ae;
float ph=h(vec2(fi,5.1))*6.283;
float pu=.62+.38*sin(t*(1.4+2.*h(vec2(fi,8.2)))+ph);
float gu=smoothstep(.2,.95,.5+.5*sin(t*(.45+.5*h(vec2(fi,4.4)))+ph*1.7));
float H=(.36+.64*h(vec2(fi,2.7)))*pu*(.6+.62*gu)*G;
float w0=.085+.09*h(vec2(fi,6.6));
heat=max(heat,tg(q,xi,H,w0,ph,t,fi));
top=max(top,H*clamp(1.-abs(u.x-xi)/(w0*3.),0.,1.));}
for(int i=0;i<10;i++){if(sd>.5)break;float fi=float(i)+sd+30.;float xi=h(vec2(fi,1.9))*Ae;float ph=h(vec2(fi,5.5))*6.283;
float H=(.12+.3*h(vec2(fi,2.2)))*(.55+.45*sin(t*(2.2+2.5*h(vec2(fi,8.8)))+ph))*G;
heat=max(heat,tg(q,xi,H,.035+.03*h(vec2(fi,6.1)),ph,t,fi));}
for(int i=0;i<12;i++){if(sd>.5)break;vec4 s=P[i];float fi=s.w*40.+sd;
float w=smoothstep(-.1,.7,sin(t*(1.5+fract(s.w*7.3)*1.7)+s.w*6.283));
float H=(.3+.6*fract(s.w*3.7))*w*G;
heat=max(heat,tg(q,s.x,H,.07+.07*s.z,s.w*6.283,t,fi));
top=max(top,H*clamp(1.-abs(u.x-s.x)/(.15),0.,1.));}
float tu=fb(vec2(q.x*9.+(f3(vec2(q.x*2.1,q.y*1.4-t*1.7+sd))-.5)*2.6,q.y*1.2-t*2.7+sd));
float tu2=f3(vec2(q.x*19.+sd,q.y*2.8-t*5.2));
float fl=n(vec2(q.x*38.,q.y*3.-t*6.));
return heat*1.2*(.9+.2*gs)-(tu*.55+tu2*.3)*(.12+q.y*1.2)-fl*.2*(.08+q.y*1.4);}
vec3 fcol(float f,float y){
vec3 c=mix(vec3(.5,.09,.02),vec3(1.,.4,.07),smoothstep(.08,.4,f));
c=mix(c,vec3(1.,.6,.22),smoothstep(.55,1.05,f));
c=mix(c,vec3(1.,.92,.76),smoothstep(1.2,1.55,f));return c;}
void main(){
float Ae=max(R.x/R.y,1.1);vec2 u=vec2(gl_FragCoord.x/R.x*Ae,gl_FragCoord.y/R.y);float t=T;
float hB,tB,hF,tF;
float fB=flame(u+vec2(.09,-.02),t*.82,7.3,Ae,hB,tB);
float fF=flame(u,t,0.,Ae,hF,tF);
float top=max(tB*.9,tF);
vec2 cc=vec2(Ae*.5,.5),dd=u-cc;float rr=length(dd),sa=1.1*exp(-rr*rr*4.)*(.7+.3*sin(t*.5));
vec2 us=cc+mat2(cos(sa),-sin(sa),sin(sa),cos(sa))*dd;
float nr=exp(-max(u.y-max(tB*.9,tF),0.)*2.2);
vec2 sp=vec2(us.x*1.1+(f3(vec2(u.y*7.-t*2.4,u.x*2.))-.5)*.05*nr,us.y*.9-t*.3);
vec2 w2=vec2(f3(sp*1.3+vec2(t*.1,0.)),f3(sp*1.3+vec2(5.2,t*.12)))-.5;
vec2 sq=sp*vec2(2.1,1.35)+w2*1.2;float b0=fb(sq);float sm=b0*.62+.38*(1.-abs(fb(sq*1.6+vec2(3.,1.))*2.-1.));
float E=mix(.1,1.,exp(-max(u.y-top*.85,0.)*1.7));
float sd=smoothstep(.33,.66,sm)*(.2+.8*E);
float lit=clamp(.5+(fb(sq-vec2(0.,.06))-b0)*11.,0.,1.);
vec3 sc=mix(vec3(.09,.12,.24),vec3(.93,.94,.98),lit*.72+sm*.28);
sc=mix(sc,sc*vec3(.85,.95,1.2),smoothstep(.3,1.,u.y)*.8);
float near=exp(-max(u.y-top,0.)*2.2);
sc+=vec3(1.,.42,.12)*(near*.3+clamp(hF,0.,1.)*.3);
vec3 col=mix(vec3(.04,.075,.17),vec3(.15,.27,.6),smoothstep(0.,1.,u.y)*.8);
float bB=smoothstep(-.02,.55,fB);
col=mix(col,fcol(fB*.8,u.y)*vec3(.9,.6,.5),bB*.55);
col=mix(col,sc,sd*.8);
float fk=1.+.07*sin(t*11.+sin(t*2.)*3.);
col+=vec3(1.,.38,.08)*pow(clamp(hF,0.,1.),1.6)*.5*fk;
float bF=smoothstep(-.02,.58,fF);
vec3 cF=fcol(fF,u.y)*(.62+.75*f3(vec2(u.x*16.,u.y*3.-t*3.8)));
col=mix(col,cF,bF*.9)+cF*bF*.22;
col+=smoothstep(.6,1.,fF)*vec3(1.,.8,.5)*.18;
float s2=smoothstep(.45,.85,f3(sq*.8+vec2(7.,3.)));
col=mix(col,sc*1.05,s2*.5*(1.-u.y*.2));
vec3 em=vec3(0.);
for(int k=0;k<2;k++){float z=float(k)+1.;vec2 g=vec2(u.x*11.*z,u.y*6.*z-t*(1.1+z*.7));vec2 id=floor(g),fr=fract(g);float r=h(id+z*13.);
vec2 c=vec2(.25+.5*h(id+4.1),.25+.5*h(id+9.7));c.x+=sin(t*1.7+r*30.)*.12;
em+=vec3(1.,.6,.22)*smoothstep(.11/z,0.,length(vec2(fr.x-c.x,(fr.y-c.y)*.4)))*step(.72,r)*(.55+.45*sin(t*6.+r*50.))*smoothstep(.95,.05,u.y)*(.4+.6*G)*1.6;}
col+=em;
col=clamp(col,0.,1.);col=mix(col,col*col*(3.-2.*col),.3);
col*=1.-.38*smoothstep(.45,1.4,length((u-vec2(Ae*.5,.5))*vec2(.75,1.)));
col*=smoothstep(0.,.45,S);
col+=(h(gl_FragCoord.xy+t)-.5)/255.;
float a=1.;
if(X>0.){float nz=fb(u*2.4+vec2(3.,9.));float e=nz*.45+u.y*.8-(X*1.45-.15);
a=smoothstep(-.004,.02,e);float g2=smoothstep(-.07,0.,e)*(1.-smoothstep(0.,.14,e));
col+=vec3(1.,.5,.1)*g2*2.2;col=mix(col,vec3(1.,.8,.5),g2*g2*.5);a=max(a,g2*.9);
vec2 gg=u*vec2(70.,40.)+vec2(0.,-t*5.);float spk=step(.9,h(floor(gg)+floor(t*9.)))*smoothstep(.55,0.,length(fract(gg)-.5));
col+=vec3(1.,.72,.3)*spk*g2*3.5;a=max(a,spk*g2);}
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
function rm(){cancelAnimationFrame(raf);document.removeEventListener('keydown',kd);d.classList.remove('bpre-on');setTimeout(function(){d.classList.remove('bpre-rev')},900);p.remove()}
function kd(e){if(e.key==='Escape'&&performance.now()-t0>500)out(true)}
function frame(n){var dt=Math.min(.1,(n-last)/1000||.016),s=Math.max(0,(n-t0)/1000),X=0,g=Math.min(1,s/.8),f,m;
if(!done){v+=(Math.min(real,94*(1-Math.exp(-s*2.2)))-v)*Math.min(1,dt*8)}
else{f=(n-tF)/1000;if(!tB){v=vF+(100-vF)*Math.min(1,f/.25);if(f>=.25){tB=n;p.classList.add('bout');if(!gl||slow){p.classList.add('bfade');d.classList.add('bpre-rev');setTimeout(rm,600)}}}else{v=100;X=Math.min(1,(n-tB)/950);X=X<.5?4*X*X*X:1-Math.pow(-2*X+2,3)/2}}
if(gl&&!slow&&!done&&last&&++cnt>2){fr.push(n-last);if(n-last>220||fr.length>=5){m=n-last>220?n-last:fr.reduce(function(x,y){return x+y},0)/fr.length;fr=[];if(m>SL){if(sc>.5){sc*=.7;rz()}else{slow=true;out(true)}}}}
last=n;
p.style.setProperty('--fk',Math.max(.2,1+.25*Math.sin(s*11+Math.sin(s*3)*2)+.1*Math.sin(s*23)+1.1*Math.exp(-Math.pow((s-1.05)/.22,2))).toFixed(3));
if(X>.3&&!rev){rev=1;d.classList.add('bpre-rev')}
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
