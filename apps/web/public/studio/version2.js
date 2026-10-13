'use strict';
/* IMAGO · 3.ª ronda (13/10/2026): más simple y más Booksy, sin IA
   Clientes: muro solo del personal · reservar en UNA ventana (servicio, con quién, día con barras tipo pila, hora,
   pago y resumen) · botón para cerrar tras reservar · Feed estilo TikTok (antes Inspiración) · perfil sencillo.
   Business: calendario primero (Día/Semana/Mes con iconos) · botón «nueva cita» con icono de agenda · Clientes sin
   filtros · Ajustes como Booksy · protección contra inasistencias y pago en la app · botón central que se despliega
   en círculo (cámara, muro, mensajes, nueva cita, hueco libre, tablón) · chat de la cita cliente ↔ negocio. */

Object.assign(ICON, {
  vdia: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13.5v4"/>',
  vsemana: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 13.5v4M12 13.5v4M16 13.5v4"/>',
  vmes: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17h.01M12 17h.01M16.5 17h.01"/>',
  muro: '<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M7.5 9h9M7.5 12.5h9M7.5 16h5"/>',
  tablon: '<path d="M5 4h14a1 1 0 011 1v9l-6 6H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path d="M14 20v-5a1 1 0 011-1h5"/>',
  agendaMas: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M12 12.5v5.5M9.2 15.2h5.6"/>',
});

/* =====================================================================
   1 · Clientes · El muro lo escribe solo el personal (los clientes lo leen)
   ===================================================================== */
S.muro = S.muro.filter((m) => m.autor !== 'cliente');
htmlMuro = () => {
  const orden = [...S.muro].filter((m) => m.autor !== 'cliente').sort((a, b) => (b.fijado - a.fijado) || (b.fecha - a.fecha));
  return `<p class="muro-nota">${ic('megafono', 'ic-s')}Lo escribe el equipo de ${NEGOCIOS[0].nombre}: novedades, avisos y huecos libres.</p>
    <div id="lista-muro">${orden.map((m) => htmlPost({ ...m, respuestas: [] }).replace(/<button data-a="responder"[\s\S]*?<\/button>/, '')).join('') || `<div class="vacio">${ic('megafono')}Aún no hay publicaciones.</div>`}</div>`;
};

/* =====================================================================
   2 · Clientes · Reservar en UNA ventana (como Booksy)
   ===================================================================== */
S.pagosV = { local: true, app: false, proteccion: true, senalTipo: 'fijo', senal: 5, aQuien: 'nuevos' };
const yoCliente = () => clientesDB().find((c) => c.yo);
function necesitaSenal() {
  const P = S.pagosV, c = yoCliente();
  if (!P.proteccion) return false;
  return P.aQuien === 'todos' || (P.aQuien === 'nuevos' && (c.first || c.noShows > 0)) || (P.aQuien === 'faltas' && c.noShows > 0);
}
const importeSenal = (s) => (S.pagosV.senalTipo === 'pct' ? Math.round((s ? s.precio : 15) * S.pagosV.senal) / 100 : S.pagosV.senal);
function htmlPagoRsv() {
  const R = S.reserva, P = S.pagosV, s = R.servicio && serv(R.servicio);
  const senal = necesitaSenal();
  const opts = [];
  if (senal) opts.push(['senal', `Dejar una señal de ${eur(importeSenal(s))}`, `Protección contra inasistencias: se descuenta del total y se te devuelve si cancelas hasta ${S.cancelHoras} h antes`]);
  else if (P.local) opts.push(['local', 'Pagar en el local', 'Al terminar. No se cobra nada ahora']);
  if (P.app && s) opts.push(['ahora', `Pagar ahora · ${eur(s.precio)}`, 'Apple Pay, Google Pay, tarjeta o Bizum']);
  if (!opts.some(([id]) => id === R.pago)) R.pago = opts[0][0];
  if (opts.length === 1) {
    const [id, t, d] = opts[0];
    return `<p class="nc-t">4 · Pago</p><div class="rsv-pago-uno">${ic(id === 'senal' ? 'escudo' : 'tienda')}<span><b>${t}</b><small>${d}</small></span></div>`;
  }
  return `<p class="nc-t">4 · Pago</p><div class="pagos">${opts.map(([id, t, d]) => `<button class="pago ${R.pago === id ? 'on' : ''}" data-a="pago" data-m="${id}"><div><b>${t}</b><small>${d}</small></div><span class="radio"></span></button>`).join('')}</div>`;
}
const quienRsv = () => { const R = S.reserva; if (R.pro && R.pro !== 'any') return pro(R.pro); return R.fecha && R.hora ? pro(proLibre(deK(R.fecha), R.hora) || 'javi') : null; };
htmlPie = () => {
  const R = S.reserva, s = R.servicio && serv(R.servicio);
  const listo = !!(s && R.fecha && R.hora);
  const p = quienRsv();
  const falta = !s ? 'Elige un servicio' : !R.hora ? 'Elige día y hora' : '';
  return `${listo ? `<div class="rsv-res">${p ? `<img src="${p.img}" alt="">` : ''}<span><b>${s.nombre} · ${eur(s.precio)}</b><small>${mayus(fRel(deK(R.fecha)).toLowerCase())} ${R.hora} · ${s.min} min${p ? ` · con ${p.nombre}` : ''}${R.pago === 'senal' ? ` · señal ${eur(importeSenal(s))}` : R.pago === 'ahora' ? ' · pagas ahora' : ' · pagas en el local'}</small></span></div>` : ''}
    <button class="btn btn--primary btn--block" data-a="confirmar" ${listo ? '' : 'disabled'}><span class="btn__txt">${listo ? 'Confirmar cita' : falta}</span></button>`;
};
irPaso = () => { if (S.vista === 'reserva') render(null, { mantenerScroll: true }); };
VISTAS.reserva = {
  clase: 'view--sinnav',
  tabbar: false,
  html() {
    const R = S.reserva;
    if (!R.pro) R.pro = 'any';
    const s = R.servicio && serv(R.servicio);
    const f = R.fecha ? deK(R.fecha) : HOY;
    const pros = [['any', 'Cualquiera'], ...EQUIPO.map((p) => [p.id, p.nombre])].map(([id, n]) => {
      const p = id === 'any' ? null : pro(id), vac = p && enVacaciones(id, f), on = R.pro === id;
      return `<button class="cal-pro ${on ? 'on' : ''}" data-a="cal-pro" data-p="${id}" aria-pressed="${on}"><span class="cal-pro__foto">${p ? `<img src="${p.img}" alt="">` : ic('equipo')}</span><small>${n}${vac ? ' · vac.' : ''}</small></button>`;
    }).join('');
    return [`<div class="rsv pad">
      <div class="rsv-neg"><span class="post__av post__av--neg"><img src="${NEGOCIOS[0].logo}" alt=""></span><span><b>${NEGOCIOS[0].nombre}</b><small>${NEGOCIOS[0].direccion}</small></span></div>
      <section class="rsv-sec"><p class="nc-t">1 · Servicio</p>
        <button class="nc-campo rs-serv" data-a="rs-serv">${s ? `<span><small>${s.temporal ? 'Temporada' : 'Servicio'}</small><b>${s.nombre}</b><em>${s.min} min · ${eur(s.precio)}</em></span>` : '<span><small>Servicio</small><b>Elige un servicio</b></span>'}<span class="nc-flecha">${ic('baja')}</span></button></section>
      <section class="rsv-sec"><p class="nc-t">2 · Con quién</p><div class="cal-pros-v1">${pros}</div></section>
      <section class="rsv-sec"><p class="nc-t">3 · Día y hora</p>${avisosReserva()}<div class="cal" id="cal">${htmlCal()}</div><div id="horas">${htmlHoras()}</div></section>
      <section class="rsv-sec" id="rsv-pago">${htmlPagoRsv()}</section>
      <section class="rsv-sec"><details class="rsv-nota" ${R.nota ? 'open' : ''}><summary>${ic('editar', 'ic-s')}Añadir una nota (opcional)</summary><textarea class="nota-campo" id="nota" placeholder="Ej.: «quiero dejarlo igual que la última vez»">${esc(R.nota)}</textarea></details>
        <p class="politica">${ic('escudo', 'ic-s')}<span>Cancelación gratis hasta ${S.cancelHoras || 4} h antes. Te la recordamos 24 h y 1 h antes, por notificación y por email.</span></p></section>
    </div>`,
    `<header class="nc-cab"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><b>Reservar cita</b><button class="guia-btn" data-a="ia">${ic('soporte', 'ic-s')}Ayuda</button></header>
     <footer class="nc-pie rsv-pie" id="pie">${htmlPie()}</footer>`];
  },
  montar(capa) { $('#nota', capa)?.addEventListener('input', (e) => { S.reserva.nota = e.target.value; }); },
};
{
  const pg = A.pago;
  A.pago = (b) => { pg(b); pintarPie(); };
}
function abrirServiciosRsv() {
  const R = S.reserva;
  const lista = R.fecha && typeof serviciosPara === 'function' ? serviciosPara(R.fecha) : SERVICIOS;
  const soloTemp = lista.length && lista.every((s) => s.temporal);
  const grupos = soloTemp ? [['Temporada · solo estos días', lista]] : [...(temporalesHoy().length ? [['Temporada', temporalesHoy()]] : []), ...gruposServicios()];
  hojaGenerica(R.servicio ? 'Cambiar el servicio' : 'Elige el servicio', soloTemp ? 'Ese día solo hay servicios de temporada' : 'Toca un grupo para abrirlo', `<div class="form-hoja selector-serv">${grupos.map(([t, l], j) => `<details ${l.some((s) => s.id === R.servicio) || (!R.servicio && j === (grupos[0][0].startsWith('Temporada') && !soloTemp ? 1 : 0)) ? 'open' : ''}><summary><b>${t}</b><small>${l.length} ${l.length === 1 ? 'servicio' : 'servicios'}</small><span class="nc-flecha">${ic('baja')}</span></summary>
    ${l.map((s) => `<button class="sel-serv ${s.id === R.servicio ? 'on' : ''}" data-a="rs-serv-ok" data-v="${s.id}"><span><b>${s.nombre}</b><small>${s.min} min</small></span><b>${eur(s.precio)}</b></button>`).join('')}</details>`).join('')}</div>`);
}
/* Tras reservar: botón para cerrar y volver */
envolver(VISTAS.exito, 'html', function (orig) {
  const r0 = orig();
  r0[0] = `<div class="exito-cab"><button class="icon-btn" data-a="exito-cerrar" aria-label="Cerrar">${ic('cerrar')}</button></div>` + r0[0];
  return r0;
});

