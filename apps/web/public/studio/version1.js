'use strict';
/* IMAGO · Versión 1 sin IA (13/10/2026, 2.ª ronda)
   Vuelve el aspecto y la organización de antes (Inicio · Explorar · Inspiración · Citas · Perfil y
   Calendario · Clientes · [cámara] · Caja · Ajustes), muy inspirado en Booksy, con las novedades buenas:
   - Sin IA de pago: tarjetas resumen y filtros en su lugar. Lo aparcado se oculta con un interruptor (no se borra).
   - Ficha del negocio: al entrar, los servicios (por grupos, con «Reservar») y, del tirón, el tablón,
     los servicios temporales y los huecos libres.
   - Business: botón central de cámara para grabar o subir vídeos (estilo TikTok) que ven los clientes en el Feed.
   - Reservar desde Business a pantalla completa: primero el cliente y después el servicio en un desplegable.
   - Ajustes agrupados por lo que se va a hacer (servicios temporales con los servicios, tablón con el muro…).
   - Regla: todo lo que ve el cliente tiene su pareja en Business para crearlo o gestionarlo. */

Object.assign(ICON, { mascota: ICON_CAT.perros });

/* =====================================================================
   1 · Interruptores (feature flags): ocultar sin borrar
   ===================================================================== */
const FUNCIONES = [
  ['iaCliente', 'Asistente IA para clientes', 'Pedir cita hablando y «pregúntale a la IA»', 'IA'],
  ['iaNegocio', 'Asistente IA del negocio', 'IA gerente e IA empleado. Sustituida por tarjetas resumen y filtros', 'IA'],
  ['cuestionario', 'Tu sitio ideal (3 preguntas)', 'Recomienda sitios con reglas sencillas, sin IA', 'Clientes'],
  ['agendaIA', 'Agenda inteligente', 'La IA ordena la agenda', 'IA'],
  ['recepcionista', 'Recepcionista IA', 'WhatsApp, Instagram y llamadas', 'IA'],
  ['automatizaciones', 'Automatizaciones', '«Ya te toca» y ofertas en días flojos (ahora: huecos libres)', 'IA'],
  ['resumenResenas', 'Resumen de reseñas con IA', 'Fase 3: una vez por semana, con 10 reseñas o más', 'IA'],
  ['subidaClientes', 'Los clientes suben vídeos', 'Necesita moderación con IA', 'IA'],
  ['intercambio', 'Intercambio de citas entre clientes', 'En la v1 solo se propone una hora libre', 'Clientes'],
  ['bonos', 'Bonos y club', '', 'Clientes'],
  ['regalos', 'Tarjetas regalo', '', 'Clientes'],
  ['chat', 'Chat de la cita (cliente ↔ negocio)', 'Como el repartidor de Uber Eats: solo con quien tiene cita', 'Clientes'],
  ['idiomas', 'Idiomas', '', 'Clientes'],
  ['propinas', 'Propinas y cobro con el móvil', '', 'Business'],
  ['fueraHorario', 'Reservar fuera de horario', '', 'Business'],
  ['marketing', 'Marketing', '', 'Business'],
  ['recompensas', 'Recompensas IMAGO', '', 'Business'],
  ['fichaTecnica', 'Ficha técnica, antes/después y firmas', '', 'Business'],
];
S.flags = Object.fromEntries(FUNCIONES.map(([k]) => [k, ['cuestionario', 'chat'].includes(k)]));
try { Object.assign(S.flags, JSON.parse(localStorage.getItem('imago-flags-v2') || '{}')); } catch {}
const activa = (k) => !!S.flags[k];
function aplicarFlags() {
  FUNCIONES.forEach(([k]) => document.body.classList.toggle('sin-' + k, !activa(k)));
  if (!activa('fueraHorario') && S.fh) S.fh.activo = false;
  try { localStorage.setItem('imago-flags-v2', JSON.stringify(S.flags)); } catch {}
}

/* =====================================================================
   2 · Barra inferior. Business: el botón del centro es la cámara
   ===================================================================== */
{
  const orig = pintarTabbar;
  pintarTabbar = (visible) => {
    if (S.modo !== 'negocio' || activa('iaNegocio')) return orig(visible);
    const tb = $('#tabbar');
    const items = [['agenda', 'Calendario', 'agenda'], ['clientes', 'Clientes', 'equipo'], ['cam'], ['caja', 'Caja', 'caja'], ['ajustes', 'Ajustes', 'ajustes']];
    const actual = VISTAS[S.vista]?.padre || S.vista;
    tb.innerHTML = items.map(([v, txt, icono]) => v === 'cam'
      ? `<button class="tab tab--orbe tab--cam" data-a="camara-abrir" aria-label="Grabar o subir un vídeo"><span class="orbe orbe--cam">${ic('camara')}</span></button>`
      : `<button class="tab" data-a="tab" data-v="${v}" ${actual === v ? 'aria-current="page"' : ''}>${ic(icono)}<span>${txt}</span></button>`).join('');
    tb.classList.toggle('oculta', !visible);
    tb.classList.remove('tabbar--4');
  };
}

/* =====================================================================
   3 · Lo que publica el negocio (para el tablón, el Inicio y «Fotos que me gustan»)
   ===================================================================== */
Object.assign(S, { huecosPub: [], avisosHoy: 0, guardados: S.guardados || [] });
const SERV_TRABAJO = { 'retrato-con-barba': 'combo', claroscuro: 'color', oleo: 'mechas' };
const servDeReel = (r) => r.servicio || SERV_TRABAJO[String(r.id).replace(/^r-/, '')] || 'corte';
function huecosActivos() { return S.huecosPub.filter((h) => libres(h.pro, deK(h.fecha)).includes(h.hora)); } // se retiran solos al ocuparse o pasar la hora
const temporalesHoy = () => (typeof temporalesActivos === 'function' ? temporalesActivos().filter((s) => s.temporal.hasta >= kF(HOY)) : []);
function guardadosItems() {
  const todos = [...S.subidos.filter((x) => !x.cliente).map((x) => ({ id: x.id, img: x.img, video: x.video, pro: x.pro, texto: x.texto, servicio: x.servicio })),
    ...TRABAJOS.map((t) => ({ id: 'r-' + t.id, img: t.img, video: t.video, pro: t.pro, texto: t.titulo, servicio: servDeReel({ id: t.id }) }))];
  return todos.filter((x) => S.guardados.includes(x.id));
}

/* =====================================================================
   4 · Ficha del negocio (estilo Booksy): servicios primero y, del tirón, tablón, temporales y huecos
   ===================================================================== */
const GRUPO_SERV = { corte: 'Cortes', combo: 'Cortes', degradado: 'Cortes', largo: 'Cortes', barba: 'Barba', mechas: 'Color', color: 'Color', nino: 'Niños y mayores', senior: 'Niños y mayores' };
const ORDEN_GRUPOS = ['Cortes', 'Barba', 'Color', 'Niños y mayores', 'Otros servicios'];
function gruposServicios() {
  const g = new Map(ORDEN_GRUPOS.map((x) => [x, []]));
  SERVICIOS.filter((s) => !s.temporal).forEach((s) => g.get(GRUPO_SERV[s.id] || 'Otros servicios').push(s));
  return [...g.entries()].filter(([, l]) => l.length);
}
function filaServicio(s, extra = '') {
  return `<div class="sv-fila">
    <button class="serv-fila__img" data-a="${s.temporal ? 'reservar-temporal' : 'reservar'}" data-s="${s.id}" aria-label="${esc(s.nombre)}"><img src="${s.img}" alt="" loading="lazy">${s.video ? `<video data-auto data-src="${s.video}" muted loop playsinline preload="none"></video><span class="vid-ic">${ic('play', 'ic-s')}</span>` : ''}</button>
    <span class="sv-fila__txt"><b>${s.nombre}</b><p>${s.desc}</p><small>${ic('reloj', 'ic-s')}${s.min} min${s.tag ? ` · ${s.tag}` : ''}${extra}</small></span>
    <span class="sv-fila__der"><b>${eur(s.precio)}</b><button class="btn btn--sm sv-btn" data-a="${s.temporal ? 'reservar-temporal' : 'reservar'}" data-s="${s.id}">Reservar</button></span>
  </div>`;
}
{
  const origPanel = panelFicha;
  panelFicha = () => {
    if (S.tabFicha === 'servicios') {
      const tmp = temporalesHoy();
      return (tmp.length ? `<p class="sv-grupo sv-grupo--temp">${ic('estrella', 'ic-s')}Temporada · ${rangoTemporal(tmp[0])}</p>${tmp.map((s) => filaServicio(s, ' · solo esos días')).join('')}` : '')
        + gruposServicios().map(([t, l]) => `<p class="sv-grupo">${t}<small>${l.length}</small></p>${l.map((s) => filaServicio(s)).join('')}`).join('');
    }
    if (S.tabFicha === 'trabajos') {
      const nuevos = S.subidos.filter((x) => !x.cliente);
      const base = origPanel();
      if (!nuevos.length) return base;
      return base.replace('<div class="trabajos-grid">', `<div class="trabajos-grid">${nuevos.map((t) => `<button class="trabajo" data-a="ver-subido" data-id="${t.id}">${t.img ? `<img src="${t.img}" alt="" loading="lazy">` : ''}${t.video ? `<video data-auto data-src="${t.video}" muted loop playsinline preload="none"></video>` : ''}<span>${esc(t.texto)}</span></button>`).join('')}`);
    }
    return origPanel();
  };
}
function htmlDelTiron() {
  const tmp = temporalesHoy(), hs = huecosActivos();
  if (!tmp.length && !hs.length) return '';
  return `<div class="tiron"><div class="fila-scroll tiron__fila">${hs.map((x) => `<button class="hueco-chip" data-a="hueco-pub" data-id="${x.id}"><small>${ic('calendario', 'ic-s')}Hueco libre</small><b>${x.hora}</b><small>${fRel(deK(x.fecha))} · ${pro(x.pro).nombre}</small></button>`).join('')}${tmp.map((s) => `<button class="temp-card" data-a="reservar-temporal" data-s="${s.id}"><img src="${s.img}" alt=""><span><small>${ic('estrella', 'ic-s')}Temporada</small><b>${s.nombre}</b><small>${eur(s.precio)} · ${rangoTemporal(s)}</small></span></button>`).join('')}</div></div>`;
}
envolver(VISTAS.negocio, 'html', function (orig) {
  let [a, b] = orig();
  if (!activa('iaCliente')) a = a.replace(/<span class="pill">[^]*?IA 24\/7<\/span>/, '');
  a = a.replace(/(<div class="pad avisos-ficha">[\s\S]*?<\/div>)/, (m) => (m.includes('class="aviso"') ? m.replace('<div class="pad avisos-ficha">', `<div class="pad avisos-ficha"><p class="tiron__t">${ic('megafono', 'ic-s')}Tablón del negocio</p>`) : m) + `<div class="pad">${htmlDelTiron()}</div>`);
  return [a, b];
});

/* =====================================================================
   5 · Inicio: «Reservar de nuevo» en 1 toque, ofertas de verdad, colores por categoría y buscador sin IA
   ===================================================================== */
function repetirSugerencia() {
  const ult = [...S.pasadas].sort((a, b) => b.fecha - a.fecha)[0];
  if (!ult) return null;
  for (let i = 0; i < 21; i++) {
    const d = addD(HOY, i);
    const l = libres(ult.pro, d);
    if (!l.length) continue;
    const h = l.includes(ult.hora) ? ult.hora : l.find((x) => Math.abs(minH(x) - minH(ult.hora)) <= 90);
    if (h) return { s: ult.servicio, p: ult.pro, f: d, h };
  }
  const ph = proximoHueco(ult.pro);
  return ph ? { s: ult.servicio, p: ult.pro, f: ph.fecha, h: ph.hora } : null;
}
function htmlRepetir() {
  const r = repetirSugerencia();
  if (!r) return '';
  const s = serv(r.s), p = pro(r.p);
  const dia = ['Hoy', 'Mañana'].includes(fRel(r.f)) ? fRel(r.f).toLowerCase() : r.f.toLocaleDateString('es-ES', { weekday: 'long' });
  return `<button class="repetir-card" data-a="repetir-ya" data-s="${r.s}" data-p="${r.p}" data-f="${kF(r.f)}" data-h="${r.h}">
    <img src="${p.img}" alt=""><span><small>${ic('repetir', 'ic-s')} Reservar de nuevo</small><b>Tu ${s.nombre.toLowerCase()} con ${p.nombre}, ${dia} ${r.h}</b><em>${eur(s.precio)} · solo tienes que confirmar</em></span>${ic('sig')}</button>`;
}
function ofertasSublime() {
  const n = NEGOCIOS[0];
  return [...huecosActivos().map((x) => `<button class="oferta oferta--real" data-a="hueco-pub" data-id="${x.id}"><img src="${n.portada}" alt=""><span class="pill pill--glass">Hueco libre</span><b>${mayus(fRel(deK(x.fecha)).toLowerCase())} · ${x.hora}</b><small>${n.nombre} · con ${pro(x.pro).nombre}</small></button>`),
    ...temporalesHoy().map((s) => `<button class="oferta oferta--real" data-a="reservar-temporal" data-s="${s.id}"><img src="${s.img}" alt=""><span class="pill pill--glass">Temporada</span><b>${s.nombre}</b><small>${n.nombre} · ${eur(s.precio)}</small></button>`)].join('');
}
envolver(VISTAS.inicio, 'html', function (orig) {
  const r0 = orig(); let [a] = r0;
  if (!activa('iaCliente')) {
    a = a.replace(/(<button class="buscador"[^>]*>\s*)<span class="orbe orbe--sm">[\s\S]*?<\/svg><\/span>/, `$1<span class="buscador__lupa">${ic('buscar')}</span>`)
      .replace('<span class="faint">Busca o pídeselo a la IA:</span>', '<span class="faint">Busca:</span>');
  }
  if (!activa('cuestionario')) a = a.replace(/<div class="seccion-t pad"><h2>Recomendados para ti<\/h2>[\s\S]*?(?=<div class="seccion-t pad"><h2>Cerca de ti<\/h2>)/, '');
  a = conMarco(a, '<div class="seccion-t pad"><h2>Tus favoritos</h2>', `<div class="pad" style="margin-top:14px">${htmlRepetir()}</div>`);
  a = a.replace('<div class="seccion-t pad"><h2>Ofertas especiales</h2></div>\n      <div class="fila-scroll">', `<div class="seccion-t pad"><h2>Ofertas especiales</h2></div>\n      <div class="fila-scroll">${ofertasSublime()}`);
  // Cada categoría con su color (el mismo que toma el fondo al entrar en ella)
  a = a.replace(/<button class="cat" role="listitem" data-a="cat" data-c="([a-z]+)"><span class="cat__ic">/g, (m, c) => { const p = PALETAS[c] || PALETAS.todo; return m.replace('<span class="cat__ic">', `<span class="cat__ic cat__ic--color" style="--k1:${p[0]};--k2:${p[1]}">`); });
  return [a, ...r0.slice(1)];
});
if (!activa('iaCliente')) FRASES.splice(0, FRASES.length, 'degradado', 'Sublime Barber Studio', 'uñas semipermanentes', 'barbería cerca de mí', 'masaje de espalda');

