import{l as p,a as g,s as y,g as h,d as f}from"./firebaseAuth.BFiCzRHz.js";const o=document.querySelector("#auth-gate"),l=document.querySelector("#user-profile"),b=document.querySelector("#user-display-name"),v=document.querySelector("#user-email"),S=document.querySelector("#profile-login-btn"),L=document.querySelector("#profile-logout-btn"),c=document.querySelector("#lists-section"),n=document.querySelector("#lists-grid"),i=document.querySelector("#lists-status");let r=null;function q(t){if(n.replaceChildren(),t.length===0){n.innerHTML=`
            <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
              <p style="margin: 0 0 1rem; color: var(--muted);">Aún no tienes listas guardadas.</p>
              <a href="/?tab=list" class="btn-primary" style="display: inline-flex;">Crear mi primera lista</a>
            </div>
          `;return}t.forEach(e=>{const a=document.createElement("article");a.className="saved-list-card";const u=e.items.slice(0,4).map(s=>`${s.nombre} (${s.cantidad} ${s.formato})`).join(", "),m=e.items.length>4?` y ${e.items.length-4} más…`:"";a.innerHTML=`
            <div>
              <div class="saved-list-header">
                <h3 class="saved-list-title">${e.nombre}</h3>
                <span class="saved-list-city">${e.ciudad||"Bogotá"}</span>
              </div>
              <p class="saved-list-items-preview">
                <strong>${e.items.length} producto${e.items.length===1?"":"s"}:</strong><br />
                ${u}${m}
              </p>
            </div>
            <div class="saved-list-actions">
              <button type="button" class="btn-primary compare-btn">
                Comparar precios
              </button>
              <button type="button" class="btn-danger-ghost delete-btn">
                Borrar
              </button>
            </div>
          `,a.querySelector(".compare-btn").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(e.items)),e.ciudad&&localStorage.setItem("comparador-ciudad",e.ciudad),window.location.href="/?tab=list"}),a.querySelector(".delete-btn").addEventListener("click",async()=>{if(!(!r||!window.confirm(`¿Deseas eliminar la lista «${e.nombre}»?`)))try{await f(r,e.id),d(r)}catch(s){alert(s.message||"Error al eliminar la lista")}}),n.append(a)})}async function d(t){i.textContent="Cargando tus listas…";try{const e=await h(t);i.textContent="",q(e)}catch{i.textContent="No se pudieron cargar las listas."}}S.addEventListener("click",async()=>{try{await p()}catch(t){alert(t.message||"Error al iniciar sesión")}});L.addEventListener("click",async()=>{await g(),window.location.href="/"});y(t=>{t?(r=t.uid,o.hidden=!0,l.hidden=!1,c.hidden=!1,b.textContent=t.displayName||"Usuario",v.textContent=t.email||"",d(t.uid)):(r=null,o.hidden=!1,l.hidden=!0,c.hidden=!0)});
