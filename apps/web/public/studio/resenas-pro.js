'use strict';
/* Reseñas por profesional (11/10/2026)
   · Cada reseña va ligada al profesional que atendió: sale en el perfil del negocio y en el apartado de ese profesional.
   · Ficha → Equipo: nota y número de reseñas de cada uno, con «Ver sus reseñas».
   · Ficha → Reseñas (y Business → Reseñas): resumen por profesional; al tocar uno, solo sus reseñas.
   · «Valorar la visita» desde una cita anterior: estrellas + texto (+ foto), ya ligada a quien te atendió. */

function statsPro(id) {
  const p = pro(id);
  const l = S.resenas.filter((r) => r.barbero === p.nombre);
  const media = l.length ? l.reduce((a, r) => a + r.estrellas, 0) / l.length : 0;
  return { n: l.length, media, txt: media ? media.toFixed(1).replace('.', ',') : '—' };
}
function tarjetasPro() {
  return `<div class="res-pros">${EQUIPO.map((p) => {
    const s = statsPro(p.id);
    const on = S.filtroRes === p.id;
    return `<button class="res-pro ${on ? 'on' : ''}" data-a="res-filtro" data-f="${on ? 'todas' : p.id}" aria-pressed="${on}"><img src="${p.img}" alt=""><span><b>${p.nombre}</b><small>${estrellas(Math.round(s.media))} ${s.txt} · ${s.n} reseñas</small></span></button>`;
  }).join('')}</div>`;
}
/* Ficha → Reseñas: tarjetas por profesional y cabecera cuando se filtra por uno */
{
  const orig = htmlResenas;
  htmlResenas = () => {
    let h = orig();
    if (!S.resenas.length) return h;
    h = h.replace('<label class="busca-res">', `<p class="franja" style="padding:0 0 8px">Por profesional</p>${tarjetasPro()}<label class="busca-res">`);
    return h;
  };
  const origLista = listaResenas;
  listaResenas = () => {
    const p = EQUIPO.find((x) => x.id === S.filtroRes);
    const h = origLista();
    if (!p) return h;
    const s = statsPro(p.id);
    return `<div class="res-pro-cab"><img src="${p.img}" alt=""><div><small>Reseñas de</small><b>${p.completo}</b><span>${estrellas(Math.round(s.media))} <b>${s.txt}</b> · ${s.n} reseñas · ${p.rol}</span></div></div>` + h;
  };
}
/* Al pulsar un filtro, refrescar también las tarjetas */
{
  const orig = A['res-filtro'];
  A['res-filtro'] = (b) => {
    if (orig) orig(b); else { S.filtroRes = b.dataset.f; }
    S.filtroRes = b.dataset.f;
    $$('[data-a="res-filtro"].chip').forEach((x) => x.setAttribute('aria-pressed', x.dataset.f === S.filtroRes));
    const t = $('.res-pros'); if (t) t.outerHTML = tarjetasPro();
    const l = $('#lista-res'); if (l) l.innerHTML = listaResenas();
  };
}
/* Ficha → Equipo: nota de cada profesional y acceso a sus reseñas */
{
  const orig = panelFicha;
  panelFicha = () => {
    let h = orig();
    if (S.tabFicha !== 'equipo') return h;
    EQUIPO.forEach((p) => {
      const s = statsPro(p.id);
      h = h.replace(`<div><b>${p.completo}</b><small>${p.rol}</small></div>`, `<div><b>${p.completo}</b><small>${p.rol}</small><small class="miembro__nota">${ic('estrella', 'ic-s')} ${s.txt} · ${s.n} reseñas</small></div>`);
    });
    return h + `<div class="equipo-res">${EQUIPO.map((p) => `<button class="btn btn--ghost btn--block" data-a="res-de" data-p="${p.id}">${ic('estrella', 'ic-s')}Ver las reseñas de ${p.nombre}</button>`).join('')}</div>`;
  };
}

