import{s as ie,l as ce,g as A,a as R}from"./firebaseAuth.D_TpaKO7.js";import{e as r}from"./normalize.CnG2smQi.js";const ee="comparador-lista";let T=null,h=null,b=null,$=[];function re(t){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(t)}function de(){try{return JSON.parse(localStorage.getItem(ee)||"[]")??[]}catch{return[]}}function le(t){localStorage.setItem(ee,JSON.stringify(t))}function z(){return document.getElementById("add-to-list-modal")}function M(){z()?.classList.remove("is-open")}function H(t){for(const n of["add-modal-auth-lists","add-modal-auth-nolists","add-modal-guest","add-modal-feedback"]){const a=document.getElementById(n);a&&(a.hidden=n!==t)}}function te(){const t=document.getElementById("add-modal-existing-select");t&&(t.innerHTML="",$.forEach(n=>{const a=document.createElement("option");a.value=n.id,a.textContent=n.nombre,t.appendChild(a)}))}function oe(t){const n=z();if(!n)return;T=t;const a=document.getElementById("add-modal-thumb"),d=document.getElementById("add-modal-prod-name"),c=document.getElementById("add-modal-prod-meta"),s=document.getElementById("add-modal-qty"),e=document.getElementById("add-modal-feedback");if(a&&(a.innerHTML="",t.image)){const i=document.createElement("img");i.src=t.image,i.alt=t.name,i.width=48,i.height=48,i.style.cssText="width:48px;height:48px;object-fit:contain;border-radius:6px;",a.appendChild(i)}if(d&&(d.textContent=t.name),c){const i=[];t.store_name&&i.push(t.store_name),t.price&&i.push(re(t.price)),c.textContent=i.join(" · ")||"Producto de supermercado"}s&&(s.value="1"),e&&(e.hidden=!0),h?(te(),H($.length>0?"add-modal-auth-lists":"add-modal-auth-nolists")):H("add-modal-guest"),n.classList.add("is-open")}function ue(){const t=z();if(!t)return;const n=document.getElementById("add-modal-feedback-msg"),a=document.getElementById("add-modal-qty"),d=document.getElementById("add-modal-format"),c=document.getElementById("add-dest-existing"),s=document.getElementById("add-dest-new"),e=document.getElementById("add-modal-existing-select"),i=document.getElementById("add-modal-new-name"),f=document.getElementById("add-modal-first-name");function y(o){n&&(n.textContent=o),H("add-modal-feedback")}function L(){return{nombre:T?.name??"",marca:"TODAS",formato:d?.value??"unidades",cantidad:Number(a?.value)||1,comprado:!1}}document.getElementById("add-modal-close")?.addEventListener("click",M),document.getElementById("add-modal-continue")?.addEventListener("click",M),t.addEventListener("click",o=>{o.target===t&&M()}),document.getElementById("add-modal-go-list")?.addEventListener("click",()=>{M(),window.location.href="/#lista"}),c?.addEventListener("change",()=>{e&&(e.disabled=!1),i&&(i.disabled=!0)}),s?.addEventListener("change",()=>{e&&(e.disabled=!0),i&&(i.disabled=!1,i.focus())}),document.getElementById("add-modal-add-local")?.addEventListener("click",()=>{const o=de();o.push(L()),le(o),y("¡Agregado a tu canasta! Puedes verlo en la página principal.")}),document.getElementById("add-modal-login-btn")?.addEventListener("click",async()=>{try{const o=await ce();h=o.uid,b=o,$=await A(o.uid,o.email??void 0),te(),H($.length>0?"add-modal-auth-lists":"add-modal-auth-nolists")}catch{}}),document.getElementById("add-modal-submit-auth")?.addEventListener("click",async()=>{if(!T||!h||!b)return;const o=s?.checked??!1,l=L();if(o){const p=i?.value.trim()??"";if(!p){alert("Escribe un nombre para la nueva lista");return}try{await R(h,{nombre:p,ciudad:"bogota",items:[l]},void 0,{displayName:b.displayName,email:b.email}),$=await A(h,b.email??void 0),y(`¡Lista «${p}» creada y producto guardado!`)}catch(u){alert(u.message||"Error al crear la lista.")}}else{const p=e?.value??"",u=$.find(m=>m.id===p);if(!u)return;try{const m=[...u.items??[],l];await R(h,{nombre:u.nombre,ciudad:u.ciudad||"bogota",items:m},u.id,{displayName:b.displayName,email:b.email}),y(`¡Producto guardado en «${u.nombre}»!`)}catch(m){alert(m.message||"Error al guardar.")}}}),document.getElementById("add-modal-submit-first")?.addEventListener("click",async()=>{if(!T||!h||!b)return;const o=f?.value.trim()??"";if(!o){alert("Escribe un nombre para tu lista");return}try{await R(h,{nombre:o,ciudad:"bogota",items:[L()]},void 0,{displayName:b.displayName,email:b.email}),$=await A(h,b.email??void 0),y(`¡Lista «${o}» creada!`)}catch(l){alert(l.message||"Error al crear la lista.")}})}ie(async t=>{h=t?.uid??null,b=t??null,h?$=await A(h,t?.email??void 0):$=[]});document.addEventListener("DOMContentLoaded",ue);const J=document.getElementById("cat-page-container"),S=J?.dataset.query||"";let C=J?.dataset.city||"bogota";const ne=Number(J?.dataset.initialCount||0),F=20;let v=1,W="";const x=document.getElementById("cat-sidebar"),E=document.getElementById("product-cards-grid"),N=document.getElementById("product-pager"),B=document.getElementById("cat-live-loader"),G=document.getElementById("sort-select"),O=document.getElementById("cat-city-select"),me=document.getElementById("btn-refresh-prices"),P=document.getElementById("visible-count-number"),Y=document.getElementById("sidebar-count-number"),I=document.getElementById("active-chips-container"),pe=document.getElementById("btn-clear-filters"),k=document.getElementById("no-filter-results"),fe=document.getElementById("btn-reset-filters-cta"),U=document.getElementById("sidebar-verdict-slot"),D=document.getElementById("sidebar-stores-slot"),K=document.getElementById("sidebar-brands-slot"),X=document.getElementById("btn-open-mobile-filters"),Z=document.getElementById("btn-close-mobile-filters");X&&x&&X.addEventListener("click",()=>{x.classList.add("cat-sidebar--mobile-open")});Z&&x&&Z.addEventListener("click",()=>{x.classList.remove("cat-sidebar--mobile-open")});document.addEventListener("click",t=>{const n=t.target.closest(".btn-verdict-add, .btn-card-add");n&&(t.preventDefault(),oe({name:n.dataset.name??"",store_name:n.dataset.store??"",price:n.dataset.price?Number(n.dataset.price):void 0,image:n.dataset.image||void 0}))});function Q(t){const n=(t||"").toLowerCase();return n.includes("iphone")||n.includes("apple")?"Apple":n.includes("samsung")||n.includes("galaxy")?"Samsung":n.includes("xiaomi")||n.includes("redmi")||n.includes("poco")?"Xiaomi":n.includes("motorola")||n.includes("moto ")?"Motorola":n.includes("honor")?"Honor":n.includes("huawei")?"Huawei":n.includes("oppo")?"Oppo":n.includes("realme")?"Realme":n.includes("infinix")?"Infinix":n.includes("tecno")?"Tecno":n.includes("lg")?"LG":n.includes("sony")?"Sony":n.includes("hp")?"HP":n.includes("lenovo")?"Lenovo":n.includes("asus")?"Asus":"Otras marcas"}function _(t){return"$ "+Math.round(t).toLocaleString("es-CO")}function ge(t){if(!E)return;const d=[...t.offers||[]].sort((e,i)=>(e.price||0)-(i.price||0)).slice(0,200);if(P&&(P.textContent=String(d.length)),Y&&(Y.textContent=String(d.length)),d.length===0){B&&(B.style.display="none"),E&&(E.style.display="none"),k&&(k.style.display="block");return}if(U){const e=t.verdict;e?U.innerHTML=`
              <div class="sidebar-verdict-card" aria-label="Menor precio detectado en Colombia">
                <div class="verdict-pill-header">
                  <span class="verdict-trophy">🏆</span>
                  <span class="verdict-tag">MENOR PRECIO HOY</span>
                </div>
                <div class="sidebar-verdict-body">
                  ${e.image?`
                    <div class="sidebar-verdict-img-wrap">
                      <img src="${r(e.image)}" alt="${r(e.name)}" class="sidebar-verdict-img" width="68" height="68" loading="eager" />
                    </div>`:""}
                  <div class="sidebar-verdict-details">
                    <h2 class="sidebar-verdict-name" title="${r(e.name)}">${r(e.headline||e.name)}</h2>
                    <div class="sidebar-verdict-pricing">
                      <strong class="sidebar-verdict-price">${_(e.price)}</strong>
                      <span class="sidebar-verdict-store">en ${r(e.store_name)}</span>
                    </div>
                    ${e.payment_note?`<span class="sidebar-verdict-payment">💳 ${r(e.payment_note)}</span>`:""}
                  </div>
                </div>
                <div class="sidebar-verdict-actions">
                  <a href="${r(e.url)}" target="_blank" rel="noopener noreferrer" class="btn-verdict-buy">
                    Ver en ${r(e.store_name)} →
                  </a>
                  <button
                    type="button"
                    class="btn-verdict-add"
                    data-name="${r(e.name)}"
                    data-store="${r(e.store_name)}"
                    data-price="${e.price}"
                    data-image="${r(e.image||"")}"
                  >
                    ➕ Agregar a lista
                  </button>
                </div>
              </div>
            `:U.innerHTML=""}const c={},s={};if(d.forEach(e=>{c[e.store_name]=(c[e.store_name]||0)+1;const i=Q(e.name);s[i]=(s[i]||0)+1}),D){const e=Object.keys(c).sort();e.length>0?D.innerHTML=`
              <details class="filter-group" open>
                <summary class="filter-group-title">
                  <span>Tiendas (${e.length})</span>
                  <span class="filter-chevron">▾</span>
                </summary>
                <div class="filter-group-content">
                  ${e.map(i=>`
                    <label class="filter-checkbox-label">
                      <input type="checkbox" class="filter-checkbox filter-store-check" value="${r(i)}" />
                      <span class="filter-text">${r(i)}</span>
                      <span class="filter-count">(${c[i]})</span>
                    </label>
                  `).join("")}
                </div>
              </details>
            `:D.innerHTML=""}if(K){const e=Object.keys(s).sort((i,f)=>s[f]-s[i]);e.length>0?K.innerHTML=`
              <details class="filter-group" open>
                <summary class="filter-group-title">
                  <span>Marcas (${e.length})</span>
                  <span class="filter-chevron">▾</span>
                </summary>
                <div class="filter-group-content">
                  ${e.map(i=>`
                    <label class="filter-checkbox-label">
                      <input type="checkbox" class="filter-checkbox filter-brand-check" value="${r(i)}" />
                      <span class="filter-text">${r(i)}</span>
                      <span class="filter-count">(${s[i]})</span>
                    </label>
                  `).join("")}
                </div>
              </details>
            `:K.innerHTML=""}E.innerHTML=d.map((e,i)=>{const f=e.list_price&&e.list_price>e.price,y=f?Math.round((e.list_price-e.price)/e.list_price*100):0,L=Q(e.name),o=i===0,l=`store-pill store-pill--${e.store_name.toLowerCase().replace(/[^a-z0-9]/g,"")}`;return`
            <article
              class="cat-product-card"
              data-store="${r(e.store_name)}"
              data-brand="${r(L)}"
              data-price="${e.price}"
              data-discount="${y}"
              data-name="${r(e.name)}"
              role="listitem"
            >
              <div class="card-top-badges">
                <span class="${l}">${r(e.store_name)}</span>
                ${f&&y>0?`<span class="discount-pill">-${y}%</span>`:""}
                ${o?'<span class="winner-mini-badge">★ Menor precio</span>':""}
              </div>

              <div class="card-thumb-wrap">
                ${e.image?`
                  <img src="${r(e.image)}" alt="${r(e.name)}" class="card-thumb" width="140" height="140" loading="lazy" />
                `:`
                  <div class="card-thumb-fallback">📱</div>
                `}
              </div>

              <div class="card-content">
                <h3 class="card-title" title="${r(e.name)}">${r(e.name)}</h3>
                ${e.unit_price?`
                  <div class="card-unit-price">${_(e.unit_price)} / ${r(e.unit_label||"")}</div>
                `:""}

                <div class="card-pricing">
                  <span class="card-current-price">${_(e.price)}</span>
                  ${f?`<span class="card-old-price">${_(e.list_price)}</span>`:""}
                </div>
              </div>

              <div class="card-actions">
                <a href="${r(e.url)}" target="_blank" rel="noopener noreferrer" class="btn-card-buy">
                  Ver en ${r(e.store_name)} →
                </a>
                <button
                  type="button"
                  class="btn-card-add"
                  data-name="${r(e.name)}"
                  data-store="${r(e.store_name)}"
                  data-price="${e.price}"
                  data-image="${r(e.image||"")}"
                  title="Añadir a mi lista de compras activa"
                >
                  ➕
                </button>
              </div>
            </article>
          `}).join(""),B&&(B.style.display="none"),k&&(k.style.display="none"),E.style.display="grid",v=1,w()}async function q(t,n){if(t){B&&(B.style.display="block"),E&&(E.style.display="none"),k&&(k.style.display="none");try{const a=await fetch(`/api/buscar?q=${encodeURIComponent(t)}&ciudad=${encodeURIComponent(n)}`);if(!a.ok)throw new Error("Error al consultar precios en vivo");const d=await a.json();ge(d)}catch(a){console.warn("Error fetching live offers:",a),B&&(B.style.display="none"),k&&(k.style.display="block")}}}function ye(t,n){if(!N||(N.replaceChildren(),N.hidden=t<=1,t<=1))return;const a=e=>{v=e,w(),E?.scrollIntoView({behavior:"smooth",block:"start"})},d=document.createElement("button");d.type="button",d.className="btn-page",d.textContent="← Anterior",d.disabled=v===1,d.addEventListener("click",()=>a(v-1));const c=document.createElement("span");c.className="pager-info",c.textContent=`Página ${v} de ${t} · ${n} productos`;const s=document.createElement("button");s.type="button",s.className="btn-page",s.textContent="Siguiente →",s.disabled=v===t,s.addEventListener("click",()=>a(v+1)),N.append(d,c,s)}function w(){if(!E)return;const t=Array.from(E.querySelectorAll(".cat-product-card"));if(t.length===0)return;const n=Array.from(document.querySelectorAll(".filter-store-check:checked")).map(l=>l.value),a=Array.from(document.querySelectorAll(".filter-brand-check:checked")).map(l=>l.value),d=document.querySelector(".filter-price-radio:checked"),c=d?d.value:"all",s=document.getElementById("check-only-discounts"),e=s?s.checked:!1;let i=0;t.forEach(l=>{const p=l.dataset.store||"",u=l.dataset.brand||"",m=Number(l.dataset.price||0),j=Number(l.dataset.discount||0);let g=!0;n.length>0&&!n.includes(p)&&(g=!1),g&&a.length>0&&!a.includes(u)&&(g=!1),g&&c!=="all"&&(c==="under-500k"&&m>5e5||c==="500k-1500k"&&(m<5e5||m>15e5)||c==="1500k-3000k"&&(m<15e5||m>3e6)||c==="over-3000k"&&m<3e6)&&(g=!1),g&&e&&j<=0&&(g=!1),g?(l.style.display="flex",i++):l.style.display="none"});const f=G?G.value:"price-asc";t.sort((l,p)=>{const u=Number(l.dataset.price||0),m=Number(p.dataset.price||0),j=Number(l.dataset.discount||0),g=Number(p.dataset.discount||0),ae=(l.dataset.name||"").toLowerCase(),se=(p.dataset.name||"").toLowerCase();return f==="price-asc"?u-m:f==="price-desc"?m-u:f==="discount-desc"?g-j:f==="name-asc"?ae.localeCompare(se):0}),t.forEach(l=>E.appendChild(l));const y=t.filter(l=>l.style.display!=="none"),L=Math.max(1,Math.ceil(y.length/F)),o=[n.join("|"),a.join("|"),c,String(e),f].join("#");o!==W&&(v=1,W=o),v=Math.min(v,L),y.forEach((l,p)=>{const u=p>=(v-1)*F&&p<v*F;l.style.display=u?"flex":"none"}),ye(L,y.length),P&&(P.textContent=String(i)),k&&(k.style.display=i===0?"block":"none"),be(n,a,c,e)}function be(t,n,a,d){if(!I)return;I.innerHTML="";const c=t.length>0||n.length>0||a!=="all"||d;if(t.forEach(s=>{const e=document.createElement("span");e.className="active-filter-chip",e.innerHTML=`<span>Tienda: ${r(s)}</span><button type="button" data-type="store" data-val="${r(s)}">✕</button>`,I.appendChild(e)}),n.forEach(s=>{const e=document.createElement("span");e.className="active-filter-chip",e.innerHTML=`<span>Marca: ${r(s)}</span><button type="button" data-type="brand" data-val="${r(s)}">✕</button>`,I.appendChild(e)}),a!=="all"){const s={"under-500k":"< $500K","500k-1500k":"$500K - $1.5M","1500k-3000k":"$1.5M - $3M","over-3000k":"> $3M"},e=document.createElement("span");e.className="active-filter-chip",e.innerHTML=`<span>Precio: ${s[a]||a}</span><button type="button" data-type="price">✕</button>`,I.appendChild(e)}if(d){const s=document.createElement("span");s.className="active-filter-chip",s.innerHTML='<span>Solo ofertas</span><button type="button" data-type="discount">✕</button>',I.appendChild(s)}if(c){const s=document.createElement("button");s.type="button",s.className="btn-reset-chips",s.textContent="Restablecer",s.addEventListener("click",V),I.appendChild(s)}}function V(){document.querySelectorAll(".filter-store-check").forEach(a=>a.checked=!1),document.querySelectorAll(".filter-brand-check").forEach(a=>a.checked=!1);const t=document.querySelector('.filter-price-radio[value="all"]');t&&(t.checked=!0);const n=document.getElementById("check-only-discounts");n&&(n.checked=!1),w()}x?.addEventListener("change",w);G?.addEventListener("change",w);pe?.addEventListener("click",V);fe?.addEventListener("click",()=>{V(),ne===0&&S&&q(S,C)});O?.addEventListener("change",()=>{C=O.value,localStorage.setItem("mercadolista_city",C),q(S,C)});me?.addEventListener("click",()=>{q(S,C)});I?.addEventListener("click",t=>{const n=t.target.closest("button");if(!n||n.classList.contains("btn-reset-chips"))return;const a=n.dataset.type,d=n.dataset.val;if(a==="store"&&d){const c=document.querySelector(`.filter-store-check[value="${d}"]`);c&&(c.checked=!1)}else if(a==="brand"&&d){const c=document.querySelector(`.filter-brand-check[value="${d}"]`);c&&(c.checked=!1)}else if(a==="price"){const c=document.querySelector('.filter-price-radio[value="all"]');c&&(c.checked=!0)}else if(a==="discount"){const c=document.getElementById("check-only-discounts");c&&(c.checked=!1)}w()});if(ne===0&&S){const t=localStorage.getItem("mercadolista_city");t&&O&&(O.value=t,C=t),q(S,C)}else w();
