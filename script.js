const $ = id => document.getElementById(id);
const fmt = (n,d=2) => Number(n).toLocaleString('es-CO',{minimumFractionDigits:d,maximumFractionDigits:d});
const val = id => Number($(id).value);
function bindRange(id,out,unit,d=1){const el=$(id),o=$(out);const update=()=>o.textContent=fmt(el.value,d)+' '+unit;el.addEventListener('input',update);update();}
document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('.sim-panel').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.panel));}));

// Caída libre
['ff-mass','ff-height','ff-gravity'].forEach((id,i)=>bindRange(id,['ff-mass-out','ff-height-out','ff-gravity-out'][i],['kg','m','m/s²'][i]));
let ffFrame=null,ffStart=0,ffRunning=false,ffElapsed=0;
function ffCalc(t=0){const m=val('ff-mass'),h=val('ff-height'),g=val('ff-gravity'),time=Math.sqrt(2*h/g),used=Math.min(t,time),y=Math.max(0,h-.5*g*used*used),v=g*used,ep=m*g*y,ec=.5*m*v*v;return {m,h,g,time,used,y,v,ep,ec};}
function ffRender(t=0){const a=ffCalc(t),stage=$('freefall').querySelector('.fall-stage'),range=stage.clientHeight-95,progress=1-a.y/a.h;$('ff-object').style.top=(28+Math.max(0,range)*progress)+'px';$('ff-time').innerHTML=fmt(a.used)+' <em>s</em>';$('ff-velocity').innerHTML=fmt(a.v)+' <em>m/s</em>';$('ff-ep').innerHTML=fmt(a.ep)+' <em>J</em>';$('ff-ec').innerHTML=fmt(a.ec)+' <em>J</em>';$('ff-total-time').textContent=fmt(a.time)+' s';$('ff-final-v').textContent=fmt(Math.sqrt(2*a.g*a.h))+' m/s';$('ff-em').textContent=fmt(a.m*a.g*a.h)+' J';$('ff-height-label').textContent=fmt(a.h,1)+' m';}
function ffStop(){ffRunning=false;if(ffFrame)cancelAnimationFrame(ffFrame);$('ff-status').textContent='FINALIZADO';}
function ffTick(now){if(!ffRunning)return;ffElapsed=(now-ffStart)/1000*1.5;const a=ffCalc(ffElapsed);ffRender(ffElapsed);if(ffElapsed>=a.time){ffStop();return;}ffFrame=requestAnimationFrame(ffTick);}
$('ff-start').onclick=()=>{if(ffFrame)cancelAnimationFrame(ffFrame);ffRunning=true;ffElapsed=0;ffStart=performance.now();$('ff-status').textContent='EN MOVIMIENTO';ffFrame=requestAnimationFrame(ffTick);};
$('ff-reset').onclick=()=>{ffStop();ffRender(0);$('ff-status').textContent='LISTO';};
['ff-mass','ff-height','ff-gravity'].forEach(id=>$(id).addEventListener('input',()=>{if(!ffRunning)ffRender(0)}));ffRender();

// Péndulo: aproximación de ángulo pequeño para el período y animación sinusoidal.
['p-length','p-mass','p-angle','p-gravity'].forEach((id,i)=>bindRange(id,['p-length-out','p-mass-out','p-angle-out','p-gravity-out'][i],['m','kg','°','m/s²'][i]));
let pRunning=false,pFrame=null,pStart=0;
function pUpdate(t=0){const L=val('p-length'),m=val('p-mass'),angle=val('p-angle'),g=val('p-gravity'),period=2*Math.PI*Math.sqrt(L/g),freq=1/period,rad=angle*Math.PI/180,drop=L*(1-Math.cos(rad)),energy=m*g*drop;$('p-period').innerHTML=fmt(period)+' <em>s</em>';$('p-frequency').innerHTML=fmt(freq)+' <em>Hz</em>';$('p-maxheight').innerHTML=fmt(drop)+' <em>m</em>';$('p-energy').innerHTML=fmt(energy)+' <em>J</em>';const theta=rad*Math.cos(2*Math.PI*t/period),scale=Math.min(1.25,115/Math.max(1,L*55)),x=250+Math.sin(theta)*L*55*scale,y=25+Math.cos(theta)*L*55*scale;$('p-string').setAttribute('x2',x);$('p-string').setAttribute('y2',y);$('p-bob').setAttribute('cx',x);$('p-bob').setAttribute('cy',y);const arcR=Math.min(120,L*55*scale);$('p-arc').setAttribute('d',`M ${250-arcR*Math.sin(rad)} ${25+arcR*Math.cos(rad)} A ${arcR} ${arcR} 0 0 1 ${250+arcR*Math.sin(rad)} ${25+arcR*Math.cos(rad)}`);}
function pTick(now){if(!pRunning)return;pUpdate((now-pStart)/1000*1.6);pFrame=requestAnimationFrame(pTick);}
$('p-toggle').onclick=()=>{pRunning=!pRunning;if(pRunning){pStart=performance.now();$('p-toggle').textContent='Ⅱ Pausar';$('p-status').textContent='OSCILANDO';pFrame=requestAnimationFrame(pTick);}else{cancelAnimationFrame(pFrame);$('p-toggle').textContent='▶ Continuar';$('p-status').textContent='PAUSADO';}};
$('p-reset').onclick=()=>{pRunning=false;cancelAnimationFrame(pFrame);$('p-toggle').textContent='▶ Iniciar péndulo';$('p-status').textContent='PAUSADO';pUpdate(0);};
['p-length','p-mass','p-angle','p-gravity'].forEach(id=>$(id).addEventListener('input',()=>{if(!pRunning)pUpdate(0)}));pUpdate();

