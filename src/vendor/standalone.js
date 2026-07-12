"use strict";(()=>{var d="splain-standalone-skin",l=typeof document>"u"?"":document.currentScript?.nonce??"",i=n=>n.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]),c=`
[data-splain-dot]{position:fixed;bottom:1.25rem;inset-inline-end:1.25rem;z-index:2147483000;display:flex;align-items:center;
justify-content:center;width:2.75rem;height:2.75rem;border-radius:9999px;border:0;cursor:pointer;
background:#4f46e5;color:#fff;font:600 1.1rem/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25)}
[data-splain-dot]:hover{background:#4338ca}
[data-splain-dot]::after{content:"";position:absolute;inset:0;border-radius:9999px;box-shadow:0 0 0 0 rgba(79,70,229,.5);
animation:splain-pulse 2.4s ease-out infinite}
@media (prefers-reduced-motion:reduce){[data-splain-dot]::after{animation:none}}
@keyframes splain-pulse{0%{box-shadow:0 0 0 0 rgba(79,70,229,.45)}70%{box-shadow:0 0 0 12px rgba(79,70,229,0)}100%{box-shadow:0 0 0 0 rgba(79,70,229,0)}}
[data-splain-dot][data-splain-done]{background:#6b7280}[data-splain-dot][data-splain-done]::after{animation:none}
[data-splain-panel]{position:fixed;bottom:4.5rem;inset-inline-end:1.25rem;z-index:2147483000;width:18rem;max-width:calc(100vw - 2.5rem);
max-height:70vh;overflow-y:auto;border-radius:.75rem;padding:.4rem;font:400 .875rem/1.4 system-ui,sans-serif;
background:#fff;color:#111827;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(0,0,0,.18)}
[data-splain-panel][hidden]{display:none}
.splain-group{padding:.25rem}
.splain-heading{padding:.4rem .5rem .2rem;font-size:.6875rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#6b7280}
.splain-count{float:inline-end;font-weight:500;font-variant-numeric:tabular-nums;text-transform:none;letter-spacing:0}
[data-splain-guide],[data-splain-track-item]{display:flex;width:100%;align-items:center;gap:.5rem;padding:.5rem;
border:0;background:none;border-radius:.375rem;cursor:pointer;text-align:left;color:inherit;font:inherit}
[data-splain-guide]:hover,[data-splain-track-item]:hover{background:#f3f4f6}
.splain-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
[data-splain-check]{font-size:.6875rem;font-weight:500;padding:.1rem .4rem;border-radius:.375rem;background:#dcfce7;color:#166534;white-space:nowrap}
[data-splain-check][hidden]{display:none}
[data-splain-track-next]{box-shadow:inset 2px 0 0 0 #4f46e5}
.splain-foot{padding:.5rem;font-size:.6875rem;color:#6b7280}
@media (prefers-color-scheme:dark){
[data-splain-panel]{background:#1f2937;color:#f9fafb;border-color:#374151}
[data-splain-guide]:hover,[data-splain-track-item]:hover{background:rgba(255,255,255,.06)}
[data-splain-check]{background:rgba(34,197,94,.15);color:#4ade80}
.splain-foot{color:#9ca3af}}
`;function u(){if(document.getElementById(d))return;let n=document.createElement("style");n.nonce=l,n.id=d,n.textContent=c,document.head.appendChild(n)}function p(n){return`<span data-splain-check${n?"":" hidden"}>Completed</span>`}function m(n){return`<button type="button" role="menuitem" data-splain-guide="${i(n.slug)}"><span class="splain-label">${i(n.title)}</span>${p(n.done===!0)}</button>`}function g(n){let a=n.guides.map(e=>`<button type="button" role="menuitem" data-splain-track-item="${i(e.slug)}" data-splain-track-version="${e.version}"${e.url?` data-splain-track-url="${i(e.url)}"`:""}${e.done?" data-splain-track-done":""}><span class="splain-label">${i(e.title)}</span>${p(e.done===!0)}</button>`).join("");return`<div class="splain-group" data-splain-track="${i(n.slug)}"><div class="splain-heading">${i(n.title)}<span class="splain-count" data-splain-track-count></span></div>${a}</div>`}function b(n){let a=(n.tracks??[]).map(g).join(""),e=n.guides.filter(o=>o.genre!=="tour"),r=n.guides.filter(o=>o.genre==="tour"),t=(o,s)=>s.length===0?"":`<div class="splain-group"><div class="splain-heading">${o}</div>${s.map(m).join("")}</div>`;return'<button type="button" data-splain-dot aria-label="Guides" aria-expanded="false">?</button><div data-splain-panel role="menu" hidden>'+a+t("How do I\u2026",e)+t("Learn this page",r)+'<div class="splain-foot">Powered by Splain</div></div>'}function f(n,a={}){let e=a.root??document.body;a.skin!==!1&&u(),e.querySelector("[data-splain-playback]")?.remove();let r=document.createElement("div");r.setAttribute("data-splain-playback",""),r.innerHTML=b(n);let t=document.createElement("script");t.nonce=l,t.type="application/json",t.setAttribute("data-splain-payload",""),t.textContent=JSON.stringify(n),r.appendChild(t),e.appendChild(r);let o=window.Splain;o?o.boot():document.addEventListener("DOMContentLoaded",()=>window.Splain?.boot())}typeof window<"u"&&(window.SplainStandalone={mount:f});})();