/* =====================================================================
   3 · Clientes · Feed estilo TikTok (antes Inspiración): un vídeo por pantalla, «Quiero esto»
   ===================================================================== */
const ESTILO_TRABAJO = { espiral: 'Rizos', carmesi: 'Color', claroscuro: 'Color', horizonte: 'Degradados', oleo: 'Color', primavera: 'Clásicos', 'retrato-con-barba': 'Barba', 'rizo-indomito': 'Rizos', tinta: 'Degradados', 'bajo-el-neon': 'Degradados', p1: 'Rizos', p2: 'Color' };
const ESTILOS = ['Degradados', 'Rizos', 'Barba', 'Color', 'Clásicos'];
S.inspFiltro = 'todo';
function itemsInsp() {
  return reels().map((r) => ({ id: r.id, img: r.img, video: r.video, pro: r.pro, texto: r.texto, servicio: servDeReel(r), estilo: ESTILO_TRABAJO[String(r.id).replace(/^r-/, '')] || 'Nuevos' }));
}
function inspFiltrados() {
  const all = itemsInsp(), F = S.inspFiltro;
  return F === 'todo' ? all : F === 'guardados' ? all.filter((x) => S.guardados.includes(x.id)) : all.filter((x) => x.estilo === F);
}
/* Feed estilo TikTok: un vídeo por pantalla, se desliza hacia arriba */
S.likes = [];
const cuentaLikes = (x) => 40 + (hash('lk' + x.id) % 260) + (S.likes.includes(x.id) ? 1 : 0);
const cuentaGuard = (x) => 3 + (hash('gd' + x.id) % 40) + (S.guardados.includes(x.id) ? 1 : 0);
function feedFiltrados() {
  const all = itemsInsp(), F = S.inspFiltro;
  if (F === 'siguiendo') return S.favoritos.includes(NEGOCIOS[0].id) ? all : [];
  return F === 'todo' ? all : F === 'guardados' ? all.filter((x) => S.guardados.includes(x.id)) : all.filter((x) => x.estilo === F);
}
function htmlFeedItem(x) {
  const s = serv(x.servicio), p = x.pro && pro(x.pro), g = S.guardados.includes(x.id), l = S.likes.includes(x.id);
  const sigue = S.favoritos.includes(NEGOCIOS[0].id);
  return `<section class="reel feed" data-id="${x.id}">
    ${x.img ? `<img class="reel__img" src="${x.img}" alt="">` : ''}
    ${x.video ? `<video data-auto data-src="${x.video}" muted loop playsinline preload="none"></video>` : ''}
    <button class="feed__toque" data-a="feed-toque" data-id="${x.id}" aria-label="Pausar o reanudar"></button>
    <span class="feed__pausa">${ic('play')}</span>
    <div class="feed__rail">
      <button class="feed__autor" data-a="feed-seguir" aria-label="${sigue ? 'Siguiendo' : 'Seguir'}">${p ? `<img src="${p.img}" alt="">` : `<img src="${NEGOCIOS[0].logo}" alt="">`}${sigue ? '' : `<i>${ic('mas')}</i>`}</button>
      <button data-a="feed-like" data-id="${x.id}" aria-pressed="${l}" aria-label="Me gusta">${ic('corazon')}<span>${cuentaLikes(x)}</span></button>
      <button data-a="insp-guardar" data-id="${x.id}" aria-pressed="${g}" aria-label="Guardar">${ic('guardar')}<span>${cuentaGuard(x)}</span></button>
      <button data-a="toast" data-t="Se abriría el menú de compartir: WhatsApp, Instagram, copiar enlace…" aria-label="Compartir">${ic('compartir')}<span>Enviar</span></button>
    </div>
    <div class="feed__info">
      <b class="feed__quien">@${p ? norm(p.nombre).toLowerCase() : 'sublime'} · ${NEGOCIOS[0].nombre}</b>
      <p>${esc(x.texto)}</p>
      <span class="feed__tags"><span>#${x.estilo.toLowerCase()}</span><span>${s.nombre} · ${eur(s.precio)} · ${s.min} min</span></span>
      <button class="feed__cta" data-a="reel-quiero" data-s="${x.servicio}" data-p="${x.pro || ''}">${ic('calendario', 'ic-s')}Quiero esto · reservar</button>
    </div>
    <i class="feed__prog"><i></i></i>
  </section>`;
}
VISTAS.inspiracion = {
  clase: 'view--reels view--feed',
  html() {
    const l = feedFiltrados(), F = S.inspFiltro;
    const vacio = F === 'siguiendo' ? 'Sigue a tus negocios (el «+» de su foto) y aquí verás solo sus vídeos.' : F === 'guardados' ? 'Aún no has guardado nada. Toca el marcador de un vídeo para guardarlo.' : 'Aún no hay vídeos de este estilo.';
    const tabs = [['siguiendo', 'Siguiendo'], ['todo', 'Para ti']].map(([id, t]) => `<button data-a="insp-filtro" data-v="${id}" aria-pressed="${F === id}">${t}</button>`).join('');
    const estilo = !['todo', 'siguiendo'].includes(F);
    return [l.length ? l.map(htmlFeedItem).join('') : `<section class="reel feed feed--vacio"><div class="vacio">${ic(F === 'guardados' ? 'guardar' : 'inspiracion')}${vacio}<button class="btn btn--sm btn--primary" data-a="insp-filtro" data-v="todo">Ver «Para ti»</button></div></section>`,
      `<div class="feed-cab">
        <div class="feed-cab__fila"><span class="feed-cab__lado"></span><div class="feed-tabs">${tabs}</div><span class="feed-cab__lado"><button class="icon-btn feed-cab__btn ${estilo ? 'on' : ''}" data-a="feed-estilos" aria-label="Estilos y guardados">${ic('ajustes')}</button></span></div>
        ${estilo ? `<div class="feed-filtro"><span>${F === 'guardados' ? `${ic('guardar', 'ic-s')}Guardados` : `#${F.toLowerCase()}`}</span><button data-a="insp-filtro" data-v="todo" aria-label="Quitar filtro">${ic('cerrar', 'ic-s')}</button></div>` : ''}
      </div>`];
  },
  montar(capa) {
    $$('.feed video', capa).forEach((v) => v.addEventListener('timeupdate', () => { const b = v.closest('.feed')?.querySelector('.feed__prog > i'); if (b && v.duration) b.style.width = `${(v.currentTime / v.duration) * 100}%`; }));
  },
};
function abrirEstilosFeed() {
  const F = S.inspFiltro;
  hojaGenerica('Feed', 'Elige qué quieres ver', `<div class="form-hoja"><div class="chips feed-estilos">${[['todo', 'Para ti'], ['guardados', `Guardados${S.guardados.length ? ` · ${S.guardados.length}` : ''}`], ...ESTILOS.map((x) => [x, '#' + x.toLowerCase()])].map(([id, t]) => `<button class="chip" data-a="feed-estilo-ok" data-v="${id}" aria-pressed="${F === id}">${t}</button>`).join('')}</div>
    <p class="faint small">Los estilos los pone cada negocio al publicar su vídeo.</p></div>`);
}
function corazonFeed(sec) {
  if (!sec || reducido) return;
  const h = document.createElement('span');
  h.className = 'feed__corazon';
  h.innerHTML = ic('corazon');
  sec.appendChild(h);
  setTimeout(() => h.remove(), 800);
}
let toqueFeed = 0;
guardadosItems = () => itemsInsp().filter((x) => S.guardados.includes(x.id));

