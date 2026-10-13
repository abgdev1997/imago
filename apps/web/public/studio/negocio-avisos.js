'use strict';
/* Mensaje destacado del negocio + avisos a seguidores + servicios temporales (11/10/2026)
   · Business escribe un mensaje (huecos libres, precio especial, cerrado, novedad). Al entrar en la ficha,
     el cliente lo ve en una ventanita que puede cerrar. Opcional: publicarlo en el muro y avisar a los seguidores.
   · El cliente activa «Avisos de este negocio» (campana) y le llegan mensajes, cambios de precio, huecos y novedades.
   · Servicios temporales: para unas fechas, SOLO se pueden reservar los servicios temporales (con su precio y duración). */

Object.assign(S, {
  aviso: { id: 'av1', activo: true, tipo: 'precio', titulo: 'Navidad en Sublime', texto: 'Del 22 al 31 de diciembre solo trabajamos con los servicios especiales de Navidad. ¡Se llenan rápido, reserva ya!', hasta: '2026-12-31', popup: true },
  avisosCerrados: [],
  suscritos: [],          // negocios de los que el cliente recibe avisos
  seguidoresAvisos: 86,   // clientes de Sublime con los avisos activados (ejemplo)
  temporales: [],
});
const TIPOS_AVISO = [['huecos', 'Huecos libres', 'calendario'], ['precio', 'Precio especial', 'euro'], ['cerrado', 'Cerrado', 'cerrar'], ['novedad', 'Novedad', 'regalo']];
const tipoAviso = (t) => TIPOS_AVISO.find((x) => x[0] === t) || TIPOS_AVISO[3];

/* ---------- Servicios temporales ---------- */
function crearTemporal({ nombre, base, precio, min, desde, hasta }) {
  const b = serv(base) || SERVICIOS[0];
  const id = 'temp-' + Math.random().toString(36).slice(2, 7);
  const s = { ...b, id, nombre, precio, min, desc: `Servicio especial del ${fCorta(deK(desde))} al ${fCorta(deK(hasta))}.`, tag: 'Temporada', temporal: { desde, hasta, activo: true }, video: b.video };
  SERVICIOS.push(s);
  S.temporales.push(id);
  return s;
}
crearTemporal({ nombre: 'Corte de Navidad', base: 'corte', precio: 20, min: 30, desde: '2026-12-22', hasta: '2026-12-31' });
crearTemporal({ nombre: 'Corte + barba de Navidad', base: 'combo', precio: 26, min: 45, desde: '2026-12-22', hasta: '2026-12-31' });
const temporalesActivos = () => SERVICIOS.filter((s) => s.temporal && s.temporal.activo);
const temporalesDe = (k) => (k ? temporalesActivos().filter((s) => k >= s.temporal.desde && k <= s.temporal.hasta) : []);
/* Qué servicios se pueden reservar un día: si ese día hay temporales, solo esos */
function serviciosPara(k) {
  const t = temporalesDe(k);
  return t.length ? t : SERVICIOS.filter((s) => !s.temporal);
}
function rangoTemporal(s) { return `${fCorta(deK(s.temporal.desde))} – ${fCorta(deK(s.temporal.hasta))}`; }

