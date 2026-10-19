import{l as w,a as f,s as v,b as $,e as S,d as C}from"./firebaseAuth.D_uCW_AH.js";const d=document.querySelector("#auth-gate"),p=document.querySelector("#user-profile"),L=document.querySelector("#user-display-name"),E=document.querySelector("#user-email"),q=document.querySelector("#profile-login-btn"),x=document.querySelector("#profile-logout-btn"),m=document.querySelector("#lists-section"),i=document.querySelector("#lists-grid"),l=document.querySelector("#lists-status");let o=null,s=null;function k(t){if(i.replaceChildren(),t.length===0){i.innerHTML=`
            <div class="panel" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
              <p style="margin: 0 0 1rem; color: var(--muted);">Aún no tienes listas guardadas.</p>
              <a href="/?tab=list" class="btn-primary" style="display: inline-flex;">Crear mi primera lista</a>
            </div>
          `;return}t.forEach(e=>{const r=document.createElement("article");r.className="saved-list-card";const g=e.items.slice(0,4).map(a=>`${a.nombre} (${a.cantidad} ${a.formato})`).join(", "),y=e.items.length>4?` y ${e.items.length-4} más…`:"",h=e.isOwner?"":`<span style="display: inline-block; font-size: 0.72rem; color: #0e6a45; background: #e7f6ee; padding: 0.15rem 0.45rem; border-radius: 4px; margin-bottom: 0.35rem; font-weight: 500;">👥 Compartida por ${e.ownerName||"tu pareja"}</span>`;r.innerHTML=`
            <div>
              ${h}
              <div class="saved-list-header">
                <h3 class="saved-list-title">${e.nombre}</h3>
                <span class="saved-list-city">${e.ciudad||"Bogotá"}</span>
              </div>
              <p class="saved-list-items-preview">
                <strong>${e.items.length} producto${e.items.length===1?"":"s"}:</strong><br />
                ${g}${y}
              </p>
            </div>
            <div class="saved-list-actions" style="flex-wrap: wrap; gap: 0.4rem;">
              <button type="button" class="btn-primary compare-btn">
                Comparar precios
              </button>
              <button type="button" class="btn-primary whatsapp-btn" style="background: #128c7e;" title="Compartir a WhatsApp de tu pareja">
                📲 WhatsApp
              </button>
              <button type="button" class="btn-primary email-btn" style="background: #4a5568;" title="Compartir por correo de Google">
                ✉️ Correo
              </button>
              <button type="button" class="btn-danger-ghost delete-btn">
                ${e.isOwner?"Borrar":"Desvincularme"}
              </button>
            </div>
          `,r.querySelector(".compare-btn").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(e.items)),e.ciudad&&localStorage.setItem("comparador-ciudad",e.ciudad),window.location.href=`/?tab=list&listaId=${e.id}`}),r.querySelector(".whatsapp-btn").addEventListener("click",()=>{const a=`${window.location.origin}/?listaId=${e.id}`,n=window.prompt("Ingresa el número de WhatsApp con código de país (ej. 573001234567) o déjalo vacío para elegir el chat en WhatsApp:","");if(n===null)return;const c=`🛒 ¡Hola! Te comparto nuestra lista de compras «${e.nombre}» para comparar precios y editarla juntos:
${a}`,b=n.trim()?`https://api.whatsapp.com/send?phone=${encodeURIComponent(n.replace(/[^0-9]/g,""))}&text=${encodeURIComponent(c)}`:`https://api.whatsapp.com/send?text=${encodeURIComponent(c)}`;window.open(b,"_blank")}),r.querySelector(".email-btn").addEventListener("click",async()=>{const a=window.prompt(`Ingresa el correo de Google de tu pareja para compartirle «${e.nombre}»:`,"");if(!(!a||!a.includes("@")))try{await S(e.id,a),alert(`¡Listo! Se compartió la lista con ${a}. Podrá verla y editarla en su perfil.`)}catch(n){alert(n.message||"Error al compartir la lista.")}}),r.querySelector(".delete-btn").addEventListener("click",async()=>{const a=e.isOwner?"eliminar":"desvincularte de";if(!(!o||!window.confirm(`¿Deseas ${a} la lista «${e.nombre}»?`)))try{await C(o,e.id,e.isOwner),u(o,s)}catch(n){alert(n.message||"Error al eliminar la lista")}}),i.append(r)})}async function u(t,e){l.textContent="Cargando tus listas…";try{const r=await $(t,e);l.textContent="",k(r)}catch{l.textContent="No se pudieron cargar las listas."}}q.addEventListener("click",async()=>{try{await w()}catch(t){alert(t.message||"Error al iniciar sesión")}});x.addEventListener("click",async()=>{await f(),window.location.href="/"});v(t=>{t?(o=t.uid,s=t.email||null,d.hidden=!0,p.hidden=!1,m.hidden=!1,L.textContent=t.displayName||"Usuario",E.textContent=t.email||"",u(t.uid,s)):(o=null,s=null,d.hidden=!1,p.hidden=!0,m.hidden=!0)});