/* =====================================================================
   6 · Reservar (como Booksy): servicio → con quién y a qué hora → confirmar
   ===================================================================== */
{
  const orig = empezarReserva;
  empezarReserva = (o = {}) => { orig(o); S.reserva.proElegido = !!(o.pro && o.pro !== 'any'); };
}
{
  const sig = A['paso-sig'];
  A['paso-sig'] = (b) => {
    const R = S.reserva;
    if (R.paso === 0 && R.servicio && R.fecha && R.hora) return irPaso(R.proElegido ? 3 : 2);
    if (R.paso === 1 && R.proElegido) return irPaso(3);
    return sig(b);
  };
}
{
  const origPaso = htmlPaso;
  htmlPaso = (dir) => {
    let h = origPaso(dir);
    const R = S.reserva;
    if (R.paso === 0) {
      const f = R.fecha ? deK(R.fecha) : HOY;
      const fila = `<div class="cal-pros-v1" role="group" aria-label="Con quién">${[['any', 'Cualquiera'], ...EQUIPO.map((p) => [p.id, p.nombre])].map(([id, n]) => {
        const p = id === 'any' ? null : pro(id), vac = p && enVacaciones(id, f);
        const on = (R.pro || 'any') === id;
        return `<button class="cal-pro ${on ? 'on' : ''}" data-a="cal-pro" data-p="${id}" aria-pressed="${on}"><span class="cal-pro__foto">${p ? `<img src="${p.img}" alt="">` : ic('equipo')}</span><small>${n}${vac ? ' · vac.' : ''}</small></button>`;
      }).join('')}</div>`;
      h = h.replace('<div class="cal" id="cal">', `${fila}<div class="cal" id="cal">`);
    }
    if (R.paso === 3) {
      h = h.replace('<div class="seccion-t" style="margin-top:24px"><h2>¿Cómo quieres pagar?</h2></div>', `<button class="link cambiar-pro" data-a="ir-paso" data-n="2">${ic('equipo', 'ic-s')}Cambiar de profesional</button><div class="seccion-t" style="margin-top:18px"><h2>¿Cómo quieres pagar?</h2></div>`);
      h = h.replace('Te recordamos la cita por WhatsApp 24 h antes.', 'Te la recordamos 24 h y 1 h antes, por notificación y por email.');
      if (!activa('fichaTecnica')) h = h.replace(/<div class="seccion-t" style="margin-top:24px"><h2>Consentimiento<\/h2><\/div>[\s\S]*?data-a="firma-borrar">Borrar<\/button><\/div>/, '');
    }
    if (R.paso === 1 && !activa('iaCliente')) h = h.replace(/<button class="consejo" data-a="ia"[\s\S]*?<\/button>/, '');
    return h;
  };
  const origHoras = htmlHoras;
  htmlHoras = () => { const h = origHoras(); return activa('iaCliente') ? h : h.split(orbe('orbe--sm')).join(`<span class="sug-ic">${ic('reloj')}</span>`); };
}
envolver(VISTAS.reserva, 'html', function (orig) {
  const r = orig();
  if (!activa('iaCliente')) r[1] = r[1].replace(`${orbe('orbe--sm')}Ayuda`, `${ic('soporte', 'ic-s')}Ayuda`);
  return r;
});
if (!activa('iaCliente')) S.guiaVista = true;
A['ir-paso'] = (b) => irPaso(+b.dataset.n, 'atras');
A['cal-pro'] = (b) => {
  const R = S.reserva;
  R.pro = b.dataset.p; R.proElegido = b.dataset.p !== 'any'; R.hora = null;
  autoDia();
  $$('.cal-pro').forEach((x) => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  $('#cal').innerHTML = htmlCal(); $('#horas').innerHTML = htmlHoras(); pintarPie();
};
A['reservar-temporal'] = (b) => { const s = serv(b.dataset.s); empezarReserva({ servicio: s.id, fecha: s.temporal.desde > kF(HOY) ? s.temporal.desde : kF(HOY) }); };
A['hueco-pub'] = (b) => { const x = S.huecosPub.find((h) => h.id === b.dataset.id); if (x) empezarReserva({ servicio: x.servicio, pro: x.pro, fecha: x.fecha, hora: x.hora }); };
A['repetir-ya'] = (b) => empezarReserva({ servicio: b.dataset.s, pro: b.dataset.p, fecha: b.dataset.f, hora: b.dataset.h });

/* Ayuda sin IA */
{
  const origIA = A.ia;
  A.ia = (b) => {
    if ((S.modo === 'cliente' && activa('iaCliente')) || (S.modo === 'negocio' && activa('iaNegocio'))) return origIA(b);
    if (S.modo === 'negocio') return hojaGenerica('Ayuda', 'IMAGO Business', `<div class="form-hoja">
      <div class="ayuda-paso"><b>Reservar a un cliente</b><p>Botón «+ Reservar» del calendario o toca un hueco libre.</p></div>
      <div class="ayuda-paso"><b>Subir un vídeo</b><p>Botón de la cámara, abajo en el centro. Sale en el Feed y en tu ficha.</p></div>
      <div class="ayuda-paso"><b>Publicar un hueco libre</b><p>Toca el hueco en el calendario → «Publicar este hueco».</p></div>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Soporte: te escribimos por WhatsApp en menos de 1 hora (laborables)">${ic('soporte', 'ic-s')}Hablar con soporte</button></div>`);
    hojaGenerica('Ayuda', 'Cómo reservar en IMAGO', `<div class="form-hoja">
      <div class="ayuda-pasos"><div><b>1</b><span>Elige el servicio</span></div><div><b>2</b><span>Con quién y a qué hora</span></div><div><b>3</b><span>Confirma</span></div></div>
      <div class="ayuda-paso"><b>¿Y si no hay hueco?</b><p>Apúntate a la lista de espera: si alguien cancela, te avisamos al momento.</p></div>
      <div class="ayuda-paso"><b>¿Puedo cambiarla o cancelarla?</b><p>Sí, desde «Citas». Gratis hasta ${S.cancelHoras || 4} h antes.</p></div>
      <div class="ayuda-paso"><b>¿Me la recordáis?</b><p>Sí: 24 h y 1 h antes, por notificación y por email.</p></div>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Se abriría el teléfono del negocio">${ic('telefono', 'ic-s')}Llamar al negocio</button></div>`);
  };
}

/* =====================================================================
   7 · Inspiración (vídeos a pantalla completa): «Quiero esto» y Guardados
   ===================================================================== */
{
  const orig = htmlReel;
  htmlReel = (r) => orig(r).replace(/(<div class="reel__info">[\s\S]*?<\/p>)/, `$1<button class="btn btn--sm reel__cta reel__quiero" data-a="reel-quiero" data-s="${servDeReel(r)}" data-p="${r.pro || ''}">Quiero esto · reservar</button>`);
}
envolver(VISTAS.inspiracion, 'html', function (orig) {
  const r = orig();
  r[1] = r[1].replace('<div class="reels-cab__fila"><h1>Feed</h1></div>', `<div class="reels-cab__fila"><h1>Feed</h1><button class="chip chip--glass" data-a="ver-guardados">${ic('guardar', 'ic-s')}Guardados${S.guardados.length ? ` · ${S.guardados.length}` : ''}</button></div>`);
  return r;
});
function abrirGuardados() {
  const l = guardadosItems();
  hojaGenerica('Guardados', 'Lo que te gusta: tus profesionales lo ven en tu ficha', l.length ? `<div class="gusta-fotos pad" style="padding-bottom:10px">${l.map((x) => `<button data-a="guardado-ver" data-id="${x.id}"><img src="${x.img}" alt=""></button>`).join('')}</div>` : `<div class="vacio">${ic('guardar')}Aún no has guardado nada. Toca «Guardar» en el Feed.</div>`);
}
function verVideos(lista, origen, inicio = 0) {
  if (!lista.length) return;
  const segs = lista.map((x) => ({ video: x.video, poster: x.img, kicker: x.pro ? `Por ${pro(x.pro).nombre} · ${NEGOCIOS[0].nombre}` : NEGOCIOS[0].nombre, titulo: x.texto, pro: x.pro, servicio: x.servicio }));
  abrirVisor(segs, origen, { titulo: NEGOCIOS[0].nombre, sub: 'Trabajos', ctaTexto: 'Quiero esto', inicio, onCta: () => { const s = TR.segs[TR.i]; cerrarVisor(); empezarReserva({ servicio: s.servicio || 'corte', pro: s.pro || null }); } });
}

/* =====================================================================
   8 · Business · Calendario: tarjetas resumen y huecos libres en 1 toque
   ===================================================================== */
function seedInasistencias() {
  if (S.inaSemilla) return;
  S.inaSemilla = true;
  for (let d = lunesDe(HOY); d <= HOY; d = addD(d, 1)) {
    if (d.getDay() === 0) continue;
    EQUIPO.forEach((p, j) => {
      const pas = HORAS.filter((h) => (d < HOY || minH(h) + 30 <= MIN_AHORA) && !libresBase(p.id, d).has(h));
      if (!pas.length || rng(hash('ina' + kF(d) + p.id))() > (esHoy(d) ? 0.9 : 0.55)) return;
      const h = pas[Math.floor(rng(hash('inah' + kF(d) + j))() * pas.length)];
      const c = citaGenerada(p.id, d, h);
      const cli = clientesDB().find((x) => !x.yo && norm(x.nombre).startsWith(norm(c.cliente)));
      S.inasistencias.push({ nombre: cli ? cli.nombre : c.cliente, id: cli?.id, fecha: d, hora: h, servicio: c.servicio.nombre, pro: p.id });
    });
  }
}
function faltasDesde(desde, pr = 'todos') { seedInasistencias(); return todasInasistencias().filter((x) => x.fecha >= desde && (pr === 'todos' || x.pro === pr)); }
const huecosLibresHoy = () => (HOY.getDay() === 0 ? 0 : EQUIPO.reduce((a, p) => a + libres(p.id, HOY).length, 0));
envolver(VISTAS.agenda, 'html', function (orig) {
  const r0 = orig(); const [a] = r0;
  if (activa('iaNegocio')) return r0;
  const hoy = faltasDesde(HOY).length, sem = faltasDesde(lunesDe(HOY)).length, hu = huecosLibresHoy();
  const tarjetas = `<div class="tarjetas-res">
    <button data-a="tr-faltas" data-v="hoy"><b>${hoy}</b><small>${hoy === 1 ? 'falta' : 'faltas'} hoy</small></button>
    <button data-a="tr-faltas" data-v="semana"><b>${sem}</b><small>faltas esta semana</small></button>
    <button data-a="tr-huecos" class="tr-verde"><b>${hu}</b><small>huecos libres hoy</small></button></div>`;
  return [a.replace('<div class="cal-nav">', `${tarjetas}<div class="cal-nav">`), ...r0.slice(1)];
});
function abrirHuecosLibres(d = HOY) {
  const filas = EQUIPO.map((p) => {
    const l = libres(p.id, d);
    return `<div class="hl-pro"><div class="hl-pro__cab"><img src="${p.img}" alt=""><b>${p.nombre}</b><small>${l.length} libres</small></div>
      <div class="horas">${l.length ? l.map((h) => { const pub = S.huecosPub.some((x) => x.pro === p.id && x.fecha === kF(d) && x.hora === h); return `<button class="hora ${pub ? 'on' : ''}" data-a="pub-hueco" data-p="${p.id}" data-f="${kF(d)}" data-h="${h}" ${pub ? 'disabled' : ''}>${h}${pub ? ' ✓' : ''}</button>`; }).join('') : '<span class="faint small">Sin huecos</span>'}</div></div>`;
  }).join('');
  hojaGenerica('Huecos libres', `${mayus(fLarga(d))} · toca uno para publicarlo`, `<div class="form-hoja">${filas}
    <p class="nota-com">Al publicar un hueco, sale en tu ficha (arriba, del tirón) y en «Ofertas especiales» del Inicio, con su botón para reservar. Se retira solo cuando alguien lo coge o pasa la hora. ${S.avisosHoy ? 'Hoy ya avisaste a tus seguidores: saldrá sin notificación.' : `Además avisamos a tus ${S.seguidoresAvisos} seguidores (1 aviso al día como máximo).`}</p></div>`);
}
function publicarHueco(p, f, h) {
  if (S.huecosPub.some((x) => x.pro === p && x.fecha === f && x.hora === h)) return;
  S.huecosPub.unshift({ id: 'h-' + p + f + h, pro: p, fecha: f, hora: h, servicio: 'corte', creado: new Date() });
  let avisados = false;
  if (S.avisosHoy < 1) {
    S.avisosHoy++; avisados = true;
    S.notiCli.unshift({ ic: 'calendario', t: `<b>${NEGOCIOS[0].nombre}</b>: hueco libre ${fRel(deK(f)).toLowerCase()} a las ${h} con ${pro(p).nombre}.`, cuando: 'ahora' });
  }
  toast(`Hueco publicado en tu ficha${avisados ? ` · avisados ${S.seguidoresAvisos} seguidores` : ' · hoy ya avisaste (máx. 1 al día): sale sin notificación'}`);
}
{
  const origSlot = A.slot;
  A.slot = (b) => {
    origSlot(b);
    const t = $('#hoja-gen .hoja__cab b');
    if (!t || !t.textContent.startsWith('Hueco libre')) return;
    const d = S.agendaFecha || HOY;
    if (d < HOY) return;
    const ancla = $('#hoja-gen [data-a="nr-hueco"]');
    const btn = `<button class="btn btn--ghost btn--block" data-a="pub-hueco" data-p="${b.dataset.p}" data-f="${kF(d)}" data-h="${b.dataset.h}" data-cerrar="1">${ic('megafono', 'ic-s')}Publicar este hueco</button>`;
    if (ancla) ancla.insertAdjacentHTML('afterend', btn); else $('#hoja-gen .form-hoja')?.insertAdjacentHTML('afterbegin', btn);
    $$('#hoja-gen [data-t="Aviso enviado a la lista de espera por WhatsApp"]').forEach((x) => (x.dataset.t = 'Aviso enviado a la lista de espera (app + email)'));
  };
}

/* =====================================================================
   9 · Business · Clientes: inasistencias con filtros y buscador con filtros
   ===================================================================== */
Object.assign(S, { inaPer: 'semana', inaPro: 'todos', cf: { ultima: '', pro: '', serv: '', faltas: false } });
const metaCli = new Map();
function datosCli(c) {
  if (!metaCli.has(c.id)) {
    const { pas } = historialCliente(c);
    const hechas = pas.filter((x) => x.estado !== 'no-vino');
    metaCli.set(c.id, { ultima: hechas[0]?.fecha || null, servs: new Set(pas.map((x) => x.servicio.id)), pros: new Set(pas.map((x) => x.pro)) });
  }
  return metaCli.get(c.id);
}
function htmlInasistencias() {
  const per = S.inaPer, pr = S.inaPro;
  const desde = per === 'hoy' ? HOY : per === 'semana' ? lunesDe(HOY) : per === 'mes' ? new Date(HOY.getFullYear(), HOY.getMonth(), 1) : new Date(2000, 0, 1);
  const q = norm(S.cliBusca.trim());
  const l = faltasDesde(desde, pr).filter((x) => !q || norm(x.nombre).includes(q));
  const perdido = l.reduce((a, x) => a + (SERVICIOS.find((s) => s.nombre === x.servicio)?.precio || 0), 0);
  const quien = clientesDB().filter((c) => c.noShows > 0).sort((a, b) => b.noShows - a.noShows).slice(0, 6);
  return `<div class="chips ina-chips">${[['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['todas', 'Todas']].map(([id, t]) => `<button class="chip" data-a="ina-per" data-v="${id}" aria-pressed="${per === id}">${t}</button>`).join('')}</div>
    <div class="chips ina-chips">${[['todos', 'Todos'], ...EQUIPO.map((p) => [p.id, p.nombre])].map(([id, t]) => `<button class="chip" data-a="ina-pro" data-v="${id}" aria-pressed="${pr === id}">${t}</button>`).join('')}</div>
    <div class="ina-res"><div><b>${l.length}</b><small>${l.length === 1 ? 'falta' : 'faltas'}</small></div><div><b>${new Set(l.map((x) => x.nombre)).size}</b><small>clientes</small></div><div><b>${eur(perdido)}</b><small>sin cobrar</small></div></div>
    ${l.length ? l.map((x) => `<div class="ina-fila"><button class="cli" data-a="cliente" data-id="${x.id || ''}" ${x.id ? '' : 'disabled'}><span class="ina-fecha"><b>${x.fecha.getDate()}</b><small>${x.fecha.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</small></span><span class="cli__txt"><b>${esc(x.nombre)}</b><small>${x.hora} · ${esc(x.servicio)} · ${pro(x.pro).nombre}</small></span></button><button class="btn btn--sm btn--ghost" data-a="ina-escribir" data-n="${esc(x.nombre)}" data-f="${kF(x.fecha)}">${ic('mensaje', 'ic-s')}Escribir</button></div>`).join('') : `<div class="vacio">${ic('check')}Nadie ha faltado en este periodo.</div>`}
    <p class="franja">Quién falta más</p>
    ${quien.map((c) => `<button class="cli" data-a="cliente" data-id="${c.id}">${sil()}<span class="cli__txt"><b>${esc(c.nombre)}</b><small>${c.visitas} visitas · ${c.tel}</small></span><span class="cli__tags">${c.bloqueado ? insignias(c) : ''}<span class="ina-n">${c.noShows}</span></span></button>`).join('')}`;
}
listaClientes = () => {
  if (S.cliFiltro === 'inasistencias') return htmlInasistencias();
  const q = norm(S.cliBusca.trim()), f = S.cliFiltro, F = S.cf;
  const l = clientesDB().filter((c) => {
    if (q && !(norm(c.nombre).includes(q) || c.tel.replace(/\s/g, '').includes(q.replace(/\s/g, '')))) return false;
    if (!(f === 'todos' || (f === 'nuevos' && c.first) || (f === 'confianza' && c.confianza) || (f === 'bloqueados' && c.bloqueado))) return false;
    if (F.faltas && !c.noShows) return false;
    if (F.ultima || F.pro || F.serv) {
      const m = datosCli(c);
      if (F.ultima && m.ultima && (HOY - m.ultima) / 864e5 < +F.ultima) return false;
      if (F.ultima && !m.ultima && !c.first) return false;
      if (F.pro && c.proFav !== F.pro && !m.pros.has(F.pro)) return false;
      if (F.serv && !m.servs.has(F.serv)) return false;
    }
    return true;
  });
  if (!l.length) return `<div class="vacio">${ic('equipo')}Ningún cliente coincide con esos filtros.</div>`;
  let letra = '';
  const filtrando = F.ultima || F.pro || F.serv || F.faltas;
  return (filtrando ? `<p class="faint small" style="margin:10px 0 0">${l.length} clientes con esos filtros</p>` : '') + l.map((c) => {
    const L0 = norm(c.nombre.charAt(0)).toUpperCase();
    const sep = L0 !== letra ? `<p class="franja">${(letra = L0)}</p>` : '';
    const m = filtrando ? datosCli(c) : null;
    const extra = m ? (m.ultima ? ` · última visita ${haceCuanto(m.ultima)}` : ' · sin visitas') + (c.noShows ? ` · ${c.noShows} faltas` : '') : '';
    return `${sep}<button class="cli" data-a="cliente" data-id="${c.id}">${sil()}<span class="cli__txt"><b>${esc(c.nombre)}</b><small>${c.first ? 'Primera reserva' : `${c.visitas} visitas · ${c.tel}`}${extra}</small></span><span class="cli__tags">${insignias(c)}</span></button>`;
  }).join('');
};
envolver(VISTAS.clientes, 'html', function (orig) {
  const r0 = orig(); const [a] = r0;
  if (S.cliFiltro === 'inasistencias') return r0;
  const F = S.cf, op = (v, t, x) => `<option value="${v}" ${x === v ? 'selected' : ''}>${t}</option>`;
  const filtros = `<div class="cli-filtros">
    <select data-cf="ultima" aria-label="Última visita">${op('', 'Última visita: cualquiera', F.ultima)}${op('30', 'Sin venir +30 días', F.ultima)}${op('60', 'Sin venir +60 días', F.ultima)}${op('90', 'Sin venir +90 días', F.ultima)}</select>
    <select data-cf="pro" aria-label="Profesional">${op('', 'Profesional: todos', F.pro)}${EQUIPO.map((p) => op(p.id, p.nombre, F.pro)).join('')}</select>
    <select data-cf="serv" aria-label="Servicio">${op('', 'Servicio: todos', F.serv)}${SERVICIOS.filter((s) => !s.temporal).map((s) => op(s.id, s.nombre, F.serv)).join('')}</select>
    <button class="chip" data-a="cf-faltas" aria-pressed="${F.faltas}">Con faltas</button></div>`;
  return [a.replace('<div id="lista-cli">', `${filtros}<div id="lista-cli">`), ...r0.slice(1)];
});
document.addEventListener('change', (e) => { const k = e.target.dataset?.cf; if (!k) return; S.cf[k] = e.target.value; const l = $('#lista-cli'); if (l) l.innerHTML = listaClientes(); });
A.cobrar = (b) => (activa('propinas') ? abrirCobro() : cobrarTicket(b));

/* =====================================================================
   10 · Business · Reservar a pantalla completa: primero el cliente, luego el servicio (desplegable)
   ===================================================================== */
function nrNuevo(pre = {}) {
  const base = S.agendaFecha && S.agendaFecha >= HOY && S.agendaFecha.getDay() !== 0 ? S.agendaFecha : HOY.getDay() === 0 ? addD(HOY, 1) : HOY;
  S.nr = { cliente: pre.cliente || null, nuevo: null, busca: '', pro: pre.pro || (S.agendaPro !== 'todos' ? S.agendaPro : 'javi'), fecha: pre.fecha || kF(base), hora: pre.hora || null, otraHora: false, servicios: [], eligiendo: true, dur: null, precio: null, nota: '', whatsapp: true };
  nrProDisponible();
}
abrirReservaBiz = (pre = {}) => {
  nrNuevo(pre);
  cerrarHoja();
  if (S.vista === 'nueva-cita') render(null); else ir('nueva-cita');
};
pintarNR = () => { if (S.vista === 'nueva-cita' && S.nr) render(null, { mantenerScroll: true }); };
nrResultados = () => {
  const crudo = S.nr.busca.trim();
  const q = norm(crudo), qt = crudo.replace(/\D/g, '');
  const fila = (c) => `<button class="nr-res" data-a="nr-cli" data-id="${c.id}">${sil()}<span><b>${esc(c.nombre)}</b><small>${c.tel}${c.visitas ? ` · ${c.visitas} visitas` : ''}</small></span><span class="nr-tags">${insignias(c)}</span></button>`;
  if (q) {
    const l = clientesDB().filter((c) => norm(c.nombre).includes(q) || (qt.length > 2 && c.tel.replace(/\D/g, '').includes(qt)));
    return `${l.map(fila).join('')}${!l.length ? '<p class="muted small" style="margin:10px 0">No hay ningún cliente con ese nombre o teléfono.</p>' : ''}
      <button class="nr-res nr-res--nuevo" data-a="nr-nuevo">${ic('mas')}<span><b>Crear cliente «${esc(crudo)}»</b><small>Se guarda en Clientes como nuevo (FIRST)</small></span></button>`;
  }
  const hab = [...clientesDB()].sort((a, b) => b.visitas - a.visitas).slice(0, 5);
  let letra = '';
  return `<p class="franja">Habituales</p>${hab.map(fila).join('')}<p class="franja">Todos los clientes</p>${clientesDB().map((c) => { const L0 = norm(c.nombre.charAt(0)).toUpperCase(); const sep = L0 !== letra ? `<small class="nc-letra">${(letra = L0)}</small>` : ''; return sep + fila(c); }).join('')}`;
};
VISTAS['nueva-cita'] = {
  clase: 'view--sinnav',
  tabbar: false,
  html() {
    if (!S.nr) nrNuevo();
    const N = S.nr;
    const elegir = !N.cliente && !N.nuevo;
    const cab = `<header class="nc-cab"><button class="icon-btn" data-a="nc-cerrar" aria-label="Cerrar">${ic('cerrar')}</button><b>${elegir ? 'Elige el cliente' : 'Nueva cita'}</b><span class="nc-paso">${elegir ? '1 de 2' : '2 de 2'}</span></header>`;
    if (elegir) {
      return [`<div class="nc pad">
        <div class="nr-busca nc-busca">${ic('buscar', 'ic-s')}<input id="nr-busca" type="search" value="${esc(N.busca)}" placeholder="Escribe el nombre o el teléfono" autocomplete="off"></div>
        <button class="nc-nuevo" data-a="nc-nuevo-cli"><span class="nc-nuevo__ic">${ic('mas')}</span><span><b>Cliente nuevo</b><small>Nombre y teléfono, y listo</small></span>${ic('sig', 'ic-s')}</button>
        <div id="nr-res">${nrResultados()}</div></div>`, cab];
    }
    const d = deK(N.fecha), tramos = nrTramos(), servs = nrServ(), probs = nrProblemas();
    let dias = '';
    for (let i = 0; i < 21; i++) {
      const x = addD(HOY, i);
      if (x.getDay() === 0) continue;
      const o = ocupacion(x, [pro(N.pro)]), vac = enVacaciones(N.pro, x);
      dias += `<button class="nr-dia ${kF(x) === N.fecha ? 'on' : ''}" data-a="nr-dia" data-f="${kF(x)}"><small>${i === 0 ? 'Hoy' : i === 1 ? 'Mañ.' : x.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</small><b>${x.getDate()}</b><i>${vac ? 'vac.' : o ? o.pct + '%' : ''}</i></button>`;
    }
    const horas = HORAS.map((h) => {
      const pasada = esHoy(d) && minH(h) <= MIN_AHORA, c = ocupada(N.pro, d, h);
      const cls = [N.hora === h ? 'on' : '', tramos.includes(h) && N.hora !== h ? 'cubre' : '', c ? 'ocu' : ''].join(' ');
      return `<button class="nr-hora ${cls}" data-a="nr-hora" data-h="${h}" ${pasada || enVacaciones(N.pro, d) ? 'disabled' : ''}>${h}${c ? `<small>${esc(c.cliente.split(' ')[0])}</small>` : ''}</button>`;
    }).join('');
    const aMedida = N.otraHora || (N.hora && !HORAS.includes(N.hora));
    const fin = N.hora ? hm(minH(N.hora) + nrDur()) : '';
    const campoServ = (s, i) => `<div class="nc-campo-fila"><button class="nc-campo" data-a="nc-serv" data-i="${i}"><span><small>Servicio${servs.length > 1 ? ` ${i + 1}` : ''}</small><b>${s.nombre}</b><em>${s.min} min · ${eur(s.precio)}</em></span><span class="nc-flecha">${ic('baja')}</span></button><button class="icon-btn" data-a="nr-quitar" data-i="${i}" aria-label="Quitar ${s.nombre}">${ic('cerrar', 'ic-s')}</button></div>`;
    return [`<div class="nc pad">
      <section class="nc-sec"><p class="nc-t">Cliente</p>${htmlNRCliente()}</section>
      <section class="nc-sec"><p class="nc-t">Servicio</p>
        ${servs.map(campoServ).join('')}
        ${servs.length ? `<button class="nc-mas" data-a="nc-serv" data-i="${servs.length}">${ic('mas', 'ic-s')}Añadir otro servicio</button>` : `<button class="nc-campo nc-campo--vacio" data-a="nc-serv" data-i="0"><span><small>Servicio</small><b>Elige un servicio</b></span><span class="nc-flecha">${ic('baja')}</span></button>`}
      </section>
      <section class="nc-sec"><p class="nc-t">Profesional</p>
        <div class="nr-pros">${EQUIPO.map((p) => `<button class="nr-pro ${N.pro === p.id ? 'on' : ''}" data-a="nr-pro" data-v="${p.id}"><img src="${p.img}" alt=""><span>${p.nombre}${enVacaciones(p.id, d) ? '<small>De vacaciones</small>' : ''}</span></button>`).join('')}</div></section>
      <section class="nc-sec"><p class="nc-t">Día y hora de inicio</p>
        <div class="nr-dias">${dias}</div>
        <div class="nr-horas">${horas}<button class="nr-hora ${aMedida ? 'on' : ''}" data-a="nr-otra-hora">Otra hora</button></div>
        ${probs.length ? `<div class="nr-aviso">${ic('alerta', 'ic-s')}<div>${probs.map((p) => `<span>${esc(p)}</span>`).join('')}</div></div>` : ''}
        ${aMedida ? `<div class="campo nr-otra"><label>Hora exacta de inicio</label><input id="nr-hora-libre" type="time" step="300" min="09:00" max="21:00" value="${N.hora && !HORAS.includes(N.hora) ? N.hora : ''}"></div>` : ''}
      </section>
      ${servs.length ? `<section class="nc-sec"><p class="nc-t">Duración y precio</p>
        <div class="nr-ajuste"><button class="icon-btn" data-a="nr-dur" data-d="-15" aria-label="Menos tiempo">${ic('menos', 'ic-s')}</button><span><b>${nrDur()} min</b><small>${N.dur == null ? 'Según los servicios' : 'Personalizada'}${N.hora ? ` · de ${N.hora} a ${fin}` : ''}</small></span><button class="icon-btn" data-a="nr-dur" data-d="15" aria-label="Más tiempo">${ic('mas', 'ic-s')}</button></div>
        <div class="nr-ajuste"><button class="icon-btn" data-a="nr-precio" data-d="-1" aria-label="Bajar precio">${ic('menos', 'ic-s')}</button><span><b>${eur(nrPrecio())}</b><small>${N.precio == null ? 'Precio de los servicios' : 'Precio personalizado'}</small></span><button class="icon-btn" data-a="nr-precio" data-d="1" aria-label="Subir precio">${ic('mas', 'ic-s')}</button></div>
        ${N.dur != null || N.precio != null ? '<button class="link" data-a="nr-reset">Volver a la duración y el precio de los servicios</button>' : ''}</section>` : ''}
      <section class="nc-sec"><p class="nc-t">Más opciones</p>
        <div class="campo"><label>Nota interna <span class="faint">(solo la ve el equipo)</span></label><textarea class="nota-campo" id="nr-nota" placeholder="Ej.: quiere probar degradado bajo">${esc(N.nota)}</textarea></div>
        <div class="ajuste"><span><b>Avisar al cliente</b><small>Notificación + email, y recordatorios 24 h y 1 h antes</small></span><button class="switch" role="switch" aria-checked="${N.whatsapp}" data-a="nr-wa" aria-label="Avisar al cliente"></button></div>
      </section></div>`,
    `${cab}<footer class="nc-pie" id="nr-pie">${htmlNRPie(probs)}</footer>`];
  },
  montar(capa) { if (!S.nr.cliente && !S.nr.nuevo) setTimeout(() => $('#nr-busca', capa)?.focus(), 350); },
};
function abrirSelectorServicio(i) {
  const actual = S.nr.servicios[i];
  const grupos = [...(temporalesHoy().length ? [['Temporada', temporalesHoy()]] : []), ...gruposServicios()];
  const abierto = actual ? grupos.findIndex(([, l]) => l.some((s) => s.id === actual)) : grupos.findIndex(([t]) => t !== 'Temporada');
  hojaGenerica('Elige el servicio', 'Toca un grupo para abrirlo', `<div class="form-hoja selector-serv">${grupos.map(([t, l], j) => `<details ${j === Math.max(0, abierto) ? 'open' : ''}><summary><b>${t}</b><small>${l.length} ${l.length === 1 ? 'servicio' : 'servicios'}</small><span class="nc-flecha">${ic('baja')}</span></summary>
    ${l.map((s) => `<button class="sel-serv ${s.id === actual ? 'on' : ''}" data-a="nc-serv-ok" data-v="${s.id}" data-i="${i}"><span><b>${s.nombre}</b><small>${s.min} min</small></span><b>${eur(s.precio)}</b></button>`).join('')}</details>`).join('')}</div>`);
}

/* =====================================================================
   11 · Business · Cámara: grabar o subir un vídeo (estilo TikTok) para Inspiración y la ficha
   ===================================================================== */
let camStream = null, camRec = null, camT = 0;
function pararCamara() {
  try { if (camRec && camRec.state !== 'inactive') { camRec.onstop = null; camRec.stop(); } } catch {}
  camRec = null; clearInterval(camT);
  if (camStream) { camStream.getTracks().forEach((t) => t.stop()); camStream = null; }
}
const nuevaCam = () => ({ modo: 'video', paso: 'grabar', url: null, tipo: null, poster: null, pro: S.rolBiz === 'empleado' ? 'adri' : null, servicio: 'corte', texto: '', avisar: S.avisosHoy < 1, facing: 'environment', sinCamara: false });
VISTAS.camara = {
  clase: 'view--full view--sinnav view--cam',
  tabbar: false,
  html() {
    const C = S.cam || (S.cam = nuevaCam());
    if (C.paso === 'publicar') {
      const grupos = gruposServicios();
      return [`<div class="cam-pub">
        <header class="nc-cab"><button class="icon-btn" data-a="cam-repetir" aria-label="Repetir">${ic('atras')}</button><b>Publicar</b><span style="width:40px"></span></header>
        <div class="cam-pub__prev">${C.tipo === 'video' ? `<video src="${C.url}" autoplay loop muted playsinline></video>` : `<img src="${C.url}" alt="">`}</div>
        <div class="pad form-hoja">
          <div class="campo"><label>¿Quién lo ha hecho?</label><div class="chips">${EQUIPO.map((p) => `<button class="chip" data-a="cam-pro" data-v="${p.id}" aria-pressed="${C.pro === p.id}" ${S.rolBiz === 'empleado' && p.id !== 'adri' ? 'disabled' : ''}><img src="${p.img}" alt="">${p.nombre}</button>`).join('')}</div></div>
          <div class="campo"><label for="cam-serv">Servicio <span class="faint">(el cliente lo reserva con «Quiero esto»)</span></label><div class="select-v1"><select id="cam-serv">${grupos.map(([t, l]) => `<optgroup label="${t}">${l.map((s) => `<option value="${s.id}" ${C.servicio === s.id ? 'selected' : ''}>${s.nombre} · ${eur(s.precio)}</option>`).join('')}</optgroup>`).join('')}</select>${ic('baja', 'ic-s')}</div></div>
          <div class="campo"><label for="cam-txt">Texto</label><input id="cam-txt" type="text" maxlength="150" value="${esc(C.texto)}" placeholder="Ej.: Degradado bajo con textura arriba" style="text-transform:none"></div>
          <div class="ajuste"><span><b>Avisar a tus seguidores</b><small>${S.avisosHoy ? 'Hoy ya avisaste (máx. 1 al día): saldrá sin notificación' : `${S.seguidoresAvisos} seguidores · 1 aviso al día como máximo`}</small></span><button class="switch" role="switch" aria-checked="${C.avisar && !S.avisosHoy}" data-a="cam-avisar" aria-label="Avisar a tus seguidores" ${S.avisosHoy ? 'disabled' : ''}></button></div>
          <label class="check-l"><input type="checkbox" id="cam-ok"> El cliente ha dado permiso para publicarlo</label>
          <button class="btn btn--primary btn--block" data-a="cam-publicar">${ic('subir', 'ic-s')}Publicar</button>
          <p class="faint small">Sale en el Feed (a pantalla completa, con «Quiero esto»), en tu ficha (Trabajos) y en tu galería.</p>
        </div></div>`];
    }
    return [`<div class="cam">
      <video class="cam__vid ${C.facing === 'user' ? 'espejo' : ''}" id="cam-vid" autoplay muted playsinline></video>
      <div class="cam__top"><button class="icon-btn icon-btn--glass" data-a="cam-cerrar" aria-label="Cerrar">${ic('cerrar')}</button><span class="cam__tiempo" id="cam-t">${C.modo === 'video' ? '0:00 / 1:00' : 'Foto'}</span><button class="icon-btn icon-btn--glass" data-a="cam-girar" aria-label="Cambiar de cámara">${ic('repetir')}</button></div>
      <div class="cam__sin" id="cam-sin" ${C.sinCamara ? '' : 'hidden'}>${ic('camara')}<b>No podemos abrir la cámara</b><small>Da permiso a la cámara en el navegador o elige un vídeo de tu galería.</small><button class="btn btn--sm btn--primary" data-a="cam-ejemplo">Usar un vídeo de ejemplo</button></div>
      <div class="cam__pie">
        <label class="cam__galeria" aria-label="Elegir de la galería">${ic('subir')}<input type="file" id="cam-file" accept="video/*,image/*" hidden></label>
        <button class="cam__rec cam__rec--${C.modo}" data-a="cam-rec" aria-label="${C.modo === 'video' ? 'Grabar' : 'Hacer foto'}"><i></i></button>
        <button class="cam__ej" data-a="cam-ejemplo">Ejemplo</button>
      </div>
      <div class="cam__modos">${[['video', 'Vídeo'], ['foto', 'Foto']].map(([k, t]) => `<button data-a="cam-modo" data-v="${k}" aria-pressed="${C.modo === k}">${t}</button>`).join('')}</div>
    </div>`];
  },
  montar(capa) {
    limpiezas.push(pararCamara);
    const C = S.cam;
    if (C.paso !== 'grabar') return;
    $('#cam-file', capa).addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; pararCamara(); Object.assign(C, { url: URL.createObjectURL(f), tipo: f.type.startsWith('video') ? 'video' : 'imagen', paso: 'publicar' }); render(null); });
    const v = $('#cam-vid', capa);
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) { C.sinCamara = true; $('#cam-sin', capa).hidden = false; return; }
    const pedir = (audio) => md.getUserMedia({ video: { facingMode: C.facing, width: { ideal: 1080 }, height: { ideal: 1920 } }, audio });
    pedir(C.modo === 'video').catch(() => pedir(false)).then((st) => { if (S.vista !== 'camara') { st.getTracks().forEach((t) => t.stop()); return; } camStream = st; v.srcObject = st; C.sinCamara = false; }).catch(() => { C.sinCamara = true; const s = $('#cam-sin'); if (s) s.hidden = false; });
  },
};
function grabarCamara(btn) {
  const C = S.cam;
  if (camRec) { camRec.stop(); return; }
  if (!camStream || typeof MediaRecorder === 'undefined') return toast('Aquí no se puede grabar: elige un vídeo de la galería o usa el ejemplo');
  const tipo = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'].find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
  const trozos = [];
  camRec = new MediaRecorder(camStream, tipo ? { mimeType: tipo } : {});
  camRec.ondataavailable = (e) => e.data.size && trozos.push(e.data);
  camRec.onstop = () => { clearInterval(camT); const blob = new Blob(trozos, { type: tipo || 'video/webm' }); camRec = null; pararCamara(); Object.assign(C, { url: URL.createObjectURL(blob), tipo: 'video', paso: 'publicar' }); render(null); };
  camRec.start();
  const t0 = Date.now();
  btn.classList.add('grabando');
  camT = setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    const t = $('#cam-t'); if (t) t.textContent = `0:${String(s).padStart(2, '0')} / 1:00`;
    btn.style.setProperty('--p', Math.min(100, (s / 60) * 100) + '%');
    if (s >= 60) camRec?.stop();
  }, 250);
}
function fotoCamara() {
  const v = $('#cam-vid');
  if (!camStream || !v?.videoWidth) return toast('Aquí no se puede hacer la foto: elige una de la galería o usa el ejemplo');
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  pararCamara();
  Object.assign(S.cam, { url: c.toDataURL('image/jpeg', 0.88), tipo: 'imagen', paso: 'publicar' });
  render(null);
}
document.addEventListener('input', (e) => { if (e.target.id === 'cam-txt' && S.cam) S.cam.texto = e.target.value; });
document.addEventListener('change', (e) => { if (e.target.id === 'cam-serv' && S.cam) S.cam.servicio = e.target.value; });

