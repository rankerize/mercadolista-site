import{s as le,l as oe,g as q,a as K}from"./firebaseAuth.D_TpaKO7.js";import{e as c}from"./normalize.CnG2smQi.js";const se="comparador-lista";let P=null,h=null,y=null,L=[];function ue(t){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(t)}function me(){try{return JSON.parse(localStorage.getItem(se)||"[]")??[]}catch{return[]}}function pe(t){localStorage.setItem(se,JSON.stringify(t))}function V(){return document.getElementById("add-to-list-modal")}function N(){V()?.classList.remove("is-open")}function j(t){for(const n of["add-modal-auth-lists","add-modal-auth-nolists","add-modal-guest","add-modal-feedback"]){const s=document.getElementById(n);s&&(s.hidden=n!==t)}}function ie(){const t=document.getElementById("add-modal-existing-select");t&&(t.innerHTML="",L.forEach(n=>{const s=document.createElement("option");s.value=n.id,s.textContent=n.nombre,t.appendChild(s)}))}function fe(t){const n=V();if(!n)return;P=t;const s=document.getElementById("add-modal-thumb"),d=document.getElementById("add-modal-prod-name"),r=document.getElementById("add-modal-prod-meta"),a=document.getElementById("add-modal-qty"),e=document.getElementById("add-modal-feedback");if(s&&(s.innerHTML="",t.image)){const i=document.createElement("img");i.src=t.image,i.alt=t.name,i.width=48,i.height=48,i.style.cssText="width:48px;height:48px;object-fit:contain;border-radius:6px;",s.appendChild(i)}if(d&&(d.textContent=t.name),r){const i=[];t.store_name&&i.push(t.store_name),t.price&&i.push(ue(t.price)),r.textContent=i.join(" · ")||"Producto de supermercado"}a&&(a.value="1"),e&&(e.hidden=!0),h?(ie(),j(L.length>0?"add-modal-auth-lists":"add-modal-auth-nolists")):j("add-modal-guest"),n.classList.add("is-open")}function ge(){const t=V();if(!t)return;const n=document.getElementById("add-modal-feedback-msg"),s=document.getElementById("add-modal-qty"),d=document.getElementById("add-modal-format"),r=document.getElementById("add-dest-existing"),a=document.getElementById("add-dest-new"),e=document.getElementById("add-modal-existing-select"),i=document.getElementById("add-modal-new-name"),f=document.getElementById("add-modal-first-name");function b(o){n&&(n.textContent=o),j("add-modal-feedback")}function $(){return{nombre:P?.name??"",marca:"TODAS",formato:d?.value??"unidades",cantidad:Number(s?.value)||1,comprado:!1}}document.getElementById("add-modal-close")?.addEventListener("click",N),document.getElementById("add-modal-continue")?.addEventListener("click",N),t.addEventListener("click",o=>{o.target===t&&N()}),document.getElementById("add-modal-go-list")?.addEventListener("click",()=>{N(),window.location.href="/#lista"}),r?.addEventListener("change",()=>{e&&(e.disabled=!1),i&&(i.disabled=!0)}),a?.addEventListener("change",()=>{e&&(e.disabled=!0),i&&(i.disabled=!1,i.focus())}),document.getElementById("add-modal-add-local")?.addEventListener("click",()=>{const o=me();o.push($()),pe(o),b("¡Agregado a tu canasta! Puedes verlo en la página principal.")}),document.getElementById("add-modal-login-btn")?.addEventListener("click",async()=>{try{const o=await oe();h=o.uid,y=o,L=await q(o.uid,o.email??void 0),ie(),j(L.length>0?"add-modal-auth-lists":"add-modal-auth-nolists")}catch{}}),document.getElementById("add-modal-submit-auth")?.addEventListener("click",async()=>{if(!P||!h||!y)return;const o=a?.checked??!1,l=$();if(o){const p=i?.value.trim()??"";if(!p){alert("Escribe un nombre para la nueva lista");return}try{await K(h,{nombre:p,ciudad:"bogota",items:[l]},void 0,{displayName:y.displayName,email:y.email}),L=await q(h,y.email??void 0),b(`¡Lista «${p}» creada y producto guardado!`)}catch(u){alert(u.message||"Error al crear la lista.")}}else{const p=e?.value??"",u=L.find(m=>m.id===p);if(!u)return;try{const m=[...u.items??[],l];await K(h,{nombre:u.nombre,ciudad:u.ciudad||"bogota",items:m},u.id,{displayName:y.displayName,email:y.email}),b(`¡Producto guardado en «${u.nombre}»!`)}catch(m){alert(m.message||"Error al guardar.")}}}),document.getElementById("add-modal-submit-first")?.addEventListener("click",async()=>{if(!P||!h||!y)return;const o=f?.value.trim()??"";if(!o){alert("Escribe un nombre para tu lista");return}try{await K(h,{nombre:o,ciudad:"bogota",items:[$()]},void 0,{displayName:y.displayName,email:y.email}),L=await q(h,y.email??void 0),b(`¡Lista «${o}» creada!`)}catch(l){alert(l.message||"Error al crear la lista.")}})}le(async t=>{h=t?.uid??null,y=t??null,h?L=await q(h,t?.email??void 0):L=[]});document.addEventListener("DOMContentLoaded",ge);const W=document.getElementById("cat-page-container"),M=W?.dataset.query||"";let w=W?.dataset.city||"bogota";const ce=Number(W?.dataset.initialCount||0),D=20;let v=1,X="";const _=document.getElementById("cat-sidebar"),E=document.getElementById("product-cards-grid"),A=document.getElementById("product-pager"),S=document.getElementById("cat-live-loader"),C=document.getElementById("sort-select"),I=document.getElementById("cat-city-select"),be=document.getElementById("btn-refresh-prices"),R=document.getElementById("visible-count-number"),Z=document.getElementById("sidebar-count-number"),B=document.getElementById("active-chips-container"),ye=document.getElementById("btn-clear-filters"),k=document.getElementById("no-filter-results"),he=document.getElementById("btn-reset-filters-cta"),G=document.getElementById("sidebar-verdict-slot"),z=document.getElementById("sidebar-stores-slot"),J=document.getElementById("sidebar-brands-slot"),Q=document.getElementById("btn-open-mobile-filters"),ee=document.getElementById("btn-close-mobile-filters"),T=document.getElementById("mobile-city-select"),O=document.getElementById("mobile-sort-select"),te=document.getElementById("mobile-filter-applied-count"),ne=document.querySelector(".mobile-cat-count");Q&&_&&Q.addEventListener("click",()=>{_.classList.add("cat-sidebar--mobile-open")});ee&&_&&ee.addEventListener("click",()=>{_.classList.remove("cat-sidebar--mobile-open")});T&&I&&(T.addEventListener("change",()=>{I.value=T.value,I.dispatchEvent(new Event("change"))}),I.addEventListener("change",()=>{T.value=I.value}));O&&C&&(O.addEventListener("change",()=>{C.value=O.value,C.dispatchEvent(new Event("change"))}),C.addEventListener("change",()=>{O.value=C.value}));document.addEventListener("click",t=>{const n=t.target.closest(".btn-verdict-add, .btn-card-add, .btn-card-add-fab");n&&(t.preventDefault(),fe({name:n.dataset.name??"",store_name:n.dataset.store??"",price:n.dataset.price?Number(n.dataset.price):void 0,image:n.dataset.image||void 0}))});function ae(t){const n=(t||"").toLowerCase();return n.includes("iphone")||n.includes("apple")?"Apple":n.includes("samsung")||n.includes("galaxy")?"Samsung":n.includes("xiaomi")||n.includes("redmi")||n.includes("poco")?"Xiaomi":n.includes("motorola")||n.includes("moto ")?"Motorola":n.includes("honor")?"Honor":n.includes("huawei")?"Huawei":n.includes("oppo")?"Oppo":n.includes("realme")?"Realme":n.includes("infinix")?"Infinix":n.includes("tecno")?"Tecno":n.includes("lg")?"LG":n.includes("sony")?"Sony":n.includes("hp")?"HP":n.includes("lenovo")?"Lenovo":n.includes("asus")?"Asus":"Otras marcas"}function H(t){return"$ "+Math.round(t).toLocaleString("es-CO")}function ve(t){if(!E)return;const d=[...t.offers||[]].sort((e,i)=>(e.price||0)-(i.price||0)).slice(0,200);if(R&&(R.textContent=String(d.length)),Z&&(Z.textContent=String(d.length)),d.length===0){S&&(S.style.display="none"),E&&(E.style.display="none"),k&&(k.style.display="block");return}if(G){const e=t.verdict;e?G.innerHTML=`
              <div class="sidebar-verdict-card" aria-label="Menor precio detectado en Colombia">
                <div class="verdict-pill-header">
                  <span class="verdict-trophy">🏆</span>
                  <span class="verdict-tag">MENOR PRECIO HOY</span>
                </div>
                <div class="sidebar-verdict-body">
                  ${e.image?`
                    <div class="sidebar-verdict-img-wrap">
                      <img src="${c(e.image)}" alt="${c(e.name)}" class="sidebar-verdict-img" width="68" height="68" loading="eager" />
                    </div>`:""}
                  <div class="sidebar-verdict-details">
                    <h2 class="sidebar-verdict-name" title="${c(e.name)}">${c(e.headline||e.name)}</h2>
                    <div class="sidebar-verdict-pricing">
                      <strong class="sidebar-verdict-price">${H(e.price)}</strong>
                      <span class="sidebar-verdict-store">en ${c(e.store_name)}</span>
                    </div>
                    ${e.payment_note?`<span class="sidebar-verdict-payment">💳 ${c(e.payment_note)}</span>`:""}
                  </div>
                </div>
                <div class="sidebar-verdict-actions">
                  <a href="${c(e.url)}" target="_blank" rel="noopener noreferrer" class="btn-verdict-buy">
                    Ver en ${c(e.store_name)} →
                  </a>
                  <button
                    type="button"
                    class="btn-verdict-add"
                    data-name="${c(e.name)}"
                    data-store="${c(e.store_name)}"
                    data-price="${e.price}"
                    data-image="${c(e.image||"")}"
                  >
                    ➕ Agregar a lista
                  </button>
                </div>
              </div>
            `:G.innerHTML=""}const r={},a={};if(d.forEach(e=>{r[e.store_name]=(r[e.store_name]||0)+1;const i=ae(e.name);a[i]=(a[i]||0)+1}),z){const e=Object.keys(r).sort();e.length>0?z.innerHTML=`
              <details class="filter-group" open>
                <summary class="filter-group-title">
                  <span>Tiendas (${e.length})</span>
                  <span class="filter-chevron">▾</span>
                </summary>
                <div class="filter-group-content">
                  ${e.map(i=>`
                    <label class="filter-checkbox-label">
                      <input type="checkbox" class="filter-checkbox filter-store-check" value="${c(i)}" />
                      <span class="filter-text">${c(i)}</span>
                      <span class="filter-count">(${r[i]})</span>
                    </label>
                  `).join("")}
                </div>
              </details>
            `:z.innerHTML=""}if(J){const e=Object.keys(a).sort((i,f)=>a[f]-a[i]);e.length>0?J.innerHTML=`
              <details class="filter-group" open>
                <summary class="filter-group-title">
                  <span>Marcas (${e.length})</span>
                  <span class="filter-chevron">▾</span>
                </summary>
                <div class="filter-group-content">
                  ${e.map(i=>`
                    <label class="filter-checkbox-label">
                      <input type="checkbox" class="filter-checkbox filter-brand-check" value="${c(i)}" />
                      <span class="filter-text">${c(i)}</span>
                      <span class="filter-count">(${a[i]})</span>
                    </label>
                  `).join("")}
                </div>
              </details>
            `:J.innerHTML=""}E.innerHTML=d.map((e,i)=>{const f=e.list_price&&e.list_price>e.price,b=f?Math.round((e.list_price-e.price)/e.list_price*100):0,$=ae(e.name),o=i===0,l=`store-pill store-pill--${e.store_name.toLowerCase().replace(/[^a-z0-9]/g,"")}`;return`
            <article
              class="cat-product-card"
              data-store="${c(e.store_name)}"
              data-brand="${c($)}"
              data-price="${e.price}"
              data-discount="${b}"
              data-name="${c(e.name)}"
              role="listitem"
            >
              <div class="card-top-badges">
                <span class="${l}">${c(e.store_name)}</span>
                ${f&&b>0?`<span class="discount-pill">-${b}%</span>`:""}
                ${o?'<span class="winner-mini-badge">★ Menor precio</span>':""}
              </div>

              <div class="card-thumb-wrap">
                ${e.image?`
                  <img src="${c(e.image)}" alt="${c(e.name)}" class="card-thumb" width="140" height="140" loading="lazy" />
                `:`
                  <div class="card-thumb-fallback">📱</div>
                `}
                <button
                  type="button"
                  class="btn-card-add-fab"
                  data-name="${c(e.name)}"
                  data-store="${c(e.store_name)}"
                  data-price="${e.price}"
                  data-image="${c(e.image||"")}"
                  title="Añadir a mi lista de compras"
                  aria-label="Añadir a mi lista"
                >
                  +
                </button>
              </div>

              <div class="card-content">
                <span class="card-brand-label">${c($)}</span>
                <h3 class="card-title" title="${c(e.name)}">${c(e.name)}</h3>
                ${e.unit_price?`
                  <div class="card-unit-price">${H(e.unit_price)} / ${c(e.unit_label||"")}</div>
                `:""}

                <div class="card-pricing">
                  <span class="card-current-price">${H(e.price)}</span>
                  ${f?`<span class="card-old-price">${H(e.list_price)}</span>`:""}
                </div>
              </div>

              <div class="card-actions">
                <a href="${c(e.url)}" target="_blank" rel="noopener noreferrer" class="btn-card-buy">
                  <span class="btn-card-buy-text-desktop">Ver en ${c(e.store_name)} →</span>
                  <span class="btn-card-buy-text-mobile">Ver Oferta ↗</span>
                </a>
                <button
                  type="button"
                  class="btn-card-add btn-card-add-desktop"
                  data-name="${c(e.name)}"
                  data-store="${c(e.store_name)}"
                  data-price="${e.price}"
                  data-image="${c(e.image||"")}"
                  title="Añadir a mi lista de compras activa"
                >
                  ➕
                </button>
              </div>
            </article>
          `}).join(""),S&&(S.style.display="none"),k&&(k.style.display="none"),E.style.display="grid",v=1,x()}async function F(t,n){if(t){S&&(S.style.display="block"),E&&(E.style.display="none"),k&&(k.style.display="none");try{const s=await fetch(`/api/buscar?q=${encodeURIComponent(t)}&ciudad=${encodeURIComponent(n)}`);if(!s.ok)throw new Error("Error al consultar precios en vivo");const d=await s.json();ve(d)}catch(s){console.warn("Error fetching live offers:",s),S&&(S.style.display="none"),k&&(k.style.display="block")}}}function Ee(t,n){if(!A||(A.replaceChildren(),A.hidden=t<=1,t<=1))return;const s=e=>{v=e,x(),E?.scrollIntoView({behavior:"smooth",block:"start"})},d=document.createElement("button");d.type="button",d.className="btn-page",d.textContent="← Anterior",d.disabled=v===1,d.addEventListener("click",()=>s(v-1));const r=document.createElement("span");r.className="pager-info",r.textContent=`Página ${v} de ${t} · ${n} productos`;const a=document.createElement("button");a.type="button",a.className="btn-page",a.textContent="Siguiente →",a.disabled=v===t,a.addEventListener("click",()=>s(v+1)),A.append(d,r,a)}function x(){if(!E)return;const t=Array.from(E.querySelectorAll(".cat-product-card"));if(t.length===0)return;const n=Array.from(document.querySelectorAll(".filter-store-check:checked")).map(l=>l.value),s=Array.from(document.querySelectorAll(".filter-brand-check:checked")).map(l=>l.value),d=document.querySelector(".filter-price-radio:checked"),r=d?d.value:"all",a=document.getElementById("check-only-discounts"),e=a?a.checked:!1;let i=0;t.forEach(l=>{const p=l.dataset.store||"",u=l.dataset.brand||"",m=Number(l.dataset.price||0),U=Number(l.dataset.discount||0);let g=!0;n.length>0&&!n.includes(p)&&(g=!1),g&&s.length>0&&!s.includes(u)&&(g=!1),g&&r!=="all"&&(r==="under-500k"&&m>5e5||r==="500k-1500k"&&(m<5e5||m>15e5)||r==="1500k-3000k"&&(m<15e5||m>3e6)||r==="over-3000k"&&m<3e6)&&(g=!1),g&&e&&U<=0&&(g=!1),g?(l.style.display="flex",i++):l.style.display="none"});const f=C?C.value:"price-asc";t.sort((l,p)=>{const u=Number(l.dataset.price||0),m=Number(p.dataset.price||0),U=Number(l.dataset.discount||0),g=Number(p.dataset.discount||0),re=(l.dataset.name||"").toLowerCase(),de=(p.dataset.name||"").toLowerCase();return f==="price-asc"?u-m:f==="price-desc"?m-u:f==="discount-desc"?g-U:f==="name-asc"?re.localeCompare(de):0}),t.forEach(l=>E.appendChild(l));const b=t.filter(l=>l.style.display!=="none"),$=Math.max(1,Math.ceil(b.length/D)),o=[n.join("|"),s.join("|"),r,String(e),f].join("#");o!==X&&(v=1,X=o),v=Math.min(v,$),b.forEach((l,p)=>{const u=p>=(v-1)*D&&p<v*D;l.style.display=u?"flex":"none"}),Ee($,b.length),R&&(R.textContent=String(i)),ne&&(ne.textContent=`+${i} ofertas`),k&&(k.style.display=i===0?"block":"none"),ke(n,s,r,e)}function ke(t,n,s,d){if(te){let a=t.length+n.length;s!=="all"&&a++,d&&a++,te.textContent=String(a)}if(!B)return;B.innerHTML="";const r=t.length>0||n.length>0||s!=="all"||d;if(t.forEach(a=>{const e=document.createElement("span");e.className="active-filter-chip",e.innerHTML=`<span>Tienda: ${c(a)}</span><button type="button" data-type="store" data-val="${c(a)}">✕</button>`,B.appendChild(e)}),n.forEach(a=>{const e=document.createElement("span");e.className="active-filter-chip",e.innerHTML=`<span>Marca: ${c(a)}</span><button type="button" data-type="brand" data-val="${c(a)}">✕</button>`,B.appendChild(e)}),s!=="all"){const a={"under-500k":"< $500K","500k-1500k":"$500K - $1.5M","1500k-3000k":"$1.5M - $3M","over-3000k":"> $3M"},e=document.createElement("span");e.className="active-filter-chip",e.innerHTML=`<span>Precio: ${a[s]||s}</span><button type="button" data-type="price">✕</button>`,B.appendChild(e)}if(d){const a=document.createElement("span");a.className="active-filter-chip",a.innerHTML='<span>Solo ofertas</span><button type="button" data-type="discount">✕</button>',B.appendChild(a)}if(r){const a=document.createElement("button");a.type="button",a.className="btn-reset-chips",a.textContent="Restablecer",a.addEventListener("click",Y),B.appendChild(a)}}function Y(){document.querySelectorAll(".filter-store-check").forEach(s=>s.checked=!1),document.querySelectorAll(".filter-brand-check").forEach(s=>s.checked=!1);const t=document.querySelector('.filter-price-radio[value="all"]');t&&(t.checked=!0);const n=document.getElementById("check-only-discounts");n&&(n.checked=!1),x()}_?.addEventListener("change",x);C?.addEventListener("change",x);ye?.addEventListener("click",Y);he?.addEventListener("click",()=>{Y(),ce===0&&M&&F(M,w)});I?.addEventListener("change",()=>{w=I.value,localStorage.setItem("mercadolista_city",w),F(M,w)});be?.addEventListener("click",()=>{F(M,w)});B?.addEventListener("click",t=>{const n=t.target.closest("button");if(!n||n.classList.contains("btn-reset-chips"))return;const s=n.dataset.type,d=n.dataset.val;if(s==="store"&&d){const r=document.querySelector(`.filter-store-check[value="${d}"]`);r&&(r.checked=!1)}else if(s==="brand"&&d){const r=document.querySelector(`.filter-brand-check[value="${d}"]`);r&&(r.checked=!1)}else if(s==="price"){const r=document.querySelector('.filter-price-radio[value="all"]');r&&(r.checked=!0)}else if(s==="discount"){const r=document.getElementById("check-only-discounts");r&&(r.checked=!1)}x()});if(ce===0&&M){const t=localStorage.getItem("mercadolista_city");t&&I&&(I.value=t,w=t),F(M,w)}else x();