// Resorte
['s-k','s-x','s-mass'].forEach((id,i)=>bindRange(id,['s-k-out','s-x-out','s-mass-out'][i],['N/m','m','kg'][i],i===0?0:2));
let sFrame=null,sRunning=false,sStart=0;
function sDraw(t=0){const k=val('s-k'),x=val('s-x'),m=val('s-mass'),energy=.5*k*x*x,force=k*x,speed=Math.sqrt(2*energy/m),omega=Math.sqrt(k/m),displacement=sRunning?x*Math.cos(omega*t):x,visualX=displacement/10*130;const left=35,right=300+visualX;let d=`M ${left} 115`;const coils=14,step=(right-left)/coils;for(let i=1;i<coils;i++)d+=` L ${left+i*step} ${i%2?83:147}`;d+=` L ${right} 115`;$('spring-coil').setAttribute('d',d);$('spring-block').setAttribute('x',right);$('s-energy').innerHTML=fmt(energy)+' <em>J</em>';$('s-force').innerHTML=fmt(force)+' <em>N</em>';$('s-amplitude').innerHTML=fmt(x)+' <em>m</em>';$('s-speed').innerHTML=fmt(speed)+' <em>m/s</em>';$('s-energy-copy').textContent=fmt(energy)+' J';$('s-speed-copy').textContent=fmt(speed)+' m/s';}
function sTick(now){if(!sRunning)return;const t=(now-sStart)/1000;sDraw(t);if(t>8){sRunning=false;$('s-status').textContent='EN REPOSO';$('s-release').textContent='↗ Soltar resorte';sDraw(0);return;}sFrame=requestAnimationFrame(sTick);}
$('s-release').onclick=()=>{sRunning=!sRunning;if(sRunning){sStart=performance.now();$('s-status').textContent='OSCILANDO';$('s-release').textContent='Ⅱ Pausar';sFrame=requestAnimationFrame(sTick);}else{cancelAnimationFrame(sFrame);$('s-status').textContent='PAUSADO';$('s-release').textContent='↗ Reanudar';}};
$('s-reset').onclick=()=>{sRunning=false;cancelAnimationFrame(sFrame);$('s-status').textContent='EN REPOSO';$('s-release').textContent='↗ Soltar resorte';sDraw(0);};
['s-k','s-x','s-mass'].forEach(id=>$(id).addEventListener('input',()=>{if(!sRunning)sDraw(0)}));sDraw();

// Pelota en rampa
['r-mass','r-height','r-gravity'].forEach((id,i)=>bindRange(id,['r-mass-out','r-height-out','r-gravity-out'][i],['kg','m','m/s²'][i]));
let rFrame=null,rRunning=false,rStart=0;
function rDraw(progress=0){const m=val('r-mass'),h=val('r-height'),g=val('r-gravity'),fraction=Math.max(0,Math.min(1,progress)),currentH=h*(1-fraction),ep=m*g*currentH,em=m*g*h,ec=em-ep,v=Math.sqrt(Math.max(0,2*g*(h-currentH)));const x=75+310*fraction,y=55+150*fraction;$('r-ball').setAttribute('cx',x);$('r-ball').setAttribute('cy',y);$('r-velocity').innerHTML=fmt(v)+' <em>m/s</em>';$('r-current-h').innerHTML=fmt(currentH)+' <em>m</em>';$('r-ep').innerHTML=fmt(ep)+' <em>J</em>';$('r-ec').innerHTML=fmt(ec)+' <em>J</em>';$('r-em').textContent=fmt(em)+' J';$('r-energy-ep').style.width=(100*(1-fraction))+'%';$('r-energy-ec').style.width=(100*fraction)+'%';}
function rTick(now){if(!rRunning)return;const p=(now-rStart)/3500;rDraw(p);if(p>=1){rRunning=false;$('r-status').textContent='LLEGÓ A LA BASE';return;}rFrame=requestAnimationFrame(rTick);}
$('r-start').onclick=()=>{cancelAnimationFrame(rFrame);rRunning=true;rStart=performance.now();$('r-status').textContent='DESCENDIENDO';rFrame=requestAnimationFrame(rTick);};
$('r-reset').onclick=()=>{rRunning=false;cancelAnimationFrame(rFrame);rDraw(0);$('r-status').textContent='LISTO';};
['r-mass','r-height','r-gravity'].forEach(id=>$(id).addEventListener('input',()=>{if(!rRunning)rDraw(0)}));rDraw();