/* La subida del negocio desde la galería tampoco pasa por la IA en la v1 (se publica al momento) */
{
  const pubOrig = A['subida-publicar'];
  A['subida-publicar'] = (b) => {
    if (S.modo !== 'negocio' || activa('subidaClientes')) return pubOrig(b);
    const s = S.subida;
    if (!s.url) return toast('Elige primero una foto o un vídeo');
    if (!s.pro) return toast('Elige quién lo ha hecho');
    if (!$('#f-ok').checked) return toast('Confirma que el cliente ha dado permiso');
    const texto = ($('#f-texto').value || '').trim();
    const v = moderarTexto(texto);
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    S.subidos.unshift({ id: 'up' + Date.now(), video: s.tipo === 'video' ? s.url : null, img: s.tipo === 'imagen' ? s.url : s.poster || null, pro: s.pro, negocio: NEGOCIOS[0].nombre, texto: texto || 'Nuevo trabajo en el estudio', fecha: new Date(), servicio: 'corte', cliente: false });
    cerrarHoja(); render(null, { mantenerScroll: true });
    toast('Publicado: ya sale en el Feed y en tu ficha');
  };
}
/* Avisos a seguidores: máximo 1 al día por negocio */
{
  const pub = A['bp-publicar'];
  A['bp-publicar'] = (b) => {
    const quiere = S.bp?.avisar, puede = S.avisosHoy < 1;
    if (quiere && !puede) S.bp.avisar = false;
    pub(b);
    if (quiere && puede) S.avisosHoy++;
    if (quiere && !puede) setTimeout(() => toast('Publicado. Hoy ya avisaste a tus seguidores (máx. 1 al día): sale sin notificación'), 50);
  };
}

