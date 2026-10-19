import{i as P,a as U,l as z,s as O,b as G,t as I,d as H,e as R}from"./shareModal.BdgUYYCS.js";const k=document.querySelector("#auth-gate"),x=document.querySelector("#user-profile"),j=document.querySelector("#user-display-name"),F=document.querySelector("#user-email"),J=document.querySelector("#profile-login-btn"),W=document.querySelector("#profile-logout-btn"),q=document.querySelector("#profile-tabs-nav"),M=document.querySelector("#tab-btn-lists"),N=document.querySelector("#tab-btn-shopping"),L=document.querySelector("#lists-section"),S=document.querySelector("#lists-grid"),w=document.querySelector("#lists-status"),T=document.querySelector("#shopping-section"),d=document.querySelector("#shopping-list-select"),K=document.querySelector("#shopping-compare-btn"),u=document.querySelector("#shopping-reset-btn"),B=document.querySelector("#shopping-progress-text"),A=document.querySelector("#shopping-progress-fill"),$=document.querySelector("#shopping-items-container"),Q=P();let m=null,f=null,c=[],r=null,l=null;function b(t){const e=t==="lists";M.classList.toggle("is-active",e),N.classList.toggle("is-active",!e),L.hidden=!e,T.hidden=e,!e&&c.length>0&&!r&&y(c[0].id)}M.addEventListener("click",()=>b("lists"));N.addEventListener("click",()=>b("shopping"));function V(t){if(S.replaceChildren(),t.length===0){S.innerHTML=`
            <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
              <p style="margin: 0 0 1rem; color: var(--muted);">Aún no tienes listas guardadas.</p>
              <a href="/?tab=list" class="btn-primary" style="display: inline-flex;">Crear mi primera lista</a>
            </div>
          `;return}t.forEach(e=>{const n=document.createElement("article");n.className="saved-list-card";const s=e.items.slice(0,4).map(a=>`${a.nombre} (${a.cantidad} ${a.formato})`).join(", "),o=e.items.length>4?` y ${e.items.length-4} más…`:"",g=e.isOwner?"":`<span style="display: inline-block; font-size: 0.72rem; color: #0e6a45; background: #e7f6ee; padding: 0.15rem 0.45rem; border-radius: 4px; margin-bottom: 0.35rem; font-weight: 500;">👥 Compartida por ${e.ownerName||"tu pareja"}</span>`,i=e.items.filter(a=>a.comprado).length,p=i>0?`<span style="display: inline-block; font-size: 0.72rem; color: #0e6a45; background: #e7f6ee; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.35rem; font-weight: 600;">✓ ${i}/${e.items.length} en carrito</span>`:"";n.innerHTML=`
            <div>
              ${g}
              <div class="saved-list-header">
                <h3 class="saved-list-title">${e.nombre}</h3>
                <span class="saved-list-city">${e.ciudad||"Bogotá"}</span>
              </div>
              <p class="saved-list-items-preview">
                <strong>${e.items.length} producto${e.items.length===1?"":"s"}:</strong>${p}<br />
                ${s}${o}
              </p>
            </div>
            <div class="saved-list-actions" style="flex-wrap: wrap; gap: 0.4rem;">
              <button type="button" class="btn-primary shop-mode-btn" style="background: #0e6a45; font-weight: 600;" title="Abrir checklist de compra para ir tachando en el súper">
                🛒 Modo Compra
              </button>
              <button type="button" class="btn-primary compare-btn" style="background: #4a5568;" title="Comparar precios en tiendas">
                Comparar precios
              </button>
              <button type="button" class="btn-primary share-btn" style="background: #128c7e;" title="Compartir lista con tu pareja por WhatsApp o Correo">
                📲 Compartir
              </button>
              <button type="button" class="btn-danger-ghost delete-btn">
                ${e.isOwner?"Borrar":"Desvincularme"}
              </button>
            </div>
          `,n.querySelector(".shop-mode-btn").addEventListener("click",()=>{y(e.id),b("shopping")}),n.querySelector(".compare-btn").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(e.items)),e.ciudad&&localStorage.setItem("comparador-ciudad",e.ciudad),window.location.href=`/?tab=list&listaId=${e.id}`}),n.querySelector(".share-btn").addEventListener("click",()=>{Q({listId:e.id,listName:e.nombre})}),n.querySelector(".delete-btn").addEventListener("click",async()=>{const a=e.isOwner?"eliminar":"desvincularte de";if(!(!m||!window.confirm(`¿Deseas ${a} la lista «${e.nombre}»?`)))try{await R(m,e.id,e.isOwner),D(m,f)}catch(h){alert(h.message||"Error al eliminar la lista")}}),S.append(n)})}function X(){if(d.replaceChildren(),c.length===0){const t=document.createElement("option");t.value="",t.textContent="No tienes listas creadas",d.append(t);return}c.forEach(t=>{const e=document.createElement("option");e.value=t.id,e.textContent=`${t.nombre} (${t.items.length} productos)`,d.append(e)}),r&&(d.value=r.id)}function y(t){const e=c.find(n=>n.id===t);e&&(r=e,d.value=t,C(e),l&&l(),l=G(t,n=>{if(!n)return;const s=c.findIndex(o=>o.id===t);s!==-1&&(c[s]=n),r=n,C(n)}))}function C(t){$.replaceChildren();const e=t.items.length,n=t.items.filter(o=>o.comprado).length,s=e>0?Math.round(n/e*100):0;if(B.textContent=`${n} de ${e} en el carrito (${s}%)`,A.style.width=`${s}%`,e===0){$.innerHTML=`
            <div style="text-align: center; color: var(--muted); padding: 2rem;">
              <p>Esta lista no tiene productos agregados todavía.</p>
              <a href="/?tab=list&listaId=${t.id}" class="btn-primary" style="display: inline-flex;">Editar productos</a>
            </div>
          `;return}t.items.forEach((o,g)=>{const i=document.createElement("div");i.className=`shopping-item-row ${o.comprado?"is-bought":""}`,i.setAttribute("role","checkbox"),i.setAttribute("aria-checked",o.comprado?"true":"false"),i.setAttribute("tabindex","0"),i.innerHTML=`
            <div class="shopping-item-check"></div>
            <div class="shopping-item-info">
              <h4 class="shopping-item-name">${o.nombre}</h4>
              <p class="shopping-item-meta">
                <strong>${o.cantidad} ${o.formato}</strong>
                ${o.marca&&o.marca.toUpperCase()!=="TODAS"?`· Marca: ${o.marca}`:""}
              </p>
            </div>
          `;async function p(){const a=!o.comprado;o.comprado=a,i.classList.toggle("is-bought",a),i.setAttribute("aria-checked",a?"true":"false");const h=t.items.filter(v=>v.comprado).length,E=e>0?Math.round(h/e*100):0;B.textContent=`${h} de ${e} en el carrito (${E}%)`,A.style.width=`${E}%`;try{await I(t.id,g,a)}catch(v){console.error("Error al actualizar item:",v)}}i.addEventListener("click",p),i.addEventListener("keydown",a=>{(a.key===" "||a.key==="Enter")&&(a.preventDefault(),p())}),$.append(i)})}d.addEventListener("change",()=>{y(d.value)});K.addEventListener("click",()=>{r&&(localStorage.setItem("comparador-lista",JSON.stringify(r.items)),r.ciudad&&localStorage.setItem("comparador-ciudad",r.ciudad),window.location.href=`/?tab=list&listaId=${r.id}`)});u.addEventListener("click",async()=>{if(!(!r||!window.confirm(`🔒 ¿Seguro que deseas desmarcar todos los productos de «${r.nombre}» para empezar una nueva compra?`))){u.disabled=!0,u.textContent="Desmarcando…";try{for(let e=0;e<r.items.length;e++)r.items[e].comprado&&(r.items[e].comprado=!1,await I(r.id,e,!1));C(r)}finally{u.disabled=!1,u.textContent="🔒 Desmarcar todo"}}});async function D(t,e){w.textContent="Cargando tus listas…";try{const n=await H(t,e);c=n,w.textContent="",V(n),X();const s=new URLSearchParams(window.location.search),o=s.get("listaId");if((s.get("modo")==="compra"||!!o)&&n.length>0){const i=o&&n.some(p=>p.id===o)?o:n[0].id;y(i),b("shopping")}}catch{w.textContent="No se pudieron cargar las listas."}}J.addEventListener("click",async()=>{try{await U()}catch(t){console.error("Error al iniciar sesión con Google:",t);let e=t.message||"Error al iniciar sesión";t.code==="auth/unauthorized-domain"?e=`El dominio «${window.location.hostname}» no está autorizado en Firebase. Agrégalo en Firebase Console > Authentication > Settings > Authorized domains.`:t.code==="auth/popup-blocked"?e="Tu navegador bloqueó la ventana emergente de Google. Por favor habilita los popups para este sitio.":t.code==="auth/popup-closed-by-user"&&(e="Se cerró la ventana emergente antes de completar el inicio de sesión."),alert(e)}});W.addEventListener("click",async()=>{l&&l(),await z(),window.location.href="/"});O(t=>{t?(m=t.uid,f=t.email||null,k.hidden=!0,x.hidden=!1,q.hidden=!1,L.hidden=!1,j.textContent=t.displayName||"Usuario",F.textContent=t.email||"",D(t.uid,f)):(m=null,f=null,l&&l(),k.hidden=!1,x.hidden=!0,q.hidden=!0,L.hidden=!0,T.hidden=!0)});
