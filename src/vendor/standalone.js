"use strict";(()=>{var d="splain-standalone-skin",l=typeof document>"u"?"":document.currentScript?.nonce??"",o=a=>a.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),c=`
[data-splain-dot]{position:fixed;bottom:1.25rem;inset-inline-end:1.25rem;z-index:2147483000;display:flex;align-items:center;
justify-content:center;width:2.75rem;height:2.75rem;border-radius:9999px;border:0;cursor:pointer;
background:rgb(var(--primary-600, 79, 70, 229));color:#fff;font:600 1.1rem/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25)}
[data-splain-dot]:hover{background:rgb(var(--primary-700, 67, 56, 202))}
[data-splain-dot]::after{content:"";position:absolute;inset:0;border-radius:9999px;box-shadow:0 0 0 0 rgba(var(--primary-500, 79, 70, 229),.5);
animation:splain-pulse 2.4s ease-out infinite}
@media (prefers-reduced-motion:reduce){[data-splain-dot]::after{animation:none}}
@keyframes splain-pulse{0%{box-shadow:0 0 0 0 rgba(var(--primary-500, 79, 70, 229),.45)}70%{box-shadow:0 0 0 12px rgba(var(--primary-500, 79, 70, 229),0)}100%{box-shadow:0 0 0 0 rgba(var(--primary-500, 79, 70, 229),0)}}
[data-splain-dot][data-splain-done]{background:rgb(var(--gray-500, 107, 114, 128))}[data-splain-dot][data-splain-done]::after{animation:none}
[data-splain-panel]{position:fixed;bottom:4.5rem;inset-inline-end:1.25rem;z-index:2147483000;width:18rem;max-width:calc(100vw - 2.5rem);
max-height:70vh;overflow-y:auto;border-radius:.75rem;padding:.4rem;font:400 .875rem/1.4 system-ui,sans-serif;color-scheme:light;
background:rgb(var(--gray-50, 255, 255, 255));color:rgb(var(--gray-900, 17, 24, 39));border:1px solid rgb(var(--gray-200, 229, 231, 235));box-shadow:0 10px 30px rgba(0,0,0,.18)}
[data-splain-panel][hidden]{display:none}
.splain-group{padding:.25rem}
.splain-heading{padding:.4rem .5rem .2rem;font-size:.6875rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:rgb(var(--primary-500, 107, 114, 128))}
.splain-count{float:inline-end;font-weight:500;font-variant-numeric:tabular-nums;text-transform:none;letter-spacing:0}
[data-splain-guide],[data-splain-track-item]{display:flex;width:100%;align-items:center;gap:.5rem;padding:.5rem;
border:0;background:none;border-radius:.375rem;cursor:pointer;text-align:left;color:inherit;font:inherit}
[data-splain-guide]:hover,[data-splain-track-item]:hover{background:rgba(var(--primary-500, 107, 114, 128),.1)}
.splain-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[data-splain-check]{font-size:.6875rem;font-weight:500;padding:.1rem .4rem;border-radius:.375rem;background:#dcfce7;color:#166534;white-space:nowrap}
[data-splain-check][hidden]{display:none}
[data-splain-track-next]{box-shadow:inset 2px 0 0 0 rgb(var(--primary-500, 79, 70, 229))}
.splain-foot{padding:.5rem;font-size:.6875rem;color:rgb(var(--gray-500, 107, 114, 128))}
.dark [data-splain-panel]{color-scheme:dark;background:rgb(var(--gray-900, 31, 41, 55));color:rgb(var(--gray-100, 249, 250, 251));border-color:rgb(var(--gray-700, 55, 65, 81))}
.dark [data-splain-guide]:hover,.dark [data-splain-track-item]:hover{background:rgba(var(--primary-400, 255, 255, 255),.12)}
.dark [data-splain-check]{background:rgba(34,197,94,.15);color:#4ade80}
.dark .splain-foot{color:rgb(var(--gray-400, 156, 163, 175))}
`;function u(){if(document.getElementById(d))return;let a=document.createElement("style");a.nonce=l,a.id=d,a.textContent=c,document.head.appendChild(a)}function p(a){return`<span data-splain-check${a?"":" hidden"}>Completed</span>`}function g(a){return`<button type="button" role="menuitem" data-splain-guide="${o(a.slug)}"><span class="splain-label">${o(a.title)}</span>${p(a.done===!0)}</button>`}function m(a){let e=a.guides.map(n=>`<button type="button" role="menuitem" data-splain-track-item="${o(n.slug)}" data-splain-track-version="${n.version}"${n.url?` data-splain-track-url="${o(n.url)}"`:""}${n.done?" data-splain-track-done":""}><span class="splain-label">${o(n.title)}</span>${p(n.done===!0)}</button>`).join("");return`<div class="splain-group" data-splain-track="${o(a.slug)}"><div class="splain-heading">${o(a.title)}<span class="splain-count" data-splain-track-count></span></div>${e}</div>`}function b(a){let e=(a.tracks??[]).map(m).join(""),n=a.guides.filter(r=>r.genre!=="tour"),i=a.guides.filter(r=>r.genre==="tour"),t=(r,s)=>s.length===0?"":`<div class="splain-group"><div class="splain-heading">${r}</div>${s.map(g).join("")}</div>`;return'<button type="button" data-splain-dot aria-label="Guides" aria-expanded="false">?</button><div data-splain-panel role="menu" hidden>'+e+t("How do I\u2026",n)+t("Learn this page",i)+'<div class="splain-foot">Powered by Splain</div></div>'}function f(a,e={}){let n=e.root??document.body;e.skin!==!1&&u(),n.querySelector("[data-splain-playback]")?.remove();let i=document.createElement("div");i.setAttribute("data-splain-playback",""),i.innerHTML=b(a);let t=document.createElement("script");t.nonce=l,t.type="application/json",t.setAttribute("data-splain-payload",""),t.textContent=JSON.stringify(a),i.appendChild(t),n.appendChild(i);let r=window.Splain;r?r.boot():document.addEventListener("DOMContentLoaded",()=>window.Splain?.boot())}typeof window<"u"&&(window.SplainStandalone={mount:f});})();