/* Calendario de la reserva: marcar los días con servicios temporales */
{
  const orig = htmlCal;
  htmlCal = () => orig().replace(/<button class="dia ([^"]*)" data-a="dia" data-f="(\d{4}-\d\d-\d\d)"/g, (m, cls, k) => (temporalesDe(k).length ? `<button class="dia dia--temp ${cls}" data-a="dia" data-f="${k}"` : m));
}
/* Paso de servicios: solo los permitidos ese día */
{
  const orig = htmlPaso;
  htmlPaso = (dir) => {
    const R = S.reserva;
    if (R.paso === 1 && R.servicio && !serviciosPara(R.fecha).some((s) => s.id === R.servicio)) R.servicio = null;
    let h = orig(dir);
    if (R.paso === 1) {
      const permitidos = new Set(serviciosPara(R.fecha).map((s) => s.id));
      h = h.replace(/<button class="serv-card [^"]*" data-a="serv-sel" data-s="([^"]+)"[\s\S]*?<\/button>/g, (m, id) => (permitidos.has(id) ? m : ''));
      const t = temporalesDe(R.fecha);
      if (t.length) h = h.replace('<p class="muted">', `<p class="aviso-temp">${ic('estrella', 'ic-s')}<span>Ese día solo hay <b>servicios especiales</b> (${rangoTemporal(t[0])}).</span></p><p class="muted">`);
    }
    return h;
  };
  const origIr = irPaso;
  irPaso = (n, dir) => {
    const R = S.reserva;
    if (n >= 2 && R.fecha && R.servicio && !serviciosPara(R.fecha).some((s) => s.id === R.servicio)) {
      R.servicio = null;
      toast('Ese día solo se pueden reservar los servicios especiales. Elige uno.');
      return origIr(1, 'atras');
    }
    return origIr(n, dir);
  };
}
/* Ficha: servicios normales + bloque de temporada */
{
  const orig = panelFicha;
  panelFicha = () => {
    if (S.tabFicha !== 'servicios') return orig();
    const h = orig().replace(/<button class="serv-fila" data-a="reservar" data-s="(temp-[^"]+)"[\s\S]*?<\/button>/g, '');
    const t = temporalesActivos();
    if (!t.length) return h;
    return `<div class="temporada"><p class="temporada__t">${ic('estrella', 'ic-s')} Servicios de temporada <small>${rangoTemporal(t[0])}</small></p>
      ${t.map((s) => `<button class="serv-fila serv-fila--temp" data-a="reservar" data-s="${s.id}"><span class="serv-fila__img"><img src="${s.img}" alt="" loading="lazy"></span><span class="serv-fila__txt"><b>${s.nombre}</b><p>${s.desc}</p><small>${ic('reloj', 'ic-s')}${s.min} min · solo esos días</small></span><span class="serv-fila__precio"><b>${eur(s.precio)}</b><span class="mas">${ic('mas', 'ic-s')}</span></span></button>`).join('')}
      <p class="faint small">Esos días no se pueden reservar los servicios normales.</p></div>` + h;
  };
}

/* ---------- Mensaje destacado: ventanita al entrar en la ficha ---------- */
function htmlCampanaFicha() {
  const on = S.suscritos.includes('sublime');
  return `<button class="icon-btn icon-btn--glass ${on ? 'on' : ''}" data-a="suscribir" aria-label="${on ? 'Desactivar avisos' : 'Activar avisos de este negocio'}" aria-pressed="${on}">${ic('campana')}</button>`;
}
envolver(VISTAS.negocio, 'html', function (orig) {
  const r = orig();
  r[0] = r[0].replace('<button class="icon-btn icon-btn--glass" data-a="toast" data-t="Enlace copiado para compartir"', `${htmlCampanaFicha()}<button class="icon-btn icon-btn--glass" data-a="toast" data-t="Enlace copiado para compartir"`);
  return r;
});
envolver(VISTAS.negocio, 'montar', function (orig, capa) {
  orig(capa);
  const a = S.aviso;
  if (!a || !a.activo || !a.popup || S.avisosCerrados.includes(a.id) || (a.hasta && kF(HOY) > a.hasta)) return;
  setTimeout(() => {
    if (S.vista !== 'negocio' || $('.aviso-pop')) return;
    const [, , icono] = tipoAviso(a.tipo);
    const on = S.suscritos.includes('sublime');
    const el = document.createElement('div');
    el.className = 'aviso-pop';
    el.innerHTML = `<div class="aviso-pop__caja aviso-pop--${a.tipo}" role="dialog" aria-label="Mensaje del negocio">
      <button class="icon-btn aviso-pop__x" data-a="aviso-cerrar" aria-label="Cerrar">${ic('cerrar', 'ic-s')}</button>
      <span class="aviso-pop__ic">${ic(icono)}</span>
      <small>${NEGOCIOS[0].nombre} · ${tipoAviso(a.tipo)[1]}</small>
      <b>${esc(a.titulo)}</b>
      <p>${esc(a.texto)}</p>
      <div class="aviso-pop__btns">
        ${a.tipo === 'cerrado' ? '' : '<button class="btn btn--primary btn--sm" data-a="aviso-reservar">Ver huecos</button>'}
        ${on ? '<span class="estado estado--ok">Avisos activados</span>' : `<button class="btn btn--ghost btn--sm" data-a="suscribir">${ic('campana', 'ic-s')}Avisarme de novedades</button>`}
      </div></div>`;
    $('#screen').appendChild(el);
    requestAnimationFrame(() => el.classList.add('on'));
  }, 600);
});
function cerrarAvisoPop() {
  const el = $('.aviso-pop');
  if (!el) return;
  el.classList.remove('on');
  setTimeout(() => el.remove(), 260);
}