/* =====================================================================
   4 · Clientes · Perfil sencillo (como Booksy)
   ===================================================================== */
VISTAS.perfil.html = function () {
  const ini = YO.nombre.split(' ').map((x) => x[0]).join('').slice(0, 2);
  const fila = (a, icono, t, s = '') => `<button data-a="${a}">${ic(icono)}<span>${t}${s ? `<small>${s}</small>` : ''}</span>${ic('sig', 'ic-s')}</button>`;
  const prox = S.citas.filter((c) => !c.cancelada).length;
  return [`<div class="pf2-cab"><span class="pf2-av">${ini}</span><div><h1>${YO.nombre}</h1><small>${YO.tel} · ${YO.email}</small></div><button class="btn btn--sm btn--ghost" data-a="perfil-datos">Editar</button></div>
    <div class="pf2-accesos">
      <button data-a="tab" data-v="citas">${ic('calendario')}<b>${prox}</b><small>${prox === 1 ? 'Próxima cita' : 'Próximas citas'}</small></button>
      <button data-a="tab" data-v="explorar">${ic('corazon')}<b>${S.favoritos.length}</b><small>Favoritos</small></button>
      <button data-a="perfil-resenas">${ic('estrella')}<b>2</b><small>Reseñas</small></button>
    </div>
    <p class="franja pad">Tu cuenta</p>
    <div class="lista-op">${fila('perfil-sobre', 'usuario', 'Sobre mí', 'Lo ven tus profesionales: tipo de pelo, cómo te gusta…')}${fila('perfil-pagos', 'tarjeta', 'Métodos de pago', 'Visa •••• 4242 · Apple Pay')}${fila('perfil-recordatorios', 'campana', 'Notificaciones y recordatorios', 'App + email · 24 h y 1 h antes')}${activa('cuestionario') ? fila('rehacer-prefs', 'diana', 'Tu sitio ideal', S.prefs ? resumenPrefs() : '3 preguntas y te recomendamos sitios') : ''}</div>
    <p class="franja pad">Ajustes</p>
    <div class="lista-op">${fila('perfil-privacidad', 'candado', 'Privacidad y seguridad', S.ajustes.faceid ? 'Face ID activado' : '')}${fila('perfil-app', 'ajustes', 'Ajustes de la app', `Tema ${S.tema}`)}${fila('guia-repetir', 'chispa', 'Ver la guía otra vez')}${fila('perfil-soporte', 'soporte', 'Ayuda')}<button data-a="salir">${ic('salir')}<span>Cerrar sesión</span></button></div>`];
};

/* =====================================================================
   5 · Business · Calendario primero (Día · Semana · Mes con iconos)
   ===================================================================== */
