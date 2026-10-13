'use strict';
/* IMAGO Business: calendario, notificaciones, clientes, caja y ajustes */

Object.assign(S, {
  agendaModo: 'dia',
  agendaPro: 'todos',
  semanaOff: 0,
  notiBiz: [],
  leidasBiz: 0,
  cliFiltro: 'todos',
  cliBusca: '',
  clienteSel: null,
  compartidos: 7,
  invitados: 1,
  reclamados: [],
  txPeriodo: 'hoy',
});
Object.assign(S.ajustes, { bizWa: true, bizWaCuando: '24', bizConfirmar: true, bizEspera: true, bizNotiReserva: true, bizNotiCambio: true, bizNotiCancel: true, bizNotiResena: true, bizResumen: true, bizSenal: true });
const ENLACE = 'https://imagocitas.com/sublime';

/* ---------- Cabecera de Business ---------- */
function bizCab() {
  const def = VISTAS[S.vista];
  const sub = def.padre && def.padre !== S.vista;
  return sub ? `<div class="biz-cab"><button class="icon-btn" data-a="volver" aria-label="Volver">${ic('atras')}</button></div>` : '<div class="biz-cab biz-cab--vacia"></div>';
}

/* ---------- Notificaciones del negocio ---------- */
const NOTI_BASE = [
  { tipo: 'reserva', t: '<b>Hugo García</b> ha reservado <b>Corte + barba</b> con Adri', sub: 'Mañana · 18:00 · cliente nuevo', cuando: 'hace 5 min', first: true },
  { tipo: 'cambio', t: '<b>Pablo Romero</b> ha movido su cita de las 10:30 a las <b>12:00</b>', sub: 'Hoy · con Javi', cuando: 'hace 40 min' },
  { tipo: 'cancelacion', t: '<b>David Ruiz</b> ha cancelado su cita de hoy a las 18:30', sub: 'Avisamos a 3 personas de la lista de espera', cuando: 'hace 1 h' },
  { tipo: 'espera', t: '<b>Sergio Díaz</b> ha cogido el hueco que quedó libre a las 18:30', sub: 'Desde la lista de espera', cuando: 'hace 55 min' },
  { tipo: 'resena', t: '<b>Jesús</b> os ha dejado 5 ★: «Pelado perfecto como el trato…»', cuando: 'hace 3 h' },
  { tipo: 'contenido', t: '<b>@hugo_sev</b> ha subido un vídeo etiquetando a Adri', sub: 'La IA lo ha revisado: apto', cuando: 'ayer', aprobar: true },
  { tipo: 'whatsapp', t: 'Recordatorio enviado por WhatsApp a <b>14 clientes</b> con cita mañana', sub: '12 ya han confirmado', cuando: 'ayer' },
  { tipo: 'mensaje', t: '<b>Pablo</b> ha preguntado en vuestro muro', cuando: 'hace 6 días' },
];
S.leidasBiz = NOTI_BASE.length - 3;
const notisBiz = () => [...S.notiBiz, ...NOTI_BASE];
const NOTI_IC = { reserva: ['mas', 'verde'], cambio: ['repetir', 'ambar'], cancelacion: ['cerrar', 'rojo'], espera: ['lista', 'verde'], resena: ['estrella', 'ambar'], contenido: ['camara', ''], whatsapp: ['whatsapp', 'verde'], mensaje: ['comentario', ''] };
VISTAS['avisos-biz'] = {
  padre: 'agenda',
  html() {
    const l = notisBiz();
    const nuevas = l.length - S.leidasBiz;
    return [`${bizCab()}<div class="neg-titulo"><h1>Notificaciones</h1></div>
      <div class="pad">${l.map((x, i) => {
        const [icono, color] = NOTI_IC[x.tipo];
        return `<div class="noti ${i < nuevas ? 'nueva' : ''}"><span class="noti__ic noti__ic--${color}">${ic(icono)}</span><span><span>${x.t}${x.first ? ' <span class="first">FIRST</span>' : ''}</span>${x.sub ? `<small>${x.sub}</small>` : ''}<small>${x.cuando}</small>
          ${x.aprobar && !x.decidido ? `<span class="noti__btns"><button class="btn btn--sm btn--primary" data-a="noti-aprobar" data-i="${i}" data-v="1">Destacar en el perfil</button><button class="btn btn--sm btn--ghost" data-a="noti-aprobar" data-i="${i}" data-v="0">Ocultar</button></span>` : ''}</span></div>`;
      }).join('')}</div>`];
  },
  montar() { S.leidasBiz = notisBiz().length; },
};