/* ---------- Business: mensaje para clientes ---------- */
VISTAS['mensaje-clientes'] = { padre: 'ajustes', html() {
  const a = S.aviso || { tipo: 'huecos', titulo: '', texto: '', hasta: '', popup: true };
  const B = S.borradorAviso || (S.borradorAviso = { ...a, muro: true, avisar: true });
  return sub('Mensaje para clientes', `<div class="pad form-hoja" style="padding-top:0">
    <div class="campo"><label>Tipo</label><div class="chips">${TIPOS_AVISO.map(([id, t, icono]) => `<button class="chip" data-a="av-tipo" data-v="${id}" aria-pressed="${B.tipo === id}">${ic(icono, 'ic-s')}${t}</button>`).join('')}</div></div>
    <div class="campo"><label>Título</label><input id="av-tit" type="text" maxlength="60" value="${esc(B.titulo)}" placeholder="Ej.: Huecos libres el miércoles"></div>
    <div class="campo"><label>Mensaje</label><textarea class="nota-campo" id="av-txt" maxlength="240" placeholder="Ej.: Este miércoles tenemos huecos por la tarde con −15 %.">${esc(B.texto)}</textarea></div>
    <div class="campo"><label>Mostrar hasta</label><input id="av-hasta" type="date" value="${B.hasta || ''}"></div>
    ${[['popup', 'Ventanita al entrar en tu perfil', 'La ven todos los que entran a reservar'], ['muro', 'Publicar también en el muro', 'Queda fijado arriba'], ['avisar', `Avisar a tus seguidores (${S.seguidoresAvisos})`, 'Clientes que tienen activados tus avisos']].map(([k, t, d]) => `<div class="ajuste"><span><b>${t}</b><small>${d}</small></span><button class="switch" role="switch" aria-checked="${!!B[k]}" data-a="av-sw" data-k="${k}" aria-label="${t}"></button></div>`).join('')}
    <p class="franja">Así lo verá el cliente</p>
    <div class="aviso-prev aviso-pop--${B.tipo}"><span class="aviso-pop__ic">${ic(tipoAviso(B.tipo)[2])}</span><small>${NEGOCIOS[0].nombre} · ${tipoAviso(B.tipo)[1]}</small><b id="av-prev-t">${esc(B.titulo) || 'Título del mensaje'}</b><p id="av-prev-x">${esc(B.texto) || 'Aquí va tu mensaje.'}</p></div>
    <button class="btn btn--primary btn--block" data-a="av-publicar">${ic('megafono', 'ic-s')}Publicar mensaje</button>
    ${S.aviso && S.aviso.activo ? '<button class="btn btn--ghost btn--block" data-a="av-quitar">Quitar el mensaje actual</button>' : ''}
    <p class="faint small">Ideas: huecos libres de un día, precio de Navidad, «el lunes cerramos», un producto o merchandising nuevo.</p></div>`, 'Un mensaje importante que tus clientes ven al entrar a reservar.');
} };
document.addEventListener('input', (e) => {
  const B = S.borradorAviso;
  if (!B) return;
  if (e.target.id === 'av-tit') { B.titulo = e.target.value; const p = $('#av-prev-t'); if (p) p.textContent = B.titulo || 'Título del mensaje'; }
  if (e.target.id === 'av-txt') { B.texto = e.target.value; const p = $('#av-prev-x'); if (p) p.textContent = B.texto || 'Aquí va tu mensaje.'; }
  if (e.target.id === 'av-hasta') B.hasta = e.target.value;
});

