"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[784],{5784:(e,r,t)=>{t.r(r),t.d(r,{default:()=>d});var n=t(7876),o=t(4232),a=t(9017),i=t(3958),u=t(2414),l=t(1907);let s="#ffffff",c=e=>{let r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return r?[parseInt(r[1],16)/255,parseInt(r[2],16)/255,parseInt(r[3],16)/255]:[1,1,1]},f=(e,r,t)=>{switch(e){case"top-left":return{anchor:[0,-.2*t],dir:[0,1]};case"top-right":return{anchor:[r,-.2*t],dir:[0,1]};case"left":return{anchor:[-.2*r,.5*t],dir:[1,0]};case"right":return{anchor:[1.2*r,.5*t],dir:[-1,0]};case"bottom-left":return{anchor:[0,1.2*t],dir:[0,-1]};case"bottom-center":return{anchor:[.5*r,1.2*t],dir:[0,-1]};case"bottom-right":return{anchor:[r,1.2*t],dir:[0,-1]};default:return{anchor:[.5*r,-.2*t],dir:[0,1]}}},d=({raysOrigin:e="top-center",raysColor:r=s,raysSpeed:t=1,lightSpread:d=1,rayLength:v=2,pulsating:m=!1,fadeDistance:g=1,saturation:y=1,followMouse:h=!0,mouseInfluence:p=.1,noiseAmount:C=0,distortion:x=0,className:w=""})=>{let R=(0,o.useRef)(null),D=(0,o.useRef)(null),b=(0,o.useRef)(null),S=(0,o.useRef)({x:.5,y:.5}),A=(0,o.useRef)({x:.5,y:.5}),P=(0,o.useRef)(null),E=(0,o.useRef)(null),T=(0,o.useRef)(null),[I,F]=(0,o.useState)(!1),L=(0,o.useRef)(null);return(0,o.useEffect)(()=>{if(R.current)return L.current=new IntersectionObserver(e=>{F(e[0].isIntersecting)},{threshold:.1}),L.current.observe(R.current),()=>{L.current&&(L.current.disconnect(),L.current=null)}},[]),(0,o.useEffect)(()=>{if(I&&R.current)return T.current&&(T.current(),T.current=null),(async()=>{if(!R.current||(await new Promise(e=>setTimeout(e,10)),!R.current))return;let n=new a.A({dpr:Math.min(window.devicePixelRatio,2),alpha:!0});b.current=n;let o=n.gl;for(o.canvas.style.width="100%",o.canvas.style.height="100%";R.current.firstChild;)R.current.removeChild(R.current.firstChild);R.current.appendChild(o.canvas);let s=`
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`,w=`precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`,I={iTime:{value:0},iResolution:{value:[1,1]},rayPos:{value:[0,0]},rayDir:{value:[0,1]},raysColor:{value:c(r)},raysSpeed:{value:t},lightSpread:{value:d},rayLength:{value:v},pulsating:{value:+!!m},fadeDistance:{value:g},saturation:{value:y},mousePos:{value:[.5,.5]},mouseInfluence:{value:p},noiseAmount:{value:C},distortion:{value:x}};D.current=I;let F=new i.l(o),L=new u.B(o,{vertex:s,fragment:w,uniforms:I}),_=new l.e(o,{geometry:F,program:L});E.current=_;let z=()=>{if(!R.current||!n)return;n.dpr=Math.min(window.devicePixelRatio,2);let{clientWidth:r,clientHeight:t}=R.current;n.setSize(r,t);let o=n.dpr,a=r*o,i=t*o;I.iResolution.value=[a,i];let{anchor:u,dir:l}=f(e,a,i);I.rayPos.value=u,I.rayDir.value=l},N=e=>{if(b.current&&D.current&&E.current){I.iTime.value=.001*e,h&&p>0&&(A.current.x=.92*A.current.x+.07999999999999996*S.current.x,A.current.y=.92*A.current.y+.07999999999999996*S.current.y,I.mousePos.value=[A.current.x,A.current.y]);try{n.render({scene:_}),P.current=requestAnimationFrame(N)}catch(e){console.warn("WebGL rendering error:",e);return}}};window.addEventListener("resize",z),z(),P.current=requestAnimationFrame(N),T.current=()=>{if(P.current&&(cancelAnimationFrame(P.current),P.current=null),window.removeEventListener("resize",z),n)try{let e=n.gl.canvas,r=n.gl.getExtension("WEBGL_lose_context");r&&r.loseContext(),e&&e.parentNode&&e.parentNode.removeChild(e)}catch(e){console.warn("Error during WebGL cleanup:",e)}b.current=null,D.current=null,E.current=null}})(),()=>{T.current&&(T.current(),T.current=null)}},[I,e,r,t,d,v,m,g,y,h,p,C,x]),(0,o.useEffect)(()=>{if(!D.current||!R.current||!b.current)return;let n=D.current,o=b.current;n.raysColor.value=c(r),n.raysSpeed.value=t,n.lightSpread.value=d,n.rayLength.value=v,n.pulsating.value=+!!m,n.fadeDistance.value=g,n.saturation.value=y,n.mouseInfluence.value=p,n.noiseAmount.value=C,n.distortion.value=x;let{clientWidth:a,clientHeight:i}=R.current,u=o.dpr,{anchor:l,dir:s}=f(e,a*u,i*u);n.rayPos.value=l,n.rayDir.value=s},[r,t,d,e,v,m,g,y,p,C,x]),(0,o.useEffect)(()=>{let e=e=>{if(!R.current||!b.current)return;let r=R.current.getBoundingClientRect();S.current={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}};if(h)return window.addEventListener("mousemove",e),()=>window.removeEventListener("mousemove",e)},[h]),(0,n.jsx)("div",{ref:R,className:`light-rays-container ${w}`.trim()})}}}]);