envolver(VISTAS.agenda, 'html', function (orig) {
  const r0 = orig();
  let a = r0[0].replace(/<div class="tarjetas-res">[\s\S]*?<\/div>\s*/, '');
  const nEsp = listaEspera().length, nNot = notisBiz().length - S.leidasBiz;
  const seg = segmento([['dia', ic('vdia')], ['semana', ic('vsemana')], ['mes', ic('vmes')]], S.agendaModo, 'agenda-modo')
    .replace('data-v="dia"', 'data-v="dia" title="Día" aria-label="Día"').replace('data-v="semana"', 'data-v="semana" title="Semana" aria-label="Semana"').replace('data-v="mes"', 'data-v="mes" title="Mes" aria-label="Mes"');
  const pros = [['todos', null], ...EQUIPO.map((p) => [p.id, p])].map(([id, p]) => `<button class="ag-pro" data-a="agenda-pro" data-v="${id}" aria-pressed="${S.agendaPro === id}" title="${p ? p.nombre : 'Todos'}">${p ? `<img src="${p.img}" alt="">` : ic('equipo')}<small>${p ? p.nombre : 'Todos'}</small></button>`).join('');
  const cab = `<div class="ag-cab">
      <div class="ag-fila"><button class="icon-btn" data-a="cal-mover" data-d="-1" aria-label="Anterior">${ic('atras', 'ic-s')}</button><button class="ag-fecha" data-a="cal-hoy" title="Ir a hoy">${tituloCal()}</button><button class="icon-btn" data-a="cal-mover" data-d="1" aria-label="Siguiente">${ic('sig', 'ic-s')}</button>
        <span class="ag-acc"><button class="icon-btn campana" data-a="ir" data-v="espera" aria-label="Lista de espera">${ic('espera')}${nEsp ? `<i class="badge badge--neutro">${nEsp}</i>` : ''}</button><button class="icon-btn campana" data-a="ir" data-v="avisos-biz" aria-label="Notificaciones">${ic('campana')}${nNot > 0 ? `<i class="badge">${nNot}</i>` : ''}</button></span></div>
      <div class="ag-fila ag-fila--2"><div class="ag-seg">${seg}</div><div class="ag-pros">${pros}</div></div>
    </div>`;
  a = a.replace(/<div class="cal-top">[\s\S]*?<div class="chips cal-pros">[\s\S]*?<\/div>/, cab);
  r0[0] = a;
  if (r0[1]) r0[1] = r0[1].replace(/<button class="fab-reservar"[\s\S]*?<\/button>/, `<button class="fab-reservar fab-reservar--ic" data-a="biz-reservar" aria-label="Nueva cita" title="Nueva cita">${ic('agendaMas')}</button>`);
  return r0;
});

/* =====================================================================
   6 · Business · Clientes sin filtros (las faltas, arriba en tarjetas)
   ===================================================================== */
S.cf = { ultima: '', pro: '', serv: '', faltas: false };
envolver(VISTAS.clientes, 'html', function (orig) {
  const r0 = orig();
  let a = r0[0].replace(/<div class="cli-filtros">[\s\S]*?<\/div>/, '');
  if (S.cliFiltro !== 'inasistencias') {
    const hoy = faltasDesde(HOY).length, sem = faltasDesde(lunesDe(HOY)).length, nuevos = clientesDB().filter((c) => c.first).length;
    a = a.replace('<div class="pad"><label class="busca-res">', `<div class="tarjetas-res"><button data-a="tr-faltas" data-v="hoy"><b>${hoy}</b><small>${hoy === 1 ? 'falta' : 'faltas'} hoy</small></button><button data-a="tr-faltas" data-v="semana"><b>${sem}</b><small>faltas esta semana</small></button><button data-a="cli-filtro" data-v="nuevos" class="tr-verde"><b>${nuevos}</b><small>clientes nuevos</small></button></div><div class="pad"><label class="busca-res">`);
  }
  r0[0] = a;
  return r0;
});

/* =====================================================================
   7 · Business · Botón central que se despliega en círculo
   ===================================================================== */
/* Cada acción tiene su pareja en la app del cliente: Cámara → Feed · Muro → muro de la ficha · Nueva cita → Mis citas ·
   Mensajes → chat de la cita · Tablón → aviso arriba de la ficha. (Los huecos libres se publican tocando el hueco en el calendario.) */
const RADIAL = [['camara', 'Cámara', 'camara-abrir'], ['muro', 'Muro', 'radial-muro'], ['agendaMas', 'Nueva cita', 'biz-reservar'], ['chat', 'Mensajes', 'radial-chat'], ['tablon', 'Tablón', 'radial-tablon']];
{
  const orig = pintarTabbar;
  pintarTabbar = (visible) => {
    orig(visible);
    $('.radial')?.remove();
    const b = $('#tabbar [data-a="camara-abrir"]');
    if (!b) return;
    b.dataset.a = 'radial';
    b.setAttribute('aria-label', 'Acciones rápidas');
    b.querySelector('.orbe').innerHTML = ic('mas');
  };
}
function abrirRadial() {
  if ($('.radial')) return cerrarRadial();
  const el = document.createElement('div');
  el.className = 'radial';
  el.innerHTML = `<button class="radial__velo" data-a="radial-cerrar" aria-label="Cerrar"></button><button class="radial__x" data-a="radial-cerrar" aria-label="Cerrar">${ic('mas')}</button>${RADIAL.map(([icono, t, a], i) => {
    const ang = ((162 - i * 36) * Math.PI) / 180, r = 138;
    return `<button class="radial__it" data-a="${a}" data-radial="1" aria-label="${t}" style="--x:${(Math.cos(ang) * r).toFixed(1)}px;--y:${(-Math.sin(ang) * r).toFixed(1)}px;--d:${i * 28}ms"><span>${ic(icono)}</span><small>${t}</small></button>`;
  }).join('')}`;
  $('#screen').appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  $('#tabbar .tab--cam')?.classList.add('abierto');
}
function cerrarRadial() {
  const el = $('.radial');
  $('#tabbar .tab--cam')?.classList.remove('abierto');
  if (!el) return;
  el.classList.remove('on');
  setTimeout(() => el.remove(), 260);
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-radial]')) cerrarRadial(); }, true);

/* =====================================================================
   8 · Business · Pagos: protección contra inasistencias y pago en la app
   ===================================================================== */