/* =====================================================================
   12 · Business · Ajustes agrupados por lo que se va a hacer
   ===================================================================== */
VISTAS.ajustes.html = function () {
  const n = NEGOCIOS[0], yo = S.perfiles.javi, f = filaAj;
  const grupo = (t, filas) => `<p class="franja pad">${t}</p><div class="lista-op">${filas.filter(Boolean).join('')}</div>`;
  const niv = activa('recompensas') ? nivelInfo() : null;
  return [`<div class="aj-portada">
      <img class="aj-portada__fondo" src="${IMG}estudio-900.webp" alt="">
      <button class="icon-btn icon-btn--glass aj-portada__editar" data-a="ir" data-v="datos-negocio" aria-label="Editar perfil del negocio">${ic('editar', 'ic-s')}</button>
      <div class="aj-portada__info"><span class="aj-portada__logo"><img src="${n.logo}" alt=""></span><b>${n.nombre}</b><small>${n.direccion}</small><small class="aj-portada__nota">${estrellas(5)} 5,0 · ${n.totalResenas} reseñas</small></div>
    </div>
    ${niv ? `<button class="aj-nivel" data-a="ir" data-v="recompensas"><span class="aj-nivel__ic">${ic('regalo')}</span><span class="aj-nivel__txt"><small>Recompensas ${MARCA}</small><b>Nivel ${niv.nombre} · ${niv.pts.toLocaleString('es-ES')} pts</b></span>${ic('sig', 'ic-s')}</button>` : ''}
    <button class="aj-qr" data-a="ir" data-v="qr"><span class="aj-qr__mini">${qrSvg(ENLACE, 2)}</span><span><b>Tu QR y enlace de reservas</b><small>imagocitas.com/sublime</small></span>${ic('sig', 'ic-s')}</button>
    <p class="franja pad">Mi perfil</p>
    <div class="lista-op"><button data-a="mi-perfil" data-v="javi"><img class="aj-yo" src="${pro('javi').img}" alt=""><span>${yo.nombre} ${yo.apellidos}<small>${yo.puesto} · foto y vídeo de presentación</small></span>${ic('sig', 'ic-s')}</button></div>
    <div class="pad rol-caja"><p class="franja" style="padding:0 0 8px">Has entrado como</p>${segmento([['gerente', 'Gerente · Javi'], ['empleado', 'Empleado · Adri']], S.rolBiz, 'rol-biz')}<p class="faint small" style="margin-top:8px">${esGerente() ? 'Ves todo, también facturación, comisiones y estadísticas.' : 'Agenda, clientes y caja para cobrar. Sin cifras del negocio.'}</p></div>
    ${grupo('Tu negocio', [f('ir', 'tienda', 'Datos del negocio', 'Nombre, contacto y descripción', 'datos-negocio'), f('ir', 'pin', 'Ubicación', n.direccion, 'ubicacion'), f('ir', 'reloj', 'Horario y vacaciones', 'Lunes a sábado · días libres', 'horario'), f('ir', 'equipo', 'Empleados', EQUIPO.map((p) => p.nombre).join(', '), 'empleados'), f('ir', 'camara', 'Galería y tráiler', 'Fotos, vídeos y el tráiler de tu ficha', 'galeria')])}
    ${grupo('Servicios', [f('ir', 'tijeras', 'Servicios y productos', `${SERVICIOS.filter((s) => !s.temporal).length} servicios · ${S.productos.length} productos`, 'servicios'), f('ir', 'estrella', 'Servicios temporales', `${temporalesHoy().length} activos · Navidad, Semana Santa…`, 'temporales'), activa('fueraHorario') && f('ir', 'reloj', 'Fuera de horario', '', 'fuera-horario'), activa('bonos') && f('ir', 'recibo', 'Bonos y suscripciones', '', 'bonos'), activa('regalos') && f('ir', 'regalo', 'Tarjetas regalo', '', 'regalos')])}
    ${grupo('Reservas', [f('ir', 'repetir', 'Asignación de citas', { cliente: 'El cliente elige', carga: 'Al que tenga menos carga', aleatorio: 'Aleatoria', turnos: 'Por turnos' }[S.asignacion], 'asignacion'), f('ir', 'documento', 'Política de citas', `Cancelación gratis hasta ${S.cancelHoras} h antes`, 'politica'), f('ir', 'tarjeta', 'Métodos de pago', 'Local, app, Bizum y señal', 'pagos'), f('ir', 'campana', 'Recordatorios', `App + email · 24 h y 1 h${premium() ? ' · WhatsApp' : ''}`, 'recordatorios'), activa('agendaIA') && f('ir', 'chispa', 'Agenda inteligente', '', 'agenda-ia')])}
    ${grupo('Clientes y comunicación', [f('ir', 'comentario', 'Muro y novedades', `${S.muro.length} publicaciones · como negocio o profesional`, 'muro-biz'), f('ir', 'megafono', 'Mensaje del tablón', S.aviso && S.aviso.activo ? `Publicado: «${esc(S.aviso.titulo)}»` : 'Ventanita al entrar en tu ficha', 'mensaje-clientes'), f('ir', 'estrella', 'Reseñas', `5,0 · ${n.totalResenas} reseñas`, 'resenas-biz'), f('ir', 'documento', 'Ficha del cliente', `Campos de ${CAMPOS_CAT[S.catFicha].nombre.toLowerCase()}`, 'campos-ficha'), f('biz-notis', 'campana', 'Notificaciones'), f('ir', 'google', 'Google e Instagram', 'Botón «Reservar» donde te buscan', 'canales'), activa('marketing') && f('ir', 'megafono', 'Marketing', '', 'marketing'), activa('recepcionista') && f('ir', 'chat', 'Recepcionista IA', '', 'recepcionista'), activa('automatizaciones') && f('ir', 'chispa', 'Automatizaciones', '', 'automatizaciones')])}
    ${grupo(esGerente() ? 'Números' : 'Números (solo gerente)', [f('ir', 'grafico', 'Estadísticas', 'Facturación, mejores días y meses', 'stats'), f('ir', 'euro', 'Comisiones', EQUIPO.filter((p) => !p.propietario).map((p) => `${p.nombre} ${p.comisionServicios} %`).join(' · '), 'comisiones'), f('ir', 'recibo', 'Transacciones', 'Todo lo cobrado', 'transacciones')])}
    ${grupo('Cuenta', [f('ir', 'recibo', 'Suscripción y facturas', `Plan ${PLANES.find((p) => p.id === S.plan).nombre}`, 'suscripcion'), f('ir', 'candado', 'Dispositivos conectados', `${S.dispositivos.length} dispositivos`, 'dispositivos'), f('ir', 'repetir', 'Cámbiate a IMAGO', 'Trae tus clientes y citas sin perder ninguna', 'migracion'), activa('recompensas') && f('ir', 'regalo', 'Recompensas', '', 'recompensas'), activa('idiomas') && f('idioma', 'idioma', 'Idioma', S.idioma === 'en' ? 'English' : 'Español'), f('ir', 'ajustes', 'Funciones', `${FUNCIONES.filter(([k]) => !activa(k)).length} aparcadas · ocultas, no borradas`, 'funciones'), f('guia-repetir', 'chispa', 'Ver la guía otra vez', 'Para qué sirve cada cosa'), f('eliminar-cuenta', 'papelera', 'Eliminar cuenta')])}
    ${grupo('Ayuda', [f('perfil-soporte', 'soporte', 'Soporte', 'Te respondemos en menos de 1 hora'), f('biz-privacidad', 'escudo', 'Política de privacidad'), `<button data-a="toast" data-t="Sesión cerrada (simulado)">${ic('salir')}<span>Cerrar sesión</span></button>`])}`];
};
/* Cada cosa en su sitio: vacaciones en Horario, tráiler en Galería y temporales junto a los servicios */
envolver(VISTAS.horario, 'html', function (orig) {
  const r0 = orig();
  r0[0] = r0[0].replace('<div class="form-hoja" style="padding:16px 0 0">', `<div class="form-hoja" style="padding:16px 0 0"><button class="btn btn--primary btn--block" data-a="aj-vacaciones">${ic('sol', 'ic-s')}Añadir vacaciones o días libres</button>`);
  return r0;
});
envolver(VISTAS.galeria, 'html', function (orig) {
  const r0 = orig();
  r0[0] = r0[0].replace(/(<button class="btn btn--primary btn--block" data-a="subir-biz">[\s\S]*?<\/button>)/, `$1<button class="btn btn--ghost btn--block" style="margin-top:8px" data-a="esc-trailer">${ic('play', 'ic-s')}Cambiar el tráiler de tu ficha</button>`);
  return r0;
});
envolver(VISTAS.servicios, 'html', function (orig) {
  const r0 = orig();
  r0[0] = r0[0].replace(/(<div class="pad">)/, `$1<button class="aj-temp" data-a="ir" data-v="temporales">${ic('estrella')}<span><b>Servicios temporales</b><small>${temporalesHoy().length} activos · precios y servicios solo para unas fechas</small></span>${ic('sig', 'ic-s')}</button>`);
  return r0;
});
function abrirSubirTrailer() {
  S.trailerNuevo = null;
  hojaGenerica('Tráiler del negocio', 'El vídeo que ven los clientes al tocar «Ver tráiler»', `<div class="form-hoja">
    <div class="trailer-actual">${TRAILER.slice(0, 4).map((t) => `<img src="${t.poster}" alt="">`).join('')}</div>
    <p class="muted small">Ahora tiene ${TRAILER.length} partes (unos 25 s). Sube un vídeo vertical de hasta 30 segundos.</p>
    <label class="subida-zona" id="zona"><input type="file" id="f-trailer" accept="video/*" hidden><span id="zona-prev">${ic('subir')}<b>Elige un vídeo</b><small>Vertical · máximo 30 segundos</small></span></label>
    <button class="link" data-a="trailer-ejemplo" style="align-self:center">o usa un vídeo de ejemplo</button>
    <button class="btn btn--primary btn--block" data-a="trailer-publicar">Publicar tráiler</button></div>`);
  $('#f-trailer').addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; S.trailerNuevo = URL.createObjectURL(f); $('#zona-prev').innerHTML = `<video src="${S.trailerNuevo}" muted loop playsinline autoplay></video>`; $('#zona').classList.add('llena'); });
}