/* ---------- Business: servicios temporales ---------- */
VISTAS.temporales = { padre: 'ajustes', html() {
  const t = SERVICIOS.filter((s) => s.temporal);
  return sub('Servicios temporales', `<div class="pad">
    <div class="explica">${ic('estrella', 'ic-s')}<span>Para fechas de mucha demanda (Navidad, Semana Santa, ferias…). <b>Esos días solo se pueden reservar los servicios temporales</b>, con su precio y su duración. Tus precios normales no cambian.</span></div>
    ${t.map((s) => `<div class="temp-fila"><span><b>${s.nombre}</b><small>${rangoTemporal(s)} · ${s.min} min · ${eur(s.precio)} <span class="faint">(normal: ${eur((serv(s.id.startsWith('temp-') ? SERVICIOS.find((x) => !x.temporal && s.img === x.img)?.id : '') || s).precio)})</span></small></span><button class="switch" role="switch" aria-checked="${s.temporal.activo}" data-a="temp-sw" data-id="${s.id}" aria-label="Activar ${s.nombre}"></button></div>`).join('') || '<p class="muted small">Todavía no tienes servicios temporales.</p>'}
    <button class="btn btn--primary btn--block" style="margin-top:14px" data-a="temp-nuevo">${ic('mas', 'ic-s')}Crear servicio temporal</button></div>`, 'Sube el precio o cambia la duración solo unos días, sin tocar tus servicios.');
} };
function abrirNuevoTemporal() {
  const b = SERVICIOS.find((s) => s.id === 'corte');
  S.nt = { base: 'corte', nombre: 'Corte de Semana Santa', precio: b.precio + 4, min: b.min, desde: '2027-03-22', hasta: '2027-03-28' };
  hojaGenerica('Nuevo servicio temporal', 'Solo se podrá reservar en estas fechas', `<div class="form-hoja">
    <div class="campo"><label>Basado en</label><select id="nt-base">${SERVICIOS.filter((s) => !s.temporal).map((s) => `<option value="${s.id}" ${s.id === 'corte' ? 'selected' : ''}>${s.nombre} (${eur(s.precio)} · ${s.min} min)</option>`).join('')}</select></div>
    <div class="campo"><label>Nombre que verá el cliente</label><input id="nt-nombre" type="text" value="${S.nt.nombre}"></div>
    <div class="nt-fila"><div class="campo"><label>Precio (€)</label><input id="nt-precio" type="number" min="0" step="1" value="${S.nt.precio}"></div><div class="campo"><label>Duración (min)</label><input id="nt-min" type="number" min="10" step="5" value="${S.nt.min}"></div></div>
    <div class="nt-fila"><div class="campo"><label>Desde</label><input id="nt-desde" type="date" value="${S.nt.desde}"></div><div class="campo"><label>Hasta</label><input id="nt-hasta" type="date" value="${S.nt.hasta}"></div></div>
    <p class="aviso-temp">${ic('estrella', 'ic-s')}<span>Esos días tus clientes <b>solo</b> podrán reservar los servicios temporales activos.</span></p>
    <button class="btn btn--primary btn--block" data-a="temp-crear">Crear y avisar a mis seguidores</button></div>`);
  $('#nt-base').addEventListener('change', (e) => { const s = serv(e.target.value); $('#nt-precio').value = s.precio + 4; $('#nt-min').value = s.min; });
}

/* ---------- Ajustes: entradas nuevas ---------- */
envolver(VISTAS.ajustes, 'html', function (orig) {
  const [a] = orig();
  return [conMarco(a, '<p class="franja pad">Gestión</p>\n      <div class="lista-op">', `
        ${filaAj('ir', 'megafono', 'Mensaje para clientes', S.aviso && S.aviso.activo ? `Publicado: «${esc(S.aviso.titulo)}»` : 'Ventanita al reservar · muro · avisos', 'mensaje-clientes')}
        ${filaAj('ir', 'estrella', 'Servicios temporales', `${temporalesActivos().length} activos · precios de temporada`, 'temporales')}`, true)];
});

