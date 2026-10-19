import{i as W,a as H,l as R,s as F,b as J,t as U,f as K,d as Q,e as V}from"./shareModal.DmmelDz9.js";const M=document.querySelector("#auth-gate"),I=document.querySelector("#user-profile"),X=document.querySelector("#user-display-name"),Y=document.querySelector("#user-email"),Z=document.querySelector("#profile-login-btn"),_=document.querySelector("#profile-logout-btn"),N=document.querySelector("#profile-tabs-nav"),z=document.querySelector("#tab-btn-lists"),D=document.querySelector("#tab-btn-shopping"),k=document.querySelector("#lists-section"),C=document.querySelector("#lists-grid"),S=document.querySelector("#lists-status"),P=document.querySelector("#shopping-section"),m=document.querySelector("#shopping-list-select"),ee=document.querySelector("#shopping-compare-btn"),y=document.querySelector("#shopping-reset-btn"),A=document.querySelector("#shopping-progress-text"),T=document.querySelector("#shopping-progress-fill"),x=document.querySelector("#shopping-items-container"),te=W();let l=null,f=null,d=[],r=null,g=null,u=null;function $(t){const e=t==="lists";z.classList.toggle("is-active",e),D.classList.toggle("is-active",!e),k.hidden=!e,P.hidden=e,!e&&d.length>0&&!r&&w(d[0].id)}z.addEventListener("click",()=>$("lists"));D.addEventListener("click",()=>$("shopping"));function O(t){if(C.replaceChildren(),t.length===0){C.innerHTML=`
            <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
              <p style="margin: 0 0 1rem; color: var(--muted);">Aún no tienes listas guardadas.</p>
              <a href="/?tab=list" class="btn-primary" style="display: inline-flex;">Crear mi primera lista</a>
            </div>
          `;return}t.forEach(e=>{const a=document.createElement("article");a.className="saved-list-card";const c=[];e.collaborators&&e.collaborators.length>0&&e.collaborators.forEach(o=>{o.uid!==l&&(o.name||o.email)&&c.push(o.name||(o.email?o.email.split("@")[0]:"Colaborador"))}),e.sharedWithEmails&&e.sharedWithEmails.length>0&&e.sharedWithEmails.forEach(o=>{const s=o.split("@")[0];o!==f&&!c.includes(s)&&c.push(s)});const n=[...new Set(c)];let p="";if(e.isOwner)n.length>0?p=`<span class="collab-badge">👥 Compartida con: <strong>${n.join(", ")}</strong></span>`:p='<span style="display: inline-block; font-size: 0.72rem; color: var(--muted); margin-bottom: 0.35rem;">🔒 Solo tú</span>';else{const o=e.ownerName||(e.ownerEmail?e.ownerEmail.split("@")[0]:"tu pareja"),s=n.filter(h=>h!==o);p=`<span class="collab-badge">👥 Compartida por <strong>${o}</strong>${s.length>0?` (y ${s.join(", ")})`:""}</span>`}const i=e.items.slice(0,4).map(o=>{const h=l&&o.addedById===l?' <span style="color: #0e6a45; font-size: 0.75rem;">(por ti)</span>':o.addedBy?` <span style="color: #0e6a45; font-size: 0.75rem;">(por ${o.addedBy})</span>`:"";return`${o.nombre} (${o.cantidad} ${o.formato})${h}`}).join(", "),v=e.items.length>4?` y ${e.items.length-4} más…`:"",b=e.items.filter(o=>o.comprado).length,L=b>0?`<span style="display: inline-block; font-size: 0.72rem; color: #0e6a45; background: #e7f6ee; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 0.35rem; font-weight: 600;">✓ ${b}/${e.items.length} en carrito</span>`:"";a.innerHTML=`
            <div>
              ${p}
              <div class="saved-list-header">
                <h3 class="saved-list-title">${e.nombre}</h3>
                <span class="saved-list-city">${e.ciudad||"Bogotá"}</span>
              </div>
              <p class="saved-list-items-preview">
                <strong>${e.items.length} producto${e.items.length===1?"":"s"}:</strong>${L}<br />
                ${i}${v}
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
          `,a.querySelector(".shop-mode-btn").addEventListener("click",()=>{w(e.id),$("shopping")}),a.querySelector(".compare-btn").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(e.items)),e.ciudad&&localStorage.setItem("comparador-ciudad",e.ciudad),window.location.href=`/?tab=list&listaId=${e.id}`}),a.querySelector(".share-btn").addEventListener("click",()=>{te({listId:e.id,listName:e.nombre})}),a.querySelector(".delete-btn").addEventListener("click",async()=>{const o=e.isOwner?"eliminar":"desvincularte de";if(!(!l||!window.confirm(`¿Deseas ${o} la lista «${e.nombre}»?`)))try{await V(l,e.id,e.isOwner),G(l,f)}catch(s){alert(s.message||"Error al eliminar la lista")}}),C.append(a)})}function j(){if(m.replaceChildren(),d.length===0){const t=document.createElement("option");t.value="",t.textContent="No tienes listas creadas",m.append(t);return}d.forEach(t=>{const e=document.createElement("option");e.value=t.id,e.textContent=`${t.nombre} (${t.items.length} productos)`,m.append(e)}),r&&(m.value=r.id)}function w(t){const e=d.find(a=>a.id===t);e&&(r=e,m.value=t,q(e),g&&g(),g=J(t,a=>{if(!a)return;const c=d.findIndex(n=>n.id===t);c!==-1&&(d[c]=a),r=a,q(a)}))}function q(t){x.replaceChildren();const e=t.items.length,a=t.items.filter(n=>n.comprado).length,c=e>0?Math.round(a/e*100):0;if(A.textContent=`${a} de ${e} en el carrito (${c}%)`,T.style.width=`${c}%`,e===0){x.innerHTML=`
            <div style="text-align: center; color: var(--muted); padding: 2rem;">
              <p>Esta lista no tiene productos agregados todavía.</p>
              <a href="/?tab=list&listaId=${t.id}" class="btn-primary" style="display: inline-flex;">Editar productos</a>
            </div>
          `;return}t.items.forEach((n,p)=>{const i=document.createElement("div");i.className=`shopping-item-row ${n.comprado?"is-bought":""}`,i.setAttribute("role","checkbox"),i.setAttribute("aria-checked",n.comprado?"true":"false"),i.setAttribute("tabindex","0");const b=l&&n.addedById===l?"Tú":n.addedBy||"",L=b?`<span class="shopping-item-author">👤 ${b}</span>`:"";i.innerHTML=`
            <div class="shopping-item-check"></div>
            <div class="shopping-item-info">
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.35rem;">
                <h4 class="shopping-item-name" style="margin: 0;">${n.nombre}</h4>
                ${L}
              </div>
              <p class="shopping-item-meta" style="margin-top: 0.2rem;">
                <strong>${n.cantidad} ${n.formato}</strong>
                ${n.marca&&n.marca.toUpperCase()!=="TODAS"?`· Marca: ${n.marca}`:""}
              </p>
            </div>
          `;async function o(){const s=!n.comprado;n.comprado=s,i.classList.toggle("is-bought",s),i.setAttribute("aria-checked",s?"true":"false");const h=t.items.filter(E=>E.comprado).length,B=e>0?Math.round(h/e*100):0;A.textContent=`${h} de ${e} en el carrito (${B}%)`,T.style.width=`${B}%`;try{await U(t.id,p,s)}catch(E){console.error("Error al actualizar item:",E)}}i.addEventListener("click",o),i.addEventListener("keydown",s=>{(s.key===" "||s.key==="Enter")&&(s.preventDefault(),o())}),x.append(i)})}m.addEventListener("change",()=>{w(m.value)});ee.addEventListener("click",()=>{r&&(localStorage.setItem("comparador-lista",JSON.stringify(r.items)),r.ciudad&&localStorage.setItem("comparador-ciudad",r.ciudad),window.location.href=`/?tab=list&listaId=${r.id}`)});y.addEventListener("click",async()=>{if(!(!r||!window.confirm(`🔒 ¿Seguro que deseas desmarcar todos los productos de «${r.nombre}» para empezar una nueva compra?`))){y.disabled=!0,y.textContent="Desmarcando…";try{for(let e=0;e<r.items.length;e++)r.items[e].comprado&&(r.items[e].comprado=!1,await U(r.id,e,!1));q(r)}finally{y.disabled=!1,y.textContent="🔒 Desmarcar todo"}}});async function G(t,e){S.textContent="Cargando tus listas…";try{const a=await Q(t,e);d=a,S.textContent="",O(a),j();const c=new URLSearchParams(window.location.search),n=c.get("listaId");if((c.get("modo")==="compra"||!!n)&&a.length>0){const i=n&&a.some(v=>v.id===n)?n:a[0].id;w(i),$("shopping")}}catch{S.textContent="No se pudieron cargar las listas."}}Z.addEventListener("click",async()=>{try{await H()}catch(t){console.error("Error al iniciar sesión con Google:",t);let e=t.message||"Error al iniciar sesión";t.code==="auth/unauthorized-domain"?e=`El dominio «${window.location.hostname}» no está autorizado en Firebase. Agrégalo en Firebase Console > Authentication > Settings > Authorized domains.`:t.code==="auth/popup-blocked"?e="Tu navegador bloqueó la ventana emergente de Google. Por favor habilita los popups para este sitio.":t.code==="auth/popup-closed-by-user"&&(e="Se cerró la ventana emergente antes de completar el inicio de sesión."),alert(e)}});_.addEventListener("click",async()=>{g&&g(),u&&u(),await R(),window.location.href="/"});F(t=>{t?(l=t.uid,f=t.email||null,M.hidden=!0,I.hidden=!1,N.hidden=!1,k.hidden=!1,X.textContent=t.displayName||"Usuario",Y.textContent=t.email||"",u&&u(),u=K(t.uid,f,e=>{d=e,S.textContent="",O(e),j()}),G(t.uid,f)):(l=null,f=null,g&&g(),u&&u(),M.hidden=!1,I.hidden=!0,N.hidden=!0,k.hidden=!0,P.hidden=!0)});