/* ---------- Calendario: día, semana y mes, con navegación libre ---------- */
Object.assign(ICON, { espera: '<path d="M4 6.5h10M4 12h6M4 17.5h6"/><circle cx="17" cy="15.5" r="4.5"/><path d="M17 13.5v2.2l1.4 1"/>' });
S.agendaFecha = HOY;
const prosFiltro = () => (S.agendaPro === 'todos' ? EQUIPO : EQUIPO.filter((p) => p.id === S.agendaPro));
const lunesDe = (d) => addD(d, -((d.getDay() + 6) % 7));
function ocupada(p, d, h) {
  const k = kF(d);
  const extra = S.extra[`${k}|${p}|${h}`];
  if (extra) return { servicio: extra.titulo ? { ...serv(extra.servicio), nombre: extra.titulo, min: extra.min, precio: extra.precio } : serv(extra.servicio), cliente: extra.cliente || YO.nombre, online: extra.pago !== 'local', nueva: true, cont: extra.cont, inicio: extra.inicio };
  if (libresBase(p, d).has(h)) return null;
  return citaGenerada(p, d, h);
}
function ocupacion(d, pros = prosFiltro()) {
  if (d.getDay() === 0) return null;
  const activos = pros.filter((p) => !enVacaciones(p.id, d));
  const total = HORAS.length * activos.length;
  if (!total) return { pct: 0, n: 0, total: 0, vac: true };
  const n = activos.reduce((a, p) => a + HORAS.filter((h) => ocupada(p.id, d, h)).length, 0);
  return { pct: Math.round((n / total) * 100), n, total };
}
/* Lista de espera (ejemplo + quien se apunta desde IMAGO Clientes) */
function listaEspera() {
  const base = [];
  for (let i = 0; i < 8; i++) {
    const r = rng(hash('espera' + i));
    const d = addD(HOY, Math.floor(r() * 6));
    if (d.getDay() === 0) continue;
    base.push({ id: 'e' + i, fecha: d, nombre: `${CLIENTES[(i * 5 + 2) % CLIENTES.length]} ${APELLIDOS[(i * 3 + 1) % APELLIDOS.length]}`, servicio: elegirServicio(r()), pro: r() < 0.5 ? (r() < 0.5 ? 'javi' : 'adri') : null, franja: ['Por la mañana', 'Por la tarde', 'Cualquier hora', 'A partir de las 18:00'][Math.floor(r() * 4)], desde: ['hace 20 min', 'hace 2 h', 'ayer', 'hace 3 días'][Math.floor(r() * 4)] });
  }
  const mias = S.espera.map((e, i) => ({ id: 'yo' + i, fecha: e.fecha ? deK(e.fecha) : HOY, nombre: YO.nombre, servicio: serv(S.reserva?.servicio || 'corte'), pro: e.pro && e.pro !== 'any' ? e.pro : null, franja: 'Cualquier hora', desde: 'ahora' }));
  return [...mias, ...base].filter((e) => !(S.esperaFuera || []).includes(e.id)).sort((a, b) => a.fecha - b.fecha);
}
function tituloCal() {
  const d = S.agendaFecha;
  if (S.agendaModo === 'dia') return esHoy(d) ? `Hoy, ${fCorta(d).split(' ').slice(1).join(' ')}` : mayus(fLarga(d));
  if (S.agendaModo === 'semana') { const l = lunesDe(d), f = addD(l, 6); return `${l.getDate()} – ${f.getDate()} ${f.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}`; }
  return mayus(d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }));
}
VISTAS.agenda = {
  html() {
    const nEsp = listaEspera().length;
    const nNot = notisBiz().length - S.leidasBiz;
    const cab = `<div class="cal-top">
        ${segmento([['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']], S.agendaModo, 'agenda-modo')}
        <button class="icon-btn campana" data-a="ir" data-v="espera" aria-label="Lista de espera">${ic('espera')}${nEsp ? `<i class="badge badge--neutro">${nEsp}</i>` : ''}</button>
        <button class="icon-btn campana" data-a="ir" data-v="avisos-biz" aria-label="Notificaciones">${ic('campana')}${nNot > 0 ? `<i class="badge">${nNot}</i>` : ''}</button>
      </div>
      <div class="cal-nav">
        <button class="icon-btn" data-a="cal-mover" data-d="-1" aria-label="Anterior">${ic('atras', 'ic-s')}</button>
        <b>${tituloCal()}</b>
        <button class="icon-btn" data-a="cal-mover" data-d="1" aria-label="Siguiente">${ic('sig', 'ic-s')}</button>
        ${esHoy(S.agendaFecha) ? '' : '<button class="chip cal-hoy" data-a="cal-hoy">Hoy</button>'}
      </div>
      <div class="chips cal-pros">${[['todos', 'Todos'], ...EQUIPO.map((p) => [p.id, p.nombre])].map(([id, t]) => `<button class="chip" data-a="agenda-pro" data-v="${id}" aria-pressed="${S.agendaPro === id}">${t}</button>`).join('')}</div>`;
    return [cab + (S.agendaModo === 'dia' ? htmlDia() : S.agendaModo === 'semana' ? htmlSemana() : htmlMes())];
  },
  montar(capa) {
    const ag = $('#agenda', capa);
    if (!ag || !esHoy(S.agendaFecha) || S.agendaModo !== 'dia') return;
    const actual = HORAS.filter((h) => minH(h) <= MIN_AHORA).pop();
    if (!actual || MIN_AHORA > minH(HORAS[HORAS.length - 1]) + 30 || (actual === '13:30' && MIN_AHORA > minH('14:00'))) return;
    const fila = $(`.agenda__hora[data-h="${actual}"]`, ag);
    const linea = document.createElement('i');
    linea.className = 'ahora';
    linea.style.top = fila.offsetTop + Math.min(1, (MIN_AHORA - minH(actual)) / 30) * 52 + 'px';
    ag.appendChild(linea);
    setTimeout(() => capa.querySelector('.view').scrollTo({ top: Math.max(0, fila.offsetTop - 60), behavior: reducido ? 'auto' : 'smooth' }), 300);
  },
};
function htmlDia() {
  const d = S.agendaFecha;
  const lunes = lunesDe(d);
  let tiras = '';
  for (let i = 0; i < 7; i++) {
    const x = addD(lunes, i), o = ocupacion(x);
    tiras += `<button class="dia-p ${kF(x) === kF(d) ? 'on' : ''} ${esHoy(x) ? 'es-hoy' : ''}" data-a="cal-ir" data-f="${kF(x)}" data-m="dia"><small>${x.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</small><b>${x.getDate()}</b><i>${o ? o.pct + '%' : '—'}</i></button>`;
  }
  if (d.getDay() === 0) return `<div class="dias-strip">${tiras}</div><div class="vacio">${ic('calendario')}Domingo: cerrado.</div>`;
  const pros = prosFiltro();
  let citas = 0, libresN = 0, previsto = 0;
  let grid = `<span></span>${pros.map((p) => `<div class="agenda__cab"><img src="${p.img}" alt="">${p.nombre}</div>`).join('')}`;
  HORAS.forEach((h) => {
    const corte = h === '17:00' ? 'corte' : '';
    grid += `<div class="agenda__hora ${corte}" data-h="${h}">${h}</div>`;
    pros.forEach((p) => {
      if (enVacaciones(p.id, d)) { grid += `<div class="slot slot--vac ${corte}">${h === HORAS[0] ? 'Vacaciones' : ''}</div>`; return; }
      const pasada = d < HOY || (esHoy(d) && minH(h) + 30 <= MIN_AHORA);
      const c = ocupada(p.id, d, h);
      if (c) {
        citas++;
        if (!pasada) previsto += c.servicio.precio;
        grid += `<button class="slot slot--cita ${c.online ? 'slot--online' : ''} ${c.nueva ? 'slot--nueva' : ''} ${pasada ? 'slot--hecha' : ''} ${corte}" data-a="slot" data-p="${p.id}" data-h="${h}"><b>${esc(c.cliente)}</b><small>${c.cont ? `continúa · desde las ${c.inicio}` : `${c.inicio && c.inicio !== h ? c.inicio + ' · ' : ''}${c.servicio.nombre} · ${c.servicio.min}′`}</small></button>`;
      } else {
        if (!pasada) libresN++;
        grid += `<button class="slot slot--libre ${corte}" data-a="slot" data-p="${p.id}" data-h="${h}">${pasada ? '' : 'Libre'}</button>`;
      }
    });
  });
  const o = ocupacion(d);
  return `<div class="dias-strip">${tiras}</div>
    <div class="agenda-res"><div><b>${o.pct}%</b><small>ocupación</small></div><div><b>${citas}</b><small>citas</small></div><div><b>${libresN}</b><small>libres</small></div><div><b>${eur(previsto)}</b><small>por cobrar</small></div></div>
    <div class="agenda" id="agenda" style="grid-template-columns:44px repeat(${pros.length}, 1fr)">${grid}</div>
    <div class="leyenda-mini" style="padding-top:14px"><span><i style="background:var(--verde)"></i>Pagada en la app</span><span><i></i>Paga en el local</span></div>`;
}
function htmlSemana() {
  const lunes = lunesDe(S.agendaFecha);
  const dias = Array.from({ length: 7 }, (_, i) => addD(lunes, i));
  const pros = prosFiltro();
  let cab = '<span></span>';
  dias.forEach((d) => {
    const o = ocupacion(d);
    cab += `<button class="wk-dia ${esHoy(d) ? 'hoy' : ''}" ${d.getDay() !== 0 ? `data-a="cal-ir" data-f="${kF(d)}" data-m="dia"` : 'disabled'}><small>${['L', 'M', 'X', 'J', 'V', 'S', 'D'][(d.getDay() + 6) % 7]}</small><b>${d.getDate()}</b><i>${o ? o.pct + '%' : '—'}</i></button>`;
  });
  let filas = '';
  HORAS.forEach((h) => {
    const corte = h === '17:00' ? 'corte' : '';
    filas += `<span class="wk-h ${corte}">${h.endsWith(':00') ? h : ''}</span>`;
    dias.forEach((d) => {
      if (d.getDay() === 0) { filas += `<span class="wk-c wk-c--cerrado ${corte}"></span>`; return; }
      const pasada = d < HOY || (esHoy(d) && minH(h) + 30 <= MIN_AHORA);
      filas += `<span class="wk-c ${pasada ? 'wk-pas' : ''} ${corte}">${pros.map((p) => {
        if (enVacaciones(p.id, d)) return '<i class="vac"></i>';
        const c = ocupada(p.id, d, h);
        return c ? `<i class="ocu ${c.nueva ? 'nueva' : ''}" title="${esc(c.cliente)} · ${c.servicio.nombre}"></i>` : '<i></i>';
      }).join('')}</span>`;
    });
  });
  const sem = dias.map((d) => ocupacion(d)).filter((o) => o && o.total);
  const media = sem.length ? Math.round(sem.reduce((a, o) => a + o.pct, 0) / sem.length) : 0;
  return `<div class="agenda-res"><div><b>${media}%</b><small>ocupación media</small></div><div><b>${sem.reduce((a, o) => a + o.n, 0)}</b><small>citas</small></div><div><b>${sem.reduce((a, o) => a + o.total - o.n, 0)}</b><small>huecos</small></div></div>
    <div class="semana">${cab}${filas}</div>
    <div class="leyenda-mini" style="padding-top:14px"><span><i></i>Cita</span><span><i class="b"></i>Libre</span>${S.agendaPro === 'todos' ? '<span class="faint">Cada celda: Javi | Adri</span>' : ''}</div>
    <p class="faint small pad" style="margin-top:8px">Toca un día para verlo entero.</p>`;
}
function htmlMes() {
  const d = S.agendaFecha;
  const ini = new Date(d.getFullYear(), d.getMonth(), 1);
  const dias = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let celdas = '<span></span>'.repeat((ini.getDay() + 6) % 7);
  const ocs = [];
  for (let i = 1; i <= dias; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), i);
    const o = ocupacion(x);
    if (o && o.total) ocs.push(o);
    const nivel = !o ? 'cerrado' : o.vac ? 'vac' : o.pct >= 85 ? 'lleno' : o.pct >= 60 ? 'alto' : o.pct >= 35 ? 'medio' : 'bajo';
    celdas += `<button class="mes-dia mes-dia--${nivel} ${esHoy(x) ? 'hoy' : ''} ${x < HOY ? 'pasado' : ''}" ${o ? `data-a="cal-ir" data-f="${kF(x)}" data-m="dia"` : 'disabled'}><b>${i}</b><small>${!o ? '' : o.vac ? 'Vac.' : o.pct + '%'}</small><i style="--p:${o ? o.pct : 0}%"></i></button>`;
  }
  const media = ocs.length ? Math.round(ocs.reduce((a, o) => a + o.pct, 0) / ocs.length) : 0;
  const top = [...ocs].sort((a, b) => b.pct - a.pct)[0];
  return `<div class="agenda-res"><div><b>${media}%</b><small>ocupación del mes</small></div><div><b>${ocs.reduce((a, o) => a + o.n, 0)}</b><small>citas</small></div><div><b>${top ? top.pct + '%' : '—'}</b><small>día más lleno</small></div></div>
    <div class="mes pad"><div class="mes__dias">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((x) => `<span>${x}</span>`).join('')}</div><div class="mes__grid">${celdas}</div></div>
    <div class="leyenda-mini" style="padding-top:12px"><span><i class="m-bajo"></i>Poco</span><span><i class="m-medio"></i>Medio</span><span><i class="m-alto"></i>Alto</span><span><i class="m-lleno"></i>Lleno</span></div>`;
}
VISTAS.espera = {
  padre: 'agenda',
  html() {
    const l = listaEspera();
    let dia = '';
    return [`${bizCab()}<div class="neg-titulo"><h1>Lista de espera</h1></div>
      <p class="muted small pad" style="margin:6px 0 8px;line-height:1.5">Clientes que quieren cita en un día lleno. Si alguien cancela, la IA les avisa por orden.</p>
      <div class="pad">${l.length ? l.map((e) => {
        const k = kF(e.fecha);
        const sep = k !== dia ? `<p class="franja">${(dia = k) && (esHoy(e.fecha) ? 'Hoy' : fRel(e.fecha) === 'Mañana' ? 'Mañana' : mayus(fLarga(e.fecha)))}</p>` : '';
        return `${sep}<div class="esp"><span class="sil">${ic('usuario')}</span><span class="esp__txt"><b>${esc(e.nombre)}</b><small>${e.servicio.nombre} · ${e.pro ? `con ${pro(e.pro).nombre}` : 'con quien sea'} · ${e.franja}</small><small class="faint">Apuntado ${e.desde}</small>
          <span class="esp__btns"><button class="btn btn--sm btn--primary" data-a="espera-ofrecer" data-id="${e.id}" data-n="${esc(e.nombre)}">${ic('whatsapp', 'ic-s')}Ofrecer hueco</button><button class="btn btn--sm btn--ghost" data-a="espera-quitar" data-id="${e.id}">Quitar</button></span></span></div>`;
      }).join('') : `<div class="vacio">${ic('espera')}Nadie en lista de espera.</div>`}</div>`];
  },
};