Object.assign(A, {
  suscribir: () => {
    const on = !S.suscritos.includes('sublime');
    S.suscritos = on ? [...S.suscritos, 'sublime'] : S.suscritos.filter((x) => x !== 'sublime');
    S.seguidoresAvisos += on ? 1 : -1;
    const c = $('[data-a="suscribir"].icon-btn');
    if (c) { c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }
    const p = $('.aviso-pop [data-a="suscribir"]');
    if (p) p.outerHTML = '<span class="estado estado--ok">Avisos activados</span>';
    toast(on ? 'Te avisaremos de mensajes, precios, huecos libres y novedades de Sublime' : 'Avisos de Sublime desactivados');
  },
  'aviso-cerrar': () => { S.avisosCerrados.push(S.aviso.id); cerrarAvisoPop(); },
  'aviso-reservar': () => { S.avisosCerrados.push(S.aviso.id); cerrarAvisoPop(); setTimeout(() => A.reservar({ dataset: {} }), 200); },
  'av-tipo': (b) => { S.borradorAviso.tipo = b.dataset.v; render(null, { mantenerScroll: true }); },
  'av-sw': (b) => { const k = b.dataset.k; S.borradorAviso[k] = !S.borradorAviso[k]; b.setAttribute('aria-checked', S.borradorAviso[k]); },
  'av-publicar': () => {
    const B = S.borradorAviso;
    if (!B.titulo.trim() || !B.texto.trim()) return toast('Escribe un título y el mensaje');
    const v = moderarTexto(`${B.titulo} ${B.texto}`);
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    S.aviso = { id: 'av' + Date.now(), activo: true, tipo: B.tipo, titulo: B.titulo.trim(), texto: B.texto.trim(), hasta: B.hasta, popup: B.popup };
    if (B.muro) S.muro.unshift({ id: 'mm' + Date.now(), autor: 'negocio', nombre: NEGOCIOS[0].nombre, texto: `${S.aviso.titulo}. ${S.aviso.texto}`, fecha: new Date(), fijado: true, respuestas: [], likes: 0 });
    if (B.avisar && S.suscritos.includes('sublime')) S.notiCli.unshift({ ic: 'megafono', t: `<b>${NEGOCIOS[0].nombre}</b>: ${esc(S.aviso.titulo)}`, cuando: 'ahora' });
    S.borradorAviso = null;
    volver();
    toast(`Mensaje publicado${B.avisar ? ` y enviado a ${S.seguidoresAvisos} seguidores` : ''}`);
  },
  'av-quitar': () => { S.aviso.activo = false; S.borradorAviso = null; render(null, { mantenerScroll: true }); toast('Mensaje retirado'); },
  'temp-sw': (b) => { const s = serv(b.dataset.id); s.temporal.activo = !s.temporal.activo; b.setAttribute('aria-checked', s.temporal.activo); toast(s.temporal.activo ? `${s.nombre} activado` : `${s.nombre} desactivado: esos días vuelven los servicios normales`); },
  'temp-nuevo': abrirNuevoTemporal,
  'temp-crear': () => {
    const d = $('#nt-desde').value, h = $('#nt-hasta').value;
    if (!d || !h || h < d) return toast('Revisa las fechas');
    const s = crearTemporal({ nombre: $('#nt-nombre').value.trim() || 'Servicio temporal', base: $('#nt-base').value, precio: +$('#nt-precio').value, min: +$('#nt-min').value, desde: d, hasta: h });
    if (S.suscritos.includes('sublime')) S.notiCli.unshift({ ic: 'estrella', t: `<b>${NEGOCIOS[0].nombre}</b> ha abierto <b>${esc(s.nombre)}</b> (${rangoTemporal(s)}) a ${eur(s.precio)}`, cuando: 'ahora' });
    cerrarHoja(); render(null, { mantenerScroll: true });
    toast(`${s.nombre} creado. Del ${fCorta(deK(d))} al ${fCorta(deK(h))} solo se reservarán los servicios temporales`);
  },
});
DEMOS.nAviso = () => { S.avisosCerrados = []; abrirApp('cliente', 'inicio'); S.tabFicha = 'servicios'; ir('negocio'); };
DEMOS.nAvisoBiz = () => { abrirApp('negocio', 'ajustes'); ir('mensaje-clientes'); };
DEMOS.nTemporales = () => { abrirApp('negocio', 'ajustes'); ir('temporales'); };
DEMOS.nTemporalesCli = () => { abrirApp('cliente', 'inicio'); S.historial = ['inicio']; empezarReserva({ fecha: '2026-12-23' }); };
