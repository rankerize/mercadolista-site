import{e as s,c as u}from"./normalize.CnG2smQi.js";import{s as M,a as C}from"./firebaseAuth.D_TpaKO7.js";const E=document.querySelector("#assistant-form"),k=document.querySelector("#assistant-input"),T=document.querySelector("#assistant-city"),L=document.querySelector("#assistant-people"),y=document.querySelector("#btn-submit-assistant"),v=document.querySelector("#assistant-status"),f=document.querySelector("#assistant-results"),j=document.querySelectorAll(".assistant-chip-btn");let p=null,h=null,x=null,H=null,N=null;M(e=>{e?(p=e.uid,h=e.email||null,x=e.displayName||(e.email?e.email.split("@")[0]:"Tú")):(p=null,h=null,x=null)});j.forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.prompt||"",r=e.dataset.people||"2";k.value=a,L.value=r,E.dispatchEvent(new Event("submit",{cancelable:!0}))})});E.addEventListener("submit",async e=>{e.preventDefault();const a=k.value.trim();if(!a)return;const r=parseInt(L.value,10)||2,n=T.value||"bogota";y.disabled=!0,y.innerHTML="<span>⏳ Consultando al asistente…</span>",v.innerHTML=`<p style="color: var(--pine); font-weight: 500;">🧑‍🍳 Analizando receta y calculando porciones para ${r} personas…</p>`,f.hidden=!0,f.replaceChildren();try{const l=await fetch("/api/asistente",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:a,personas:r,ciudad:n})});if(!l.ok){const o=await l.json().catch(()=>({}));throw new Error(o.detail||"No pudimos procesar tu solicitud")}const m=await l.json();H=m,v.innerHTML=`<p style="color: var(--pine); font-weight: 500;">🛒 Cotizando ${m.ingredientes.length} ingredientes en supermercados de ${T.selectedOptions[0]?.textContent||n}…</p>`;const g={ciudad:n,items:m.ingredientes.map(o=>({nombre:o.nombre,cantidad:o.cantidad,formato:o.formato,marca:"todas"}))},b=await fetch("/api/lista",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)});let i=null;b.ok&&(i=await b.json(),N=i),v.textContent="",P(m,i,n)}catch(l){console.error("Error al consultar asistente:",l),v.innerHTML=`<p style="color: #c53030;">⚠️ ${s(l.message||"Error al consultar el asistente")}</p>`}finally{y.disabled=!1,y.innerHTML="<span>✨ Armar lista y cotizar</span>"}});function P(e,a,r){f.replaceChildren(),f.hidden=!1;const n=document.createElement("article");n.className="recipe-card";const l=e.origen==="gemini"?'<span style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: #1e40af; background: #dbeafe; padding: 0.2rem 0.5rem; border-radius: 999px; font-weight: 600;">✨ Generado con IA Gemini</span>':'<span style="display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; color: #065f46; background: #d1fae5; padding: 0.2rem 0.5rem; border-radius: 999px; font-weight: 600;">📚 Catálogo Maestro Colombiano</span>',m=e.ingredientes.map((t,c)=>{const d=a?.items?a.items[c]:null;let S="";return d&&d.winner?S=`<span style="font-weight: 600; color: #0e6a45; font-size: 0.88rem;">${u(d.winner.total||d.winner.price)} <small style="font-weight: 400; color: var(--muted);">(${s(d.winner.store_name)})</small></span>`:S='<span style="font-size: 0.8rem; color: var(--muted);">Cotizando…</span>',`
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; border-bottom: 1px solid var(--line); font-size: 0.95rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-weight: 600; color: #0e6a45; min-width: 80px;">${Number(t.cantidad)} ${s(t.formato)}</span>
                <div>
                  <strong style="color: var(--ink);">${s(t.nombre)}</strong>
                  ${t.notas?`<span style="color: var(--muted); font-size: 0.82rem; margin-left: 0.4rem;">(${s(t.notas)})</span>`:""}
                </div>
              </div>
              <div>${S}</div>
            </div>
          `}).join("");let g="";if(a&&a.found>0){const t=a.best_single_store;let c="";if(t&&a.found===a.count){const d=t.total-a.total;c=d>.5?`<p style="font-size: 0.85rem; color: #475569; margin: 0.35rem 0 0;">💡 En una sola tienda: <strong>${s(t.store_name)}</strong> por ${u(t.total)} (${u(d)} más que comprando mixto).</p>`:`<p style="font-size: 0.85rem; color: #475569; margin: 0.35rem 0 0;">💡 En una sola tienda: <strong>${s(t.store_name)}</strong> por ${u(t.total)}.</p>`}g=`
            <div style="margin-top: 1.5rem; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 1.25rem;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;">
                <span style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #166534; letter-spacing: 0.04em;">Veredicto de Ahorro</span>
                <span style="font-size: 1.35rem; font-weight: 800; color: #0e6a45;">Total: ${u(a.total)}</span>
              </div>
              <p style="margin: 0.35rem 0 0; font-size: 0.95rem; color: #15803d;">
                Encontrados <strong>${a.found} de ${a.count}</strong> ingredientes al precio más bajo en supermercados de ${s(r)}.
              </p>
              ${c}
            </div>
          `}const b=e.consejo?`<div class="recipe-tip">💡 <strong>Consejo del chef:</strong> ${s(e.consejo)}</div>`:"";n.innerHTML=`
          <div class="recipe-header">
            <div>
              <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.45rem; flex-wrap: wrap;">
                <span class="badge-tipo-receta">🍳 Receta · ${e.porciones} personas</span>
                ${l}
              </div>
              <h2 class="recipe-title">${s(e.receta)}</h2>
              <p class="recipe-desc">${s(e.descripcion)}</p>
            </div>
          </div>

          ${b}

          <div style="margin-top: 1.25rem;">
            <h3 style="font-size: 1.05rem; font-weight: 600; margin: 0 0 0.5rem; color: var(--ink);">
              🛒 Ingredientes para ${e.porciones} personas:
            </h3>
            <div style="background: #fafaf9; border: 1px solid var(--line); border-radius: 10px; padding: 0.5rem 1rem;">
              ${m}
            </div>
          </div>

          ${g}

          <div class="recipe-actions">
            <button type="button" id="btn-save-as-recipe" class="btn-primary" style="background: linear-gradient(135deg, #0e6a45, #15803d);">
              💾 Guardar en Mis Recetas
            </button>
            <button type="button" id="btn-open-shopping-mode" class="btn-primary" style="background: #0e6a45;">
              🛒 Abrir en Modo Compra
            </button>
            <button type="button" id="btn-whatsapp-recipe" class="btn-primary" style="background: #128c7e;">
              📲 Enviar a WhatsApp
            </button>
            <button type="button" id="btn-edit-in-comparator" class="btn-secondary" style="background: transparent; color: var(--ink); border: 1px solid var(--line);">
              ✏️ Editar en Comparador
            </button>
          </div>
          <div id="save-status-msg" style="margin-top: 0.75rem; font-size: 0.88rem; font-weight: 500;"></div>
        `,f.append(n);const i=e.ingredientes.map(t=>({nombre:t.nombre,cantidad:t.cantidad,formato:t.formato,marca:"todas",comprado:!1,addedBy:x||"Tú",addedById:p||"local",addedAt:new Date().toISOString()})),o=n.querySelector("#btn-save-as-recipe"),$=n.querySelector("#save-status-msg");o.addEventListener("click",async()=>{if(!p){localStorage.setItem("comparador-lista",JSON.stringify(i)),localStorage.setItem("comparador-ciudad",r),window.confirm("Para guardar esta receta en tu cuenta y compartirla en vivo con tu pareja, inicia sesión con Google. ¿Deseas ir a iniciar sesión ahora?")?window.location.href="/perfil":$.innerHTML='<span style="color: #0e6a45;">¡Receta guardada en tu navegador! Puedes verla en el comparador.</span>';return}o.disabled=!0,o.textContent="Guardando receta…";try{const t=await C(p,e.receta,i,null,h,r,{tipo:"receta",porciones:e.porciones,descripcion:e.descripcion});$.innerHTML=`
              <span style="color: #15803d;">
                ✅ ¡Receta guardada con éxito en tu perfil!
                <a href="/perfil" style="color: #0e6a45; font-weight: 600; text-decoration: underline; margin-left: 0.4rem;">Ver en Mis Listas →</a>
              </span>
            `,o.textContent="✅ Guardada"}catch(t){console.error("Error al guardar receta:",t),$.innerHTML=`<span style="color: #c53030;">Error al guardar: ${s(t.message)}</span>`,o.disabled=!1,o.textContent="💾 Guardar en Mis Recetas"}}),n.querySelector("#btn-open-shopping-mode").addEventListener("click",async()=>{if(localStorage.setItem("comparador-lista",JSON.stringify(i)),localStorage.setItem("comparador-ciudad",r),p)try{const t=await C(p,e.receta,i,null,h,r,{tipo:"receta",porciones:e.porciones,descripcion:e.descripcion});window.location.href=`/perfil?listaId=${t}&modo=compra`;return}catch(t){console.warn("Fallback a modo local:",t)}window.location.href="/perfil?modo=compra"}),n.querySelector("#btn-whatsapp-recipe").addEventListener("click",()=>{let t=`🍳 *Receta: ${e.receta}*
`;t+=`👥 Para: ${e.porciones} personas
`,e.descripcion&&(t+=`📝 ${e.descripcion}

`),t+=`🛒 *Ingredientes necesarios:*
`,e.ingredientes.forEach(c=>{t+=`◻ ${c.nombre} (${Number(c.cantidad)} ${c.formato})
`}),a&&a.total&&(t+=`
💰 *Total estimado en supermercados:* ${u(a.total)}
`),e.consejo&&(t+=`
💡 *Tip del chef:* ${e.consejo}
`),t+=`
🔗 *Cotiza y tacha en vivo con Mercado Lista:*
${window.location.origin}/asistente`,window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(t)}`,"_blank")}),n.querySelector("#btn-edit-in-comparator").addEventListener("click",()=>{localStorage.setItem("comparador-lista",JSON.stringify(i)),localStorage.setItem("comparador-ciudad",r),window.location.href="/?tab=list"}),f.scrollIntoView({behavior:"smooth",block:"start"})}const w=new URLSearchParams(window.location.search),I=w.get("prompt")||w.get("q"),z=w.get("personas")||w.get("people");I&&(k.value=I,z&&(L.value=z),setTimeout(()=>{E.dispatchEvent(new Event("submit",{cancelable:!0}))},120));