/* =====================================================================
   13 · Recordatorios dobles y gratis (app + email, 24 h y 1 h). WhatsApp solo en Súper premium
   ===================================================================== */
Object.assign(S.ajustes, { bizRec24: true, bizRec1: true });
S.permisoNoti = null;
PLANES.splice(0, PLANES.length,
  { id: 'basico', nombre: 'Básico', precio: 19, pros: 'Hasta 2 profesionales', extras: ['Agenda, reservas y clientes', 'Recordatorios app + email (24 h y 1 h)', 'Ficha con servicios, muro y vídeos'] },
  { id: 'pro', nombre: 'Pro', precio: 39, pros: 'Hasta 5 profesionales', extras: ['Todo lo del Básico', 'Caja, comisiones y estadísticas', 'Inasistencias con filtros'] },
  { id: 'premium', nombre: 'Súper premium', precio: 60, pros: 'Profesionales ilimitados', extras: ['Todo lo del Pro', 'Recordatorios por WhatsApp: 1.000 clientes al mes', 'Paquetes extra de WhatsApp'] });
if (!PLANES.some((p) => p.id === S.plan)) S.plan = 'pro';
const premium = () => S.plan === 'premium';
function mockAviso(c) {
  return `<div class="mock-push"><span class="mock-push__app"><span class="marca">${LOGO}</span>IMAGO · ahora</span><b>Mañana tienes cita a las ${c.hora}</b><p>${c.servicio} con ${c.pro} en ${NEGOCIOS[0].nombre}.</p><div class="mock-push__btns"><span>Confirmar</span><span>Cambiar</span><span>Cancelar</span></div></div>
    <div class="mock-mail"><small>De: IMAGO · Para: ${c.email}</small><b>Recordatorio: tu cita es mañana a las ${c.hora}</b><p>Hola ${c.nombre}, te esperamos en ${NEGOCIOS[0].nombre} (${NEGOCIOS[0].direccion}). ${c.servicio} con ${c.pro}.</p><div class="mock-push__btns"><span>Confirmar</span><span>Cambiar</span><span>Cancelar</span></div></div>`;
}
VISTAS.recordatorios = {
  padre: 'ajustes',
  html() {
    const ej = { hora: '18:00', servicio: 'Corte de pelo', pro: 'Adri', nombre: 'Carlos', email: 'carlos@ejemplo.com' };
    return [`${bizCab()}<div class="neg-titulo"><h1>Recordatorios</h1></div>
      <p class="muted small pad aj-lead">Todas las citas tienen doble recordatorio gratis: 24 h y 1 h antes, por notificación de la app y por email a la vez. Si el cliente no tiene las notificaciones activadas, el email le llega igualmente.</p>
      <div class="pad form-hoja" style="padding-top:0">
        ${sw('bizRec24', '24 horas antes', 'Si reservan con menos antelación, este aviso se omite')}
        ${sw('bizRec1', '1 hora antes')}
        <div class="ajuste"><span><b>Canales</b><small>Notificación de la app + email (siempre los dos)</small></span>${ic('check')}</div>
        ${sw('bizEspera', 'Si cancela, avisar a la lista de espera', 'Por la app y por email')}
        <div class="campo"><label>Así le llega (con botones Confirmar · Cambiar · Cancelar)</label>${mockAviso(ej)}</div>
        <div class="kpis" style="padding:0"><div class="kpi"><small>Enviados este mes</small><b>624</b></div><div class="kpi"><small>Confirmados</small><b>91 %</b></div><div class="kpi"><small>Solo por email</small><b>18 %</b><span class="faint small">sin notificaciones</span></div><div class="kpi"><small>Coste</small><b>0 €</b></div></div>
        ${premium() ? `${sw('bizWa', 'Además por WhatsApp', 'Súper premium · hasta 1.000 clientes al mes (llevas 312)')}` : `<div class="wa-premium">${ic('whatsapp')}<span><b>Recordatorios por WhatsApp</b><small>Solo en el plan Súper premium (60 €/mes): hasta 1.000 clientes al mes. Tiene coste por mensaje.</small></span><button class="btn btn--sm btn--primary" data-a="ir" data-v="suscripcion">Ver plan</button></div>`}
        <button class="btn btn--ghost btn--block" data-a="rec-prueba">${ic('campana', 'ic-s')}Enviarme una prueba</button>
      </div>`];
  },
};
function mostrarPush({ titulo, texto, botones = [] }) {
  $('.push-sim')?.remove();
  const el = document.createElement('div');
  el.className = 'push-sim';
  el.innerHTML = `<span class="mock-push__app"><span class="marca">${LOGO}</span>IMAGO · ahora</span><b>${titulo}</b><p>${texto}</p>${botones.length ? `<div class="push-sim__btns">${botones.map(([t, a, extra = '']) => `<button data-a="${a}" ${extra}>${t}</button>`).join('')}</div>` : ''}`;
  $('#screen').appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  clearTimeout(mostrarPush.t);
  mostrarPush.t = setTimeout(cerrarPush, 9000);
}
function cerrarPush() { const el = $('.push-sim'); if (!el) return; el.classList.remove('on'); setTimeout(() => el.remove(), 300); }
function recordatorioDemo() {
  let i = S.citas.findIndex((c) => !c.cancelada);
  if (i < 0) i = citaDemo();
  const c = S.citas[i], s = serv(c.servicio), p = pro(c.pro);
  const cuando = fRel(deK(c.fecha)) === 'Hoy' ? 'Dentro de poco' : mayus(fRel(deK(c.fecha)).toLowerCase());
  mostrarPush({ titulo: `${cuando} tienes cita a las ${c.hora}`, texto: `${s.nombre} con ${p.nombre} en ${NEGOCIOS[0].nombre}. También te lo hemos mandado por email.`, botones: [['Confirmar', 'rec-ok', `data-i="${i}"`], ['Cambiar', 'rec-cambiar', `data-i="${i}"`], ['Cancelar', 'rec-cancelar', `data-i="${i}"`]] });
}
envolver(VISTAS.perfil, 'html', function (orig) {
  const r0 = orig(); let [a] = r0;
  a = a.replace('WhatsApp, 24 h antes', 'App + email · 24 h y 1 h antes').replace(/<small>Desactivados<\/small>/, '<small>App + email · 24 h y 1 h antes</small>');
  a = conMarco(a, '<div class="lista-op">', `<div class="viaja"><b>${ic('usuario', 'ic-s')} Tu perfil viaja contigo</b><small>Tu historial, lo que te gusta y tus preferencias sirven en cualquier negocio de IMAGO.</small></div><div class="lista-op">
        <button data-a="ver-guardados">${ic('guardar')}<span>Fotos que me gustan<small>${S.guardados.length ? `${S.guardados.length} guardadas · las ven tus profesionales` : 'Guarda trabajos en el Feed'}</small></span>${ic('sig', 'ic-s')}</button>
        <button data-a="mis-mascotas">${ic('mascota')}<span>Mis mascotas<small>${S.mascotas.length ? S.mascotas.map((m) => m.nombre).join(', ') : 'Para peluquería canina'}</small></span>${ic('sig', 'ic-s')}</button>
      </div>`);
  return [a, ...r0.slice(1)];
});
A['perfil-recordatorios'] = () => hojaGenerica('Recordatorios', 'Para que no se te pase ninguna cita', `<div class="form-hoja">
  <div class="ajuste"><span><b>Notificación en el móvil</b><small>${S.permisoNoti === 'si' ? 'Activada' : 'Desactivada: solo te llega el email'}</small></span>${S.permisoNoti === 'si' ? ic('check') : '<button class="btn btn--sm btn--primary" data-a="perm-pedir">Activar</button>'}</div>
  <div class="ajuste"><span><b>Email</b><small>${YO.email} · siempre activo</small></span>${ic('check')}</div>
  <div class="ajuste"><span><b>¿Cuándo?</b><small>24 h antes y 1 h antes (si reservas con menos antelación, ese aviso no sale)</small></span>${ic('reloj')}</div>
  <p class="faint small">Algunos negocios también te lo mandan por WhatsApp (plan Súper premium).</p></div>`);