/* Valorar una visita (desde «Mis citas» → Anteriores → Detalle, o desde el aviso) */
function abrirValorar(i) {
  const c = S.pasadas[i], p = pro(c.pro), s = serv(c.servicio);
  S.val = { i, estrellas: 5, texto: '', pro: c.pro };
  hojaGenerica('Valorar la visita', `${s.nombre} con ${p.nombre} · ${fCorta(c.fecha)}`, `<div class="form-hoja">
    <div class="val-pro"><img src="${p.img}" alt=""><span>Tu reseña saldrá en <b>${NEGOCIOS[0].nombre}</b> y en el perfil de <b>${p.nombre}</b>.</span></div>
    <div class="val-estrellas" role="radiogroup" aria-label="Puntuación">${[1, 2, 3, 4, 5].map((n) => `<button data-a="val-e" data-n="${n}" aria-label="${n} estrellas" class="on">${ic('estrella')}</button>`).join('')}</div>
    <textarea class="nota-campo" id="val-txt" maxlength="400" placeholder="¿Qué tal con ${p.nombre}? Cuéntalo para ayudar a otros clientes."></textarea>
    <button class="btn btn--ghost btn--block" data-a="toast" data-t="En la app real podrás añadir la foto o el vídeo de tu corte">${ic('camara', 'ic-s')}Añadir foto de tu corte</button>
    <button class="btn btn--primary btn--block" data-a="val-enviar">Publicar reseña</button>
    <p class="faint small">El texto se revisa antes de publicarlo (insultos, datos personales…).</p></div>`);
}

Object.assign(A, {
  'res-de': (b) => { S.filtroRes = b.dataset.p; S.tabFicha = 'resenas'; render(null, { mantenerScroll: true }); setTimeout(() => $('.res-pro-cab')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200); },
  valorar: (b) => abrirValorar(+b.dataset.i),
  'val-e': (b) => { S.val.estrellas = +b.dataset.n; $$('[data-a="val-e"]').forEach((x) => x.classList.toggle('on', +x.dataset.n <= S.val.estrellas)); },
  'val-enviar': (b) => {
    const t = ($('#val-txt').value || '').trim();
    if (t.length < 4) return toast('Escribe unas palabras sobre tu visita');
    const v = moderarTexto(t);
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    const p = pro(S.val.pro);
    S.resenas.unshift({ nombre: YO.nombre.split(' ')[0], estrellas: S.val.estrellas, texto: t, barbero: p.nombre, fecha: kF(HOY), nueva: true });
    S.pasadas[S.val.i].valorada = true;
    S.notiBiz.unshift({ tipo: 'resena', t: `<b>${YO.nombre}</b> ha dejado ${S.val.estrellas} ★ a <b>${p.nombre}</b>: «${esc(t.slice(0, 60))}…»`, cuando: 'ahora' });
    cerrarHoja();
    render(null, { mantenerScroll: true });
    toast(`¡Gracias! Publicada en Sublime y en el perfil de ${p.nombre}`);
  },
});
/* El botón «Valorar la visita» del detalle de una cita anterior abre el formulario */
{
  const orig = A['ver-pasada'];
  A['ver-pasada'] = (b) => {
    orig(b);
    const btn = $('#hoja-gen [data-t^="Gracias. Tu reseña"]');
    const i = +b.dataset.i;
    if (!btn) return;
    if (S.pasadas[i].valorada) { btn.outerHTML = `<p class="estado estado--ok" style="align-self:center">${ic('check', 'ic-s')}Ya la has valorado</p>`; return; }
    btn.dataset.a = 'valorar'; btn.dataset.i = i; delete btn.dataset.t;
  };
}
/* Business → Reseñas: resumen por profesional también */
envolver(VISTAS['resenas-biz'], 'html', function (orig) {
  const r = orig();
  r[0] = r[0].replace('<div class="panel">', `<p class="muted small pad" style="margin:4px 0 12px">Cada reseña queda en el negocio y en el profesional que atendió. Toca a uno para ver solo las suyas.</p><div class="panel">`);
  return r;
});
DEMOS.nResenaPro = () => { abrirApp('cliente', 'inicio'); S.tabFicha = 'equipo'; ir('negocio'); };
DEMOS.nValorar = () => { abrirApp('cliente', 'citas'); setTimeout(() => abrirValorar(0), 300); };