/* ---------- Clientes ---------- */
let CLIENTES_DB = null;
function clientesDB() {
  if (CLIENTES_DB) return CLIENTES_DB;
  const l = [];
  for (let i = 0; i < 36; i++) {
    const r = rng(hash('cli' + i));
    const nombre = `${CLIENTES[i % CLIENTES.length]} ${APELLIDOS[(i * 7 + 3) % APELLIDOS.length]}`;
    const first = i % 8 === 3;
    const visitas = first ? 0 : 1 + Math.floor(r() * 24);
    const tel = `6${String(10000000 + Math.floor(r() * 89999999))}`.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    l.push({ id: 'c' + i, nombre, tel, email: norm(nombre).replace(/\s+/g, '.') + '@ejemplo.com', visitas, desde: addD(HOY, first ? -1 : -Math.floor(30 + r() * 700)), proFav: r() < 0.5 ? 'javi' : 'adri', noShows: first ? 0 : Math.floor(r() * r() * 3), pendientes: !first && r() < 0.15 ? 1 : 0, confianza: !first && r() < 0.22, bloqueado: i === 13, proxima: first || r() < 0.3, first });
  }
  l.push({ id: 'yo', nombre: YO.nombre, tel: YO.tel, email: YO.email, visitas: S.pasadas.length, desde: addD(HOY, -400), proFav: 'javi', noShows: 0, pendientes: 0, confianza: true, bloqueado: false, yo: true });
  l.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  CLIENTES_DB = l;
  return l;
}
function historialCliente(c) {
  if (c.yo) {
    const pas = S.pasadas.map((x) => ({ fecha: x.fecha, hora: x.hora, servicio: serv(x.servicio), pro: x.pro, estado: 'cobrada', metodo: 'tarjeta' }));
    const prox = S.citas.filter((x) => !x.cancelada).map((x) => ({ fecha: deK(x.fecha), hora: x.hora, servicio: serv(x.servicio), pro: x.pro, estado: x.pago !== 'local' ? 'pagada' : 'proxima' }));
    return { pas, prox };
  }
  const r = rng(hash('hist' + c.id));
  const pas = [];
  const n = Math.min(c.visitas + c.noShows, 10);
  let d = addD(HOY, -Math.floor(5 + r() * 20));
  for (let i = 0; i < n; i++) {
    const estado = i < c.pendientes ? 'pendiente' : i < c.pendientes + c.noShows ? 'no-vino' : 'cobrada';
    pas.push({ fecha: d, hora: HORAS[Math.floor(r() * HORAS.length)], servicio: elegirServicio(r()), pro: r() < 0.7 ? c.proFav : c.proFav === 'javi' ? 'adri' : 'javi', estado, metodo: r() < 0.6 ? 'tarjeta' : 'efectivo' });
    d = addD(d, -Math.floor(18 + r() * 25));
  }
  const prox = c.proxima ? [{ fecha: addD(HOY, 1 + Math.floor(r() * 6)), hora: HORAS[8 + Math.floor(r() * 8)], servicio: elegirServicio(r()), pro: c.proFav, estado: 'proxima' }] : [];
  return { pas, prox };
}
const sil = (cls = '') => `<span class="sil ${cls}">${ic('usuario')}</span>`;
function insignias(c) {
  return `${c.first ? '<span class="first">FIRST</span>' : ''}${c.confianza ? `<span class="tag-c tag-c--ok">${ic('confianza', 'ic-s')}Confianza</span>` : ''}${c.bloqueado ? `<span class="tag-c tag-c--mal">${ic('bloquear', 'ic-s')}Bloqueado</span>` : ''}`;
}
function listaClientes() {
  const q = norm(S.cliBusca.trim());
  const f = S.cliFiltro;
  const l = clientesDB().filter((c) => (!q || norm(c.nombre).includes(q) || c.tel.replace(/\s/g, '').includes(q.replace(/\s/g, ''))) && (f === 'todos' || (f === 'nuevos' && c.first) || (f === 'confianza' && c.confianza) || (f === 'bloqueados' && c.bloqueado)));
  if (!l.length) return `<div class="vacio">${ic('equipo')}Ningún cliente coincide.</div>`;
  let letra = '';
  return l.map((c) => {
    const L0 = c.nombre.charAt(0).toUpperCase();
    const sep = L0 !== letra ? `<p class="franja">${(letra = L0)}</p>` : '';
    return `${sep}<button class="cli" data-a="cliente" data-id="${c.id}">${sil()}<span class="cli__txt"><b>${esc(c.nombre)}</b><small>${c.first ? 'Primera reserva' : `${c.visitas} visitas · ${c.tel}`}</small></span><span class="cli__tags">${insignias(c)}</span></button>`;
  }).join('');
}
VISTAS.clientes = {
  html() {
    const db = clientesDB();
    return [`${bizCab()}<div class="neg-titulo"><h1>Clientes</h1><button class="btn btn--sm btn--ghost" data-a="toast" data-t="En la app real: alta rápida o importar desde tus contactos">${ic('mas', 'ic-s')}Nuevo</button></div>
      <p class="muted small pad" style="margin-top:4px">${db.length} clientes · ${db.filter((c) => c.first).length} nuevos esta semana</p>
      <div class="pad"><label class="busca-res">${ic('buscar')}<input id="cli-busca" type="search" placeholder="Buscar por nombre o teléfono" value="${esc(S.cliBusca)}" autocomplete="off"></label>
      <div class="chips">${[['todos', 'Todos'], ['nuevos', 'Nuevos'], ['confianza', 'De confianza'], ['bloqueados', 'Bloqueados']].map(([id, t]) => `<button class="chip" data-a="cli-filtro" data-v="${id}" aria-pressed="${S.cliFiltro === id}">${t}</button>`).join('')}</div>
      <div id="lista-cli">${listaClientes()}</div></div>`];
  },
  montar(capa) {
    const i = $('#cli-busca', capa);
    i.addEventListener('input', () => { S.cliBusca = i.value; $('#lista-cli').innerHTML = listaClientes(); });
  },
};
const ESTADOS = { cobrada: ['Cobrada', 'ok'], pagada: ['Pagada en la app', 'ok'], pendiente: ['Pendiente de cobro', 'aviso'], 'no-vino': ['No vino', 'mal'], proxima: ['Próxima', ''] };
function filaCita(x) {
  const [t, cls] = ESTADOS[x.estado];
  return `<div class="cita-fila"><img src="${pro(x.pro).img}" alt=""><span><b>${x.servicio.nombre}</b><small>${mayus(fCorta(x.fecha))} · ${x.hora} · ${pro(x.pro).nombre}</small></span><span class="cita-fila__der"><b>${eur(x.servicio.precio)}</b><span class="estado estado--${cls}">${t}${x.estado === 'cobrada' ? ` · ${x.metodo}` : ''}</span></span></div>`;
}
VISTAS.cliente = {
  padre: 'clientes',
  html() {
    const c = clientesDB().find((x) => x.id === S.clienteSel);
    const { pas, prox } = historialCliente(c);
    const gastado = pas.filter((x) => x.estado === 'cobrada').reduce((a, x) => a + x.servicio.precio, 0) * (c.yo ? 1 : Math.max(1, c.visitas / Math.max(1, pas.length)));
    const cobradas = pas.filter((x) => x.estado === 'cobrada').length;
    const accion = (a, icono, t, on = false) => `<button class="acc-cli ${on ? 'on' : ''}" data-a="${a}" data-id="${c.id}">${ic(icono)}<small>${t}</small></button>`;
    const notas = c.yo ? `${S.sobreMi.pelo} · ${S.sobreMi.piel.join(' · ')}. ${S.sobreMi.nota}` : c.first ? 'Primera vez: pregúntale qué busca y cómo suele llevarlo.' : `Suele venir con ${pro(c.proFav).nombre}.`;
    return [`${bizCab()}
      <div class="cli-cab">${sil('sil--xl')}<h1>${esc(c.nombre)}</h1><div class="cli__tags">${insignias(c)}</div><p class="muted small">${c.first ? 'Cliente nuevo' : `Cliente desde ${c.desde.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`} · ${c.tel}</p></div>
      <div class="acc-fila">
        ${accion('cli-llamar', 'telefono', 'Llamar')}${accion('cli-wa', 'whatsapp', 'WhatsApp')}${accion('cli-sms', 'sms', 'Mensaje')}
        ${accion('cli-mail', 'correo', 'Correo')}${accion('cli-confianza', 'confianza', 'Confianza', c.confianza)}${accion('cli-bloquear', 'bloquear', c.bloqueado ? 'Bloqueado' : 'Bloquear', c.bloqueado)}
      </div>
      <div class="kpis">
        <div class="kpi"><small>Reservas totales</small><b>${c.visitas + prox.length + c.noShows}</b></div>
        <div class="kpi"><small>Gastado</small><b>${eur(Math.round(gastado))}</b></div>
        <div class="kpi"><small>Cobradas</small><b>${cobradas}/${pas.length}</b>${c.pendientes ? `<span class="faint small">${c.pendientes} pendiente</span>` : ''}</div>
        <div class="kpi"><small>No vino</small><b>${c.noShows}</b></div>
      </div>
      <div class="bloque-t">${c.yo ? 'Sobre mí (lo escribe el cliente)' : 'Notas'}</div>
      <p class="nota-cli">${esc(notas)}</p>
      <div class="bloque-t">Próximas citas<small>${prox.length}</small></div>
      <div class="pad">${prox.length ? prox.map(filaCita).join('') : '<p class="muted small">Sin citas próximas.</p>'}</div>
      <div class="bloque-t">Historial<small>${pas.length} citas</small></div>
      <div class="pad">${pas.length ? pas.map(filaCita).join('') : '<p class="muted small">Es su primera reserva.</p>'}</div>`];
  },
};

/* ---------- Ajustes ---------- */
Object.assign(S, {
  asignacion: 'carga', intervalo: '30', agendaIA: true, cancelHoras: '4', cambioHoras: '2', maxCitas: '2', antelacion: '2', plan: 'pro', periodoFact: 'mensual',
  pagos: { local: true, online: true, bizum: true, senal: true },
  perfilSel: 'javi',
  perfiles: {
    javi: { nombre: 'Javi', apellidos: 'Navarro', email: 'javi@ejemplo.com', tel: '600 000 001', puesto: 'Gerente', desc: 'Fundador de Sublime Barber Studio. 10 años de oficio.', visible: true, servicios: SERVICIOS.map((s) => s.id) },
    adri: { nombre: 'Adri', apellidos: 'Reina', email: 'adri@ejemplo.com', tel: '600 000 002', puesto: 'Profesional', desc: 'Barbero del estudio.', visible: true, servicios: SERVICIOS.filter((s) => s.id !== 'color').map((s) => s.id) },
  },
  dispositivos: [
    { id: 'd1', nombre: 'iPhone de Javi', detalle: 'Este dispositivo · Sevilla', quien: 'javi@ejemplo.com', cuando: 'ahora', este: true },
    { id: 'd2', nombre: 'iPad del mostrador', detalle: 'Recepción · Sevilla', quien: 'javi@ejemplo.com', cuando: 'hace 2 h' },
    { id: 'd3', nombre: 'iPhone de Adri', detalle: 'Sevilla', quien: 'adri@ejemplo.com', cuando: 'ayer' },
  ],
  mkTipo: 'hueco', mkCanales: { muro: true, stories: true, instagram: true, facebook: false, whatsapp: false }, mkPublico: 'todos', servTab: 'servicios', galPro: 'todos',
});
const HORARIO = [['Lunes', '10:00–14:00 · 17:00–21:00'], ['Martes', '10:00–14:00 · 17:00–21:00'], ['Miércoles', '10:00–14:00 · 17:00–21:00'], ['Jueves', '10:00–14:00 · 17:00–21:00'], ['Viernes', '10:00–14:00 · 17:00–21:00'], ['Sábado', '10:00–14:00 · 17:00–21:00'], ['Domingo', 'Cerrado']];
const PLANES = [
  { id: 'basico', nombre: 'Básico', precio: 19, pros: '1 profesional', extras: ['Agenda y reservas', 'Recordatorios por WhatsApp', 'Ficha en IMAGO'] },
  { id: 'pro', nombre: 'Pro', precio: 39, pros: 'Hasta 3 profesionales', extras: ['Todo lo del Básico', 'Caja, productos y comisiones', 'Agenda inteligente con IA', 'Estadísticas completas'] },
  { id: 'equipo', nombre: 'Equipo', precio: 69, pros: 'Profesionales ilimitados', extras: ['Todo lo del Pro', 'Varios locales', 'Marketing y campañas', 'Soporte prioritario'] },
];
const filaAj = (a, icono, t, sub = '', v = '', extra = '') => `<button data-a="${a}" ${v ? `data-v="${v}"` : ''} ${extra}>${ic(icono)}<span>${t}${sub ? `<small>${sub}</small>` : ''}</span>${ic('sig', 'ic-s')}</button>`;
function nivelInfo() {
  const R = retos();
  const pts = R.reduce((a, r) => a + Math.round(Math.min(1, r.v / r.m) * 400), 0);
  return { pts, nombre: pts >= 1600 ? 'Oro' : pts >= 900 ? 'Plata' : 'Bronce', sig: pts >= 1600 ? null : pts >= 900 ? 1600 : 900 };
}
function qrSvg(texto, celda = 4) {
  try { const q = qrcode(0, 'M'); q.addData(texto); q.make(); return q.createSvgTag(celda, 0); } catch { return ic('qr'); }
}
VISTAS.ajustes = {
  html() {
    const n = NEGOCIOS[0], niv = nivelInfo(), yo = S.perfiles.javi;
    return [`<div class="aj-portada">
        <img class="aj-portada__fondo" src="${IMG}estudio-900.webp" alt="">
        <button class="icon-btn icon-btn--glass aj-portada__editar" data-a="ir" data-v="datos-negocio" aria-label="Editar perfil del negocio">${ic('editar', 'ic-s')}</button>
        <div class="aj-portada__info">
          <span class="aj-portada__logo"><img src="${n.logo}" alt=""></span>
          <b>${n.nombre}</b>
          <small>${n.direccion}</small>
          <small class="aj-portada__nota">${estrellas(5)} 5,0 · ${n.totalResenas} reseñas</small>
        </div>
      </div>
      <button class="aj-nivel" data-a="ir" data-v="recompensas">
        <span class="aj-nivel__ic">${ic('regalo')}</span>
        <span class="aj-nivel__txt"><small>Recompensas ${MARCA}</small><b>Nivel ${niv.nombre} · ${niv.pts.toLocaleString('es-ES')} pts</b><i class="reto__barra"><i style="width:${Math.min(100, (niv.pts / 1600) * 100)}%"></i></i></span>
        ${ic('sig', 'ic-s')}
      </button>
      <button class="aj-qr" data-a="ir" data-v="qr"><span class="aj-qr__mini">${qrSvg(ENLACE, 2)}</span><span><b>Tu QR y enlace de reservas</b><small>imagocitas.com/sublime</small></span>${ic('sig', 'ic-s')}</button>
      <p class="franja pad">Mi perfil</p>
      <div class="lista-op"><button data-a="mi-perfil" data-v="javi"><img class="aj-yo" src="${pro('javi').img}" alt=""><span>${yo.nombre} ${yo.apellidos}<small>${yo.puesto} · ${yo.email}</small></span>${ic('sig', 'ic-s')}</button></div>
      <p class="franja pad">Mi negocio</p>
      <div class="lista-op">
        ${filaAj('ir', 'tienda', 'Datos del negocio', 'Nombre, contacto y descripción', 'datos-negocio')}
        ${filaAj('ir', 'equipo', 'Empleados', 'Javi, Adri', 'empleados')}
        ${filaAj('ir', 'reloj', 'Horario', 'Lunes a sábado', 'horario')}
        ${filaAj('ir', 'repetir', 'Asignación de citas', { cliente: 'El cliente elige', carga: 'Al que tenga menos carga', aleatorio: 'Aleatoria', turnos: 'Por turnos' }[S.asignacion], 'asignacion')}
        ${filaAj('ir', 'documento', 'Política de citas', `Cancelación gratis hasta ${S.cancelHoras} h antes`, 'politica')}
        ${filaAj('ir', 'chispa', 'Agenda inteligente', `${S.agendaIA ? 'Activada' : 'Desactivada'} · huecos de ${S.intervalo} min`, 'agenda-ia')}
        ${filaAj('ir', 'tarjeta', 'Métodos de pago', 'Local, app, Bizum y señal', 'pagos')}
        ${filaAj('ir', 'estrella', 'Reseñas', `5,0 · ${n.totalResenas} reseñas`, 'resenas-biz')}
        ${filaAj('ir', 'camara', 'Galería y Feed', 'Fotos y vídeos de cada profesional', 'galeria')}
        ${filaAj('ir', 'pin', 'Ubicación', n.direccion, 'ubicacion')}
        ${filaAj('ir', 'candado', 'Dispositivos conectados', `${S.dispositivos.length} dispositivos`, 'dispositivos')}
        ${filaAj('ir', 'recibo', 'Suscripción y facturas', `Plan ${PLANES.find((p) => p.id === S.plan).nombre}`, 'suscripcion')}
        ${filaAj('eliminar-cuenta', 'papelera', 'Eliminar cuenta')}
      </div>
      <p class="franja pad">Gestión</p>
      <div class="lista-op">
        ${filaAj('ir', 'grafico', 'Estadísticas', 'Facturación, mejores días y meses', 'stats')}
        ${filaAj('ir', 'tijeras', 'Servicios y productos', `${SERVICIOS.length} servicios · ${S.productos.length} productos`, 'servicios')}
        ${filaAj('ir', 'euro', 'Transacciones', 'Todo lo cobrado', 'transacciones')}
        ${filaAj('ir', 'megafono', 'Marketing', 'Mensajes, redes y reseñas', 'marketing')}
      </div>
      <p class="franja pad">Clientes</p>
      <div class="lista-op">
        ${filaAj('ir', 'whatsapp', 'Recordatorios por WhatsApp', S.ajustes.bizWa ? 'Activados' : 'Desactivados', 'recordatorios')}
        ${filaAj('biz-notis', 'campana', 'Notificaciones')}
      </div>
      <p class="franja pad">Ayuda</p>
      <div class="lista-op">
        ${filaAj('perfil-soporte', 'soporte', 'Soporte', 'Chat 24/7')}
        ${filaAj('biz-privacidad', 'escudo', 'Política de privacidad')}
        <button data-a="toast" data-t="Sesión cerrada (simulado)">${ic('salir')}<span>Cerrar sesión</span></button>
      </div>`];
  },
};
const sub = (titulo, cuerpo, lead = '') => [`${bizCab()}<div class="neg-titulo"><h1>${titulo}</h1></div>${lead ? `<p class="muted small pad aj-lead">${lead}</p>` : ''}${cuerpo}`];

VISTAS.qr = { padre: 'ajustes', html() {
  return sub('Tu QR', `<div class="qr-grande"><div class="qr qr--xl">${qrSvg(ENLACE, 6)}</div><b>imagocitas.com/sublime</b><small>Escanéalo y reserva en Sublime Barber Studio</small></div>
    <div class="pad aj-botones"><button class="btn btn--primary btn--block" data-a="copiar-enlace">${ic('copiar', 'ic-s')}Copiar enlace</button>
    <button class="btn btn--ghost btn--block" data-a="copiar-enlace" data-v="compartir">${ic('compartir', 'ic-s')}Compartir</button>
    <button class="btn btn--ghost btn--block" data-a="qr-pdf">${ic('documento', 'ic-s')}Descargar en PDF (cartel para el local)</button></div>`, 'Ponlo en el espejo, en el mostrador o en tu Instagram para que te reserven directamente.');
} };

function htmlFicha(id) {
  const p = S.perfiles[id], e = pro(id);
  const campo = (k, l, tipo = 'text') => `<div class="campo"><label>${l}</label><input type="${tipo}" data-k="${k}" value="${esc(p[k])}"></div>`;
  return `<div class="aj-ficha"><img src="${e.recorte}" alt=""><div><b>${p.nombre} ${p.apellidos}</b><small>${p.puesto}</small></div></div>
    <div class="pad form-hoja" data-perfil="${id}">
      <p class="franja">Información personal</p>
      ${campo('nombre', 'Nombre')}${campo('apellidos', 'Apellidos')}${campo('email', 'Email', 'email')}${campo('tel', 'Teléfono', 'tel')}
      <p class="franja">Información profesional</p>
      <div class="campo"><label>Puesto</label><div class="chips">${['Gerente', 'Profesional', 'Recepción'].map((x) => `<button type="button" class="chip" data-a="pf-puesto" data-v="${x}" aria-pressed="${p.puesto === x}">${x}</button>`).join('')}</div></div>
      <div class="campo"><label>Descripción (la ven los clientes)</label><textarea class="nota-campo" data-k="desc">${esc(p.desc)}</textarea></div>
      <div class="ajuste"><span><b>Visible en la agenda</b><small>Si lo apagas, los clientes no podrán reservar con ${p.nombre}</small></span><button class="switch" role="switch" aria-checked="${p.visible}" data-a="pf-visible" aria-label="Visible en la agenda"></button></div>
      <p class="franja">Servicios que hace</p>
      <div class="chips">${SERVICIOS.map((s) => `<button type="button" class="chip" data-a="pf-serv" data-v="${s.id}" aria-pressed="${p.servicios.includes(s.id)}">${s.nombre}</button>`).join('')}</div>
      <p class="franja">Horario de ${p.nombre}</p>
      <div class="horario-lista">${HORARIO.map(([d, h]) => `<div><span>${d}</span><b>${h}</b></div>`).join('')}</div>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="En la app real: editar tramos, descansos y días libres">${ic('reloj', 'ic-s')}Cambiar horario</button>
      <button class="btn btn--primary btn--block" data-a="pf-guardar">Guardar cambios</button>
    </div>`;
}
VISTAS['mi-perfil'] = { padre: 'ajustes', html() { return sub(S.perfilSel === 'javi' ? 'Mi perfil' : 'Empleado', htmlFicha(S.perfilSel)); } };
VISTAS.empleados = { padre: 'ajustes', html() {
  return sub('Empleados', `<div class="pad">${EQUIPO.map((e) => { const p = S.perfiles[e.id]; return `<button class="cli" data-a="mi-perfil" data-v="${e.id}"><img class="sil" src="${e.img}" alt="" style="object-fit:cover"><span class="cli__txt"><b>${p.nombre} ${p.apellidos}${e.id === 'javi' ? ' (tú)' : ''}</b><small>${p.puesto} · ${p.servicios.length} servicios · ${p.visible ? 'visible en la agenda' : 'oculto'}</small></span>${ic('sig', 'ic-s')}</button>`; }).join('')}
    <button class="btn btn--ghost btn--block" style="margin-top:14px" data-a="toast" data-t="Le llegaría una invitación por email para unirse a IMAGO Business">${ic('mas', 'ic-s')}Invitar a un empleado</button></div>`, 'Cada profesional tiene su perfil, sus servicios y su horario.');
} };
VISTAS.horario = { padre: 'ajustes', html() {
  return sub('Horario', `<div class="pad"><div class="horario-lista">${HORARIO.map(([d, h]) => `<div><span>${d}</span><b>${h}</b></div>`).join('')}</div>
    <div class="form-hoja" style="padding:16px 0 0">${sw('bizFestivos', 'Cerrar en festivos nacionales')}${sw('bizVerano', 'Horario de verano', 'Julio y agosto: solo mañanas')}
    <button class="btn btn--ghost btn--block" data-a="toast" data-t="En la app real: editar los tramos de cada día">${ic('editar', 'ic-s')}Editar horario</button></div></div>`, 'Es el horario del local. Cada profesional puede tener el suyo dentro de este.');
} };
const radioCard = (accion, id, actual, t, d, rec = false) => `<button class="pago ${actual === id ? 'on' : ''}" data-a="${accion}" data-v="${id}"><div><b>${t}${rec ? ' <span class="pill">Recomendado</span>' : ''}</b><small>${d}</small></div><span class="radio"></span></button>`;
VISTAS.asignacion = { padre: 'ajustes', html() {
  return sub('Asignación de citas', `<div class="pad pagos">
    ${radioCard('asig', 'carga', S.asignacion, 'Al que tenga menos carga', 'Si el cliente elige «Sin preferencia», la cita va al profesional con menos citas ese día. El trabajo se reparte solo.', true)}
    ${radioCard('asig', 'aleatorio', S.asignacion, 'Aleatoria', 'Se asigna al azar entre los profesionales libres.')}
    ${radioCard('asig', 'turnos', S.asignacion, 'Por turnos', 'Una para cada uno, en orden.')}
    ${radioCard('asig', 'cliente', S.asignacion, 'El cliente siempre elige', 'Se quita la opción «Sin preferencia».')}
  </div>`, '¿A quién va una cita cuando al cliente le da igual con quién?');
} };
VISTAS.politica = { padre: 'ajustes', html() {
  return sub('Política de citas', `<div class="pad form-hoja" style="padding-top:0">
    <div class="campo"><label>Cancelar gratis hasta</label>${segmento([['2', '2 h antes'], ['4', '4 h antes'], ['12', '12 h'], ['24', '24 h']], S.cancelHoras, 'pol-cancel')}</div>
    <div class="campo"><label>Cambiar la cita hasta</label>${segmento([['1', '1 h antes'], ['2', '2 h antes'], ['24', '24 h antes']], S.cambioHoras, 'pol-cambio')}</div>
    <div class="campo"><label>Citas a la vez por cliente</label>${segmento([['1', '1'], ['2', '2'], ['3', '3']], S.maxCitas, 'pol-max')}</div>
    <div class="campo"><label>Se puede reservar con</label>${segmento([['1', '1 mes'], ['2', '2 meses'], ['3', '3 meses']], S.antelacion, 'pol-antel')}</div>
    ${sw('bizSenal', 'Pedir señal a clientes nuevos', 'Los de confianza no la pagan')}
    ${sw('bizNoShow', 'Si no viene sin avisar, se queda la señal', 'Y se marca «No vino» en su ficha')}
    <p class="nota-com">Así lo verá el cliente al reservar: <b>«Cancelación gratis hasta ${S.cancelHoras} h antes. Puedes cambiarla hasta ${S.cambioHoras} h antes.»</b></p>
  </div>`);
} };
VISTAS['agenda-ia'] = { padre: 'ajustes', html() {
  const barra = (bloques) => `<div class="tl">${bloques.map(([ini, dur, tipo]) => `<i class="tl__b tl__b--${tipo}" style="left:${(ini / 240) * 100}%;width:${(dur / 240) * 100}%"></i>`).join('')}</div>`;
  return sub('Agenda inteligente', `<div class="pad form-hoja" style="padding-top:0">
    <div class="ajuste aj-ia"><span><b>${orbe('orbe--sm')} Agenda inteligente con IA</b><small>Ofrece las horas que encajan, para que no queden huecos sueltos</small></span><button class="switch" role="switch" aria-checked="${S.agendaIA}" data-a="agenda-ia-sw" aria-label="Agenda inteligente"></button></div>
    <div class="campo"><label>Intervalos de la agenda</label>${segmento([['15', '15 min'], ['30', '30 min'], ['45', '45 min'], ['60', '1 h']], S.intervalo, 'intervalo')}</div>
    <p class="franja">¿Qué diferencia hay?</p>
    <div class="comparar">
      <div><b>Agenda normal</b><small>El cliente coge cualquier hora libre. Quedan huecos de 15 o 30 min que nadie puede usar.</small>${barra([[0, 30, 'c'], [45, 30, 'c'], [90, 45, 'c'], [150, 30, 'c'], [195, 30, 'c']])}<span class="tl__leyenda">4 huecos muertos · 60 min perdidos</span></div>
      <div class="comparar__ia"><b>Agenda inteligente</b><small>La IA ofrece primero las horas pegadas a otras citas y guarda los huecos largos para servicios largos. Cabe más gente.</small>${barra([[0, 30, 'c'], [30, 30, 'c'], [60, 45, 'c'], [105, 30, 'c'], [135, 30, 'c'], [165, 45, 'n']])}<span class="tl__leyenda">0 huecos muertos · 1 cita más</span></div>
    </div>
    <p class="nota-com">Este mes la agenda inteligente habría evitado <b>23 huecos muertos</b>, unos <b>310 €</b>. <span class="faint">(Dato de ejemplo)</span></p>
  </div>`, 'Decide cada cuánto se ofrecen horas y si la IA ordena la agenda por ti.');
} };
VISTAS.pagos = { padre: 'ajustes', html() {
  const t = (k, l, d) => `<div class="ajuste"><span><b>${l}</b><small>${d}</small></span><button class="switch" role="switch" aria-checked="${S.pagos[k]}" data-a="pago-sw" data-k="${k}" aria-label="${l}"></button></div>`;
  return sub('Métodos de pago', `<div class="pad form-hoja" style="padding-top:0">
    ${t('local', 'Pago en el local', 'Efectivo o tarjeta al terminar')}${t('online', 'Pago en la app', 'Tarjeta, Apple Pay y Google Pay')}${t('bizum', 'Bizum', 'Al reservar o en el local')}${t('senal', 'Señal al reservar', '5 € que se descuentan del total')}
    <div class="pago"><div><b>Cuenta donde cobras</b><small>ES•• •••• •••• 1234 · cobros cada 2 días</small></div>${ic('sig', 'ic-s')}</div>
    <p class="faint small">Los datos de tarjeta los guarda la pasarela de pago, nunca IMAGO.</p></div>`);
} };
VISTAS['resenas-biz'] = { padre: 'ajustes', html() { return sub('Reseñas', `<div class="panel">${htmlResenas()}</div>`); }, montar(c) { montarResenas(c); } };
VISTAS.galeria = { padre: 'ajustes', html() {
  const items = [...S.subidos.map((x) => ({ img: x.img, video: x.video, pro: x.pro, titulo: x.texto, nuevo: true })), ...TRABAJOS.map((t) => ({ img: t.img, video: t.video, pro: t.pro, titulo: t.titulo }))].filter((x) => S.galPro === 'todos' || x.pro === S.galPro);
  return sub('Galería y Feed', `<div class="pad"><button class="btn btn--primary btn--block" data-a="subir-biz">${ic('subir', 'ic-s')}Subir foto o vídeo</button>
    <div class="chips" style="margin-top:12px">${[['todos', 'Todos'], ...EQUIPO.map((p) => [p.id, p.nombre])].map(([id, t]) => `<button class="chip" data-a="gal-pro" data-v="${id}" aria-pressed="${S.galPro === id}">${t}</button>`).join('')}</div></div>
    <div class="trabajos-grid" style="margin:12px 0 0">${items.map((t) => `<div class="trabajo">${t.img ? `<img src="${t.img}" alt="" loading="lazy">` : ''}${t.video ? `<video data-auto data-src="${t.video}" muted loop playsinline preload="none"></video>` : ''}<span>${t.pro ? pro(t.pro).nombre : 'Sublime'}${t.nuevo ? ' · nuevo' : ''}</span></div>`).join('')}</div>`, 'Lo que subáis aparece en vuestro perfil y en el Feed, con el nombre de quien lo hizo.');
} };
VISTAS.ubicacion = { padre: 'ajustes', html() {
  return sub('Ubicación', `<div class="pad form-hoja" style="padding-top:0"><div class="campo"><label>Dirección</label><input type="text" value="Calle Cataluña 54, 41015 Sevilla"></div>
    <div class="mapa-ubic"><div id="mapa-ubic"></div></div><p class="faint small">Arrastra el pin para afinar la entrada del local.</p>
    <button class="btn btn--primary btn--block" data-a="guardar-hoja">Guardar ubicación</button></div>`, 'Así te encuentran en el mapa de IMAGO y en «Cómo llegar».');
}, montar(capa) {
  const el = $('#mapa-ubic', capa);
  if (typeof L === 'undefined') { el.innerHTML = '<div class="vacio">El mapa necesita conexión.</div>'; return; }
  const n = NEGOCIOS[0];
  const m = L.map(el, { zoomControl: false }).setView([n.lat, n.lng], 17);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(m);
  L.marker([n.lat, n.lng], { draggable: true, icon: L.divIcon({ className: '', html: `<span class="pin pin--real">${n.nombre.split(' ')[0]}</span>`, iconSize: null, iconAnchor: [30, 16] }) }).addTo(m);
  setTimeout(() => { try { m.invalidateSize(); } catch {} }, 80);
  limpiezas.push(() => { try { m.remove(); } catch {} });
} };
VISTAS.dispositivos = { padre: 'ajustes', html() {
  return sub('Dispositivos conectados', `<div class="pad">${S.dispositivos.map((d) => `<div class="disp ${d.bloqueado ? 'bloq' : ''}"><span class="disp__ic">${ic(d.nombre.startsWith('iPad') ? 'tienda' : 'telefono')}</span><span class="disp__txt"><b>${d.nombre}${d.este ? ' <span class="pill">Este</span>' : ''}</b><small>${d.quien} · ${d.detalle}</small><small class="faint">Último acceso: ${d.cuando}${d.bloqueado ? ' · Bloqueado' : ''}</small>
    ${d.este ? '' : `<span class="esp__btns"><button class="btn btn--sm btn--ghost" data-a="disp-salir" data-id="${d.id}">Cerrar sesión</button><button class="btn btn--sm btn--ghost" data-a="disp-bloq" data-id="${d.id}">${d.bloqueado ? 'Desbloquear' : 'Bloquear'}</button></span>`}</span></div>`).join('')}</div>`, 'Como propietario puedes ver quién entra en la cuenta del negocio, cerrar su sesión o bloquearlo.');
} };
VISTAS.suscripcion = { padre: 'ajustes', html() {
  const plan = PLANES.find((p) => p.id === S.plan);
  const precio = (p) => (S.periodoFact === 'anual' ? `${p.precio * 10} €/año` : `${p.precio} €/mes`);
  return sub('Suscripción', `<div class="plan-actual"><span class="eyebrow">Tu plan</span><b>${plan.nombre}</b><small>${precio(plan)} · ${plan.pros} · se renueva el 1 de noviembre</small></div>
    <div class="pad"><div class="campo"><label>Periodo de facturación</label>${segmento([['mensual', 'Mensual'], ['anual', 'Anual (2 meses gratis)']], S.periodoFact, 'periodo-fact')}</div>
    <p class="franja">Planes</p>
    ${PLANES.map((p) => `<button class="plan ${p.id === S.plan ? 'on' : ''}" data-a="plan" data-v="${p.id}"><span><b>${p.nombre}</b><small>${p.pros}</small><span class="plan__extras">${p.extras.map((x) => `<small>${ic('check', 'ic-s')}${x}</small>`).join('')}</span></span><span class="plan__precio">${precio(p)}</span></button>`).join('')}
    <p class="franja">Facturas</p>
    <div class="factura"><span><b>Octubre 2026</b><small>Plan ${plan.nombre} · ${plan.precio} €</small></span><button class="btn btn--sm btn--ghost" data-a="factura" data-m="9">${ic('documento', 'ic-s')}Descargar</button></div>
    <button class="btn btn--primary btn--block" style="margin-top:12px" data-a="ir" data-v="facturas">Panel de facturas</button>
    <p class="faint small" style="margin-top:12px">Precios de ejemplo.</p></div>`);
} };
VISTAS.facturas = { padre: 'suscripcion', html() {
  const plan = PLANES.find((p) => p.id === S.plan);
  const meses = Array.from({ length: 12 }, (_, i) => new Date(HOY.getFullYear(), HOY.getMonth() - i, 1));
  return sub('Facturas', `<div class="pad">${meses.map((m, i) => `<div class="factura"><span><b>${mayus(m.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))}</b><small>IMG-${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')} · ${plan.precio} € · ${i === 0 ? 'Pendiente de cobro' : 'Pagada'}</small></span><button class="btn btn--sm btn--ghost" data-a="factura" data-m="${i}">${ic('documento', 'ic-s')}PDF</button></div>`).join('')}</div>`, 'Todas tus facturas de IMAGO, listas para tu gestoría.');
} };
VISTAS['datos-negocio'] = { padre: 'ajustes', html() {
  const c = (l, v) => `<div class="campo"><label>${l}</label><input type="text" value="${esc(v)}"></div>`;
  return sub('Datos del negocio', `<div class="pad form-hoja" style="padding-top:0">
    <div class="aj-fotos"><div><img src="${NEGOCIOS[0].logo}" alt="" style="background:#000;padding:14px"><small>Logo</small></div><div><img src="${IMG}estudio-900.webp" alt=""><small>Portada</small></div></div>
    ${c('Nombre', NEGOCIOS[0].nombre)}${c('Categoría', 'Barbería')}${c('Teléfono', '955 000 000')}${c('Instagram', '@sublimebarberstudio')}
    <div class="campo"><label>Descripción</label><textarea class="nota-campo">Barbería de autor en Sevilla. Cortes a medida, barba y color.</textarea></div>
    <button class="btn btn--primary btn--block" data-a="guardar-hoja">Guardar</button>
    <button class="btn btn--ghost btn--block" data-a="ver-como-cliente">${ic('usuario', 'ic-s')}Ver mi ficha como cliente</button></div>`);
} };
VISTAS.servicios = { padre: 'ajustes', html() {
  const lista = S.servTab === 'servicios'
    ? SERVICIOS.map((s) => `<button class="serv-fila" data-a="serv-edit" data-id="${s.id}"><span class="serv-fila__img"><img src="${s.img}" alt=""></span><span class="serv-fila__txt"><b>${s.nombre}</b><small>${ic('reloj', 'ic-s')}${s.min} min · ${EQUIPO.filter((p) => S.perfiles[p.id].servicios.includes(s.id)).map((p) => p.nombre).join(', ')}</small></span><span class="serv-fila__precio"><b>${eur(s.precio)}</b></span></button>`).join('')
    : S.productos.map((p) => `<button class="prod" style="width:100%;margin:0" data-a="prod-edit" data-id="${p.id}">${prodIc(p)}<div class="t"><b>${esc(p.nombre)}</b><small>${p.stock} en stock · comisión ${p.comision}%</small></div><div class="precio"><b>${eur(p.precio)}</b></div></button>`).join('');
  return sub('Servicios y productos', `<div class="pad">${segmento([['servicios', 'Servicios'], ['productos', 'Productos']], S.servTab, 'serv-tab')}
    <button class="btn btn--ghost btn--block" style="margin:12px 0 4px" data-a="${S.servTab === 'servicios' ? 'serv-nuevo' : 'prod-nuevo'}">${ic('mas', 'ic-s')}Añadir ${S.servTab === 'servicios' ? 'servicio' : 'producto'}</button>${lista}</div>`);
} };
const PLANTILLAS = {
  hueco: 'Nos queda un hueco hoy a las 18:30. ¿Te lo quedas? Resérvalo en la app.',
  promo: 'Esta semana, corte + barba a precio especial. Reserva tu cita en IMAGO.',
  novedad: 'Novedad en el estudio: aceite de barba. Pregúntanos en tu próxima cita.',
  vacaciones: 'Del 12 al 17 Javi estará de vacaciones. Adri os atiende con normalidad.',
};
VISTAS.marketing = { padre: 'ajustes', html() {
  const c = S.mkCanales, t = (k, l) => `<button type="button" class="chip" data-a="mk-canal" data-v="${k}" aria-pressed="${c[k]}">${l}</button>`;
  const top = S.resenas.filter((r) => r.estrellas === 5 && r.texto.length > 25).slice(0, 6);
  return sub('Marketing', `<div class="pad form-hoja" style="padding-top:0">
    <p class="franja">Crear un mensaje</p>
    <div class="chips">${[['hueco', 'Hueco libre'], ['promo', 'Promoción'], ['novedad', 'Novedad'], ['vacaciones', 'Vacaciones']].map(([k, l]) => `<button type="button" class="chip" data-a="mk-tipo" data-v="${k}" aria-pressed="${S.mkTipo === k}">${l}</button>`).join('')}</div>
    <textarea class="nota-campo" id="mk-texto" placeholder="Escribe tu mensaje…">${esc(S.mkTexto || '')}</textarea>
    <button class="btn btn--ghost btn--block" data-a="mk-ia">${orbe('orbe--sm')}Escribirlo con IA</button>
    <div class="campo"><label>¿Dónde lo publicas?</label><div class="chips">${t('muro', 'Muro de IMAGO')}${t('stories', 'Stories de IMAGO')}${t('instagram', 'Instagram')}${t('facebook', 'Facebook')}${t('whatsapp', 'WhatsApp a clientes')}</div></div>
    ${c.whatsapp ? `<div class="campo"><label>¿A qué clientes?</label>${segmento([['todos', 'Todos'], ['confianza', 'De confianza'], ['inactivos', 'Sin venir +60 días']], S.mkPublico, 'mk-publico')}</div>` : ''}
    <button class="btn btn--primary btn--block" data-a="mk-publicar">${ic('megafono', 'ic-s')}Publicar</button>
    <button class="btn btn--ghost btn--block" data-a="publicar">${ic('pin2', 'ic-s')}Aviso fijo o vacaciones en el muro</button>
    <p class="franja">Compartir una reseña</p>
  </div>
  <div class="fila-scroll">${top.map((r, i) => `<button class="resena-card" data-a="mk-resena" data-i="${S.resenas.indexOf(r)}">${estrellas(5)}<p>«${esc(r.texto)}»</p><small>${esc(r.nombre)} · con ${esc(r.barbero)}</small><span class="pill">${ic('compartir', 'ic-s')}Compartir</span></button>`).join('') || '<p class="muted small pad">Cargando reseñas…</p>'}</div>`, 'Crea un mensaje y publícalo en IMAGO, en tus redes o mándalo por WhatsApp.');
}, montar(capa) { const t = $('#mk-texto', capa); t.addEventListener('input', () => (S.mkTexto = t.value)); } };

function abrirSubidaBiz() {
  S.subida = { url: null, tipo: null, negocio: 'sublime', pro: null, mala: false };
  hojaGenerica('Subir a la galería', 'Aparecerá en vuestro perfil y en el Feed', `<div class="form-hoja">
    <label class="subida-zona" id="zona"><input type="file" id="f-archivo" accept="image/*,video/*" hidden><span id="zona-prev">${ic('subir')}<b>Elige una foto o vídeo</b><small>Máximo 60 segundos</small></span></label>
    <button class="link" data-a="subida-ejemplo" style="align-self:center">o usa un vídeo de ejemplo</button>
    <div class="campo"><label>¿Quién lo ha hecho?</label><div class="chips">${EQUIPO.map((p) => `<button type="button" class="chip" data-a="subida-pro" data-v="${p.id}" aria-pressed="false">${p.nombre}</button>`).join('')}</div></div>
    <div class="campo"><label for="f-texto">Texto</label><input type="text" id="f-texto" maxlength="150" placeholder="Ej.: Degradado bajo con textura arriba"></div>
    <label class="check-l"><input type="checkbox" id="f-ok"> El cliente ha dado permiso para publicarlo</label>
    <button type="button" class="chip demo-mala" data-a="subida-mala" aria-pressed="false">Probar: simular contenido no permitido</button>
    <button class="btn btn--primary btn--block" data-a="subida-publicar">Publicar</button>
  </div>`);
  $('#f-archivo').addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; S.subida.url = URL.createObjectURL(f); S.subida.tipo = f.type.startsWith('video') ? 'video' : 'imagen'; pintarPrevia(); });
}
function imprimir(html, titulo) {
  const w = window.open('', '_blank');
  if (!w) return toast('Permite las ventanas emergentes para descargar el PDF');
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${titulo}</title><style>body{font-family:-apple-system,Helvetica,Arial,sans-serif;color:#111;margin:40px}h1{font-size:28px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:10px 0;border-bottom:1px solid #ddd}.d{text-align:right}.qr{width:320px;margin:30px auto}.qr svg{width:100%;height:auto}.c{text-align:center}</style></head><body>${html}<script>setTimeout(()=>print(),300)<\/script></body></html>`);
  w.document.close();
}

/* Recordatorios por WhatsApp */
VISTAS.recordatorios = {
  padre: 'ajustes',
  html() {
    const man = addD(HOY, HOY.getDay() === 6 ? 2 : 1);
    const h = HORAS.find((x) => ocupada('adri', man, x)) || '17:00';
    const c = ocupada('adri', man, h) || { cliente: 'Carlos', servicio: serv('corte') };
    const msg = `Hola ${esc(c.cliente.split(' ')[0])} 👋 Te recordamos tu cita en <b>Sublime Barber Studio</b> ${S.ajustes.bizWaCuando === '2' ? 'hoy' : 'mañana'}, ${fLarga(man)}, a las <b>${h}</b> con Adri (${c.servicio.nombre}).${S.ajustes.bizConfirmar ? '<br><br>Responde <b>1</b> para confirmar o <b>2</b> para cambiarla.' : ''}`;
    return [`${bizCab()}<div class="neg-titulo"><h1>Recordatorios</h1></div>
      <p class="muted small pad" style="margin:6px 0 14px;line-height:1.5">Cada cliente recibe su cita por WhatsApp antes de venir. Menos olvidos y menos huecos vacíos.</p>
      <div class="pad form-hoja" style="padding-top:0">
        ${sw('bizWa', 'Enviar recordatorio automático', 'Por WhatsApp; si no tiene, por SMS')}
        <div class="campo"><label>¿Cuándo?</label>${segmento([['24', '1 día antes'], ['2', '2 h antes'], ['ambos', 'Los dos']], S.ajustes.bizWaCuando, 'biz-wa-cuando')}</div>
        ${sw('bizConfirmar', 'Pedir que confirme', 'Responde 1 o 2 sin salir de WhatsApp')}
        ${sw('bizEspera', 'Si cancela, avisar a la lista de espera')}
        <div class="campo"><label>Así le llega</label><div class="wa"><div class="wa__burbuja">${msg}<small>10:00 ✓✓</small></div></div></div>
        <div class="kpis" style="padding:0"><div class="kpi"><small>Enviados este mes</small><b>312</b></div><div class="kpi"><small>Confirmados</small><b>94 %</b></div></div>
        <button class="btn btn--ghost btn--block" data-a="toast" data-t="Mensaje de prueba enviado a tu WhatsApp (simulado)">${ic('whatsapp', 'ic-s')}Enviarme una prueba</button>
        <p class="faint small">Datos de ejemplo. En la app real se usa la API oficial de WhatsApp Business con plantillas aprobadas por Meta.</p>
      </div>`];
  },
};

/* Transacciones */
VISTAS.transacciones = {
  padre: 'ajustes',
  html() {
    const ini = { hoy: +HOY, semana: +addD(HOY, -6), mes: +new Date(HOY.getFullYear(), HOY.getMonth(), 1) }[S.txPeriodo];
    const vs = ventasEntre(ini, Date.now() + 1);
    const tickets = new Map();
    vs.forEach((v) => { const t = tickets.get(v.tk) || { t: v.t, pro: v.pro, metodo: v.metodo, items: [], total: 0 }; t.items.push(v); t.total += v.precio; tickets.set(v.tk, t); });
    const l = [...tickets.values()].sort((a, b) => b.t - a.t);
    const total = vs.reduce((a, v) => a + v.precio, 0);
    let dia = '';
    return [`${bizCab()}<div class="neg-titulo"><h1>Transacciones</h1></div>
      <div class="pad">${segmento([['hoy', 'Hoy'], ['semana', '7 días'], ['mes', 'Este mes']], S.txPeriodo, 'tx-periodo')}</div>
      <div class="hero-cifra"><small>${l.length} tickets</small><b>${eur(Math.round(total))}</b></div>
      <div class="pad">${l.slice(0, 60).map((t) => {
        const d = new Date(t.t);
        const k = kF(d);
        const sep = k !== dia ? `<p class="franja">${(dia = k) && mayus(fLarga(d))}</p>` : '';
        const nombres = t.items.map((i) => (i.tipo === 't' ? 'Propina' : (i.tipo === 's' ? serv(i.id) : prod(i.id))?.nombre || 'Producto'));
        return `${sep}<div class="tx"><img src="${pro(t.pro).img}" alt=""><span><b>${nombres.join(' + ')}</b><small>${d.toTimeString().slice(0, 5)} · ${pro(t.pro).nombre} · ${t.metodo}</small></span><b>${eur(t.total)}</b></div>`;
      }).join('') || '<p class="vacio">Sin cobros en este periodo.</p>'}${l.length > 60 ? `<p class="faint small" style="margin-top:12px">Mostrando los 60 últimos de ${l.length}.</p>` : ''}</div>`];
  },
};

/* Recompensas IMAGO */
function retos() {
  const mesIni = +new Date(HOY.getFullYear(), HOY.getMonth(), 1);
  const mes = ventasEntre(mesIni, Date.now() + 1);
  const citasMes = mes.filter((v) => v.tipo === 's').length;
  const tarjeta = Math.round(mes.filter((v) => v.metodo !== 'efectivo').reduce((a, v) => a + v.precio, 0));
  return [
    { id: 'pegatinas', t: 'Comparte tu enlace o QR 10 veces', v: S.compartidos, m: 10, premio: 'Pack de pegatinas + póster con tu QR', ic: 'compartir' },
    { id: 'taza', t: 'Invita a 3 negocios a IMAGO', v: S.invitados, m: 3, premio: 'Taza IMAGO', ic: 'tienda' },
    { id: 'camiseta', t: '300 citas reservadas en un mes', v: citasMes, m: 300, premio: 'Camiseta IMAGO', ic: 'calendario' },
    { id: 'delantal', t: `Cobra ${eur(1500)} con tarjeta o Bizum en un mes`, v: tarjeta, m: 1500, premio: 'Delantal IMAGO', ic: 'tarjeta', euros: true },
    { id: 'sudadera', t: '50 reseñas de 5 estrellas', v: 291, m: 50, premio: 'Sudadera edición limitada', ic: 'estrella' },
  ];
}
VISTAS.recompensas = {
  padre: 'ajustes',
  html() {
    const R = retos();
    const pts = R.reduce((a, r) => a + Math.round(Math.min(1, r.v / r.m) * 400), 0);
    return [`${bizCab()}<div class="neg-titulo"><h1>Recompensas</h1></div>
      <div class="nivel"><span class="eyebrow">Tu nivel</span><b>${pts >= 1600 ? 'Oro' : pts >= 900 ? 'Plata' : 'Bronce'}</b><small>${pts.toLocaleString('es-ES')} puntos · ${pts >= 1600 ? '¡nivel máximo!' : `te faltan ${(pts >= 900 ? 1600 : 900) - pts} para el siguiente`}</small><i class="nivel__barra"><i style="width:${Math.min(100, (pts / 1600) * 100)}%"></i></i></div>
      <div class="pad">${R.map((r) => {
        const ok = r.v >= r.m;
        const pedido = S.reclamados.includes(r.id);
        return `<div class="reto ${ok ? 'ok' : ''}"><span class="reto__ic">${ic(r.ic)}</span><span class="reto__txt"><b>${r.t}</b><small>${ic('regalo', 'ic-s')}${r.premio}</small><i class="reto__barra"><i style="width:${Math.min(100, (r.v / r.m) * 100)}%"></i></i><small>${r.euros ? eur(Math.min(r.v, r.m)) : Math.min(r.v, r.m)} / ${r.euros ? eur(r.m) : r.m}</small></span>
          ${ok ? `<button class="btn btn--sm ${pedido ? 'btn--ghost' : 'btn--primary'}" data-a="reclamar" data-id="${r.id}" ${pedido ? 'disabled' : ''}>${pedido ? 'Enviado ✓' : 'Pedir regalo'}</button>` : ''}</div>`;
      }).join('')}</div>
      <div class="invita"><span class="eyebrow">Tu código para invitar</span><b>SUBLIME-IMAGO</b><small>El negocio que invites y tú tenéis 1 mes gratis.</small><button class="btn btn--sm btn--primary" data-a="copiar-enlace" data-v="codigo">${ic('copiar', 'ic-s')}Copiar código</button></div>`];
  },
};

/* ---------- Acciones de Business ---------- */
Object.assign(A, {
  ir: (b) => ir(b.dataset.v),
  'agenda-modo': (b) => { S.agendaModo = b.dataset.v; if (b.dataset.v === 'mes') S.agendaFecha = new Date(S.agendaFecha.getFullYear(), S.agendaFecha.getMonth(), esHoy(S.agendaFecha) ? HOY.getDate() : 1); moverSegmento(b); setTimeout(() => render(null), 170); },
  'agenda-pro': (b) => { S.agendaPro = b.dataset.v; render(null, { mantenerScroll: true }); },
  'cal-mover': (b) => { const n = +b.dataset.d, d = S.agendaFecha; S.agendaFecha = S.agendaModo === 'dia' ? addD(d, n) : S.agendaModo === 'semana' ? addD(d, 7 * n) : new Date(d.getFullYear(), d.getMonth() + n, 1); render(null); },
  'cal-hoy': () => { S.agendaFecha = HOY; render(null); },
  'cal-ir': (b) => { S.agendaFecha = deK(b.dataset.f); S.agendaModo = b.dataset.m; render(S.agendaModo === 'dia' ? null : 'fundido'); },
  'espera-ofrecer': (b) => { toast(`Le hemos ofrecido el primer hueco libre a ${b.dataset.n} por WhatsApp`); },
  'espera-quitar': (b) => { S.esperaFuera = [...(S.esperaFuera || []), b.dataset.id]; render(null, { mantenerScroll: true }); toast('Quitado de la lista de espera'); },
  'noti-aprobar': (b) => { NOTI_BASE[+b.dataset.i - S.notiBiz.length].decidido = true; render(null, { mantenerScroll: true }); toast(b.dataset.v === '1' ? 'Destacado en vuestro perfil y en el Feed' : 'Oculto de vuestro perfil'); },
  cliente: (b) => { S.clienteSel = b.dataset.id; ir('cliente'); },
  'cli-filtro': (b) => { S.cliFiltro = b.dataset.v; $$('[data-a="cli-filtro"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#lista-cli').innerHTML = listaClientes(); },
  'cli-llamar': (b) => toast(`Llamando a ${clientesDB().find((c) => c.id === b.dataset.id).nombre}… (simulado)`),
  'cli-wa': (b) => toast(`Se abriría WhatsApp con ${clientesDB().find((c) => c.id === b.dataset.id).nombre}`),
  'cli-sms': () => toast('Se abriría Mensajes con el texto preparado'),
  'cli-mail': () => toast('Se abriría el correo'),
  'cli-confianza': (b) => { const c = clientesDB().find((x) => x.id === b.dataset.id); c.confianza = !c.confianza; render(null, { mantenerScroll: true }); toast(c.confianza ? 'Marcado de confianza: puede reservar sin señal' : 'Ya no es cliente de confianza'); },
  'cli-bloquear': (b) => { const c = clientesDB().find((x) => x.id === b.dataset.id); c.bloqueado = !c.bloqueado; render(null, { mantenerScroll: true }); toast(c.bloqueado ? 'Bloqueado: no podrá reservar online' : 'Desbloqueado'); },
  'copiar-enlace': (b) => {
    const txt = b.dataset.v === 'codigo' ? 'SUBLIME-IMAGO' : ENLACE;
    try { navigator.clipboard?.writeText(txt); } catch {}
    if (b.dataset.v !== 'codigo') S.compartidos++;
    toast(b.dataset.v === 'codigo' ? 'Código copiado' : b.dataset.v === 'compartir' ? 'Se abriría el menú de compartir del móvil' : `Enlace copiado: ${txt}`);
  },
  'biz-wa-cuando': (b) => { S.ajustes.bizWaCuando = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'tx-periodo': (b) => { S.txPeriodo = b.dataset.v; moverSegmento(b); setTimeout(() => render(null), 160); },
  reclamar: (b) => { S.reclamados.push(b.dataset.id); render(null, { mantenerScroll: true }); toast(`¡Hecho! Te lo enviamos a ${NEGOCIOS[0].direccion}`); },
  'biz-perfil': () => hojaGenerica('Perfil del negocio', 'Así te ven los clientes', `<div class="form-hoja">
    ${[['Nombre', NEGOCIOS[0].nombre], ['Dirección', NEGOCIOS[0].direccion], ['Teléfono', '955 000 000'], ['Instagram', '@sublimebarberstudio']].map(([l, v]) => `<div class="campo"><label>${l}</label><input type="text" value="${esc(v)}"></div>`).join('')}
    <button class="btn btn--primary btn--block" data-a="guardar-hoja">Guardar</button>
    <button class="btn btn--ghost btn--block" data-a="ver-como-cliente">${ic('usuario', 'ic-s')}Ver mi ficha como cliente</button></div>`),
  'ver-como-cliente': () => { cerrarHoja(); S.logueado = true; setModo('cliente'); S.tabFicha = 'servicios'; ir('negocio'); },
  'biz-notis': () => hojaGenerica('Notificaciones', 'Qué quieres que te avise', `<div class="form-hoja">${sw('bizNotiReserva', 'Nuevas reservas')}${sw('bizNotiCambio', 'Cambios de cita')}${sw('bizNotiCancel', 'Cancelaciones')}${sw('bizNotiResena', 'Reseñas nuevas')}${sw('bizResumen', 'Resumen del día', 'Cada noche a las 21:30')}</div>`),
  'biz-politica': () => hojaGenerica('Política de cancelación', 'Se muestra al reservar', `<div class="form-hoja"><div class="campo"><label>Cancelación gratis hasta</label>${segmento([['2', '2 h antes'], ['4', '4 h antes'], ['24', '24 h antes']], '4', 'toast-seg')}</div>${sw('bizSenal', 'Pedir señal a clientes nuevos', 'Los de confianza no la pagan')}<p class="muted small">Si alguien no viene sin avisar, se queda la señal y se marca «No vino» en su ficha.</p></div>`),
  'toast-seg': (b) => moverSegmento(b),
  'biz-privacidad': () => hojaGenerica('Privacidad', '', '<div class="form-hoja"><p class="muted small" style="line-height:1.6">Los datos de tus clientes son tuyos. IMAGO los guarda cifrados en la UE y nunca los vende. Puedes exportarlos o borrarlos cuando quieras.</p><button class="btn btn--ghost btn--block" data-a="toast" data-t="Se descargaría un Excel con tus clientes">Exportar clientes</button></div>'),
});

/* Lo que hace el cliente le llega al negocio (y al revés) */
{
  const nb = (x) => S.notiBiz.unshift({ cuando: 'ahora', ...x });
  const nc = (x) => S.notiCli.unshift({ cuando: 'ahora', ...x });
  const conf = A.confirmar;
  A.confirmar = (b) => {
    const R = S.reserva, s = serv(R.servicio);
    nb({ tipo: 'reserva', t: `<b>${YO.nombre}</b> ha reservado <b>${s.nombre}</b>${R.pro && R.pro !== 'any' ? ` con ${pro(R.pro).nombre}` : ''}`, sub: `${fRel(deK(R.fecha))} · ${R.hora}${R.pago !== 'local' ? ' · pagada en la app' : ''}` });
    nc({ ic: 'check', t: `Cita confirmada en <b>${NEGOCIOS[0].nombre}</b>: ${s.nombre}, ${fRel(deK(R.fecha)).toLowerCase()} a las ${R.hora}.` });
    conf(b);
  };
  const canc = A['cita-cancelar'];
  A['cita-cancelar'] = (b) => { const c = S.citas[+b.dataset.i]; nb({ tipo: 'cancelacion', t: `<b>${YO.nombre}</b> ha cancelado su cita del ${fCorta(deK(c.fecha))} a las ${c.hora}`, sub: 'Avisamos a la lista de espera' }); canc(b); };
  const camb = A['cita-cambiar'];
  A['cita-cambiar'] = (b) => { const c = S.citas[+b.dataset.i]; nb({ tipo: 'cambio', t: `<b>${YO.nombre}</b> está cambiando su cita del ${fCorta(deK(c.fecha))} a las ${c.hora}` }); camb(b); };
  const pub = A['pub-enviar'];
  A['pub-enviar'] = (b) => { const t = $('#p-texto').value.trim(); pub(b); if (t || S.pub.tipo === 'vacaciones') nc({ ic: 'megafono', t: `<b>${NEGOCIOS[0].nombre}</b> ha publicado un aviso nuevo.`, ir: 'muro' }); };
  const pm = publicarMuro;
  publicarMuro = (t) => { if (moderarTexto(t).ok) nb({ tipo: 'mensaje', t: `<b>${YO.nombre}</b> ha escrito en vuestro muro: «${esc(t.slice(0, 60))}»` }); pm(t); };
}

Object.assign(ICON, { tijeras: '<circle cx="6" cy="6.5" r="2.8"/><circle cx="6" cy="17.5" r="2.8"/><path d="M8.2 8.2L20 18M8.2 15.8L20 6"/>' });
const mesFactura = (i) => new Date(HOY.getFullYear(), HOY.getMonth() - i, 1);
Object.assign(A, {
  'mi-perfil': (b) => { S.perfilSel = b.dataset.v; ir('mi-perfil'); },
  'pf-puesto': (b) => { S.perfiles[S.perfilSel].puesto = b.dataset.v; $$('[data-a="pf-puesto"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'pf-visible': (b) => { const p = S.perfiles[S.perfilSel]; p.visible = !p.visible; b.setAttribute('aria-checked', p.visible); },
  'pf-serv': (b) => { const p = S.perfiles[S.perfilSel], v = b.dataset.v; p.servicios = p.servicios.includes(v) ? p.servicios.filter((x) => x !== v) : [...p.servicios, v]; b.setAttribute('aria-pressed', p.servicios.includes(v)); },
  'pf-guardar': () => { const p = S.perfiles[S.perfilSel]; $$('[data-perfil] [data-k]').forEach((i) => (p[i.dataset.k] = i.value)); toast('Perfil guardado'); volver(); },
  asig: (b) => { S.asignacion = b.dataset.v; $$('[data-a="asig"]').forEach((x) => x.classList.toggle('on', x === b)); toast('Guardado'); },
  'pol-cancel': (b) => { S.cancelHoras = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'pol-cambio': (b) => { S.cambioHoras = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  'pol-max': (b) => { S.maxCitas = b.dataset.v; moverSegmento(b); },
  'pol-antel': (b) => { S.antelacion = b.dataset.v; moverSegmento(b); },
  'agenda-ia-sw': (b) => { S.agendaIA = !S.agendaIA; b.setAttribute('aria-checked', S.agendaIA); toast(S.agendaIA ? 'Agenda inteligente activada' : 'Agenda normal'); },
  intervalo: (b) => { S.intervalo = b.dataset.v; moverSegmento(b); },
  'pago-sw': (b) => { const k = b.dataset.k; S.pagos[k] = !S.pagos[k]; b.setAttribute('aria-checked', S.pagos[k]); },
  'gal-pro': (b) => { S.galPro = b.dataset.v; render(null, { mantenerScroll: true }); },
  'subir-biz': abrirSubidaBiz,
  'disp-salir': (b) => { S.dispositivos = S.dispositivos.filter((d) => d.id !== b.dataset.id); render(null, { mantenerScroll: true }); toast('Sesión cerrada en ese dispositivo'); },
  'disp-bloq': (b) => { const d = S.dispositivos.find((x) => x.id === b.dataset.id); d.bloqueado = !d.bloqueado; render(null, { mantenerScroll: true }); toast(d.bloqueado ? 'Dispositivo bloqueado' : 'Dispositivo desbloqueado'); },
  'periodo-fact': (b) => { S.periodoFact = b.dataset.v; moverSegmento(b); setTimeout(() => render(null, { mantenerScroll: true }), 160); },
  plan: (b) => { if (b.dataset.v === S.plan) return; S.plan = b.dataset.v; render(null, { mantenerScroll: true }); toast(`Plan cambiado a ${PLANES.find((p) => p.id === S.plan).nombre} (simulado)`); },
  factura: (b) => {
    const m = mesFactura(+b.dataset.m), plan = PLANES.find((p) => p.id === S.plan), num = `IMG-${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
    const base = plan.precio / 1.21;
    imprimir(`<h1>Factura ${num}</h1><p>${mayus(m.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }))}</p><p><b>IMAGO</b> (datos fiscales de ejemplo)<br>Cliente: ${NEGOCIOS[0].nombre} · ${NEGOCIOS[0].direccion}</p>
      <table><tr><td>Plan ${plan.nombre} (${plan.pros})</td><td class="d">${base.toFixed(2).replace('.', ',')} €</td></tr><tr><td>IVA 21 %</td><td class="d">${(plan.precio - base).toFixed(2).replace('.', ',')} €</td></tr><tr><td><b>Total</b></td><td class="d"><b>${plan.precio},00 €</b></td></tr></table><p style="margin-top:30px;color:#888">Documento de ejemplo generado por el prototipo.</p>`, `Factura ${num}`);
  },
  'qr-pdf': () => imprimir(`<div class="c"><h1>Reserva tu cita</h1><p>${NEGOCIOS[0].nombre}</p><div class="qr">${qrSvg(ENLACE, 8)}</div><p>imagocitas.com/sublime</p></div>`, 'QR Sublime Barber Studio'),
  'eliminar-cuenta': () => hojaGenerica('Eliminar cuenta', 'Piénsalo bien', `<div class="form-hoja"><p class="muted small" style="line-height:1.55">Puedes <b>desactivarla</b> (tu ficha deja de verse y no entran reservas, pero no se borra nada) o <b>eliminarla</b> para siempre: se borran clientes, citas, estadísticas y facturas tras 30 días.</p>
    <button class="btn btn--ghost btn--block" data-a="toast" data-t="Cuenta desactivada (simulado)">Desactivar temporalmente</button>
    <button class="btn btn--block btn-peligro" data-a="toast" data-t="En la app real se pediría confirmar con tu contraseña o Face ID">Eliminar para siempre</button></div>`),
  'serv-tab': (b) => { S.servTab = b.dataset.v; moverSegmento(b); setTimeout(() => render(null), 160); },
  'serv-edit': (b) => {
    const s = serv(b.dataset.id);
    hojaGenerica(s.nombre, 'Editar servicio', `<div class="form-hoja">
      <div class="aj-fotos"><div><img src="${s.img}" alt=""><small>${s.video ? 'Foto + vídeo' : 'Foto'}</small></div></div>
      <div class="campo"><label>Nombre</label><input type="text" value="${esc(s.nombre)}"></div>
      <div class="campo"><label>Precio <b>${eur(s.precio)}</b></label><input type="range" min="5" max="90" value="${s.precio}" oninput="this.previousElementSibling.lastChild.textContent=this.value+' €'"></div>
      <div class="campo"><label>Duración</label>${segmento([['20', '20 min'], ['30', '30 min'], ['45', '45 min'], ['90', '90 min']], String(s.min), 'toast-seg')}</div>
      <div class="campo"><label>¿Quién lo hace?</label><div class="chips">${EQUIPO.map((p) => `<span class="chip" aria-pressed="${S.perfiles[p.id].servicios.includes(s.id)}">${p.nombre}</span>`).join('')}</div></div>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Se abriría la galería para elegir foto o vídeo">${ic('camara', 'ic-s')}Cambiar foto o vídeo</button>
      <button class="btn btn--primary btn--block" data-a="guardar-hoja">Guardar</button></div>`);
  },
  'serv-nuevo': () => toast('En la app real: nombre, precio, duración, foto o vídeo y quién lo hace'),
  'mk-canal': (b) => { const k = b.dataset.v; S.mkCanales[k] = !S.mkCanales[k]; if (k === 'whatsapp') render(null, { mantenerScroll: true }); else b.setAttribute('aria-pressed', S.mkCanales[k]); },
  'mk-tipo': (b) => { S.mkTipo = b.dataset.v; $$('[data-a="mk-tipo"]').forEach((x) => x.setAttribute('aria-pressed', x === b)); },
  'mk-ia': (b) => { b.disabled = true; const t = $('#mk-texto'); t.value = ''; const txt = PLANTILLAS[S.mkTipo]; let i = 0; const iv = setInterval(() => { t.value = txt.slice(0, (i += 3)); if (i >= txt.length) { clearInterval(iv); S.mkTexto = txt; b.disabled = false; } }, 25); },
  'mk-publico': (b) => { S.mkPublico = b.dataset.v; moverSegmento(b); },
  'mk-publicar': () => {
    const t = ($('#mk-texto').value || '').trim();
    if (!t) return toast('Escribe el mensaje o pídeselo a la IA');
    const v = moderarTexto(t);
    if (!v.ok) return toast(`No se ha publicado: ${v.motivo}`);
    const canales = Object.entries(S.mkCanales).filter(([, on]) => on).map(([k]) => ({ muro: 'muro', stories: 'stories', instagram: 'Instagram', facebook: 'Facebook', whatsapp: 'WhatsApp' }[k]));
    if (!canales.length) return toast('Elige al menos un sitio donde publicarlo');
    if (S.mkCanales.muro || S.mkCanales.stories) S.muro.push({ id: 'mk' + Date.now(), autor: 'negocio', nombre: NEGOCIOS[0].nombre, texto: t, fecha: new Date(), storyNueva: S.mkCanales.stories, story: S.mkCanales.stories, respuestas: [], likes: 0 });
    S.notiCli.unshift({ ic: 'megafono', t: `<b>${NEGOCIOS[0].nombre}</b>: ${esc(t.slice(0, 70))}`, cuando: 'ahora', ir: 'muro' });
    S.mkTexto = '';
    render(null);
    toast(`Publicado en ${canales.join(', ')}${S.mkCanales.whatsapp ? ' (simulado)' : ''}`);
  },
  'mk-resena': (b) => {
    const r = S.resenas[+b.dataset.i];
    hojaGenerica('Compartir reseña', 'Formato story para Instagram o WhatsApp', `<div class="form-hoja"><div class="story-resena"><span class="marca">${LOGO}</span>${estrellas(5)}<p>«${esc(r.texto)}»</p><small>${esc(r.nombre)} · le atendió ${esc(r.barbero)}</small><b>${NEGOCIOS[0].nombre}</b></div>
      <button class="btn btn--primary btn--block" data-a="toast" data-t="Se abriría Instagram con la story lista">Compartir en Instagram</button>
      <button class="btn btn--ghost btn--block" data-a="toast" data-t="Se abriría WhatsApp con la imagen">Enviar por WhatsApp</button></div>`);
  },
});
{
  const ver = A['subida-ver'];
  A['subida-ver'] = (b) => { if (S.modo === 'negocio') { cerrarHoja(); render(null); toast('Publicado en vuestra galería y en el Feed'); } else ver(b); };
}
{
  const pub = A['subida-publicar'];
  A['subida-publicar'] = (b) => { if (S.modo === 'negocio' && !S.subida.pro) return toast('Elige quién lo ha hecho'); pub(b); };
}