envolver(VISTAS.citas, 'html', function (orig) {
  const r0 = orig(); let [a] = r0;
  a = a.split('<div class="cita-acciones">').join(`<p class="rec-linea">${ic('campana', 'ic-s')}Te avisamos 24 h y 1 h antes · app + email</p><div class="cita-acciones">`);
  if (S.permisoNoti !== 'si' && S.citas.some((c) => !c.cancelada)) a = a.replace(/(<div class="neg-titulo"><h1>Mis citas<\/h1>[\s\S]*?<\/div>)/, `$1<div class="noti-off">${ic('campana')}<span><b>Tienes las notificaciones desactivadas</b><small>Te avisaremos solo por email y es fácil que se te pase la hora.</small></span><button class="btn btn--sm btn--primary" data-a="perm-pedir">Activar</button></div>`);
  return [a, ...r0.slice(1)];
});
envolver(VISTAS.exito, 'html', function (orig) {
  const r0 = orig(); const [a] = r0;
  return [a.replace('Te lo recordaremos por WhatsApp 24 h antes.', 'Te la recordaremos 24 h y 1 h antes, por notificación y por email.'), ...r0.slice(1)];
});
VISTAS.exito.montar = () => {
  if (S.permisoNoti === 'si' || S.permisoPreguntado) return;
  S.permisoPreguntado = true;
  setTimeout(() => { if (S.vista === 'exito') hojaPermiso(); }, 900);
};
function hojaPermiso() {
  hojaGenerica('', '', `<div class="form-hoja permiso">
    <span class="permiso__ic">${ic('campana')}</span>
    <h2>Activa los avisos de tus citas</h2>
    <p>Te avisaremos <b>24 horas y 1 hora antes</b> de cada cita. Los avisos de tus citas llegan por aquí: si no activas las notificaciones, no te enterarás en el móvil y es fácil que se te pase la hora.</p>
    <button class="btn btn--primary btn--block" data-a="perm-si">Activar avisos</button>
    <button class="btn btn--ghost btn--block" data-a="perm-no">Ahora no</button></div>`);
}
function dialogoSistema() {
  const el = document.createElement('div');
  el.className = 'alerta-sis';
  el.innerHTML = `<div class="alerta-sis__caja"><b>«IMAGO» quiere enviarte notificaciones</b><p>Las notificaciones pueden incluir avisos, sonidos e iconos. Puedes cambiarlo en Ajustes.</p><div><button data-a="perm-sis" data-v="no">No permitir</button><button data-a="perm-sis" data-v="si">Permitir</button></div></div>`;
  $('#screen').appendChild(el);
}

/* =====================================================================
   14 · Campos de la ficha por categoría y perfil que viaja con el cliente
   ===================================================================== */
