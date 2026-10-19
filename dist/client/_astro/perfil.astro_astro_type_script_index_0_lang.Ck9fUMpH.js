import{i as b,l as h,a as f,s as v,b as w,d as S}from"./shareModal.DyLvo2lE.js";const l=document.querySelector("#auth-gate"),c=document.querySelector("#user-profile"),$=document.querySelector("#user-display-name"),C=document.querySelector("#user-email"),L=document.querySelector("#profile-login-btn"),q=document.querySelector("#profile-logout-btn"),d=document.querySelector("#lists-section"),i=document.querySelector("#lists-grid"),o=document.querySelector("#lists-status"),x=b();let n=null,s=null;function E(t){if(i.replaceChildren(),t.length===0){i.innerHTML=`
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
          `,a.querySelector(".compare-btn").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(e.items)),e.ciudad&&localStorage.setItem("comparador-ciudad",e.ciudad),window.location.href=`/?tab=list&listaId=${e.id}`}),a.querySelector(".share-btn").addEventListener("click",()=>{x({listId:e.id,listName:e.nombre})}),a.querySelector(".delete-btn").addEventListener("click",async()=>{const r=e.isOwner?"eliminar":"desvincularte de";if(!(!n||!window.confirm(`¿Deseas ${r} la lista «${e.nombre}»?`)))try{await S(n,e.id,e.isOwner),u(n,s)}catch(y){alert(y.message||"Error al eliminar la lista")}}),i.append(a)})}async function u(t,e){o.textContent="Cargando tus listas…";try{const a=await w(t,e);o.textContent="",E(a)}catch{o.textContent="No se pudieron cargar las listas."}}L.addEventListener("click",async()=>{try{await h()}catch(t){alert(t.message||"Error al iniciar sesión")}});q.addEventListener("click",async()=>{await f(),window.location.href="/"});v(t=>{t?(n=t.uid,s=t.email||null,l.hidden=!0,c.hidden=!1,d.hidden=!1,$.textContent=t.displayName||"Usuario",C.textContent=t.email||"",u(t.uid,s)):(n=null,s=null,l.hidden=!1,c.hidden=!0,d.hidden=!0)});