VISTAS.pagos = { padre: 'ajustes', html() {
  const P = S.pagosV;
  const t = (k, l, d) => `<div class="ajuste"><span><b>${l}</b><small>${d}</small></span><button class="switch" role="switch" aria-checked="${!!P[k]}" data-a="pv-sw" data-k="${k}" aria-label="${l}"></button></div>`;
  const ej = serv('corte');
  const vista = P.proteccion ? `Clientes ${P.aQuien === 'todos' ? 'todos' : P.aQuien === 'nuevos' ? 'nuevos o con faltas' : 'con faltas'}: <b>«Dejar una señal de ${eur(P.senalTipo === 'pct' ? Math.round(ej.precio * P.senal) / 100 : P.senal)}»</b> (se descuenta y se devuelve si cancela hasta ${S.cancelHoras} h antes).` : `<b>«Pagar en el local»</b>${P.app ? ' o <b>«Pagar ahora»</b>' : ''}.`;
  return sub('Pagos', `<div class="pad form-hoja" style="padding-top:0">
    ${t('local', 'Pago en el local', 'Efectivo, tarjeta o Bizum al terminar')}
    ${t('app', 'Pago por adelantado en la app', 'El cliente puede pagar al reservar (Apple Pay, Google Pay, tarjeta)')}
    <div class="proteccion ${P.proteccion ? 'on' : ''}">
      <div class="ajuste"><span><b>${ic('escudo', 'ic-s')} Protección contra inasistencias</b><small>Pide una señal al reservar. Si no viene sin avisar, te la quedas</small></span><button class="switch" role="switch" aria-checked="${P.proteccion}" data-a="pv-sw" data-k="proteccion" aria-label="Protección contra inasistencias"></button></div>
      ${P.proteccion ? `<div class="campo"><label>Señal</label>${segmento([['f5', '5 €'], ['f10', '10 €'], ['p20', '20 %'], ['p50', '50 %']], (P.senalTipo === 'pct' ? 'p' : 'f') + P.senal, 'pv-senal')}</div>
      <div class="campo"><label>¿A quién se la pedimos?</label>${segmento([['todos', 'A todos'], ['nuevos', 'Nuevos'], ['faltas', 'Con faltas']], P.aQuien, 'pv-quien')}</div>
      <p class="faint small">Los clientes de confianza nunca pagan señal. Se devuelve si cancelan hasta ${S.cancelHoras} h antes (Política de citas).</p>` : ''}
    </div>
    <div class="campo"><label>Así lo ve el cliente al reservar</label><p class="nota-com">${vista}</p></div>
    <div class="pago"><div><b>Cuenta donde cobras</b><small>ES•• •••• •••• 1234 · cobros cada 2 días</small></div>${ic('sig', 'ic-s')}</div>
    <p class="faint small">Los datos de tarjeta los guarda la pasarela de pago (Stripe), nunca IMAGO.</p></div>`, 'Cómo te pagan tus clientes y cómo te proteges de los que no vienen.');
} };

/* =====================================================================
   9 · Business · Ajustes como Booksy (con nuestras funciones)
   ===================================================================== */
VISTAS.ajustes.html = function () {
  const n = NEGOCIOS[0], yo = S.perfiles.javi, f = filaAj;
  const grupo = (t, filas) => `<p class="franja pad">${t}</p><div class="lista-op">${filas.filter(Boolean).join('')}</div>`;
  const P = S.pagosV;
  return [`<div class="aj2-cab"><span class="aj-portada__logo"><img src="${n.logo}" alt=""></span><div><b>${n.nombre}</b><small>${estrellas(5)} 5,0 · ${n.totalResenas} reseñas</small></div><button class="btn btn--sm btn--ghost" data-a="ver-como-cliente">Ver perfil</button></div>
    <button class="aj-qr" data-a="ir" data-v="qr"><span class="aj-qr__mini">${qrSvg(ENLACE, 2)}</span><span><b>Tu enlace y QR de reservas</b><small>imagocitas.com/sublime</small></span>${ic('sig', 'ic-s')}</button>
    ${grupo('Perfil del negocio', [f('ir', 'tienda', 'Datos del negocio', 'Nombre, categoría, contacto y descripción', 'datos-negocio'), f('ir', 'pin', 'Ubicación', n.direccion, 'ubicacion'), f('ir', 'camara', 'Galería y tráiler', 'Fotos, vídeos y el tráiler de tu ficha', 'galeria'), f('ir', 'estrella', 'Reseñas', `5,0 · ${n.totalResenas} reseñas`, 'resenas-biz')])}
    ${grupo('Servicios', [f('ir', 'tijeras', 'Servicios y productos', `${SERVICIOS.filter((s) => !s.temporal).length} servicios · ${S.productos.length} productos`, 'servicios'), f('ir', 'estrella', 'Servicios temporales', `${temporalesHoy().length} activos · Navidad, Semana Santa…`, 'temporales'), activa('fueraHorario') && f('ir', 'reloj', 'Fuera de horario', '', 'fuera-horario'), activa('bonos') && f('ir', 'recibo', 'Bonos y suscripciones', '', 'bonos')])}
    ${grupo('Equipo', [`<button data-a="mi-perfil" data-v="javi"><img class="aj-yo" src="${pro('javi').img}" alt=""><span>${yo.nombre} ${yo.apellidos}<small>${yo.puesto} · tu perfil, foto y vídeo</small></span>${ic('sig', 'ic-s')}</button>`, f('ir', 'equipo', 'Empleados', EQUIPO.map((p) => p.nombre).join(', '), 'empleados'), f('ir', 'reloj', 'Horario y vacaciones', 'Lunes a sábado · días libres', 'horario')])}
    ${grupo('Reservas online', [f('ir', 'documento', 'Política de citas', `Cancelación gratis hasta ${S.cancelHoras} h antes`, 'politica'), f('ir', 'repetir', 'Asignación de citas', { cliente: 'El cliente elige', carga: 'Al que tenga menos carga', aleatorio: 'Aleatoria', turnos: 'Por turnos' }[S.asignacion], 'asignacion'), f('ir', 'campana', 'Recordatorios', `App + email · 24 h y 1 h${premium() ? ' · WhatsApp' : ''}`, 'recordatorios'), f('ir', 'google', 'Google e Instagram', 'Botón «Reservar» donde te buscan', 'canales')])}
    ${grupo('Pagos', [f('ir', 'tarjeta', 'Pagos y protección contra inasistencias', `${P.app ? 'Local y app' : 'En el local'}${P.proteccion ? ` · señal ${P.senalTipo === 'pct' ? P.senal + ' %' : eur(P.senal)}` : ''}`, 'pagos'), esGerente() && f('ir', 'euro', 'Comisiones', EQUIPO.filter((p) => !p.propietario).map((p) => `${p.nombre} ${p.comisionServicios} %`).join(' · '), 'comisiones')])}
    ${grupo('Clientes y comunicación', [f('ir', 'chat', 'Mensajes', 'Chat de la cita con tus clientes', 'bandeja'), f('ir', 'comentario', 'Muro y novedades', `${S.muro.length} publicaciones`, 'muro-biz'), f('ir', 'megafono', 'Mensaje del tablón', S.aviso && S.aviso.activo ? `Publicado: «${esc(S.aviso.titulo)}»` : 'Ventanita al entrar en tu ficha', 'mensaje-clientes'), f('ir', 'documento', 'Ficha del cliente', `Campos de ${CAMPOS_CAT[S.catFicha].nombre.toLowerCase()}`, 'campos-ficha'), f('biz-notis', 'campana', 'Notificaciones')])}
    ${grupo(esGerente() ? 'Estadísticas' : 'Estadísticas (solo gerente)', [f('ir', 'grafico', 'Estadísticas', 'Facturación, mejores días y meses', 'stats'), f('ir', 'recibo', 'Transacciones', 'Todo lo cobrado', 'transacciones')])}
    ${grupo('Cuenta', [f('ir', 'recibo', 'Suscripción y facturas', `Plan ${PLANES.find((p) => p.id === S.plan).nombre}`, 'suscripcion'), f('ir', 'candado', 'Dispositivos conectados', `${S.dispositivos.length} dispositivos`, 'dispositivos'), f('ir', 'repetir', 'Cámbiate a IMAGO', 'Trae tus clientes y citas sin perder ninguna', 'migracion'), f('ir', 'ajustes', 'Funciones', `${FUNCIONES.filter(([k]) => !activa(k)).length} aparcadas · ocultas, no borradas`, 'funciones'), f('guia-repetir', 'chispa', 'Ver la guía otra vez'), f('eliminar-cuenta', 'papelera', 'Eliminar cuenta')])}
    <div class="pad rol-caja"><p class="franja" style="padding:0 0 8px">Has entrado como</p>${segmento([['gerente', 'Gerente · Javi'], ['empleado', 'Empleado · Adri']], S.rolBiz, 'rol-biz')}</div>
    ${grupo('Ayuda', [f('perfil-soporte', 'soporte', 'Soporte', 'Te respondemos en menos de 1 hora'), f('biz-privacidad', 'escudo', 'Política de privacidad'), `<button data-a="toast" data-t="Sesión cerrada (simulado)">${ic('salir')}<span>Cerrar sesión</span></button>`])}`];
};