const CAMPOS_CAT = {
  barberia: { nombre: 'Barbería', campos: ['Tipo de pelo', 'Piel y cuero cabelludo', 'Cómo le gusta'] },
  peluqueria: { nombre: 'Peluquería', campos: ['Tipo de pelo', 'Color actual', 'Alergias a tintes'] },
  perros: { nombre: 'Peluquería canina', campos: ['Mascota', 'Raza', 'Tamaño', 'Carácter'] },
  unas: { nombre: 'Uñas', campos: ['Forma preferida', 'Largo', 'Alergias'] },
  estetica: { nombre: 'Estética', campos: ['Tipo de piel', 'Alergias', 'Tratamientos anteriores'] },
};
Object.assign(S, { catFicha: 'barberia', camposExtra: [], mascotas: [] });
function valoresCampos(c) {
  const cat = S.catFicha, r = rng(hash('campo' + c.id + cat)), pick = (l) => l[Math.floor(r() * l.length)];
  const m = c.yo ? S.mascotas[0] : null;
  const base = {
    barberia: c.yo ? [S.sobreMi.pelo, S.sobreMi.piel.join(', ') || '—', S.sobreMi.nota] : [pick(['Liso', 'Ondulado', 'Rizado']), pick(['Normal', 'Piel sensible', 'Caspa']), pick(['Degradado bajo', 'Clásico con raya', 'Textura arriba'])],
    peluqueria: [c.yo ? S.sobreMi.pelo : pick(['Liso', 'Ondulado', 'Rizado']), pick(['Natural', 'Castaño claro', 'Mechas rubias']), pick(['No', 'Sí: prueba antes'])],
    perros: m ? [m.nombre, m.raza, m.tamano, m.caracter] : c.yo ? ['—', '—', '—', '—'] : [pick(['Toby', 'Luna', 'Coco', 'Rocky']), pick(['Caniche', 'Golden', 'Bichón maltés', 'Mestizo']), pick(['Pequeño', 'Mediano', 'Grande']), pick(['Tranquilo', 'Nervioso', 'Juguetón'])],
    unas: [pick(['Almendra', 'Cuadrada', 'Redonda']), pick(['Corto', 'Medio', 'Largo']), pick(['No', 'Acetona'])],
    estetica: [pick(['Mixta', 'Seca', 'Grasa']), pick(['No', 'Ácido salicílico']), pick(['Limpieza', 'Ninguno'])],
  }[cat];
  return [...CAMPOS_CAT[cat].campos.map((t, i) => [t, base[i] || '—']), ...S.camposExtra.map((t) => [t, c.yo ? '—' : 'Sin rellenar'])];
}
envolver(VISTAS.cliente, 'html', function (orig) {
  const r0 = orig(); let [a] = r0;
  const c = clientesDB().find((x) => x.id === S.clienteSel);
  if (!activa('fichaTecnica')) a = a.replace(/<div class="bloque-t">Ficha técnica[\s\S]*?(?=<div class="bloque-t">Próximas citas)/, '');
  const guard = c.yo ? guardadosItems() : [];
  const bloque = `<div class="bloque-t">Ficha · ${CAMPOS_CAT[S.catFicha].nombre}<small><button class="link" data-a="ir" data-v="campos-ficha">Campos</button></small></div>
    <div class="pad campos-cli">${valoresCampos(c).map(([t, v]) => `<div><small>${esc(t)}</small><b>${esc(v)}</b></div>`).join('')}</div>
    ${c.yo ? `<div class="bloque-t">Fotos que le gustan<small>${guard.length}</small></div><div class="pad">${guard.length ? `<div class="gusta-fotos">${guard.slice(0, 6).map((x) => `<img src="${x.img}" alt="">`).join('')}</div>` : '<p class="muted small">Aún no ha guardado ninguna. Las que guarde en el Feed aparecerán aquí.</p>'}</div>` : ''}`;
  return [conMarco(a, '<div class="bloque-t">Próximas citas', bloque), ...r0.slice(1)];
});
VISTAS['campos-ficha'] = { padre: 'ajustes', html() {
  return sub('Ficha del cliente', `<div class="pad form-hoja" style="padding-top:0">
    <div class="campo"><label>Tu categoría</label><div class="chips">${Object.entries(CAMPOS_CAT).map(([k, v]) => `<button class="chip" data-a="cat-ficha" data-v="${k}" aria-pressed="${S.catFicha === k}">${v.nombre}</button>`).join('')}</div></div>
    <p class="franja">Campos de la ficha</p>
    <div class="campos-lista">${CAMPOS_CAT[S.catFicha].campos.map((t) => `<div class="factura"><span><b>${t}</b><small>De la categoría</small></span>${ic('check', 'ic-s')}</div>`).join('')}
      ${S.camposExtra.map((t, i) => `<div class="factura"><span><b>${esc(t)}</b><small>Añadido por ti</small></span><button class="btn btn--sm btn--ghost" data-a="campo-quitar" data-i="${i}">Quitar</button></div>`).join('')}</div>
    <div class="fila-input"><input id="campo-nuevo" type="text" maxlength="40" placeholder="Añadir un campo (ej.: Alergias)" style="text-transform:none"><button class="btn btn--sm btn--primary" data-a="campo-add">Añadir</button></div>
    <p class="nota-com">Lo que el cliente rellena en su perfil («Sobre mí» o «Mis mascotas») aparece solo en estos campos.</p></div>`, 'Cada sector guarda cosas distintas de sus clientes. Elige tu categoría y añade los campos que quieras.');
} };
function hojaMascota() {
  const m = S.mascotas[0] || { nombre: '', raza: '', tamano: 'Mediano', caracter: 'Tranquilo' };
  S.borradorM = { ...m };
  hojaGenerica('Mis mascotas', 'Lo verá tu peluquería canina en tu ficha', `<div class="form-hoja">
    <div class="campo"><label>Nombre</label><input id="m-nombre" type="text" value="${esc(m.nombre)}" placeholder="Ej.: Toby" style="text-transform:none"></div>
    <div class="campo"><label>Raza</label><input id="m-raza" type="text" value="${esc(m.raza)}" placeholder="Ej.: Caniche" style="text-transform:none"></div>
    <div class="campo"><label>Tamaño</label><div class="chips">${['Pequeño', 'Mediano', 'Grande'].map((x) => `<button class="chip" data-a="m-sel" data-k="tamano" data-v="${x}" aria-pressed="${m.tamano === x}">${x}</button>`).join('')}</div></div>
    <div class="campo"><label>Carácter</label><div class="chips">${['Tranquilo', 'Nervioso', 'Juguetón', 'Muerde a veces'].map((x) => `<button class="chip" data-a="m-sel" data-k="caracter" data-v="${x}" aria-pressed="${m.caracter === x}">${x}</button>`).join('')}</div></div>
    <button class="btn btn--primary btn--block" data-a="m-guardar">Guardar</button></div>`);
}
/* Foto y vídeo de presentación de cada profesional (lo ve el cliente en Equipo y al elegir profesional) */
envolver(VISTAS['mi-perfil'], 'html', function (orig) {
  const r0 = orig(), p = pro(S.perfilSel);
  r0[0] = r0[0].replace('<p class="franja">Servicios que hace</p>', `<p class="franja">Foto y vídeo de presentación</p>
      <div class="pf-media"><img src="${p.img}" alt=""><span><b>Lo ven tus clientes</b><small>En Equipo y al elegir profesional (el vídeo se enciende al tocar su foto).</small></span></div>
      <button class="btn btn--ghost btn--block" data-a="pf-video">${ic('camara', 'ic-s')}Cambiar foto o vídeo</button>
      <p class="franja">Servicios que hace</p>`);
  return r0;
});

/* =====================================================================
   15 · Funciones (interruptores)
   ===================================================================== */
VISTAS.funciones = { padre: 'ajustes', html() {
  const grupos = [...new Set(FUNCIONES.map((f) => f[3]))];
  return sub('Funciones', `<div class="pad form-hoja" style="padding-top:0">
    <div class="viaja"><b>${ic('escudo', 'ic-s')} Ocultar, no borrar</b><small>Lo aparcado está apagado: no se ve, pero el código y los datos se conservan para recuperarlo cuando lo pidan negocios y clientes.</small></div>
    ${grupos.map((g) => `<p class="franja">${g === 'IA' ? 'Con IA (fuera de la versión 1)' : g}</p>${FUNCIONES.filter((f) => f[3] === g).map(([k, t, d]) => `<div class="ajuste"><span><b>${t}</b>${d ? `<small>${d}</small>` : ''}</span><button class="switch" role="switch" aria-checked="${activa(k)}" data-a="flag-sw" data-k="${k}" aria-label="${t}"></button></div>`).join('')}`).join('')}
  </div>`, 'Interruptores de la versión 1. Solo para probar: en la app real los controla IMAGO.');
} };

/* =====================================================================
   16 · Animación de entrada: primero la «o» de IMAGO y luego se abre y llena la pantalla (como Zalando)
   ===================================================================== */
S.colorMarca = 'nacar';
try { S.colorMarca = localStorage.getItem('imago-color') || 'nacar'; } catch {}
splash = function (m) {
  const el = $('#splash');
  clearTimeout(splash.t); clearTimeout(splash.t2);
  el.className = `splash sp-o sp-o--${S.colorMarca}`;
  el.innerHTML = `<i class="sp-o__ola"></i><div class="splash__marca">${LOGO}${m === 'negocio' ? '<small>Business</small>' : ''}</div>`;
  el.hidden = false;
  splash.t = setTimeout(() => {
    el.classList.add('sale');
    splash.t2 = setTimeout(() => { el.hidden = true; el.className = 'splash'; }, 330);
  }, reducido ? 350 : 1400);
};

/* =====================================================================
   17 · Una sola guía corta
   ===================================================================== */
GUIAS.cliente.pasos = [
  ['.buscador', 'Busca', 'Escribe un servicio («degradado») o el nombre de un sitio.'],
  ['.repetir-card', 'Reservar de nuevo', 'Tu última cita, lista para volver: solo tienes que confirmar.'],
  ['[data-a="tab"][data-v="inspiracion"]', 'Feed', 'Trabajos en vídeo de tus sitios. ¿Te gusta uno? «Quiero esto» y reservas.'],
  ['[data-a="tab"][data-v="citas"]', 'Tus citas', 'Te avisamos 24 h y 1 h antes. Desde aquí las cambias o cancelas.'],
];
GUIAS.negocio.pasos = [
  ['.tarjetas-res', 'Tu día de un vistazo', 'Faltas de hoy y de la semana, y huecos libres. Toca una tarjeta para ver la lista.'],
  ['.fab-reservar', 'Reservar', 'Crea una cita: primero el cliente y luego el servicio. También tocando un hueco libre.'],
  ['[data-a="camara-abrir"]', 'Tu cámara', 'Graba o sube un vídeo de tu trabajo: lo verán tus clientes en el Feed y en tu ficha.'],
  ['[data-a="tab"][data-v="ajustes"]', 'Ajustes', 'Ordenados por temas: tu negocio, servicios, reservas, clientes y números.'],
];

/* =====================================================================
   18 · Detalles: cambio de cita sin intercambio, avisos sin WhatsApp ni IA
   ===================================================================== */
{
  const orig = pintarCambio;
  pintarCambio = () => {
    orig();
    if (activa('intercambio')) return;
    $$('#cb .cb-h--otro').forEach((x) => { x.disabled = true; });
    const ley = $('#cb .leyenda-cb');
    if (ley) ley.innerHTML = '<span><i class="l"></i>Elige una hora libre: el profesional solo tiene que aceptarla</span>';
  };
}
envolver(VISTAS.espera, 'html', function (orig) { const r0 = orig(); const [a] = r0; return [a.replace('Si alguien cancela, la IA les avisa por orden.', 'Si alguien cancela, les avisamos por orden (app + email).').split(`${ic('whatsapp', 'ic-s')}Ofrecer hueco`).join(`${ic('mensaje', 'ic-s')}Ofrecer hueco`), ...r0.slice(1)]; });
A['espera-ofrecer'] = (b) => toast(`Le hemos ofrecido el primer hueco libre a ${b.dataset.n} por la app y por email`);
envolver(VISTAS.login, 'html', function (orig) { const r0 = orig(); const [a] = r0; return [a.replace('Con vídeo, comunidad y una IA que te guía.', 'Con vídeo, huecos libres y recordatorios para que no se te pase ninguna cita.'), ...r0.slice(1)]; });
{
  const i = NOTI_BASE.findIndex((x) => x.tipo === 'whatsapp');
  if (i >= 0) Object.assign(NOTI_BASE[i], { tipo: 'recordatorio', t: 'Recordatorios enviados (app + email) a <b>14 clientes</b> con cita mañana' });
  const j = NOTI_BASE.findIndex((x) => x.tipo === 'contenido');
  if (j >= 0 && !activa('subidaClientes')) NOTI_BASE.splice(j, 1);
  Object.assign(NOTI_IC, { recordatorio: ['campana', 'verde'], confirmada: ['check', 'verde'] });
}
{
  const orig = setModo;
  setModo = (m, op) => { pararCamara(); $$('#screen .guia, #screen .aviso-pop, #screen .push-sim, #screen .alerta-sis').forEach((x) => x.remove()); S.guia = null; return orig(m, op); };
}

/* =====================================================================
   19 · Acciones
   ===================================================================== */
