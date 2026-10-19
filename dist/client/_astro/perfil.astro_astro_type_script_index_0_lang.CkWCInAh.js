import{i as h,a as y,l as f,s as v,b as w,d as S}from"./shareModal.Cn1s2voi.js";const l=document.querySelector("#auth-gate"),c=document.querySelector("#user-profile"),$=document.querySelector("#user-display-name"),C=document.querySelector("#user-email"),q=document.querySelector("#profile-login-btn"),E=document.querySelector("#profile-logout-btn"),d=document.querySelector("#lists-section"),s=document.querySelector("#lists-grid"),i=document.querySelector("#lists-status"),L=h();let n=null,o=null;function x(t){if(s.replaceChildren(),t.length===0){s.innerHTML=`
            <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
              <p style="margin: 0 0 1rem; color: var(--muted);">Aún no tienes listas guardadas.</p>
              <a href="/?tab=list" class="btn-primary" style="display: inline-flex;">Crear mi primera lista</a>
            </div>
          `;return}t.forEach(e=>{const a=document.createElement("article");a.className="saved-list-card";const m=e.items.slice(0,4).map(r=>`${r.nombre} (${r.cantidad} ${r.formato})`).join(", "),p=e.items.length>4?` y ${e.items.length-4} más…`:"",g=e.isOwner?"":`<span style="display: inline-block; font-size: 0.72rem; color: #0e6a45; background: #e7f6ee; padding: 0.15rem 0.45rem; border-radius: 4px; margin-bottom: 0.35rem; font-weight: 500;">👥 Compartida por ${e.ownerName||"tu pareja"}</span>`;a.innerHTML=`
            <div>
              ${g}
              <div class="saved-list-header">
                <h3 class="saved-list-title">${e.nombre}</h3>
                <span class="saved-list-city">${e.ciudad||"Bogotá"}</span>
              </div>
              <p class="saved-list-items-preview">
                <strong>${e.items.length} producto${e.items.length===1?"":"s"}:</strong><br />
                ${m}${p}
              </p>
            </div>
            <div class="saved-list-actions" style="flex-wrap: wrap; gap: 0.4rem;">
              <button type="button" class="btn-primary compare-btn">
                Comparar precios
              </button>
              <button type="button" class="btn-primary share-btn" style="background: #128c7e;" title="Compartir lista con tu pareja por WhatsApp o Correo">
                📲 Compartir
              </button>
              <button type="button" class="btn-danger-ghost delete-btn">
                ${e.isOwner?"Borrar":"Desvincularme"}
              </button>
            </div>
          `,a.querySelector(".compare-btn").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(e.items)),e.ciudad&&localStorage.setItem("comparador-ciudad",e.ciudad),window.location.href=`/?tab=list&listaId=${e.id}`}),a.querySelector(".share-btn").addEventListener("click",()=>{L({listId:e.id,listName:e.nombre})}),a.querySelector(".delete-btn").addEventListener("click",async()=>{const r=e.isOwner?"eliminar":"desvincularte de";if(!(!n||!window.confirm(`¿Deseas ${r} la lista «${e.nombre}»?`)))try{await S(n,e.id,e.isOwner),u(n,o)}catch(b){alert(b.message||"Error al eliminar la lista")}}),s.append(a)})}async function u(t,e){i.textContent="Cargando tus listas…";try{const a=await w(t,e);i.textContent="",x(a)}catch{i.textContent="No se pudieron cargar las listas."}}q.addEventListener("click",async()=>{try{await y()}catch(t){console.error("Error al iniciar sesión con Google:",t);let e=t.message||"Error al iniciar sesión";t.code==="auth/unauthorized-domain"?e=`El dominio «${window.location.hostname}» no está autorizado en Firebase. Agrégalo en Firebase Console > Authentication > Settings > Authorized domains.`:t.code==="auth/popup-blocked"?e="Tu navegador bloqueó la ventana emergente de Google. Por favor habilita los popups para este sitio.":t.code==="auth/popup-closed-by-user"&&(e="Se cerró la ventana emergente antes de completar el inicio de sesión."),alert(e)}});E.addEventListener("click",async()=>{await f(),window.location.href="/"});v(t=>{t?(n=t.uid,o=t.email||null,l.hidden=!0,c.hidden=!1,d.hidden=!1,$.textContent=t.displayName||"Usuario",C.textContent=t.email||"",u(t.uid,o)):(n=null,o=null,l.hidden=!1,c.hidden=!0,d.hidden=!0)});