/* =====================================================================
   10 · Chat de la cita (cliente ↔ negocio), como el repartidor de Uber Eats
   ===================================================================== */
S.convs = [
  { id: 'yo', nombre: YO.nombre, mensajes: [{ de: 'negocio', quien: 'Javi', t: '¡Hola Marcos! Gracias por venir el otro día 🙌', cuando: 'hace 4 semanas' }, { de: 'cliente', t: '¡A vosotros! Quedó genial', cuando: 'hace 4 semanas' }], noBiz: 0, noCli: 0 },
  { id: 'c-hugo', nombre: 'Hugo García', cita: 'Mañana · 18:00 · Corte + barba con Adri', mensajes: [{ de: 'cliente', t: '¿Puedo llevar una foto del corte que quiero?', cuando: 'hace 10 min' }], noBiz: 1 },
  { id: 'c-pablo', nombre: 'Pablo Romero', cita: 'Hoy · 12:00 · Degradado con Javi', mensajes: [{ de: 'cliente', t: 'Llego 5 minutos tarde, perdón', cuando: 'hace 1 h' }, { de: 'negocio', quien: 'Javi', t: '¡Sin problema! Te esperamos 👍', cuando: 'hace 1 h' }], noBiz: 0 },
];
S.noLeidosCli = 0;
const convDe = (id) => S.convs.find((c) => c.id === id);
function citaYo() { return S.citas.filter((c) => !c.cancelada).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))[0]; }
function txtCita(c) { if (!c) return ''; const s = serv(c.servicio), p = pro(c.pro); return `${mayus(fRel(deK(c.fecha)).toLowerCase())} · ${c.hora} · ${s.nombre} con ${p.nombre}`; }
const RAPIDOS_CLI = ['Llego 5 minutos tarde', 'Ya estoy en la puerta', '¿Puedo llevar una foto de referencia?', 'Necesito cambiar la hora'];
const RAPIDOS_BIZ = ['¡Sin problema!', 'Te esperamos 👍', 'Mándanos la foto por aquí', 'Ahora te llamamos'];
const burbujas = (l, yo) => l.map((m) => `<div class="msg ${m.de === yo ? 'msg--yo' : 'msg--ia'}">${m.de !== yo && m.quien ? `<b class="msg__quien">${esc(m.quien)}</b>` : ''}${esc(m.t)}<small class="msg__h">${m.cuando}</small></div>`).join('');
VISTAS.mensajes = { padre: 'inicio', html() {
  const c = convDe('yo'), ult = c.mensajes.at(-1), cita = citaYo();
  return [`<div class="topbar"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><b>Mensajes</b><span style="width:40px"></span></div>
    <div class="pad"><button class="conv" data-a="chat-cita"><span class="conv__av"><img src="${NEGOCIOS[0].logo}" alt=""></span><span><b>${NEGOCIOS[0].nombre}</b><small>${cita ? `${ic('calendario', 'ic-s')} ${txtCita(cita)}` : esc(ult?.t || '')}</small></span><small>${ult?.cuando || ''}</small>${c.noCli ? `<i class="badge badge--rel">${c.noCli}</i>` : ''}</button>
    <p class="vacio" style="padding-top:20px">Puedes escribir a los negocios donde tienes una cita. Si hay algún problema, te escriben por aquí (sin compartir tu WhatsApp).</p></div>`];
} };
VISTAS['chat-cita'] = { padre: 'citas', tabbar: false, clase: 'view--sinnav', html() {
  const c = convDe('yo'); c.noCli = 0; S.noLeidosCli = 0;
  const cita = citaYo(), s = cita && serv(cita.servicio), p = cita && pro(cita.pro);
  return [`<div class="chat2 pad">
      ${cita ? `<div class="chat2-cita"><img src="${p.img}" alt=""><span><small>Tu cita</small><b>${s.nombre} con ${p.nombre}</b><em>${mayus(fLarga(deK(cita.fecha)))} · ${cita.hora}</em></span><button class="icon-btn" data-a="toast" data-t="Se abriría el mapa con la ruta" aria-label="Cómo llegar">${ic('pin')}</button></div>` : ''}
      <div class="chat" id="chat">${burbujas(c.mensajes, 'cliente')}</div></div>`,
    `<div class="chat-cab"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><span class="conv__av"><img src="${NEGOCIOS[0].logo}" alt=""></span><span><b>${NEGOCIOS[0].nombre}</b><small>Suele responder en 10 min</small></span><button class="icon-btn" data-a="toast" data-t="Se abriría el teléfono del negocio" aria-label="Llamar">${ic('telefono')}</button></div>
     <div class="chat-pie"><div class="chat-rapidos">${RAPIDOS_CLI.map((t) => `<button class="chip" data-a="chat2-rapido" data-t="${esc(t)}">${t}</button>`).join('')}</div>
     <form class="chat-input" id="chat2-form" data-quien="cliente" data-conv="yo"><input id="chat2-txt" type="text" placeholder="Escribe al negocio…" autocomplete="off"><button class="icon-btn" type="submit" aria-label="Enviar">${ic('enviar')}</button></form></div>`];
}, montar(capa) { const v = $('.view', capa); v.scrollTop = v.scrollHeight; } };
VISTAS.bandeja = { padre: 'clientes', html() {
  return sub('Mensajes', `<div class="pad">${S.convs.map((c) => { const ult = c.mensajes.at(-1); const cita = c.id === 'yo' ? txtCita(citaYo()) : c.cita; return `<button class="conv" data-a="chat-biz2" data-id="${c.id}"><span class="sil">${ic('usuario')}</span><span><b>${esc(c.nombre)}</b><small>${cita ? `${ic('calendario', 'ic-s')} ${esc(cita)}` : ''}</small><small>${esc(ult?.t || '')}</small></span><small>${ult?.cuando || ''}</small>${c.noBiz ? `<i class="badge badge--rel">${c.noBiz}</i>` : ''}</button>`; }).join('')}</div>`, 'Chat de la cita: tus clientes te escriben si llegan tarde, quieren mandarte una foto o tienen un problema. Sin dar tu WhatsApp.');
} };
VISTAS['chat-biz2'] = { padre: 'clientes', tabbar: false, clase: 'view--sinnav', html() {
  const c = convDe(S.chatSel) || S.convs[0]; c.noBiz = 0;
  const cita = c.id === 'yo' ? txtCita(citaYo()) : c.cita;
  return [`<div class="chat2 pad">${cita ? `<div class="chat2-cita"><span class="sil">${ic('usuario')}</span><span><small>Cita</small><b>${esc(cita)}</b></span></div>` : ''}<div class="chat" id="chat">${burbujas(c.mensajes, 'negocio')}</div></div>`,
    `<div class="chat-cab"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button><span class="sil">${ic('usuario')}</span><span><b>${esc(c.nombre)}</b><small>Cliente</small></span><button class="icon-btn" data-a="toast" data-t="Llamando… (simulado)" aria-label="Llamar">${ic('telefono')}</button></div>
     <div class="chat-pie"><div class="chat-rapidos">${RAPIDOS_BIZ.map((t) => `<button class="chip" data-a="chat2-rapido" data-t="${esc(t)}">${t}</button>`).join('')}</div>
     <form class="chat-input" id="chat2-form" data-quien="negocio" data-conv="${c.id}"><input id="chat2-txt" type="text" placeholder="Responder…" autocomplete="off"><button class="icon-btn" type="submit" aria-label="Enviar">${ic('enviar')}</button></form></div>`];
}, montar(capa) { const v = $('.view', capa); v.scrollTop = v.scrollHeight; } };
function enviarChat2(texto, quien, convId) {
  texto = (texto || '').trim();
  if (!texto) return;
  const v = moderarTexto(texto);
  if (!v.ok) return toast(`No se ha enviado: ${v.motivo}`);
  const c = convDe(convId);
  c.mensajes.push({ de: quien, quien: quien === 'negocio' ? (S.rolBiz === 'empleado' ? 'Adri' : 'Javi') : '', t: texto, cuando: 'ahora' });
  if (quien === 'cliente') {
    c.noBiz++;
    S.notiBiz.unshift({ tipo: 'mensaje', t: `<b>${YO.nombre}</b> os ha escrito: «${esc(texto.slice(0, 60))}»`, cuando: 'ahora' });
    render(null);
    setTimeout(() => { if (S.vista !== 'chat-cita') return; c.mensajes.push({ de: 'negocio', quien: 'Javi', t: /tarde/i.test(texto) ? '¡Sin problema! Te esperamos 👍' : /foto/i.test(texto) ? '¡Claro! Mándala por aquí y lo vemos.' : /cambiar/i.test(texto) ? 'Vale, propón la nueva hora desde «Mis citas» y te la confirmo.' : '¡Recibido! En un momento te contesto.', cuando: 'ahora' }); render(null); }, 1500);
  } else {
    if (c.id === 'yo') { c.noCli++; S.noLeidosCli = c.noCli; S.notiCli.unshift({ ic: 'chat', t: `<b>${NEGOCIOS[0].nombre}</b> te ha escrito: «${esc(texto.slice(0, 60))}»`, cuando: 'ahora' }); }
    render(null);
  }
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'chat2-form') return;
  e.preventDefault();
  enviarChat2($('#chat2-txt').value, e.target.dataset.quien, e.target.dataset.conv);
});
/* Entradas al chat: tarjeta de la cita (cliente), ficha del negocio y hoja de la cita (Business) */
envolver(VISTAS.citas, 'html', function (orig) {
  const r0 = orig();
  r0[0] = r0[0].replace(/(<div class="cita-acciones">[\s\S]*?)(<\/div>)/g, (m, a, b) => `${a}<button data-a="chat-cita">${ic('chat')}Mensaje</button>${b}`);
  return r0;
});
{
  const origSlot = A.slot;
  A.slot = (b) => {
    origSlot(b);
    const t = $('#hoja-gen .hoja__cab b');
    if (!t || t.textContent.startsWith('Hueco libre')) return;
    const wa = $$('#hoja-gen .form-hoja button').find((x) => /WhatsApp/.test(x.textContent));
    if (wa) wa.outerHTML = `<button class="btn btn--ghost btn--block" data-a="chat-nombre" data-n="${esc(t.textContent)}">${ic('chat', 'ic-s')}Mensaje en la app</button>`;
  };
}