Object.assign(A, {
  'reel-quiero': (b) => { S.historial = ['inspiracion']; empezarReserva({ servicio: b.dataset.s || 'corte', pro: b.dataset.p || null }); },
  'ver-guardados': abrirGuardados,
  'guardado-ver': (b) => { const l = guardadosItems().filter((x) => x.video); cerrarHoja(); verVideos(l, b, Math.max(0, l.findIndex((x) => x.id === b.dataset.id))); },
  'ver-subido': (b) => { const l = S.subidos.filter((x) => !x.cliente && x.video); verVideos(l, b, Math.max(0, l.findIndex((x) => x.id === b.dataset.id))); },
  'tr-faltas': (b) => { S.cliFiltro = 'inasistencias'; S.inaPer = b.dataset.v; S.inaPro = 'todos'; S.cliBusca = ''; ir('clientes', { reset: true, dir: 'fundido' }); },
  'tr-huecos': () => abrirHuecosLibres(S.vista === 'agenda' && S.agendaFecha >= HOY ? S.agendaFecha : HOY),
  'pub-hueco': (b) => { publicarHueco(b.dataset.p, b.dataset.f, b.dataset.h); if (b.dataset.cerrar) return cerrarHoja(); b.classList.add('on'); b.disabled = true; b.textContent = `${b.dataset.h} ✓`; },
  'ina-per': (b) => { S.inaPer = b.dataset.v; $('#lista-cli').innerHTML = listaClientes(); },
  'ina-pro': (b) => { S.inaPro = b.dataset.v; $('#lista-cli').innerHTML = listaClientes(); },
  'ina-escribir': (b) => {
    const n = b.dataset.n.split(' ')[0];
    hojaGenerica(`Escribir a ${b.dataset.n}`, 'Por la app y por email', `<div class="form-hoja"><textarea class="nota-campo" id="ina-msg">Hola ${n}, el ${fLarga(deK(b.dataset.f))} no pudiste venir a tu cita. ¿Te busco otro hueco esta semana? 🙂</textarea>
      <button class="btn btn--primary btn--block" data-a="ina-enviar" data-n="${esc(n)}">${ic('enviar', 'ic-s')}Enviar</button>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Se abriría WhatsApp con el mensaje (sin coste: es tu WhatsApp)">${ic('whatsapp', 'ic-s')}Abrir en mi WhatsApp</button></div>`);
  },
  'ina-enviar': (b) => { cerrarHoja(); toast(`Mensaje enviado a ${b.dataset.n} por la app y por email`); },
  'cf-faltas': (b) => { S.cf.faltas = !S.cf.faltas; b.setAttribute('aria-pressed', S.cf.faltas); $('#lista-cli').innerHTML = listaClientes(); },
  /* Nueva cita a pantalla completa */
  'nc-cerrar': () => { S.nr = null; volver(); },
  'nc-nuevo-cli': () => { S.nr.nuevo = { nombre: mayus(S.nr.busca.trim()), tel: '', confianza: false }; render(null); setTimeout(() => $('#nr-nombre')?.focus(), 80); },
  'nc-serv': (b) => abrirSelectorServicio(+b.dataset.i),
  'nc-serv-ok': (b) => { const i = +b.dataset.i, N = S.nr; if (i < N.servicios.length) N.servicios[i] = b.dataset.v; else N.servicios.push(b.dataset.v); N.eligiendo = false; cerrarHoja(); render(null, { mantenerScroll: true }); },
  /* Cámara */
  'camara-abrir': () => { S.cam = nuevaCam(); ir('camara'); },
  'cam-cerrar': () => { pararCamara(); S.cam = null; volver(); },
  'cam-modo': (b) => { if (camRec) return; S.cam.modo = b.dataset.v; pararCamara(); render(null); },
  'cam-girar': () => { if (camRec) return; S.cam.facing = S.cam.facing === 'user' ? 'environment' : 'user'; pararCamara(); render(null); },
  'cam-rec': (b) => (S.cam.modo === 'foto' ? fotoCamara() : grabarCamara(b)),
  'cam-ejemplo': () => { pararCamara(); Object.assign(S.cam, { url: VID + 'obras/horizonte.mp4', poster: IMG + 'obras/horizonte.webp', tipo: 'video', paso: 'publicar' }); render(null); },
  'cam-repetir': () => { Object.assign(S.cam, { paso: 'grabar', url: null, tipo: null }); render(null); },
  'cam-pro': (b) => { S.cam.pro = b.dataset.v; $$('[data-a="cam-pro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'cam-avisar': (b) => { S.cam.avisar = !S.cam.avisar; b.setAttribute('aria-checked', S.cam.avisar); },
  'cam-publicar': () => {
    const C = S.cam;
    if (!C.pro) return toast('Elige quién lo ha hecho');
    if (!$('#cam-ok').checked) return toast('Confirma que el cliente ha dado permiso');
    const v = moderarTexto(C.texto || '');
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    S.subidos.unshift({ id: 'cam' + Date.now(), video: C.tipo === 'video' ? C.url : null, img: C.tipo === 'imagen' ? C.url : C.poster || null, pro: C.pro, negocio: NEGOCIOS[0].nombre, texto: (C.texto || '').trim() || `Nuevo trabajo de ${pro(C.pro).nombre}`, fecha: new Date(), servicio: C.servicio, cliente: false });
    let avisados = false;
    if (C.avisar && S.avisosHoy < 1) { S.avisosHoy++; avisados = true; S.notiCli.unshift({ ic: 'camara', t: `<b>${pro(C.pro).nombre}</b> (${NEGOCIOS[0].nombre}) ha subido un trabajo nuevo.`, cuando: 'ahora' }); }
    S.cam = null; pararCamara(); volver();
    toast(`Publicado en el Feed y en tu ficha${avisados ? ` · avisados ${S.seguidoresAvisos} seguidores` : ''}`);
  },
  /* Ajustes agrupados */
  'aj-vacaciones': () => { S.bp = nuevoBorradorPost(); S.bp.tipo = 'vacaciones'; S.bp.autor = S.rolBiz === 'empleado' ? 'adri' : 'javi'; ir('muro-biz'); },
  'esc-trailer': abrirSubirTrailer,
  'trailer-ejemplo': () => { S.trailerNuevo = VID + 'neon-vertical.mp4'; $('#zona-prev').innerHTML = `<video src="${S.trailerNuevo}" muted loop playsinline autoplay></video>`; $('#zona').classList.add('llena'); },
  'trailer-publicar': () => { if (!S.trailerNuevo) return toast('Elige primero un vídeo'); TRAILER.unshift({ video: S.trailerNuevo, poster: IMG + 'hero-estudio-700.webp', kicker: 'Tráiler nuevo', titulo: NEGOCIOS[0].nombre }); cerrarHoja(); toast('Tráiler publicado: ya lo ven tus clientes al tocar «Ver tráiler»'); },
  'pf-video': () => {
    S.videoPro = null;
    hojaGenerica('Foto y vídeo de presentación', `${pro(S.perfilSel).completo} · lo ven los clientes`, `<div class="form-hoja">
      <label class="subida-zona" id="zona"><input type="file" id="f-pvid" accept="image/*,video/*" hidden><span id="zona-prev">${ic('subir')}<b>Elige una foto o un vídeo</b><small>Vídeo vertical de hasta 15 segundos</small></span></label>
      <button class="btn btn--primary btn--block" data-a="pf-video-ok">Guardar</button></div>`);
    $('#f-pvid').addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; S.videoPro = { url: URL.createObjectURL(f), video: f.type.startsWith('video') }; $('#zona-prev').innerHTML = S.videoPro.video ? `<video src="${S.videoPro.url}" muted loop playsinline autoplay></video>` : `<img src="${S.videoPro.url}" alt="">`; $('#zona').classList.add('llena'); });
  },
  'pf-video-ok': () => { const v = S.videoPro, p = pro(S.perfilSel); if (!v) return toast('Elige primero una foto o un vídeo'); if (v.video) p.video = v.url; else p.img = v.url; cerrarHoja(); render(null, { mantenerScroll: true }); toast(`Guardado: los clientes ya ven ${v.video ? 'el vídeo' : 'la foto'} de ${p.nombre}`); },
  /* Recordatorios y permiso */
  'rec-prueba': () => recordatorioDemo(),
  'rec-ok': (b) => {
    const c = S.citas[+b.dataset.i];
    if (c) { c.confirmada = true; S.notiBiz.unshift({ tipo: 'confirmada', t: `<b>${YO.nombre}</b> ha confirmado su cita`, sub: `${fRel(deK(c.fecha))} · ${c.hora} · desde el recordatorio`, cuando: 'ahora' }); }
    cerrarPush(); toast('Cita confirmada. El negocio ya lo sabe.');
    if (S.vista === 'citas') render(null, { mantenerScroll: true });
  },
  'rec-cambiar': (b) => { cerrarPush(); if (S.modo !== 'cliente') return toast('El cliente abriría «Proponer cambio»'); if (S.vista !== 'citas') ir('citas', { reset: true, dir: 'fundido' }); setTimeout(() => abrirCambio(+b.dataset.i), 250); },
  'rec-cancelar': (b) => { cerrarPush(); if (S.modo !== 'cliente') return toast('Se liberaría el hueco y avisaríamos a la lista de espera'); if (S.vista !== 'citas') ir('citas', { reset: true, dir: 'fundido' }); setTimeout(() => A['cita-cancelar']({ dataset: { i: b.dataset.i } }), 250); },
  'perm-si': () => { cerrarHoja(); setTimeout(dialogoSistema, 250); },
  'perm-pedir': () => { cerrarHoja(); if (S.permisoSistema === 'no') return toast('Lo bloqueaste antes: ve a Ajustes del móvil → IMAGO → Notificaciones'); setTimeout(dialogoSistema, 200); },
  'perm-no': () => { S.permisoNoti = 'luego'; cerrarHoja(); toast('Vale. Te lo volveremos a preguntar más adelante. El email te llega igualmente.'); },
  'perm-sis': (b) => {
    $('.alerta-sis')?.remove();
    S.permisoSistema = b.dataset.v; S.permisoNoti = b.dataset.v === 'si' ? 'si' : 'no';
    toast(b.dataset.v === 'si' ? 'Avisos activados: 24 h y 1 h antes de cada cita' : 'Sin notificaciones: te avisaremos por email');
    if (['citas', 'perfil'].includes(S.vista)) render(null, { mantenerScroll: true });
  },
  /* Ficha y perfil */
  'mis-mascotas': hojaMascota,
  'm-sel': (b) => { S.borradorM[b.dataset.k] = b.dataset.v; $$(`[data-a="m-sel"][data-k="${b.dataset.k}"]`).forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'm-guardar': () => { const m = { ...S.borradorM, nombre: $('#m-nombre').value.trim(), raza: $('#m-raza').value.trim() }; if (!m.nombre) return toast('Escribe el nombre de tu mascota'); S.mascotas = [m]; cerrarHoja(); render(null, { mantenerScroll: true }); toast(`Guardado. ${m.nombre} aparecerá en tu ficha de la peluquería canina`); },
  'cat-ficha': (b) => { S.catFicha = b.dataset.v; render(null, { mantenerScroll: true }); },
  'campo-add': () => { const v = ($('#campo-nuevo').value || '').trim(); if (!v) return toast('Escribe el nombre del campo'); S.camposExtra.push(v); render(null, { mantenerScroll: true }); toast(`Campo «${v}» añadido a la ficha`); },
  'campo-quitar': (b) => { S.camposExtra.splice(+b.dataset.i, 1); render(null, { mantenerScroll: true }); },
  'flag-sw': (b) => { const k = b.dataset.k; S.flags[k] = !S.flags[k]; b.setAttribute('aria-checked', S.flags[k]); aplicarFlags(); toast(S.flags[k] ? 'Activada (solo para probar)' : 'Aparcada: oculta, no borrada'); },
});
{
  const conf = A.confirmar;
  A.confirmar = (b) => { if (!activa('fichaTecnica')) S.reserva.firmado = true; conf(b); };
}

/* =====================================================================
   20 · Atajos del panel lateral
   ===================================================================== */
Object.assign(DEMOS, {
  v1Splash: () => { setModo(S.modo, { forzar: true }); },
  v1ColorNacar: () => { S.colorMarca = 'nacar'; try { localStorage.setItem('imago-color', 'nacar'); } catch {} splash(S.modo); },
  v1ColorTinta: () => { S.colorMarca = 'tinta'; try { localStorage.setItem('imago-color', 'tinta'); } catch {} splash(S.modo); },
  v1ColorVioleta: () => { S.colorMarca = 'violeta'; try { localStorage.setItem('imago-color', 'violeta'); } catch {} splash(S.modo); },
  v1Inicio: () => { abrirApp('cliente', 'inicio'); render(null); },
  v1Repetir: () => { abrirApp('cliente', 'inicio'); setTimeout(() => $('.repetir-card')?.click(), 400); },
  v1Ficha: () => { S.logueado = true; if (S.modo !== 'cliente') setModo('cliente'); S.historial = ['inicio']; S.tabFicha = 'servicios'; ir('negocio'); },
  v1Inspiracion: () => abrirApp('cliente', 'inspiracion'),
  v1Permiso: () => { S.permisoNoti = null; S.permisoPreguntado = false; S.permisoSistema = null; abrirApp('cliente', 'inicio'); const ph = proximoHueco(); empezarReserva({ servicio: 'corte', pro: ph.pro, fecha: kF(ph.fecha), hora: ph.hora }); setTimeout(() => $('[data-a="confirmar"]')?.click(), 600); },
  v1Recordatorio: () => { abrirApp('cliente', 'citas'); if (!S.citas.some((c) => !c.cancelada)) { citaDemo(); render(null); } setTimeout(recordatorioDemo, 500); },
  v1Guia: () => DEMOS.nGuiaCli(),
  v1Agenda: () => { S.agendaModo = 'dia'; S.agendaFecha = HOY; abrirApp('negocio', 'agenda'); render(null); },
  v1NuevaCita: () => { S.agendaModo = 'dia'; S.agendaFecha = HOY; abrirApp('negocio', 'agenda'); render(null); setTimeout(() => abrirReservaBiz(), 300); },
  v1Camara: () => { abrirApp('negocio', 'agenda'); setTimeout(() => A['camara-abrir'](), 300); },
  v1Huecos: () => { S.agendaModo = 'dia'; S.agendaFecha = HOY; abrirApp('negocio', 'agenda'); render(null); setTimeout(() => abrirHuecosLibres(HOY), 300); },
  v1Inasistencias: () => { S.cliFiltro = 'inasistencias'; S.inaPer = 'semana'; abrirApp('negocio', 'clientes'); render(null); },
  v1Filtros: () => { S.cliFiltro = 'todos'; S.cf = { ultima: '60', pro: '', serv: '', faltas: false }; abrirApp('negocio', 'clientes'); render(null); },
  v1Ajustes: () => { abrirApp('negocio', 'ajustes'); render(null); },
  v1Recordatorios: () => { abrirApp('negocio', 'ajustes'); ir('recordatorios'); },
  v1Campos: () => { abrirApp('negocio', 'ajustes'); ir('campos-ficha'); },
  v1Funciones: () => { abrirApp('negocio', 'ajustes'); ir('funciones'); },
  v1GuiaBiz: () => DEMOS.nGuiaBiz(),
});

aplicarFlags();