/* =====================================================================
   11 · Acciones
   ===================================================================== */
Object.assign(A, {
  'rs-serv': abrirServiciosRsv,
  'rs-serv-ok': (b) => { S.reserva.servicio = b.dataset.v; cerrarHoja(); render(null, { mantenerScroll: true }); },
  'exito-cerrar': () => ir('inicio', { reset: true, dir: 'fundido' }),
  'insp-filtro': (b) => { S.inspFiltro = b.dataset.v; render(null, { mantenerScroll: true }); },
  'insp-ver': (b) => { const l = inspFiltrados(); verVideos(l, b, Math.max(0, l.findIndex((x) => x.id === b.dataset.id))); },
  'insp-guardar': (b) => {
    const id = b.dataset.id, on = !S.guardados.includes(id);
    S.guardados = on ? [...S.guardados, id] : S.guardados.filter((x) => x !== id);
    b.setAttribute('aria-pressed', on);
    const xg = itemsInsp().find((y) => y.id === id), cg = b.querySelector('span');
    if (xg && cg) cg.textContent = cuentaGuard(xg);
    if (on && !reducido) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    toast(on ? 'Guardado: tu profesional lo verá en tu ficha' : 'Quitado de guardados');
  },
  'ver-guardados': () => { S.inspFiltro = 'guardados'; ir('inspiracion', { reset: true, dir: 'fundido' }); },
  'feed-estilos': abrirEstilosFeed,
  'feed-estilo-ok': (b) => { cerrarHoja(); S.inspFiltro = b.dataset.v; render(null); },
  'feed-like': (b) => {
    const id = b.dataset.id, on = !S.likes.includes(id);
    S.likes = on ? [...S.likes, id] : S.likes.filter((x) => x !== id);
    b.setAttribute('aria-pressed', on);
    const x = itemsInsp().find((y) => y.id === id);
    if (x) b.querySelector('span').textContent = cuentaLikes(x);
    if (on && !reducido) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  },
  'feed-toque': (b) => {
    const sec = b.closest('.feed'), ahora = Date.now();
    if (ahora - toqueFeed < 300) {
      toqueFeed = 0;
      clearTimeout(sec._t);
      const lk = sec.querySelector('[data-a="feed-like"]');
      if (lk.getAttribute('aria-pressed') !== 'true') A['feed-like'](lk);
      return corazonFeed(sec);
    }
    toqueFeed = ahora;
    sec._t = setTimeout(() => { const v = sec.querySelector('video'); if (!v) return; if (v.paused) { v.play().catch(() => {}); sec.classList.remove('pausado'); } else { v.pause(); sec.classList.add('pausado'); } }, 280);
  },
  'feed-seguir': () => {
    const id = NEGOCIOS[0].id, on = !S.favoritos.includes(id);
    S.favoritos = on ? [...S.favoritos, id] : S.favoritos.filter((x) => x !== id);
    toast(on ? `Sigues a ${NEGOCIOS[0].nombre}: verás sus vídeos en «Siguiendo»` : `Ya no sigues a ${NEGOCIOS[0].nombre}`);
    render(null, { mantenerScroll: true });
  },
  'perfil-soporte': () => A.ia({ dataset: {} }),
  radial: abrirRadial,
  'radial-cerrar': cerrarRadial,
  'radial-muro': () => { S.bp = null; ir('muro-biz'); },
  'radial-chat': () => ir('bandeja'),
  'radial-tablon': () => ir('mensaje-clientes'),
  'chat-cita': () => { if (!citaYo()) return toast('Podrás escribir al negocio cuando tengas una cita'); ir('chat-cita'); },
  'chat-abrir': () => A['chat-cita'](),
  'chat-biz': (b) => { S.chatSel = b.dataset.id; ir('chat-biz2'); },
  'chat-biz2': (b) => { S.chatSel = b.dataset.id; ir('chat-biz2'); },
  'chat-nombre': (b) => {
    cerrarHoja();
    const n = b.dataset.n;
    let c = S.convs.find((x) => norm(x.nombre).startsWith(norm(n)) || norm(n).startsWith(norm(x.nombre.split(' ')[0])));
    if (!c) { c = { id: 'c' + Date.now(), nombre: n, cita: `${fRel(S.agendaFecha || HOY)} · cita en la agenda`, mensajes: [], noBiz: 0 }; S.convs.unshift(c); }
    S.chatSel = c.id;
    setTimeout(() => ir('chat-biz2'), 200);
  },
  'cli-sms': () => { const c = clientesDB().find((x) => x.id === S.clienteSel); A['chat-nombre']({ dataset: { n: c.nombre } }); },
  'chat2-rapido': (b) => { const f = $('#chat2-form'); if (f) enviarChat2(b.dataset.t, f.dataset.quien, f.dataset.conv); },
  'pv-sw': (b) => { const k = b.dataset.k; S.pagosV[k] = !S.pagosV[k]; if (!S.pagosV.local && !S.pagosV.app) S.pagosV.local = true; render(null, { mantenerScroll: true }); },
  'pv-senal': (b) => { const v = b.dataset.v; S.pagosV.senalTipo = v[0] === 'p' ? 'pct' : 'fijo'; S.pagosV.senal = +v.slice(1); moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'pv-quien': (b) => { S.pagosV.aQuien = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
});
/* El aviso de mensajes del cliente cuenta los no leídos del chat de la cita */
{
  const orig = campanaCli;
  campanaCli = () => orig().replace(/(data-v="mensajes"[^>]*>[\s\S]*?<\/svg>)(<i class="badge">\d+<\/i>)?/, (m, a) => `${a}${S.noLeidosCli ? `<i class="badge">${S.noLeidosCli}</i>` : ''}`);
}

/* =====================================================================
   12 · Guía y atajos
   ===================================================================== */
GUIAS.negocio.pasos = [
  ['.ag-cab', 'Tu calendario', 'Lo primero. Cambia entre día, semana y mes con los iconos y filtra por profesional.'],
  ['.fab-reservar', 'Nueva cita', 'Primero el cliente y luego el servicio. También tocando un hueco libre.'],
  ['[data-a="radial"]', 'Acciones rápidas', 'Se despliega en círculo: cámara, muro, nueva cita, mensajes y tablón.'],
  ['[data-a="tab"][data-v="ajustes"]', 'Ajustes', 'Como Booksy: perfil, servicios, equipo, reservas, pagos y clientes.'],
];
Object.assign(DEMOS, {
  v2Reserva: () => { S.pagosV.aQuien = 'nuevos'; S.reserva.pago = 'local'; abrirApp('cliente', 'inicio'); S.historial = ['inicio']; empezarReserva({ servicio: 'combo' }); },
  v2Senal: () => { S.pagosV.proteccion = true; S.pagosV.aQuien = 'todos'; abrirApp('cliente', 'inicio'); S.historial = ['inicio']; empezarReserva({ servicio: 'corte' }); },
  v2Inspiracion: () => { S.inspFiltro = 'todo'; abrirApp('cliente', 'inspiracion'); render(null); },
  v2Feed: () => { S.inspFiltro = 'todo'; abrirApp('cliente', 'inspiracion'); render(null); },
  v2Perfil: () => abrirApp('cliente', 'perfil'),
  v2Muro: () => { abrirApp('cliente', 'inicio'); S.tabFicha = 'muro'; S.historial = ['inicio']; ir('negocio'); },
  v2ChatCli: () => { abrirApp('cliente', 'citas'); if (!citaYo()) { citaDemo(); render(null); } setTimeout(() => ir('chat-cita'), 300); },
  v2Agenda: () => { S.agendaModo = 'dia'; S.agendaFecha = HOY; abrirApp('negocio', 'agenda'); render(null); },
  v2Radial: () => { S.agendaModo = 'dia'; abrirApp('negocio', 'agenda'); render(null); setTimeout(abrirRadial, 1800); },
  v2ChatBiz: () => { abrirApp('negocio', 'clientes'); ir('bandeja'); },
  v2Pagos: () => { abrirApp('negocio', 'ajustes'); ir('pagos'); },
  v2Ajustes: () => { abrirApp('negocio', 'ajustes'); render(null); },
  v2Clientes: () => { S.cliFiltro = 'todos'; abrirApp('negocio', 'clientes'); render(null); },
  v2Sitio: () => { abrirApp('cliente', 'inicio'); A['rehacer-prefs'](); },
});
aplicarFlags();

/* Feed por estilos: el estilo lo elige el negocio al publicar (pareja en Business) */
envolver(VISTAS.camara, 'html', function (orig) {
  const r0 = orig();
  const C = S.cam || {};
  const sel = `<div class="campo"><label for="cam-estilo">Estilo <span class="faint">(filtro del Feed)</span></label><div class="select-v1"><select id="cam-estilo">${ESTILOS.map((x) => `<option ${C.estilo === x ? 'selected' : ''}>${x}</option>`).join('')}</select>${ic('baja', 'ic-s')}</div></div>`;
  r0[0] = r0[0].replace('<div class="campo"><label for="cam-txt">', sel + '<div class="campo"><label for="cam-txt">');
  return r0;
});
document.addEventListener('change', (e) => { if (e.target.id === 'cam-estilo' && S.cam) S.cam.estilo = e.target.value; });
{
  const pub = A['cam-publicar'];
  A['cam-publicar'] = (b) => {
    const est = (S.cam && S.cam.estilo) || ESTILOS[0], antes = S.subidos.length;
    pub(b);
    if (S.subidos.length > antes) ESTILO_TRABAJO[String(S.subidos[0].id)] = est;
  };
}

/* =====================================================================
   13 · Entrada como Zalando: la «o» sale en el centro, se abre hacia ti y llena la pantalla de su color
   (un aro liso y un disco con el mismo centro, para que todo crezca desde el mismo punto)
   ===================================================================== */
splash = function (m) {
  const el = $('#splash');
  clearTimeout(splash.t); clearTimeout(splash.t2);
  el.className = `splash sp2 sp2--${S.colorMarca}`;
  el.innerHTML = `<span class="sp2__g"><i class="sp2__lleno"></i><i class="sp2__o"></i></span>${m === 'negocio' ? '<small class="sp2__biz">Business</small>' : ''}`;
  el.hidden = false;
  splash.t = setTimeout(() => {
    el.classList.add('sale');
    splash.t2 = setTimeout(() => { el.hidden = true; el.className = 'splash'; }, 380);
  }, reducido ? 450 : 1500);
};
